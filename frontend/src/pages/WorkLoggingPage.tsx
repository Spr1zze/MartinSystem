import React, { useEffect, useRef, useState } from 'react';
import { useNotification } from '../hooks';
import { Button, Input, Textarea } from '../components';
import { workLogService } from '../services/workLogService';
import type { WorkLog } from '../types';

type Step = 'card' | 'notes';

export const WorkLoggingPage: React.FC = () => {
  const { addNotification } = useNotification();

  const [step, setStep] = useState<Step>('card');
  const [cardInput, setCardInput] = useState('');
  const [scannedUserId, setScannedUserId] = useState<number | null>(null);
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastLog, setLastLog] = useState<WorkLog | null>(null);

  const cardInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (step === 'card') cardInputRef.current?.focus();
    if (step === 'notes') notesInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const fetchLatestLog = async () => {
      try {
        const response = await workLogService.getAll();
        setLastLog(response.data.at(-1) ?? null);
      } catch (error) {
        console.error('Failed to fetch work logs:', error);
      }
    };

    void fetchLatestLog();
  }, []);

  const resetForm = () => {
    setStep('card');
    setCardInput('');
    setScannedUserId(null);
    setBatchNumber('');
    setNotes('');
  };

  const processStudentCard = (rawValue: string) => {
    const parsedUserId = Number(rawValue.trim());

    if (Number.isNaN(parsedUserId)) {
      addNotification('error', 'Indtast et gyldigt studiekortnummer.');
      return;
    }

    setScannedUserId(parsedUserId);
    setCardInput('');
    setStep('notes');
  };

  const handleCardScan = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || cardInput.trim() === '') {
      return;
    }

    processStudentCard(cardInput);
  };

  const handleLogNote = async () => {
    if (!notes.trim()) {
      addNotification('error', 'Skriv noget i noterne, for du logger processen.');
      return;
    }

    if (!batchNumber.trim()) {
      addNotification('error', 'Indtast et batchnummer, for du logger processen.');
      return;
    }

    if (!scannedUserId) {
      addNotification('error', 'Scan et studiekort, for du logger processen.');
      return;
    }

    setLoading(true);
    try {
      const response = await workLogService.create({
        notes: notes.trim(),
        batchNumber: batchNumber.trim(),
        userId: scannedUserId,
      });

      setLastLog(response.data);

      const timestamp = new Date(response.data.timestamp).toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit',
      });

      addNotification('success', `Proces logget med succes kl. ${timestamp}.`);
      resetForm();
    } catch (error) {
      console.error('Failed to create work log:', error);
      addNotification('error', 'Der opstod en fejl under logning af processen. Prov igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-text-primary mb-2">Work Logging</h1>
        <p className="text-text-secondary">Dokumenter dit arbejde</p>
      </div>

      {step === 'card' && (
        <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-h2 text-text-primary mb-2">Scan dit studenterkort</label>
            <Input
              ref={cardInputRef}
              type="text"
              placeholder="Scan dit studenterkort her..."
              value={cardInput}
              onChange={e => setCardInput(e.target.value)}
              onKeyDown={handleCardScan}
              disabled={loading}
              helperText="Feltet er klar til en barcode-scanner, der fungerer som tastatur."
            />
          </div>
        </div>
      )}

      {step === 'notes' && (
        <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 space-y-4">
          <div className="bg-accent bg-opacity-10 border-l-4 border-accent p-4 rounded">
            <p className="text-small text-text-secondary">Logning som:</p>
            <p className="font-bold text-text-primary text-h2">Studiekort {scannedUserId}</p>
          </div>
          <div>
            <label className="block text-h2 text-text-primary mb-2">
              Batchnummer
              <span className="text-warning ml-2 font-semibold">*</span>
            </label>
            <Input
              type="text"
              placeholder="Indtast batchnummer"
              value={batchNumber}
              onChange={e => setBatchNumber(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-h2 text-text-primary mb-2">
              Hvad er du i gang med?
              <span className="text-warning ml-2 font-semibold">*</span>
            </label>
            <Textarea
              ref={notesInputRef}
              placeholder="Beskriv dit nuværende arbejde"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              helperText="Vær beskrivende om dit nuværende arbejde..."
              disabled={loading}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleLogNote}
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={loading || !notes.trim() || !batchNumber.trim()}
            >
              {loading ? 'Logging...' : 'Log Note'}
            </Button>
            <Button
              onClick={resetForm}
              variant="secondary"
              size="lg"
              className="flex-1"
              disabled={loading}
            >
              Annuller
            </Button>
          </div>
        </div>
      )}

      {lastLog && (
        <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 border-l-4 border-success">
          <p className="text-small text-text-secondary mb-2">Seneste log:</p>
          <div className="space-y-2">
            <p className="font-bold text-success">
              Logget kl. {new Date(lastLog.timestamp).toLocaleString('da-DK')}
            </p>
            <p className="text-text-secondary">Batchnummer: {lastLog.batchNumber}</p>
            <p className="text-text-primary bg-gray-50 p-3 rounded">{lastLog.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

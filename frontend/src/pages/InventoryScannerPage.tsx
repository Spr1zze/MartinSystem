import React, { useEffect, useRef, useState } from 'react';
import { useNotification } from '../hooks';
import type { CheckoutItem, ScannerInventoryItem, ScannerStudent } from '../types';
import { BarcodePreview, Button, Input } from '../components';
import { inventoryLogService } from '../services/inventoryLogService';

type Step = 'card' | 'itemScan' | 'quantity';

export const ScannerPage: React.FC = () => {
  const { addNotification } = useNotification();

  const [step, setStep] = useState<Step>('card');
  const [cardInput, setCardInput] = useState('');
  const [scannedStudent, setScannedStudent] = useState<ScannerStudent | null>(null);
  const [itemInput, setItemInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('1');
  const [selectedItem, setSelectedItem] = useState<ScannerInventoryItem | null>(null);
  const [scannedItems, setScannedItems] = useState<CheckoutItem[]>([]);
  const [signatureInput, setSignatureInput] = useState('');
  const [signatureSigner, setSignatureSigner] = useState<ScannerStudent | null>(null);
  const [loading, setLoading] = useState(false);

  const cardInputRef = useRef<HTMLInputElement>(null);
  const itemInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'card') cardInputRef.current?.focus();
    if (step === 'itemScan') itemInputRef.current?.focus();
    if (step === 'quantity') quantityInputRef.current?.focus();
  }, [step]);

  const resetScannerSession = () => {
    setStep('card');
    setCardInput('');
    setScannedStudent(null);
    setItemInput('');
    setQuantityInput('1');
    setSelectedItem(null);
    setScannedItems([]);
    setSignatureInput('');
    setSignatureSigner(null);
  };

  const processStudentCard = async (rawValue: string) => {
    const studentId = Number(rawValue.trim());
    if (Number.isNaN(studentId)) {
      addNotification('error', 'Indtast et gyldigt studiekortnummer');
      return;
    }

    setLoading(true);
    try {
      const response = await inventoryLogService.validateStudent(studentId);
      setScannedStudent(response.data);
      setStep('itemScan');
      setCardInput('');
      addNotification('success', `Student fundet: ${response.data.userName}`);
    } catch {
      addNotification('error', 'Student blev ikke fundet');
    } finally {
      setLoading(false);
    }
  };

  const handleCardScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || cardInput.trim() === '') return;
    await processStudentCard(cardInput);
  };

  const processItemBarcode = async (rawValue: string) => {
    const barcode = rawValue.trim();
    if (barcode === '') {
      addNotification('error', 'Indtast en gyldig barkode');
      return;
    }

    setLoading(true);
    try {
      const response = await inventoryLogService.validateBarcode(barcode);
      setSelectedItem(response.data);
      setStep('quantity');
      setItemInput('');
      setQuantityInput('1');
    } catch {
      addNotification('error', 'Barkoden blev ikke fundet');
    } finally {
      setLoading(false);
    }
  };

  const handleItemScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || itemInput.trim() === '') return;
    await processItemBarcode(itemInput);
  };

  const handleAddItem = () => {
    if (!selectedItem || !scannedStudent) return;

    const quantity = parseInt(quantityInput, 10);
    if (Number.isNaN(quantity) || quantity <= 0) {
      addNotification('error', 'Indtast en gyldig mængde');
      return;
    }

    if (quantity > selectedItem.quantity) {
      addNotification('error', 'quantity not in stock');
      return;
    }

    setScannedItems(prev => [
      ...prev,
      {
        itemId: selectedItem.id,
        itemName: selectedItem.itemName,
        quantityTaken: quantity,
        availableStock: selectedItem.quantity,
        barcode: selectedItem.barcode,
      },
    ]);
    addNotification('success', `${quantity} ${selectedItem.itemName} lagt til checkout`);
    setSelectedItem(null);
    setQuantityInput('1');
    setStep('itemScan');
  };

  const handleRemoveScannedItem = (indexToRemove: number) => {
    setScannedItems(prev => prev.filter((_, index) => index !== indexToRemove));
    addNotification('success', 'Vare fjernet fra checkout');
  };

  const resolveSignatureSigner = async () => {
    if (!scannedStudent) {
      addNotification('error', 'Scan eleven foerst');
      return null;
    }

    const signerCardId = Number(signatureInput.trim());
    if (Number.isNaN(signerCardId)) {
      addNotification('error', 'Underskrift skal være et gyldigt studiekortnummer');
      return null;
    }

    const response = await inventoryLogService.validateStudent(signerCardId);
    const signer = response.data;

    if (signer.userId === scannedStudent.userId) {
      addNotification('error', 'Den ansvarlige elev kan ikke underskrive sin egen checkout');
      return null;
    }

    setSignatureSigner(signer);
    return signer;
  };

  const handleSignatureScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || signatureInput.trim() === '') return;

    setLoading(true);
    try {
      const signer = await resolveSignatureSigner();
      if (signer) {
        addNotification('success', `Underskrift godkendt af: ${signer.userName}`);
      }
    } catch {
      addNotification('error', 'Underskriveren blev ikke fundet');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishCheckout = async () => {
    if (!scannedStudent || scannedItems.length === 0) {
      addNotification('error', 'Scan mindst en vare foer checkout afsluttes');
      return;
    }

    const signature = signatureInput.trim();
    if (signature === '') {
      addNotification('error', 'Underskrift skal scannes foer checkout afsluttes');
      return;
    }

    setLoading(true);
    try {
      const signer = signatureSigner ?? (await resolveSignatureSigner());
      if (!signer) return;

      for (const item of scannedItems) {
        await inventoryLogService.createCheckout({
          itemId: item.itemId,
          studentId: scannedStudent.userId,
          quantityTaken: item.quantityTaken,
          signature: String(signer.userId),
        });
      }

      addNotification('success', `Checkout blev gennemført og underskrevet af ${signer.userName}`);
      resetScannerSession();
    } catch {
      addNotification('error', 'Checkout kunne ikke afsluttes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-text-primary mb-2">Scanner</h1>
        <p className="text-text-secondary text-xl">Scan din studenterkort og varer for at checke ud</p>
      </div>

      <div className="flex justify-between gap-4 mb-8">
        {(['card', 'itemScan', 'quantity'] as Step[]).map((s, idx) => (
          <div key={s} className="flex items-center gap-3 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-small ${
                step === s
                  ? 'bg-accent text-dark-text'
                  : scannedStudent || scannedItems.length > 0
                    ? 'bg-success text-dark-text'
                    : 'bg-gray-300 text-text-secondary'
              }`}
            >
              {idx + 1}
            </div>
            {idx < 2 && <div className="flex-1 h-1 bg-gray-200 rounded" />}
          </div>
        ))}
      </div>

      {step === 'card' && (
        <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-h2 text-text-primary mb-2">Scan dit studenterkort</label>
            <Input
              ref={cardInputRef}
              type="text"
              placeholder="Scan studenterkort her..."
              value={cardInput}
              onChange={e => setCardInput(e.target.value)}
              onKeyDown={handleCardScan}
              disabled={loading}
              helperText="Feltet er klar til en barcode-scanner, der fungerer som tastatur."
            />
          </div>
          {scannedStudent && (
            <div className="bg-green-50 border-l-4 border-success p-4 rounded">
              <p className="text-small text-text-secondary">Student:</p>
              <p className="font-bold text-text-primary">{scannedStudent.userName}</p>
              <p className="text-small text-text-secondary">Studiekort: {scannedStudent.userId}</p>
            </div>
          )}
        </div>
      )}

      {step === 'itemScan' && (
        <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 space-y-4">
          {scannedStudent && (
            <div className="bg-green-50 border-l-4 border-success p-4 rounded">
              <p className="text-small text-text-secondary">Student:</p>
              <p className="font-bold text-text-primary">{scannedStudent.userName}</p>
              <p className="text-small text-text-secondary">Studiekort: {scannedStudent.userId}</p>
            </div>
          )}
          <div>
            <label className="block text-h2 text-text-primary mb-2">Scan barkode</label>
            <Input
              ref={itemInputRef}
              type="text"
              placeholder="Scan barkode her..."
              value={itemInput}
              onChange={e => setItemInput(e.target.value)}
              onKeyDown={handleItemScan}
              disabled={loading}
              helperText="Feltet er klar til en barcode-scanner, der fungerer som tastatur."
            />
          </div>
        </div>
      )}

      {step === 'quantity' && selectedItem && (
        <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 space-y-4">
          <div className="bg-accent bg-opacity-10 border-l-4 border-accent p-4 rounded">
            <p className="text-h2 text-text-primary font-bold">{selectedItem.itemName}</p>
            <p className="text-success font-bold mt-2">Scannet barkode: {selectedItem.barcode}</p>
            <div className="mt-3 rounded-xs border border-gray-200 bg-white p-3">
              <BarcodePreview value={String(selectedItem.barcode)} />
            </div>
            <p className="text-text-secondary mt-2">På lager: {selectedItem.quantity}</p>
          </div>
          <div>
            <label className="block text-h2 text-text-primary mb-2">Mængde taget</label>
            <Input
              ref={quantityInputRef}
              type="number"
              min="1"
              placeholder="Enter quantity..."
              value={quantityInput}
              onChange={e => setQuantityInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void handleAddItem()}
              disabled={loading}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => void handleAddItem()} variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Behandler...' : 'Opret checkout'}
            </Button>
            <Button
              onClick={() => {
                setSelectedItem(null);
                setStep('itemScan');
              }}
              variant="secondary"
              className="flex-1"
              disabled={loading}
            >
              Annuller
            </Button>
          </div>
        </div>
      )}

      {scannedItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-h2 text-text-primary">Registrerede checkouts</h2>
          {scannedItems.map((item, idx) => (
            <div
              key={`${item.itemId}-${idx}`}
              className="bg-white rounded-md shadow-subtle p-4 md:p-6 border-l-4 border-success"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                <p className="font-bold text-text-primary">{item.itemName}</p>
                <p className="text-small text-text-secondary">Antal: {item.quantityTaken}</p>
                <p className="text-small text-text-secondary">Barkode: {item.barcode}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleRemoveScannedItem(idx)}
                  disabled={loading}
                >
                  Slet
                </Button>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 space-y-4">
            <div>
              <label className="block text-h2 text-text-primary mb-2">Underskrift</label>
              <Input
                type="text"
                placeholder="Scan underskrift her..."
                value={signatureInput}
                onChange={e => {
                  setSignatureInput(e.target.value);
                  setSignatureSigner(null);
                }}
                onKeyDown={handleSignatureScan}
                disabled={loading}
                helperText="Scannes af en anden person, der godkender udtagelsen."
              />
            </div>
            {signatureSigner && (
              <div className="bg-green-50 border-l-4 border-success p-4 rounded">
                <p className="text-small text-text-secondary">Godkendt af:</p>
                <p className="font-bold text-text-primary">{signatureSigner.userName}</p>
                <p className="text-small text-text-secondary">Studiekort: {signatureSigner.userId}</p>
              </div>
            )}
            <Button onClick={() => void handleFinishCheckout()} variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Afslutter...' : 'Afslut checkout'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={resetScannerSession} variant="secondary" size="lg" className="flex-1">
          Start forfra
        </Button>
      </div>
    </div>
  );
};

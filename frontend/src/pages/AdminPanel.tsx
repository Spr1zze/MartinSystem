import React, { useEffect, useState } from 'react';
import type {
  AdminDashboardStats,
  AdminStudent,
  InventoryItem,
  InventoryLog,
  InventorySearchParams,
  ItemType,
  Unit,
  WorkLog,
} from '../types';
import { useNotification } from '../hooks';
import { adminService } from '../services/adminService';
import { inventoryLogService } from '../services/inventoryLogService';
import { inventoryService } from '../services/inventoryService';
import { workLogService } from '../services/workLogService';
import { BarcodePreview, Button, Input, Modal } from '../components';

type AdminTab =
  | 'dashboard'
  | 'students'
  | 'groups'
  | 'inventory'
  | 'inventoryLogs'
  | 'workLogs'
  | 'database';

interface Stats {
  totalStudents: number | null;
  totalGroups: number;
  lowStockItems: number;
  totalLogFiles: number;
}

interface CreateInventoryItemForm {
  itemName: string;
  quantity: string;
  unitId: string;
  itemTypeId: string;
  minQuantity: string;
  lastUsed: string;
  createdDate: string;
  bestBefore: string;
  batchNumber: string;
  barcode: string;
}

interface CreateStudentForm {
  userName: string;
  userId: string;
  groupId: string;
}

interface InventoryFilters {
  startDate: string;
  endDate: string;
  lowStock: boolean;
  typeId: string;
}

interface LogFilters {
  startDate: string;
  endDate: string;
  searchTerm: string;
}

const defaultStats: Stats = {
  totalStudents: null,
  totalGroups: 0,
  lowStockItems: 0,
  totalLogFiles: 0,
};

const tabLabels: Record<AdminTab, string> = {
  dashboard: 'Oversigt',
  students: 'Studerende',
  groups: 'Grupper',
  inventory: 'Inventar',
  inventoryLogs: 'Inventory Logs',
  workLogs: 'Work Logs',
  database: 'Database',
};

const defaultCreateInventoryItemForm: CreateInventoryItemForm = {
  itemName: '',
  quantity: '',
  unitId: '',
  itemTypeId: '',
  minQuantity: '',
  lastUsed: '',
  createdDate: '',
  bestBefore: '',
  batchNumber: '',
  barcode: '',
};

const defaultCreateStudentForm: CreateStudentForm = {
  userName: '',
  userId: '',
  groupId: '',
};

const defaultFilters: InventoryFilters = {
  startDate: '',
  endDate: '',
  lowStock: false,
  typeId: '',
};

const defaultLogFilters: LogFilters = {
  startDate: '',
  endDate: '',
  searchTerm: '',
};

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddInventoryItemModal, setShowAddInventoryItemModal] = useState(false);
  const [showInventoryFilterModal, setShowInventoryFilterModal] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [dashboardStats, setDashboardStats] = useState<Stats>(defaultStats);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [inventoryLogFilters, setInventoryLogFilters] = useState<LogFilters>(defaultLogFilters);
  const [workLogFilters, setWorkLogFilters] = useState<LogFilters>(defaultLogFilters);
  const [inventoryLogsLoading, setInventoryLogsLoading] = useState(false);
  const [workLogsLoading, setWorkLogsLoading] = useState(false);
  const [workLogsEndpointReady, setWorkLogsEndpointReady] = useState(true);
  const [selectedInventoryLog, setSelectedInventoryLog] = useState<InventoryLog | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [selectedWorkLog, setSelectedWorkLog] = useState<WorkLog | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [creatingInventoryItem, setCreatingInventoryItem] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);
  const [deletingInventoryLogId, setDeletingInventoryLogId] = useState<number | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [deletingWorkLogId, setDeletingWorkLogId] = useState<number | null>(null);
  const [generatedBarcodeValue, setGeneratedBarcodeValue] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<InventoryFilters>(defaultFilters);
  const [draftFilters, setDraftFilters] = useState<InventoryFilters>(defaultFilters);
  const [newInventoryItemForm, setNewInventoryItemForm] = useState<CreateInventoryItemForm>(
    defaultCreateInventoryItemForm
  );
  const [newStudentForm, setNewStudentForm] = useState<CreateStudentForm>(defaultCreateStudentForm);
  const { addNotification } = useNotification();

  const fetchDashboardStats = async () => {
    try {
      setDashboardLoading(true);
      const response = await adminService.getDashboardStats();
      const stats: AdminDashboardStats = response.data;

      setDashboardStats({
        totalStudents: students.length,
        totalGroups: stats.totalGroups,
        lowStockItems: stats.lowStockItems,
        totalLogFiles: stats.totalLogFiles,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      addNotification('error', 'Dashboard-data kunne ikke hentes.');
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await adminService.getStudents();
      setStudents(response.data);
      setDashboardStats(currentStats => ({
        ...currentStats,
        totalStudents: response.data.length,
      }));
    } catch (error) {
      console.error('Failed to fetch students:', error);
      addNotification('error', 'Studerende kunne ikke hentes.');
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchInventoryItems = async (filters?: InventoryFilters) => {
    try {
      setInventoryLoading(true);

      const hasFilters =
        !!filters &&
        (filters.startDate !== '' ||
          filters.endDate !== '' ||
          filters.lowStock ||
          filters.typeId !== '');

      const response = hasFilters
        ? await inventoryService.search(toSearchParams(filters))
        : await inventoryService.getAll();

      setInventoryItems(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory items:', error);
      addNotification('error', 'Inventar kunne ikke hentes.');
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchInventoryItemTypes = async () => {
    try {
      const response = await inventoryService.getTypes();
      setItemTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory item types:', error);
      addNotification('error', 'Varetyper kunne ikke hentes.');
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await inventoryService.getUnits();
      setUnits(response.data);
    } catch (error) {
      console.error('Failed to fetch units:', error);
      addNotification('error', 'Enheder kunne ikke hentes.');
    }
  };

  const fetchInventoryLogs = async () => {
    try {
      setInventoryLogsLoading(true);
      const response = await inventoryLogService.getAll();
      setInventoryLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory logs:', error);
      addNotification('error', 'Inventory logs kunne ikke hentes.');
    } finally {
      setInventoryLogsLoading(false);
    }
  };

  const fetchWorkLogs = async () => {
    try {
      setWorkLogsLoading(true);
      setWorkLogsEndpointReady(true);
      const response = await workLogService.getAll();
      setWorkLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch work logs:', error);
      setWorkLogs([]);
      setWorkLogsEndpointReady(false);
    } finally {
      setWorkLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      return;
    }

    void fetchStudents();
    void fetchDashboardStats();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'students') {
      return;
    }

    void fetchStudents();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'inventory') {
      return;
    }

    void fetchInventoryItems(activeFilters);
    void fetchInventoryItemTypes();
    void fetchUnits();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'inventoryLogs') {
      return;
    }

    void fetchInventoryLogs();
    if (units.length === 0) {
      void fetchUnits();
    }
    if (students.length === 0) {
      void fetchStudents();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'workLogs') {
      return;
    }

    void fetchWorkLogs();
    if (students.length === 0) {
      void fetchStudents();
    }
  }, [activeTab]);

  const handleDeleteWorkLog = async (log: WorkLog) => {
    const shouldDelete = window.confirm(
      `Vil du fjerne work loggen fra ${getLogUserName(log, students)}?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingWorkLogId(log.id);
      await workLogService.delete(log.id);
      await fetchWorkLogs();
      setSelectedWorkLog(currentLog => (currentLog?.id === log.id ? null : currentLog));
      addNotification('success', 'Work loggen blev fjernet.');
    } catch (error) {
      console.error('Failed to delete work log:', error);
      addNotification('error', 'Work loggen kunne ikke fjernes.');
    } finally {
      setDeletingWorkLogId(null);
    }
  };

  const handleDeleteInventoryLog = async (log: InventoryLog) => {
    const shouldDelete = window.confirm(
      `Vil du fjerne inventory loggen fra ${getLogUserName(log, students)}?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingInventoryLogId(log.id);
      await inventoryLogService.delete(log.id);
      await fetchInventoryLogs();
      setSelectedInventoryLog(currentLog => (currentLog?.id === log.id ? null : currentLog));
      addNotification('success', 'Inventory loggen blev fjernet.');
    } catch (error) {
      console.error('Failed to delete inventory log:', error);
      addNotification('error', 'Inventory loggen kunne ikke fjernes.');
    } finally {
      setDeletingInventoryLogId(null);
    }
  };

  const handleResetDatabase = async () => {
    setResetting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      addNotification('success', 'Databasen blev nulstillet.');
      setShowResetConfirm(false);
    } catch {
      addNotification('error', 'Databasen kunne ikke nulstilles.');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteInventoryItem = async (item: InventoryItem) => {
    const shouldDelete = window.confirm(`Vil du fjerne ${item.itemName} fra inventaret?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingItemId(item.id);
      await inventoryService.delete(item.id);
      await fetchInventoryItems(activeFilters);
      setSelectedInventoryItem(currentItem => (currentItem?.id === item.id ? null : currentItem));
      addNotification('success', `${item.itemName} blev fjernet fra inventaret.`);
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      addNotification('error', 'Varen kunne ikke fjernes.');
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleOpenAddInventoryItemModal = () => {
    setNewInventoryItemForm(defaultCreateInventoryItemForm);
    setGeneratedBarcodeValue(null);
    setShowAddInventoryItemModal(true);
  };

  const handleOpenAddStudentModal = () => {
    setNewStudentForm(defaultCreateStudentForm);
    setShowAddStudentModal(true);
  };

  const handleOpenInventoryFilters = () => {
    setDraftFilters(activeFilters);
    setShowInventoryFilterModal(true);
  };

  const handleApplyInventoryFilters = async () => {
    setActiveFilters(draftFilters);
    setShowInventoryFilterModal(false);
    await fetchInventoryItems(draftFilters);
  };

  const handleClearInventoryFilters = async () => {
    setActiveFilters(defaultFilters);
    setDraftFilters(defaultFilters);
    setShowInventoryFilterModal(false);
    await fetchInventoryItems();
  };

  const handleCreateInventoryItem = async () => {
    if (
      newInventoryItemForm.itemName.trim() === '' ||
      newInventoryItemForm.quantity === '' ||
      newInventoryItemForm.unitId === '' ||
      newInventoryItemForm.itemTypeId === '' ||
      newInventoryItemForm.minQuantity === '' ||
      newInventoryItemForm.lastUsed === '' ||
      newInventoryItemForm.createdDate === '' ||
      newInventoryItemForm.bestBefore === '' ||
      newInventoryItemForm.batchNumber.trim() === '' ||
      newInventoryItemForm.barcode === ''
    ) {
      addNotification('error', 'Udfyld alle felter for at oprette en vare.');
      return;
    }

    try {
      setCreatingInventoryItem(true);

      const response = await inventoryService.create({
        itemName: newInventoryItemForm.itemName.trim(),
        quantity: Number(newInventoryItemForm.quantity),
        unitId: Number(newInventoryItemForm.unitId),
        itemTypeId: Number(newInventoryItemForm.itemTypeId),
        minQuantity: Number(newInventoryItemForm.minQuantity),
        lastUsed: newInventoryItemForm.lastUsed,
        createdDate: newInventoryItemForm.createdDate,
        bestBefore: newInventoryItemForm.bestBefore,
        batchNumber: newInventoryItemForm.batchNumber.trim(),
        barcode: Number(newInventoryItemForm.barcode),
      });

      setShowAddInventoryItemModal(false);
      setNewInventoryItemForm(defaultCreateInventoryItemForm);
      await fetchInventoryItems(activeFilters);
      addNotification('success', `${response.data.itemName} blev oprettet.`);
    } catch (error) {
      console.error('Failed to create inventory item:', error);
      addNotification('error', 'Varen kunne ikke oprettes.');
    } finally {
      setCreatingInventoryItem(false);
    }
  };

  const handleCreateStudent = async () => {
    const trimmedUserName = newStudentForm.userName.trim();
    const parsedUserId = Number(newStudentForm.userId);
    const normalizedGroupId = newStudentForm.groupId.trim();
    const parsedGroupId =
      normalizedGroupId === '' ? undefined : Number(normalizedGroupId);

    if (trimmedUserName === '' || newStudentForm.userId.trim() === '') {
      addNotification('error', 'Udfyld brugernavn og bruger-ID for at oprette en studerende.');
      return;
    }

    if (Number.isNaN(parsedUserId)) {
      addNotification('error', 'Bruger-ID skal være et tal.');
      return;
    }

    if (normalizedGroupId !== '' && Number.isNaN(parsedGroupId)) {
      addNotification('error', 'Gruppe-ID skal være et tal.');
      return;
    }

    try {
      setCreatingStudent(true);
      const response = await adminService.createStudent({
        userName: trimmedUserName,
        userId: parsedUserId,
        groupId: parsedGroupId,
      });

      setShowAddStudentModal(false);
      setNewStudentForm(defaultCreateStudentForm);
      await fetchStudents();
      addNotification('success', `${response.data.userName} blev oprettet.`);
    } catch (error) {
      console.error('Failed to create student:', error);
      addNotification('error', 'Den studerende kunne ikke oprettes.');
    } finally {
      setCreatingStudent(false);
    }
  };

  const handleDeleteStudent = async (student: AdminStudent) => {
    const shouldDelete = window.confirm(`Vil du fjerne ${student.userName}?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingStudentId(student.userId);
      await adminService.deleteStudent(student.userId);
      await fetchStudents();
      addNotification('success', `${student.userName} blev fjernet.`);
    } catch (error) {
      console.error('Failed to delete student:', error);
      addNotification('error', 'Den studerende kunne ikke fjernes.');
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleGenerateBarcode = () => {
    const normalizedBarcode = newInventoryItemForm.barcode.trim();

    if (normalizedBarcode === '') {
      addNotification('error', 'Indtast en stregkode for at generere barcode.');
      return;
    }

    if (!/^\d+$/.test(normalizedBarcode)) {
      addNotification('error', 'Stregkoden skal kun indeholde tal.');
      return;
    }

    setGeneratedBarcodeValue(normalizedBarcode);
    addNotification('success', 'Barcode genereret.');
  };

  const hasActiveFilters =
    activeFilters.startDate !== '' ||
    activeFilters.endDate !== '' ||
    activeFilters.lowStock ||
    activeFilters.typeId !== '';

  const activeTypeName =
    itemTypes.find(itemType => itemType.id === Number(activeFilters.typeId))?.type || '';

  const getUnitSymbol = (unitId?: number) =>
    units.find(unit => unit.id === unitId)?.symbol || (unitId ? `Enhed ${unitId}` : 'N/A');

  const filteredInventoryItems = inventoryItems.filter(item =>
    item.itemName.toLowerCase().includes(inventorySearchQuery.toLowerCase())
  );
  const filteredStudents = students.filter(student =>
    [
      student.userName,
      String(student.userId),
      student.groupId != null ? String(student.groupId) : '',
    ].some(value => value.toLowerCase().includes(studentSearchQuery.toLowerCase()))
  );
  const filteredInventoryLogs = inventoryLogs.filter(log => matchesLogFilters(log, inventoryLogFilters));
  const filteredWorkLogs = workLogs.filter(log => matchesLogFilters(log, workLogFilters));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-text-primary mb-2">Adminpanel</h1>
        <p className="text-text-secondary">Administrer systemopsætning og data</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {(
          ['dashboard', 'students', 'groups', 'inventory', 'inventoryLogs', 'workLogs', 'database'] as AdminTab[]
        ).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === tab
                ? 'text-accent border-accent'
                : 'text-text-secondary hover:text-text-primary border-transparent'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {dashboardLoading && (
            <div className="bg-white rounded-md shadow-subtle p-4 md:p-6">
              <p className="text-text-secondary">Henter dashboard-data...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Antal studerende" value={dashboardStats.totalStudents} />
            <StatCard label="Antal grupper" value={dashboardStats.totalGroups} />
            <StatCard label="Varer med lav beholdning" value={dashboardStats.lowStockItems} color="warning" />
            <StatCard label="Antal logfiler" value={dashboardStats.totalLogFiles} />
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Søg efter studerende..."
              className="flex-1"
              value={studentSearchQuery}
              onChange={event => setStudentSearchQuery(event.target.value)}
            />
            <Button variant="primary" onClick={handleOpenAddStudentModal}>
              Tilføj studerende
            </Button>
          </div>
          {studentsLoading ? (
            <div className="bg-white rounded-md shadow-subtle p-4 md:p-6">
              <p className="text-text-secondary">Henter studerende...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white rounded-md shadow-subtle p-4 md:p-6">
              <p className="text-text-secondary">Ingen studerende fundet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-bold text-text-primary">Navn</th>
                    <th className="px-4 py-3 text-left font-bold text-text-primary">Bruger ID</th>
                    <th className="px-4 py-3 text-left font-bold text-text-primary">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-semibold text-text-primary">{student.userName}</td>
                      <td className="px-4 py-3 text-text-secondary">{student.userId}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            void handleDeleteStudent(student);
                          }}
                          disabled={deletingStudentId === student.userId}
                        >
                          {deletingStudentId === student.userId ? 'Fjerner...' : 'Slet'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="space-y-4">
          <Button variant="primary">Tilføj gruppe</Button>
          <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 space-y-3">
            {['Gruppe A', 'Gruppe B', 'Gruppe C'].map(group => (
              <div key={group} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="font-semibold text-text-primary">{group}</span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    Rediger
                  </Button>
                  <Button variant="danger" size="sm">
                    Slet
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
            <Input
              label="Søg i inventar"
              placeholder="Søg efter artikler, f.eks. 'Kaffe'"
              value={inventorySearchQuery}
              onChange={e => setInventorySearchQuery(e.target.value)}
            />
            <Button
              type="button"
              variant={hasActiveFilters ? 'primary' : 'secondary'}
              className="h-fit"
              onClick={handleOpenInventoryFilters}
            >
              Filtre
            </Button>
            <Button variant="primary" className="h-fit" onClick={handleOpenAddInventoryItemModal}>
              Tilføj vare
            </Button>
          </div>

          {hasActiveFilters && (
            <div className="bg-white rounded-md shadow-subtle p-4 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-text-secondary">
                  Aktive filtre:{' '}
                  {[
                    activeFilters.startDate && `Startdato ${activeFilters.startDate}`,
                    activeFilters.endDate && `Slutdato ${activeFilters.endDate}`,
                    activeFilters.lowStock && 'Lav lager',
                    activeTypeName && `Type ${activeTypeName}`,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <Button type="button" variant="secondary" onClick={handleClearInventoryFilters}>
                  Nulstil filtre
                </Button>
              </div>
            </div>
          )}

          {inventoryLoading ? (
            <div className="bg-white rounded-md shadow-subtle p-4 md:p-6">
              <p className="text-text-secondary">Henter inventar...</p>
            </div>
          ) : filteredInventoryItems.length === 0 ? (
            <div className="bg-white rounded-md shadow-subtle p-4 md:p-6">
              <p className="text-text-secondary">Ingen varer fundet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-bold text-text-primary">Navn</th>
                    <th className="px-4 py-3 text-left font-bold text-text-primary">Mængde</th>
                    <th className="px-4 py-3 text-left font-bold text-text-primary">Batchnummer</th>
                    <th className="px-4 py-3 text-left font-bold text-text-primary">Handling</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventoryItems.map(item => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedInventoryItem(item)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-text-primary">{item.itemName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${
                            item.quantity <= item.minQuantity ? 'text-error' : 'text-success'
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{item.batchNumber || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={deletingItemId === item.id}
                          onClick={event => {
                            event.stopPropagation();
                            void handleDeleteInventoryItem(item);
                          }}
                        >
                          {deletingItemId === item.id ? 'Fjerner...' : 'Fjern'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventoryLogs' && (
        <LogSection
          title="Inventory Logs"
          description="Søg i inventory logs efter datointerval og bruger."
          filters={inventoryLogFilters}
          onFiltersChange={setInventoryLogFilters}
          loading={inventoryLogsLoading}
          logs={filteredInventoryLogs}
          emptyMessage="Ingen inventory logs fundet."
          columns={['Tidspunkt', 'Bruger', 'Vare', 'Mængde', 'Noter', 'Handling']}
          onRowClick={log => setSelectedInventoryLog(log)}
          renderRow={log => (
            <>
              <td className="px-4 py-3 text-text-secondary">{formatDateTime(log.timestamp)}</td>
              <td className="px-4 py-3 text-text-primary">{getLogUserName(log, students)}</td>
              <td className="px-4 py-3 text-text-primary">{getInventoryItemName(log)}</td>
              <td className="px-4 py-3 text-text-primary">{log.quantity}</td>
              <td className="px-4 py-3 text-text-secondary">{log.notes || 'Ingen noter'}</td>
              <td className="px-4 py-3">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={deletingInventoryLogId === log.id}
                  onClick={event => {
                    event.stopPropagation();
                    void handleDeleteInventoryLog(log);
                  }}
                >
                  {deletingInventoryLogId === log.id ? 'Fjerner...' : 'Fjern'}
                </Button>
              </td>
            </>
          )}
        />
      )}

      {activeTab === 'workLogs' && (
        <LogSection
          title="Work Logs"
          description="Søg i work logs efter datointerval og bruger."
          filters={workLogFilters}
          onFiltersChange={setWorkLogFilters}
          loading={workLogsLoading}
          logs={filteredWorkLogs}
          emptyMessage={
            workLogsEndpointReady
              ? 'Ingen work logs fundet.'
              : 'Work log endpoint er ikke klar endnu. Når controlleren er klar, kan denne sektion hente data.'
          }
          columns={['Tidspunkt', 'Bruger', 'Batchnummer', 'Noter', 'Handling']}
          onRowClick={log => setSelectedWorkLog(log)}
          renderRow={log => (
            <>
              <td className="px-4 py-3 text-text-secondary">{formatDateTime(log.timestamp)}</td>
              <td className="px-4 py-3 text-text-primary">{getLogUserName(log, students)}</td>
              <td className="px-4 py-3 text-text-secondary">{log.batchNumber || 'N/A'}</td>
              <td className="px-4 py-3 text-text-secondary">{log.notes || 'Ingen noter'}</td>
              <td className="px-4 py-3">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={deletingWorkLogId === log.id}
                  onClick={event => {
                    event.stopPropagation();
                    void handleDeleteWorkLog(log);
                  }}
                >
                  {deletingWorkLogId === log.id ? 'Fjerner...' : 'Fjern'}
                </Button>
              </td>
            </>
          )}
        />
      )}

      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 border-l-4 border-error space-y-4">
            <div>
              <h3 className="text-h2 text-error mb-2">Farezone</h3>
              <p className="text-text-secondary">
                Hvis databasen nulstilles, slettes alle data permanent, herunder studerende,
                grupper, inventarvarer og logfiler. Handlingen kan ikke fortrydes.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowResetConfirm(true)}
            >
              Nulstil database
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={showInventoryFilterModal}
        onClose={() => setShowInventoryFilterModal(false)}
        title="Filtre"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start date"
              type="date"
              value={draftFilters.startDate}
              onChange={e =>
                setDraftFilters(current => ({ ...current, startDate: e.target.value }))
              }
            />
            <Input
              label="End date"
              type="date"
              value={draftFilters.endDate}
              onChange={e =>
                setDraftFilters(current => ({ ...current, endDate: e.target.value }))
              }
            />
            <div className="w-full">
              <label className="block text-xl font-semibold text-text-primary mb-2">Type</label>
              <select
                value={draftFilters.typeId}
                onChange={e =>
                  setDraftFilters(current => ({ ...current, typeId: e.target.value }))
                }
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 text-lg bg-white"
              >
                <option value="">Alle typer</option>
                {itemTypes.map(itemType => (
                  <option key={itemType.id} value={itemType.id}>
                    {itemType.type}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3 rounded-xs border-2 border-gray-300 px-3 py-3 mt-[2.25rem]">
              <input
                type="checkbox"
                checked={draftFilters.lowStock}
                onChange={e =>
                  setDraftFilters(current => ({ ...current, lowStock: e.target.checked }))
                }
                className="w-4 h-4 cursor-pointer"
              />
              <span className="font-semibold text-text-primary">Low stock</span>
            </label>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <Button type="button" variant="secondary" onClick={handleClearInventoryFilters}>
              Clear
            </Button>
            <Button type="button" onClick={handleApplyInventoryFilters}>
              Apply filters
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddStudentModal}
        onClose={() => {
          if (!creatingStudent) {
            setShowAddStudentModal(false);
          }
        }}
        title="Tilføj studerende"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Udfyld oplysningerne for den nye studerende. Bruger-ID skal være unikt.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Brugernavn"
              value={newStudentForm.userName}
              onChange={event =>
                setNewStudentForm(current => ({ ...current, userName: event.target.value }))
              }
            />
            <Input
              label="Bruger ID"
              type="number"
              min="0"
              value={newStudentForm.userId}
              onChange={event =>
                setNewStudentForm(current => ({ ...current, userId: event.target.value }))
              }
            />
            <Input
              label="Gruppe ID"
              type="number"
              min="0"
              value={newStudentForm.groupId}
              onChange={event =>
                setNewStudentForm(current => ({ ...current, groupId: event.target.value }))
              }
              helperText="Valgfrit felt hvis den studerende skal knyttes til en gruppe."
            />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowAddStudentModal(false)}
              disabled={creatingStudent}
            >
              Annuller
            </Button>
            <Button onClick={handleCreateStudent} disabled={creatingStudent}>
              {creatingStudent ? 'Opretter...' : 'Opret studerende'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddInventoryItemModal}
        onClose={() => setShowAddInventoryItemModal(false)}
        title="Tilføj vare"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Navn"
              value={newInventoryItemForm.itemName}
              onChange={e =>
                setNewInventoryItemForm(current => ({ ...current, itemName: e.target.value }))
              }
            />
            <Input
              label="Batchnummer"
              value={newInventoryItemForm.batchNumber}
              onChange={e =>
                setNewInventoryItemForm(current => ({ ...current, batchNumber: e.target.value }))
              }
            />
            <Input
              label="Mængde"
              type="number"
              min="0"
              value={newInventoryItemForm.quantity}
              onChange={e =>
                setNewInventoryItemForm(current => ({ ...current, quantity: e.target.value }))
              }
            />
            <Input
              label="Minimum lager"
              type="number"
              min="0"
              value={newInventoryItemForm.minQuantity}
              onChange={e =>
                setNewInventoryItemForm(current => ({ ...current, minQuantity: e.target.value }))
              }
            />
            <div className="w-full">
              <label className="block text-xl font-semibold text-text-primary mb-2">Enhed</label>
              <select
                value={newInventoryItemForm.unitId}
                onChange={e =>
                  setNewInventoryItemForm(current => ({ ...current, unitId: e.target.value }))
                }
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 text-lg bg-white"
              >
                <option value="">Vælg enhed</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.symbol}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="block text-xl font-semibold text-text-primary mb-2">Varetype</label>
              <select
                value={newInventoryItemForm.itemTypeId}
                onChange={e =>
                  setNewInventoryItemForm(current => ({ ...current, itemTypeId: e.target.value }))
                }
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 text-lg bg-white"
              >
                <option value="">Vælg varetype</option>
                {itemTypes.map(itemType => (
                  <option key={itemType.id} value={itemType.id}>
                    {itemType.type}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Dato registreret"
              type="date"
              value={newInventoryItemForm.createdDate}
              onChange={e =>
                setNewInventoryItemForm(current => ({ ...current, createdDate: e.target.value }))
              }
            />
            <Input
              label="Sidst brugt"
              type="date"
              value={newInventoryItemForm.lastUsed}
              onChange={e =>
                setNewInventoryItemForm(current => ({ ...current, lastUsed: e.target.value }))
              }
            />
            <Input
              label="Best Before"
              type="date"
              value={newInventoryItemForm.bestBefore}
              onChange={e =>
                setNewInventoryItemForm(current => ({ ...current, bestBefore: e.target.value }))
              }
            />
            <div className="w-full md:col-span-2">
              <label className="block text-xl font-semibold text-text-primary mb-2">Stregkode</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-start">
                <Input
                  type="number"
                  min="0"
                  value={newInventoryItemForm.barcode}
                  onChange={e => {
                    setGeneratedBarcodeValue(null);
                    setNewInventoryItemForm(current => ({ ...current, barcode: e.target.value }));
                  }}
                  helperText="Indtast den numeriske værdi, og generer derefter barcoden."
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-fit"
                  onClick={handleGenerateBarcode}
                >
                  Generer barcode
                </Button>
              </div>
            </div>
            {generatedBarcodeValue && (
              <div className="md:col-span-2 rounded-xs border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 font-semibold text-text-primary">Barcode preview</p>
                <BarcodePreview value={generatedBarcodeValue} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setGeneratedBarcodeValue(null);
                setShowAddInventoryItemModal(false);
              }}
              disabled={creatingInventoryItem}
            >
              Annuller
            </Button>
            <Button
              onClick={handleCreateInventoryItem}
              disabled={creatingInventoryItem}
            >
              {creatingInventoryItem ? 'Opretter...' : 'Opret vare'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Nulstil database"
        isDangerous
      >
        <div className="space-y-4">
          <p className="text-text-primary">
            Er du helt sikker på, at du vil nulstille databasen?
          </p>
          <div className="bg-error bg-opacity-10 border-l-4 border-error p-4 rounded">
            <p className="font-bold text-error">Denne handling er permanent og kan ikke fortrydes.</p>
            <p className="text-error text-sm mt-2">Alle data gaar tabt.</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleResetDatabase}
              disabled={resetting}
              className="flex-1"
            >
              {resetting ? 'Nulstiller...' : 'Ja, nulstil databasen'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowResetConfirm(false)}
              disabled={resetting}
              className="flex-1"
            >
              Annuller
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedInventoryLog}
        onClose={() => setSelectedInventoryLog(null)}
        title={selectedInventoryLog ? `Inventory Log #${selectedInventoryLog.id}` : 'Inventory Log'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow label="Bruger" value={selectedInventoryLog ? getLogUserName(selectedInventoryLog, students) : ''} />
            <DetailRow label="Bruger ID" value={selectedInventoryLog?.userId || 'N/A'} />
            <DetailRow label="Vare" value={selectedInventoryLog ? getInventoryItemName(selectedInventoryLog) : 'N/A'} />
            <DetailRow label="Mængde" value={selectedInventoryLog?.quantity || 'N/A'} />
            <DetailRow label="Enhed" value={getUnitSymbol(selectedInventoryLog?.unitId)} />
            <DetailRow label="Underskrift" value={selectedInventoryLog?.signature || 'Ingen underskrift'} />
            <DetailRow label="Tidspunkt" value={formatDateTime(selectedInventoryLog?.timestamp) || 'N/A'} />
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-2">Noter</p>
            <p className="text-text-secondary bg-gray-50 p-3 rounded-xs">
              {selectedInventoryLog?.notes || 'Ingen noter'}
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <Button
              variant="danger"
              onClick={() => {
                if (selectedInventoryLog) {
                  void handleDeleteInventoryLog(selectedInventoryLog);
                }
              }}
              disabled={!selectedInventoryLog || deletingInventoryLogId === selectedInventoryLog.id}
            >
              {selectedInventoryLog && deletingInventoryLogId === selectedInventoryLog.id
                ? 'Fjerner...'
                : 'Fjern inventory log'}
            </Button>
            <Button variant="secondary" onClick={() => setSelectedInventoryLog(null)}>
              Luk
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedInventoryItem}
        onClose={() => setSelectedInventoryItem(null)}
        title={selectedInventoryItem?.itemName}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Mængde" value={selectedInventoryItem?.quantity}/>
            <DetailRow label="Enhed" value={getUnitSymbol(selectedInventoryItem?.unitId)} />
            <DetailRow label="Min. tærskel" value={selectedInventoryItem?.minQuantity} />
            <DetailRow label="Batch Nummer" value={selectedInventoryItem?.batchNumber || 'N/A'} />
            <DetailRow label="Dato Registreret" value={formatDate(selectedInventoryItem?.createdDate) || 'N/A'} />
            <DetailRow label="Best Before" value={formatDate(selectedInventoryItem?.bestBefore) || 'N/A'} />
            <DetailRow label="Sidst Brugt" value={formatDate(selectedInventoryItem?.lastUsed) || 'Aldrig'} />
            <DetailRow label="Stregkode" value={selectedInventoryItem?.barcode || 'N/A'} />
          </div>
          {selectedInventoryItem?.barcode && (
            <div>
              <p className="font-semibold text-text-primary mb-2">Barcode</p>
              <div className="rounded-xs border border-gray-200 bg-gray-50 p-4">
                <BarcodePreview value={String(selectedInventoryItem.barcode)} />
              </div>
            </div>
          )}
          {selectedInventoryItem?.notes && (
            <div>
              <p className="font-semibold text-text-primary mb-2">Noter</p>
              <p className="text-text-secondary bg-gray-50 p-3 rounded-xs">
                {selectedInventoryItem.notes}
              </p>
            </div>
          )}
          <Button
            variant="secondary"
            onClick={() => setSelectedInventoryItem(null)}
            className="w-full"
          >
            Luk
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedWorkLog}
        onClose={() => setSelectedWorkLog(null)}
        title={selectedWorkLog ? `Work Log #${selectedWorkLog.id}` : 'Work Log'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow label="Bruger" value={selectedWorkLog ? getLogUserName(selectedWorkLog, students) : ''} />
            <DetailRow label="Bruger ID" value={selectedWorkLog?.userId || 'N/A'} />
            <DetailRow label="Batch Nummer" value={selectedWorkLog?.batchNumber || 'N/A'} />
            <DetailRow label="Tidspunkt" value={formatDateTime(selectedWorkLog?.timestamp) || 'N/A'} />
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-2">Noter</p>
            <p className="text-text-secondary bg-gray-50 p-3 rounded-xs">
              {selectedWorkLog?.notes || 'Ingen noter'}
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <Button
              variant="danger"
              onClick={() => {
                if (selectedWorkLog) {
                  void handleDeleteWorkLog(selectedWorkLog);
                }
              }}
              disabled={!selectedWorkLog || deletingWorkLogId === selectedWorkLog.id}
            >
              {selectedWorkLog && deletingWorkLogId === selectedWorkLog.id ? 'Fjerner...' : 'Fjern work log'}
            </Button>
            <Button variant="secondary" onClick={() => setSelectedWorkLog(null)}>
              Luk
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number | null;
  color?: string;
  unavailable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color = 'accent', unavailable = false }) => {
  const colorClasses = {
    accent: 'border-accent bg-accent bg-opacity-5',
    warning: 'border-warning bg-warning bg-opacity-5',
  };

  return (
    <div className={`card border-l-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-text-secondary text-small mb-2">{label}</p>
      <p className="text-h1 font-bold text-text-primary">{unavailable ? '-' : value ?? 0}</p>
      {unavailable && (
        <p className="text-small text-text-secondary mt-2">Kommer, naar bruger-endpoints er klar</p>
      )}
    </div>
  );
};

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div>
    <p className="text-small font-semibold text-text-secondary mb-1">{label}</p>
    <p className="font-semibold text-text-primary">{value}</p>
  </div>
);


const formatDate = (value?: string | Date) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
};

const formatDateTime = (value?: string) => {
  if (!value) return '';
  return new Date(value).toLocaleString();
};

const getLogUserName = (log: InventoryLog | WorkLog, students: AdminStudent[] = []) =>
  log.userName ||
  log.user?.userName ||
  log.user?.name ||
  students.find(student => student.id === log.userId || student.userId === log.userId)?.userName ||
  `User ${log.userId}`;

const getInventoryItemName = (log: InventoryLog) =>
  log.inventoryItemName || `Vare #${log.inventoryItemId}`;

const matchesLogFilters = (log: InventoryLog | WorkLog, filters: LogFilters) => {
  const logDate = new Date(log.timestamp);
  const startDate = filters.startDate ? new Date(filters.startDate) : null;
  const endDate = filters.endDate ? new Date(`${filters.endDate}T23:59:59`) : null;

  if (startDate && logDate < startDate) {
    return false;
  }

  if (endDate && logDate > endDate) {
    return false;
  }

  const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase();

  if (normalizedSearchTerm === '') {
    return true;
  }

  return getLogUserName(log).toLowerCase().includes(normalizedSearchTerm);
};

const toSearchParams = (filters: InventoryFilters): InventorySearchParams => ({
  startDate: filters.startDate || undefined,
  endDate: filters.endDate || undefined,
  lowStock: filters.lowStock || undefined,
  typeId: filters.typeId ? Number(filters.typeId) : undefined,
});

interface LogSectionProps<TLog extends InventoryLog | WorkLog> {
  title: string;
  description: string;
  filters: LogFilters;
  onFiltersChange: React.Dispatch<React.SetStateAction<LogFilters>>;
  loading: boolean;
  logs: TLog[];
  emptyMessage: string;
  columns: string[];
  onRowClick?: (log: TLog) => void;
  renderRow: (log: TLog) => React.ReactNode;
}

const LogSection = <TLog extends InventoryLog | WorkLog>({
  title,
  description,
  filters,
  onFiltersChange,
  loading,
  logs,
  emptyMessage,
  columns,
  onRowClick,
  renderRow,
}: LogSectionProps<TLog>) => (
  <section className="space-y-4 bg-white rounded-md shadow-subtle p-4 md:p-6">
    <div className="space-y-2">
      <h2 className="text-h2 text-text-primary">{title}</h2>
      <p className="text-text-secondary">{description}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <Input
        type="date"
        label="Fra dato"
        value={filters.startDate}
        onChange={event =>
          onFiltersChange(current => ({ ...current, startDate: event.target.value }))
        }
      />
      <Input
        type="date"
        label="Til dato"
        value={filters.endDate}
        onChange={event =>
          onFiltersChange(current => ({ ...current, endDate: event.target.value }))
        }
      />
      <Input
        label="Bruger"
        placeholder="Søg efter bruger..."
        value={filters.searchTerm}
        onChange={event =>
          onFiltersChange(current => ({ ...current, searchTerm: event.target.value }))
        }
      />
      <Button
        type="button"
        variant="secondary"
        className="h-fit"
        onClick={() => onFiltersChange(defaultLogFilters)}
      >
        Nulstil filtre
      </Button>
    </div>

    {loading ? (
      <p className="text-text-secondary">Henter logs...</p>
    ) : logs.length === 0 ? (
      <p className="text-text-secondary">{emptyMessage}</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map(column => (
                <th key={column} className="px-4 py-3 text-left font-bold text-text-primary">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr
                key={log.id}
                onClick={onRowClick ? () => onRowClick(log) : undefined}
                className={`border-b border-gray-100 ${
                  onRowClick ? 'cursor-pointer transition-colors hover:bg-gray-50' : ''
                }`}
              >
                {renderRow(log)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

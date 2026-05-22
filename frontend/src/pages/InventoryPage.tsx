import React, { useEffect, useState } from 'react';
import type { InventoryItem, InventorySearchParams, ItemType, Unit } from '../types';
import { inventoryService } from '../services/inventoryService';
import { BarcodePreview, Button, Input, Modal } from '../components';

interface InventoryFilters {
  startDate: string;
  endDate: string;
  lowStock: boolean;
  typeId: string;
}

const defaultFilters: InventoryFilters = {
  startDate: '',
  endDate: '',
  lowStock: false,
  typeId: '',
};

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<InventoryFilters>(defaultFilters);
  const [draftFilters, setDraftFilters] = useState<InventoryFilters>(defaultFilters);

  const fetchItems = async (filters?: InventoryFilters) => {
    try {
      setLoading(true);

      const hasFilters =
        !!filters &&
        (filters.startDate !== '' ||
          filters.endDate !== '' ||
          filters.lowStock ||
          filters.typeId !== '');

      const response = hasFilters
        ? await inventoryService.search(toSearchParams(filters))
        : await inventoryService.getAll();

      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);

        const itemsResponse = await inventoryService.getAll();
        setItems(itemsResponse.data);

        const typesResponse = await inventoryService.getTypes();
        setItemTypes(typesResponse.data);

        const unitsResponse = await inventoryService.getUnits();
        setUnits(unitsResponse.data);
      } catch (error) {
        console.error('Failed to load inventory page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const handleOpenFilters = () => {
    setDraftFilters(activeFilters);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = async () => {
    setActiveFilters(draftFilters);
    setIsFilterModalOpen(false);
    await fetchItems(draftFilters);
  };

  const handleClearFilters = async () => {
    setActiveFilters(defaultFilters);
    setDraftFilters(defaultFilters);
    setIsFilterModalOpen(false);
    await fetchItems();
  };

  const hasActiveFilters =
    activeFilters.startDate !== '' ||
    activeFilters.endDate !== '' ||
    activeFilters.lowStock ||
    activeFilters.typeId !== '';

  const activeTypeName =
    itemTypes.find(itemType => itemType.id === Number(activeFilters.typeId))?.type || '';

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredItems = items.filter(item => {
    if (normalizedSearchQuery === '') {
      return true;
    }

    const normalizedItemName = item.itemName.toLowerCase();
    const normalizedBarcode = item.barcode.toLowerCase();
    return (
      normalizedItemName.includes(normalizedSearchQuery) ||
      normalizedBarcode.includes(normalizedSearchQuery)
    );
  });

  const getUnitSymbol = (unitId?: number) =>
    units.find(unit => unit.id === unitId)?.symbol || (unitId ? `Enhed ${unitId}` : 'N/A');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-text-primary mb-2">Inventar</h1>
        <p className="text-text-secondary text-lg">Vis og administrer laboratorie-lagerartikler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
        <Input
          label="Søg i inventar"
          placeholder="Søg efter artikler, f.eks. 'Kaffe'"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <Button
          type="button"
          variant={hasActiveFilters ? 'primary' : 'secondary'}
          className="h-fit"
          onClick={handleOpenFilters}
        >
          Filtre
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="bg-white rounded-md shadow-subtle p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-text-secondary">
              Aktive filtre:
              {' '}
              {[
                activeFilters.startDate && `Startdato ${activeFilters.startDate}`,
                activeFilters.endDate && `Slutdato ${activeFilters.endDate}`,
                activeFilters.lowStock && 'Lav lager',
                activeTypeName && `Type ${activeTypeName}`,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
            <Button type="button" variant="secondary" onClick={handleClearFilters}>
              Nulstil filtre
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 text-center py-12">
          <p className="text-h2 text-text-secondary mb-2">Ingen artikler fundet</p>
          <p className="text-text-secondary">Prov at justere din sogning eller filtre</p>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow-subtle p-4 md:p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-bold text-text-primary">Navn</th>
                <th className="px-4 py-3 text-left font-bold text-text-primary">Mængde</th>
                <th className="px-4 py-3 text-left font-bold text-text-primary">Enhed</th>
                <th className="px-4 py-3 text-left font-bold text-text-primary">Min. tærskel</th>
                <th className="px-4 py-3 text-left font-bold text-text-primary">Bedst før</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
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
                  <td className="px-4 py-3 text-text-secondary">{getUnitSymbol(item.unitId)}</td>
                  <td className="px-4 py-3 text-text-secondary">{item.minQuantity}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(item.bestBefore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
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
            <Button type="button" variant="secondary" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button type="button" onClick={handleApplyFilters}>
              Apply filters
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.itemName}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Mængde" value={selectedItem?.quantity ?? 'N/A'} />
            <DetailRow label="Enhed" value={getUnitSymbol(selectedItem?.unitId)} />
            <DetailRow label="Min. tærskel" value={selectedItem?.minQuantity} />
            <DetailRow label="Batch Nummer" value={selectedItem?.batchNumber || 'N/A'} />
            <DetailRow label="Dato Registreret" value={formatDate(selectedItem?.createdDate) || 'N/A'} />
            <DetailRow label="Best Before" value={formatDate(selectedItem?.bestBefore) || 'N/A'} />
            <DetailRow label="Sidst Brugt" value={formatDate(selectedItem?.lastUsed) || 'Aldrig'} />
            <DetailRow label="Stregkode" value={selectedItem?.barcode || 'N/A'} />
          </div>
          {selectedItem?.barcode && (
            <div>
              <p className="font-semibold text-text-primary mb-2">Barcode</p>
              <div className="rounded-xs border border-gray-200 bg-gray-50 p-4">
                <BarcodePreview value={String(selectedItem.barcode)} />
              </div>
            </div>
          )}
          {selectedItem?.notes && (
            <div>
              <p className="font-semibold text-text-primary mb-2">Noter</p>
              <p className="text-text-secondary bg-gray-50 p-3 rounded-xs">{selectedItem.notes}</p>
            </div>
          )}
          <Button
            variant="secondary"
            onClick={() => setSelectedItem(null)}
            className="w-full"
          >
            Luk
          </Button>
        </div>
      </Modal>
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

const toSearchParams = (filters: InventoryFilters): InventorySearchParams => ({
  startDate: filters.startDate || undefined,
  endDate: filters.endDate || undefined,
  lowStock: filters.lowStock || undefined,
  typeId: filters.typeId ? Number(filters.typeId) : undefined,
});

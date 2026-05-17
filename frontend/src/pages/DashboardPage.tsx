import React, { useEffect, useState } from 'react';
import type { InventoryItem, Unit } from '../types';
import { supplyListService } from '../services/supplyListService';
import { inventoryService } from '../services/inventoryService';

export const DashboardPage: React.FC = () => {
  const [lowSupplyItems, setLowSupplyItems] = useState<InventoryItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [supplyResponse, unitsResponse] = await Promise.all([
          supplyListService.getAll(),
          inventoryService.getUnits(),
        ]);

        setLowSupplyItems(supplyResponse.data);
        setUnits(unitsResponse.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const getUnitSymbol = (unitId?: number) =>
    units.find(unit => unit.id === unitId)?.symbol || (unitId ? `Enhed ${unitId}` : 'N/A');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary text-lg">Overblik over lagerstatus og kommende indsigt</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <section className="bg-white rounded-md shadow-subtle p-4 md:p-6 space-y-4 min-h-[24rem]">
          <div>
            <h2 className="text-h2 text-text-primary">Chart</h2>
            <p className="text-text-secondary">Plads reserveret til kommende dashboard-chart.</p>
          </div>
          <div className="h-full min-h-[18rem] rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
            <p className="text-text-secondary text-lg">Chart kommer her</p>
          </div>
        </section>

        <section className="bg-white rounded-md shadow-subtle p-4 md:p-6 space-y-4">
          <div>
            <h2 className="text-h2 text-text-primary">Lav lagerbeholdning</h2>
            <p className="text-text-secondary">Varer som er under eller på minimumsniveau.</p>
          </div>

          {loading ? (
            <p className="text-text-secondary">Henter supply list...</p>
          ) : lowSupplyItems.length === 0 ? (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <p className="text-text-secondary">Ingen varer er på lav lagerbeholdning.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-bold text-text-primary">Vare</th>
                    <th className="px-4 py-3 text-left font-bold text-text-primary">Mængde</th>
                    <th className="px-4 py-3 text-left font-bold text-text-primary">Min.</th>
                  </tr>
                </thead>
                <tbody>
                  {lowSupplyItems.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="px-4 py-3 font-semibold text-text-primary">{item.itemName}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        {item.quantity} {getUnitSymbol(item.unitId)}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {item.minQuantity} {getUnitSymbol(item.unitId)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

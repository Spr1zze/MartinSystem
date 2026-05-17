import type { InventorySearchParams, ItemType, Unit } from '../types';
import { apiClient } from './api';

export const inventoryService = {
  getAll: () => apiClient.get('/inventory'),
  // getById: (id: number) => apiClient.get(`/inventory/${id}`),
  search: (params: InventorySearchParams) => apiClient.get('/inventory/search', { params }),
  getTypes: () => apiClient.get<ItemType[]>('/inventory/types'),
  getUnits: () => apiClient.get<Unit[]>('/inventory/units'),
  create: (data: any) => apiClient.post('/inventory', data),
  edit: (id: number, data: any) => apiClient.put(`/inventory/${id}`, data),
  delete: (id: number) => apiClient.delete(`/inventory/${id}`),
};

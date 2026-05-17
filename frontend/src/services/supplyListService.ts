import type { InventoryItem } from '../types';
import { apiClient } from './api';

export const supplyListService = {
  getAll: () => apiClient.get<InventoryItem[]>('/supplylist'),
};

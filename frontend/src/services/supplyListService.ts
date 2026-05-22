import type { InventoryItem } from '../types';
import { apiClient } from './api';

export const supplyListService = {
  getAll: () => apiClient.get<InventoryItem[]>('/extralist'),
  getExpiredBestBefore: () => apiClient.get<InventoryItem[]>('/extralist/best-before-expired'),
};

import type { InventoryLog, ScannerInventoryItem, ScannerStudent } from '../types';
import { apiClient } from './api';

type CreateCheckoutRequest = {
  itemId: number;
  studentId: number;
  quantityTaken: number;
  signature: string;
};

export const inventoryLogService = {
  getAll: () => apiClient.get<InventoryLog[]>('/inventorylog'),
  validateStudent: (studentId: number) =>
    apiClient.get<ScannerStudent>(`/inventorylog/validate-student/${studentId}`),
  validateBarcode: (barcode: number) =>
    apiClient.get<ScannerInventoryItem>(`/inventorylog/validate-barcode/${barcode}`),
  createCheckout: (data: CreateCheckoutRequest) =>
    apiClient.post('/inventorylog/create-checkout', data),
  delete: (id: number) => apiClient.delete(`/admin/inventory-logs/${id}`),
};

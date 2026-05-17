import type { WorkLog } from '../types';
import { apiClient } from './api';

type CreateWorkLogRequest = {
  notes: string;
  batchNumber: string;
  userId: number;
};

export const workLogService = {
  getAll: () => apiClient.get<WorkLog[]>('/worklog'),
  create: (data: CreateWorkLogRequest) => apiClient.post<WorkLog>('/worklog/create-log', data),
  delete: (id: number) => apiClient.delete(`/admin/work-log/${id}`),
};

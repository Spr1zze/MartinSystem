import type { AdminDashboardStats, AdminStudent, CreateStudentRequest } from '../types';
import { apiClient } from './api';

export const adminService = {
  getDashboardStats: () => apiClient.get<AdminDashboardStats>('/admin/dashboard-stats'),
  getStudents: () => apiClient.get<AdminStudent[]>('/admin/students'),
  createStudent: (payload: CreateStudentRequest) => apiClient.post<AdminStudent>('/admin/students', payload),
  deleteStudent: (userId: number) => apiClient.delete(`/admin/students/${userId}`),
};

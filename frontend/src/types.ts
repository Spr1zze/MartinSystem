// Authentication & User
export interface User {
  id: string | number;
  name?: string;
  userName?: string;
  studentId?: string | number;
  userId?: number;
  group?: string;
  isAdmin: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (studentId: string, password: string) => Promise<void>;
  logout: () => void;
  loginAsAdmin: (password: string) => Promise<void>;
}

// Inventory
export interface InventoryItem {
  id: number;
  itemName: string;
  quantity: number;
  unitId: number;
  itemTypeId: number;
  minQuantity: number;
  lastUsed?: Date;
  batchNumber: string;
  createdDate: string;
  bestBefore: string;
  notes?: string;
  barcode: string;
}

export interface InventorySearchParams {
  startDate?: string;
  endDate?: string;
  lowStock?: boolean;
  typeId?: number;
}

export interface ItemType {
  id: number;
  type: string;
}

export interface Unit {
  id: number;
  symbol: string;
}

export interface AdminDashboardStats {
  totalGroups: number;
  lowStockItems: number;
  totalLogFiles: number;
}

export interface AdminStudent {
  id: number;
  userName: string;
  userId: number;
  groupId?: number | null;
  isAdmin?: boolean | null;
}

export interface CreateStudentRequest {
  userName: string;
  userId: number;
  groupId?: number;
}

// Checkout/Scanning
export interface CheckoutItem {
  itemId: number;
  itemName: string;
  quantityTaken: number;
  availableStock: number;
  barcode: number;
}

export interface Checkout {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  items: CheckoutItem[];
}

// Inventory Logs
export interface InventoryLog {
  id: number;
  timestamp: string;
  quantity: number;
  inventoryItemId: number;
  inventoryItemName?: string;
  userId: number;
  userName?: string;
  unitId: number;
  signature?: string;
  notes?: string;
  user?: User;
}

export interface ScannerStudent {
  id: number;
  userName: string;
  userId: number;
  groupId?: number | null;
}

export interface ScannerInventoryItem {
  id: number;
  itemName: string;
  quantity: number;
  unitId: number;
  itemTypeId: number;
  minQuantity: number;
  lastUsed?: string;
  batchNumber: string;
  createdDate: string;
  notes?: string;
  barcode: number;
}

// Work Logs
export interface WorkLog {
  id: number;
  timestamp: string;
  notes: string;
  batchNumber: string;
  userId: number;
  userName?: string;
  user?: User;
}

// Groups
export interface Group {
  id: string;
  name: string;
  memberCount: number;
}

// Notifications
export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

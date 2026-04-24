export type Role = 'admin' | 'manager' | 'waiter' | 'chef' | 'cashier';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  section: 'Main Hall' | 'Terrace' | 'Private Room';
  status: 'available' | 'occupied' | 'reserved' | 'ready_to_pay';
  waiterId?: string;
  guestCount?: number;
  seatedAt?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  isAvailable: boolean;
  description: string;
  imageUrl?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  notes: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface Order {
  id: string;
  tableId: string;
  waiterId: string;
  status: 'open' | 'sent_to_kitchen' | 'partially_ready' | 'ready' | 'sent_to_cashier' | 'paid';
  items: OrderItem[];
  isEditedByWaiter?: boolean;
  waiterAcceptedReady?: boolean;
  paidAt?: string;
}

export interface InventoryReport {
  id: string;
  chefId: string;
  date: string;
  items: {
    inventoryItemId: string;
    name: string;
    reportedStock: number;
    previousStock: number;
  }[];
  status: 'pending' | 'reviewed' | 'purchased';
  managerNote?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  costPerUnit: number;
}

export interface Staff {
  id: string;
  name: string;
  role: Role;
  phone: string;
  hireDate: string;
  salary: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  totalSpent: number;
  loyaltyPoints: number;
  tags: string[];
}

export interface Reservation {
  id: string;
  customerId: string;
  tableId: string;
  date: string;
  time: string;
  guestCount: number;
  status: 'pending' | 'confirmed' | 'seated' | 'cancelled';
  specialRequests: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Settings {
  name: string;
  address: string;
  currency: string;
  taxRate: number;
}

export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Admin', role: 'admin' },
  { id: '2', name: 'John Manager', role: 'manager' },
  { id: '3', name: 'Ali Waiter', role: 'waiter' },
  { id: '4', name: 'Marco Chef', role: 'chef' },
  { id: '5', name: 'Lena Cashier', role: 'cashier' },
  { id: '6', name: 'Sam Waiter', role: 'waiter' },
  { id: '7', name: 'Anna Waiter', role: 'waiter' },
  { id: '8', name: 'Luigi Chef', role: 'chef' },
];

export const mockTables: Table[] = [
  { id: 't1', number: 1, capacity: 4, section: 'Main Hall', status: 'occupied', waiterId: 'e1', guestCount: 3, seatedAt: '19:15' },
  { id: 't2', number: 2, capacity: 2, section: 'Main Hall', status: 'occupied', waiterId: 'e1', guestCount: 2, seatedAt: '19:40' },
  { id: 't3', number: 3, capacity: 6, section: 'Terrace', status: 'occupied', waiterId: 'e1', guestCount: 5, seatedAt: '20:00' },
  { id: 't4', number: 4, capacity: 4, section: 'Terrace', status: 'ready_to_pay', waiterId: 'e1', guestCount: 2 },
  { id: 't5', number: 5, capacity: 4, section: 'Main Hall', status: 'available', waiterId: 'e5' },
  { id: 't6', number: 6, capacity: 2, section: 'Main Hall', status: 'available', waiterId: 'e5' },
  { id: 't7', number: 7, capacity: 8, section: 'Private Room', status: 'occupied', waiterId: 'e6', guestCount: 7, seatedAt: '18:30' },
  { id: 't8', number: 8, capacity: 4, section: 'Terrace', status: 'available', waiterId: 'e6' },
];

export const mockMenuCategories: MenuCategory[] = [
  { id: 'c1', name: 'Starters' },
  { id: 'c2', name: 'Mains' },
  { id: 'c3', name: 'Desserts' },
  { id: 'c4', name: 'Drinks' },
  { id: 'c5', name: 'Specials' },
];

export const mockMenuItems: MenuItem[] = [
  { id: 'm1', categoryId: 'c1', name: 'Bruschetta', price: 8.50, isAvailable: true, description: 'Toasted bread with tomatoes', imageUrl: 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=300&h=220&fit=crop&auto=format' },
  { id: 'm2', categoryId: 'c1', name: 'Soup of the Day', price: 7.00, isAvailable: true, description: 'Ask your waiter', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=220&fit=crop&auto=format' },
  { id: 'm3', categoryId: 'c2', name: 'Grilled Salmon', price: 24.00, isAvailable: true, description: 'With lemon butter sauce', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=220&fit=crop&auto=format' },
  { id: 'm4', categoryId: 'c2', name: 'Ribeye Steak', price: 32.00, isAvailable: true, description: '300g, served with fries', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=220&fit=crop&auto=format' },
  { id: 'm5', categoryId: 'c2', name: 'Pasta Carbonara', price: 18.50, isAvailable: true, description: 'Classic Italian pasta', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&h=220&fit=crop&auto=format' },
  { id: 'm6', categoryId: 'c3', name: 'Tiramisu', price: 9.00, isAvailable: true, description: 'Coffee-flavored Italian dessert', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=220&fit=crop&auto=format' },
  { id: 'm7', categoryId: 'c4', name: 'House Red Wine', price: 6.50, isAvailable: true, description: 'Glass of house red', imageUrl: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=300&h=220&fit=crop&auto=format' },
  { id: 'm8', categoryId: 'c5', name: 'Chef\'s Special Truffle Risotto', price: 28.00, isAvailable: false, description: 'Truffle infused risotto (Sold out)', imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&h=220&fit=crop&auto=format' },
];

export const mockOrders: Order[] = [
  {
    id: 'o1', tableId: 't1', waiterId: 'e1',
    status: 'sent_to_kitchen',
    items: [
      { id: 'oi1', menuItemId: 'm1', name: 'Bruschetta', quantity: 2, price: 8.50, notes: '', status: 'pending' },
      { id: 'oi2', menuItemId: 'm3', name: 'Grilled Salmon', quantity: 1, price: 24.00, notes: 'no lemon', status: 'pending' },
    ],
  },
  {
    id: 'o2', tableId: 't4', waiterId: 'e1',
    status: 'ready',
    items: [
      { id: 'oi3', menuItemId: 'm4', name: 'Ribeye Steak', quantity: 2, price: 32.00, notes: 'medium rare', status: 'ready' },
      { id: 'oi8', menuItemId: 'm7', name: 'House Red Wine', quantity: 2, price: 6.50, notes: '', status: 'ready' },
    ],
  },
  {
    id: 'o3', tableId: 't7', waiterId: 'e6',
    status: 'partially_ready',
    items: [
      { id: 'oi4', menuItemId: 'm5', name: 'Pasta Carbonara', quantity: 4, price: 18.50, notes: '', status: 'preparing' },
      { id: 'oi5', menuItemId: 'm6', name: 'Tiramisu', quantity: 3, price: 9.00, notes: 'later', status: 'pending' },
    ],
  },
  {
    id: 'o4', tableId: 't2', waiterId: 'e1',
    status: 'partially_ready',
    items: [
      { id: 'oi6', menuItemId: 'm2', name: 'Soup of the Day', quantity: 1, price: 7.00, notes: '', status: 'preparing' },
      { id: 'oi7', menuItemId: 'm7', name: 'House Red Wine', quantity: 2, price: 6.50, notes: '', status: 'ready' },
    ],
  },
  {
    id: 'o5', tableId: 't5', waiterId: 'e5',
    status: 'sent_to_cashier',
    items: [
      { id: 'oi9', menuItemId: 'm5', name: 'Pasta Carbonara', quantity: 2, price: 18.50, notes: '', status: 'served' },
      { id: 'oi10', menuItemId: 'm6', name: 'Tiramisu', quantity: 2, price: 9.00, notes: '', status: 'served' },
    ],
  },
  {
    id: 'o6', tableId: 't8', waiterId: 'e6',
    status: 'sent_to_cashier',
    items: [
      { id: 'oi11', menuItemId: 'm3', name: 'Grilled Salmon', quantity: 1, price: 24.00, notes: '', status: 'served' },
      { id: 'oi12', menuItemId: 'm1', name: 'Bruschetta', quantity: 1, price: 8.50, notes: '', status: 'served' },
    ],
  },
  {
    id: 'o7', tableId: 't3', waiterId: 'e1',
    status: 'paid',
    paidAt: '2026-04-23T14:20:00.000Z',
    items: [
      { id: 'oi13', menuItemId: 'm4', name: 'Ribeye Steak', quantity: 1, price: 32.00, notes: '', status: 'served' },
      { id: 'oi14', menuItemId: 'm7', name: 'House Red Wine', quantity: 2, price: 6.50, notes: '', status: 'served' },
    ],
  },
];

export const mockInventory: InventoryItem[] = [
  { id: 'i1', name: 'Salmon Fillet', unit: 'kg', currentStock: 2.5, minStockLevel: 3, costPerUnit: 18 },
  { id: 'i2', name: 'Ribeye Beef', unit: 'kg', currentStock: 8, minStockLevel: 5, costPerUnit: 22 },
  { id: 'i3', name: 'Flour', unit: 'kg', currentStock: 0.8, minStockLevel: 5, costPerUnit: 1.2 },
  { id: 'i4', name: 'Tomatoes', unit: 'kg', currentStock: 12, minStockLevel: 10, costPerUnit: 2.5 },
  { id: 'i5', name: 'Coffee Beans', unit: 'kg', currentStock: 1.5, minStockLevel: 2, costPerUnit: 15 },
];

export const mockStaff: Staff[] = [
  { id: 'e1', name: 'Ali Hassan', role: 'waiter', phone: '+1 555 0101', hireDate: '2022-03-15', salary: 2800, isActive: true },
  { id: 'e5', name: 'Sam Carter', role: 'waiter', phone: '+1 555 0105', hireDate: '2023-02-12', salary: 2700, isActive: true },
  { id: 'e6', name: 'Anna Blake', role: 'waiter', phone: '+1 555 0106', hireDate: '2021-11-09', salary: 2850, isActive: true },
  { id: 'e2', name: 'Marco Rossi', role: 'chef', phone: '+1 555 0102', hireDate: '2021-07-01', salary: 3500, isActive: true },
  { id: 'e3', name: 'Sarah Admin', role: 'admin', phone: '+1 555 0103', hireDate: '2020-01-10', salary: 4500, isActive: true },
  { id: 'e4', name: 'John Manager', role: 'manager', phone: '+1 555 0104', hireDate: '2020-06-20', salary: 4000, isActive: true },
];

export const mockCustomers: Customer[] = [
  { id: 'cu1', name: 'James Wilson', phone: '+1 555 2001', email: 'james@email.com', totalVisits: 12, totalSpent: 486, loyaltyPoints: 240, tags: ['VIP'] },
  { id: 'cu2', name: 'Amira Nour', phone: '+1 555 2002', email: 'amira@email.com', totalVisits: 3, totalSpent: 94, loyaltyPoints: 47, tags: ['Regular'] },
  { id: 'cu3', name: 'Chen Wei', phone: '+1 555 2003', email: 'chen@email.com', totalVisits: 1, totalSpent: 45, loyaltyPoints: 10, tags: ['New'] },
];

export const mockReservations: Reservation[] = [
  { id: 'r1', customerId: 'cu1', tableId: 't5', date: '2024-12-20', time: '19:00', guestCount: 4, status: 'confirmed', specialRequests: 'Window table' },
  { id: 'r2', customerId: 'cu2', tableId: 't8', date: '2024-12-21', time: '20:30', guestCount: 2, status: 'pending', specialRequests: '' },
  { id: 'r3', customerId: 'cu3', tableId: 't3', date: '2024-12-22', time: '18:00', guestCount: 6, status: 'confirmed', specialRequests: 'Birthday cake' },
];

export const mockShifts: Shift[] = [
  { id: 's1', employeeId: 'e1', date: '2024-12-20', startTime: '10:00', endTime: '18:00' },
  { id: 's2', employeeId: 'e2', date: '2024-12-20', startTime: '14:00', endTime: '22:00' },
  { id: 's3', employeeId: 'e1', date: '2024-12-21', startTime: '10:00', endTime: '18:00' },
];

export const mockAttendance: Attendance[] = [
  { id: 'a1', employeeId: 'e1', date: '2024-12-19', checkIn: '09:55', checkOut: '18:05', status: 'present' },
  { id: 'a2', employeeId: 'e2', date: '2024-12-19', checkIn: '14:15', checkOut: '22:00', status: 'late' },
  { id: 'a3', employeeId: 'e3', date: '2024-12-19', checkIn: '', checkOut: '', status: 'absent' },
];

export const mockLeaveRequests: LeaveRequest[] = [
  { id: 'lr1', employeeId: 'e1', startDate: '2024-12-24', endDate: '2024-12-26', reason: 'Family vacation', status: 'pending' },
  { id: 'lr2', employeeId: 'e2', startDate: '2024-12-10', endDate: '2024-12-11', reason: 'Medical appointment', status: 'approved' },
];

export const mockSettings: Settings = {
  name: 'Demo Restaurant',
  address: '123 Culinary Ave, Food City',
  currency: 'USD',
  taxRate: 8,
};

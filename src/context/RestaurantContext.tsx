'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  mockUsers,
  mockTables,
  mockMenuCategories,
  mockMenuItems,
  mockOrders,
  mockInventory,
  mockStaff,
  mockCustomers,
  mockReservations,
  User,
  Table,
  MenuCategory,
  MenuItem,
  Order,
  InventoryReport,
  InventoryItem,
  Staff,
  Customer,
  Reservation,
  Role,
  Shift,
  Attendance,
  LeaveRequest,
  Settings,
  mockShifts,
  mockAttendance,
  mockLeaveRequests,
  mockSettings,
} from '@/lib/mockData';

interface RestaurantContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  
  menuCategories: MenuCategory[];
  setMenuCategories: React.Dispatch<React.SetStateAction<MenuCategory[]>>;
  
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;

  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;

  attendance: Attendance[];
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;

  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;

  inventoryReports: InventoryReport[];
  setInventoryReports: React.Dispatch<React.SetStateAction<InventoryReport[]>>;

  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(mockMenuCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [attendance, setAttendance] = useState<Attendance[]>(mockAttendance);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [inventoryReports, setInventoryReports] = useState<InventoryReport[]>([]);
  const [settings, setSettings] = useState<Settings>(mockSettings);

  return (
    <RestaurantContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        tables,
        setTables,
        menuCategories,
        setMenuCategories,
        menuItems,
        setMenuItems,
        orders,
        setOrders,
        inventory,
        setInventory,
        staff,
        setStaff,
        customers,
        setCustomers,
        reservations,
        setReservations,
        shifts,
        setShifts,
        attendance,
        setAttendance,
        leaveRequests,
        setLeaveRequests,
        inventoryReports,
        setInventoryReports,
        settings,
        setSettings,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

import { Customer, WantListEntry, Plant } from '../lib/types';

// Function to calculate total customers
export const calculateTotalCustomers = (customers: Customer[]): number => {
    return customers.length;
};

// Function to calculate active want lists
export const calculateActiveWantLists = (wantListEntries: WantListEntry[]): number => {
    return wantListEntries.filter(entry => !entry.is_closed).length;
};

// Function to calculate total plants
export const calculateTotalPlants = (wantListEntries: WantListEntry[]): number => {
    return wantListEntries.reduce((total, entry) => {
        return total + entry.plants.reduce((plantTotal, plant) => plantTotal + plant.quantity, 0);
    }, 0);
};

// Function to calculate pending orders
export const calculatePendingOrders = (orders: any[]): number => {
    return orders.filter(order => order.status === 'pending').length;
};

// Function to calculate average plants per want list
export const calculateAveragePlantsPerWantList = (wantListEntries: WantListEntry[]): number => {
    const totalPlants = calculateTotalPlants(wantListEntries);
    return wantListEntries.length ? totalPlants / wantListEntries.length : 0;
};

// Function to calculate total orders
export const calculateTotalOrders = (orders: any[]): number => {
    return orders.length;
};

// Function to calculate completed orders
export const calculateCompletedOrders = (orders: any[]): number => {
    return orders.filter(order => order.status === 'completed').length;
};

// Function to get all metrics
export const getMetrics = (customers: Customer[], wantListEntries: WantListEntry[], orders: any[]) => {
    return {
        totalCustomers: calculateTotalCustomers(customers),
        activeWantLists: calculateActiveWantLists(wantListEntries),
        totalPlants: calculateTotalPlants(wantListEntries),
        pendingOrders: calculatePendingOrders(orders),
        averagePlantsPerWantList: calculateAveragePlantsPerWantList(wantListEntries),
        totalOrders: calculateTotalOrders(orders),
        completedOrders: calculateCompletedOrders(orders),
    };
};
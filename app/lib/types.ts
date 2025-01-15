export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    is_active: boolean;
}

export interface Plant {
    name: string;
    size: string;
    quantity: number;
}

export interface WantListEntry {
    id: number;
    customer_id: number;
    initial: string;
    notes?: string;
    is_closed: boolean;
    spoken_to?: string;
    plants: Plant[];
    customer_first_name: string;
    customer_last_name: string;
}

export interface FormData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    initial: string;
    notes?: string;
    plants: Plant[];
    spokenTo?: string;
    customer_id?: number;
}

export interface ApiResponse {
    success: boolean;
    error?: string;
    conflict?: boolean;
    message?: string;
    customer?: Customer;
}

export interface DashboardMetrics {
    totalCustomers: number;
    activeWantlists: number;
    totalPlants: number;
    pendingOrders: number;
}

export interface ActivityItem {
    type: 'wantlist' | 'customer' | 'order';
    customer: string;
    time: string;
    action: string;
}
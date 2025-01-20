export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    is_active: boolean;
    notes: string;
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
    created_at: string;
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

export interface BenchTag {
    ID: string;
    TagName: string;
    Botanical: string;
    Department: string;
    NoWarranty: string;
    DeerResistance: string;
    Native: string;
    Sun: string;
    PartSun: string;
    Shade: string;
    GrowthRate: string;
    MatureSize: string;
    Winterizing: string;
    SpecialCareAttributes: string;
    Image: string;
    Price: string;
    Size: string;
    PotSize: string;
    PotSizeUnit: string;
    PotDepth: string;
    PotShape: string;
    PotType: string;
    PotCustomText: string;
    Print: string;
}
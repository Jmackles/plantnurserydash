export interface DashboardStats {
    totalPlants: number;
    totalCustomers: number;
    activeWantLists: number;
    lowStockItems: number;
}

export interface TopPlant {
    id: number;
    tag_name: string;
    botanical: string;
    request_count: number;
}

export interface RecentWantList {
    id: number;
    customer_name: string;
    initial: string;
    status: string;
    created_at_text: string;
    notes?: string;
    general_notes?: string;
    plants: {
        name: string;
        quantity: number;
    }[];
}

export interface CustomerActivity {
    id: number;
    customer_name: string;
    last_interaction: string;
    total_requests: number;
}

export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    is_active: boolean;
    notes: string;
}

export interface WantListPlant {
    name: string;
    size: string;
    quantity: number;
}

export interface Plant {
    id?: number;
    want_list_entry_id?: number;
    name: string;
    size: string;
    quantity: number;
}

export interface WantListEntry {
    id: number;
    customer_id: number;
    initial: string;
    notes: string;
    plants: Plant[];
    created_at: string;
    is_closed?: boolean;
    closed_by?: string;
    spoken_to?: string;
}

export interface FormData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    initial: string;
    notes?: string;
    plants: WantListPlant[];
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
    averagePlantsPerWantList: number;
    totalOrders: number;
    completedOrders: number;
}

export interface ActivityItem {
    type: 'wantlist' | 'customer' | 'order';
    customer: string;
    customer_id: number;
    time: string;
    action: string;
}

export interface BenchTagImages {
    TagName?: string;
    Botanical?: string;
    Image?: Blob;
}

export interface Genus {
    id: number;
    genus_name: string;
}

export interface Species {
    id: number;
    species_name: string;
    genus_id: number;
}

export interface Botanical {
    id: number;
    botanical_name: string;
    species_id: number;
}

export interface CommonNames {
    id: number;
    common_name: string;
    botanical_id: number;
}

export interface BenchTags {
    ID: number;
    TagName?: string;
    botanical_id?: number; // Foreign key to the Botanical table
    Department?: string;
    Classification?: string;
    NoWarranty: boolean;
    DeerResistance?: string;
    Nativity?: string;
    CarNative: boolean;
    MeltingSun: 0 | 1;
    FullSun: 0 | 1;
    PartSun: 0 | 1;
    Shade: 0 | 1;
    GrowthRate: string;
    AvgSize?: string;
    MaxSize?: string;
    MatureSize?: string;
    ZoneMax?: string;
    ZoneMin?: string;
    Winterizing?: string;
    Notes?: string;
    ShowTopNotes: boolean;
    TopNotes?: string;
    Image?: string;
    Price?: string;
    Size?: string;
    PotSize?: string;
    PotSizeUnit?: string;
    PotDepth?: string;
    PotShape?: string;
    PotType?: string;
    PotCustomText?: string;
    FlatPricing: boolean;
    FlatCount?: number;
    FlatPrice?: string;
    Print: boolean;
    Sun?: boolean;
    SpecialCareAttributes?: string;
}

export interface CheckTable {
    ID: number;
    Needs: string | number | boolean | object;
    New: boolean;
    'Needs Info?': boolean;
}

export interface GrowthRateOptions {
    ID: number;
    Description: string;
    GrowthRateRange: string;
}

export interface WinterizingOptions {
    Type?: string;
}

export interface PlantKnowledgeBase {
    id: number;
    common_name: string;
    botanical_name: string;
    department: string;
    classification?: string;
    deer_resistance?: string;
    native?: boolean;
    full_sun?: boolean;
    part_sun?: boolean;
    shade?: boolean;
    growth_rate?: string;
    mature_size?: string;
    zone_min?: number;
    zone_max?: number;
    winterizing?: string;
    notes?: string;
    image_url?: string;
    price?: string;
    size?: string;
    pot_size?: string;
    pot_type?: string;
    created_at: string;
    updated_at: string;
}

export interface KnowledgeBaseResponse {
    data: BenchTags[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    error?: string;
    details?: string;
}

export interface FilterState {
    searchQuery: string;
    sunExposure: string[];
    foliageType: string[];
    lifespan: string[];
    zones: string[];
    departments: string[];
    botanicalNames: string[];
    [key: string]: any;
}

export interface FilterOption {
    label: string;
    value: string;
}

export const filterCategories = {
    sunExposure: ['Full Sun', 'Part Sun', 'Shade', 'Deep Shade'],
    foliageType: ['Deciduous', 'Evergreen', 'Semi-evergreen'],
    lifespan: ['Annual', 'Perennial', 'Tropical'],
    departments: ['Trees', 'Shrubs', 'Perennials', 'Annuals', 'Herbs', 'Vegetables'],
} as const;

export interface AllPerennials {
    ID: number;
    TagName?: string;
    Botanical?: string;
    Department?: string;
    Classification?: string;
    Winterizing?: string;
    NoWarranty: boolean;
    DeerResistance?: string;
    CarNative: boolean;
    MeltingSun: boolean;
    FullSun: boolean;
    PartSun: boolean;
    Shade: boolean;
    GrowthRate?: string;
    MatureSize?: string;
    ZoneMax?: string;
    ZoneMin?: string;
    Notes?: string;
    Image?: Blob;
}

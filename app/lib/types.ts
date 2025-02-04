export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    is_active: boolean;
    notes: string;
}

export interface PlantCatalog {
    id: number;
    tag_name: string;
    botanical: string;
    department: string;
    classification: string;
    no_warranty: boolean;
    deer_resistance: string;
    nativity: string;
    car_native: boolean;
    melting_sun: boolean;
    full_sun: boolean;
    part_sun: boolean;
    shade: boolean;
    growth_rate: string;
    avg_size: string;
    max_size: string;
    mature_size: string;
    zone_max: number;
    zone_min: number;
    winterizing: string;
    notes: string;
    show_top_notes: boolean;
    top_notes: string;
    price: number;
    size: string;
    pot_details_id: number;
    flat_pricing: boolean;
    flat_count: number;
    flat_price: number;
    print: boolean;
    botanical_id: number;
}

export interface Plant {
    id: number;
    want_list_entry_id: number;
    name: string;
    size: string;
    quantity: number;
    status: string;
    plant_catalog_id: number;
    requested_at: string;
    fulfilled_at: string;
}

export interface PotDetails {
    id: number;
    pot_size: string;
    pot_size_unit: string;
    pot_depth: string;
    pot_shape: string;
    pot_type: string;
    pot_custom_text: string;
}

export interface WantList {
    id: number;
    customer_id: number;
    initial: string;
    notes: string;
    is_closed: boolean;
    spoken_to: string;
    created_at_text: string;
    closed_by: string;
    plants: Plant[];
}

export interface FilterState {
    sunExposure: string[];
    foliageType: string[];
    lifespan: string[];
    zones: string[];
    departments: string[];
    botanicalNames: string[];
    searchQuery: string;
    winterizing: string[];
    carNative: string[];
}

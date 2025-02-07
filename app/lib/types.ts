export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    is_active: boolean;
    notes: string;
}

export interface CatalogImage {
    id: number;
    plantcatalog_id: number;
    image_path: string;
    caption?: string;
    created_at: string;
    updated_at: string;
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
    images?: CatalogImage[];
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
    status: string;
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
    sizeCategories: string[];
}

export const SizeCategories = {
    UNSORTED: 'Unsorted (No Size Listed)',
    GROUND_COVER: 'Ground Cover (0-6")',
    SMALL: 'Small (6"-2\')',
    MEDIUM: 'Medium (2\'-6\')',
    LARGE: 'Large (6\'-15\')',
    EXTRA_LARGE: 'Extra Large (15\'+)',
} as const;

// Helper function to parse and categorize sizes
export const parsePlantSize = (sizeStr: string): string[] => {
    if (!sizeStr || sizeStr.toLowerCase().includes('n/a')) {
        return [SizeCategories.UNSORTED];
    }
    
    // Convert all measurements to inches for consistent comparison
    const getInches = (val: string): number => {
        if (val.includes('\'')) {
            return parseInt(val) * 12;
        }
        return parseInt(val);
    };

    // Extract the first height number (assuming it's the minimum height)
    const heightMatch = sizeStr.match(/(\d+)(['"]|\s*H)/);
    if (!heightMatch) return [SizeCategories.UNSORTED];

    const height = getInches(heightMatch[1] + (heightMatch[2] || ''));
    
    // Categorize based on height
    if (height <= 6) return [SizeCategories.GROUND_COVER];
    if (height <= 24) return [SizeCategories.SMALL];
    if (height > 24 && height <= 72) return [SizeCategories.MEDIUM];
    if (height > 72 && height <= 180) return [SizeCategories.LARGE];
    if (height > 180) return [SizeCategories.EXTRA_LARGE];
    
    return [SizeCategories.UNSORTED];
};

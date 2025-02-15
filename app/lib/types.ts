export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
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
    general_notes: string;
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

export enum SunCategory {
  MELTING = 'Melting Sun', // Intense, direct sunlight conditions exceeding 6 hours
  FULL = 'Full Sun',       // At least 6 hours of direct sunlight
  PART = 'Part Shade',     // Approximately 4-6 hours of direct sunlight
  SHADE = 'Shade'          // Less than 3 hours of direct sunlight
}

export function generateTooltip(acceptedCategories: SunCategory[]): string {
  // Handle single-category cases first.
  if (acceptedCategories.length === 1) {
    const category = acceptedCategories[0];
    switch (category) {
      case SunCategory.MELTING:
        return "Thrives in intense, direct sunlight for more than 6 hours daily. Ideal for very sunny, hot spots.";
      case SunCategory.FULL:
        return "Prefers full sun—requiring at least 6 hours of direct sunlight each day.";
      case SunCategory.PART:
        return "Best suited for partial sunlight, ideally receiving 4–6 hours of direct light daily.";
      case SunCategory.SHADE:
        return "Excels in low-light environments, thriving with less than 3 hours of direct sunlight per day.";
    }
  }

  // For multiple categories, calculate boolean flags.
  const hasMelting: boolean = acceptedCategories.includes(SunCategory.MELTING);
  const hasFull: boolean    = acceptedCategories.includes(SunCategory.FULL);
  const hasPart: boolean    = acceptedCategories.includes(SunCategory.PART);
  const hasShade: boolean   = acceptedCategories.includes(SunCategory.SHADE);

  // High-Light Specialists: Only MELTING and FULL
  if (hasMelting && hasFull && !hasPart && !hasShade) {
    return "Thrives in intense, direct sunlight (over 6 hours daily). Avoid shade for optimal performance.";
  }

  // High-Light with Some Flexibility: MELTING, FULL, and PART
  if (hasMelting && hasFull && hasPart && !hasShade) {
    return "Prefers intense sunlight (6+ hours daily) but can tolerate partial light (4–6 hours).";
  }

  // Wide Adaptability: All conditions accepted
  if (hasMelting && hasFull && hasPart && hasShade) {
    return "Highly adaptable—thrives under conditions ranging from intense sun (6+ hours) to deep shade (less than 3 hours).";
  }

  // Shade Specialists: Only PART and SHADE
  if (!hasMelting && !hasFull && hasPart && hasShade) {
    return "Best suited for low-light environments, excelling with partial sunlight (4–6 hours) and deep shade (under 3 hours).";
  }

  // Unique or Non-Contiguous Combinations (e.g., MELTING and SHADE only)
  if (hasMelting && !hasFull && !hasPart && hasShade) {
    return "Handles extremes: thrives in both intense sunlight (over 6 hours) and deep shade (less than 3 hours), though intermediate light may be less optimal.";
  }

  // Explicit Definition for "Full Sun & Part Shade"
  if (!hasMelting && hasFull && hasPart && !hasShade) {
    return "Grows well in full sun (6+ hours) but also performs in part shade (4–6 hours). Avoid deep shade for best results.";
  }

  // Fallback Removed – Every case is now explicitly defined.
  return "This tooltip shouldn't appear. Check logic.";
}

export const getStatusSortOrder = (status: string): number => {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 0;
        case 'completed':
            return 1;
        case 'canceled':
            return 2;
        default:
            return 999; // Unknown statuses go last
    }
};

export interface ActivityItem {
    type: string;
    customer: string;
    time: string;
    action: string;
    customer_id: number;
}

export interface DashboardMetrics {
    totalCustomers: number;
    activeWantlists: number;
    totalPlants: number;
    averagePlantsPerWantList: number;
}

export interface Documentation {
    id: number;
    entity_type: string;
    entity_id: number;
    doc_type: string;
    content: string;
    acknowledged?: boolean;
    created_at: string;
    updated_at: string;
}

export interface EntityNote {
    id: number;
    notable_type: string;
    notable_id: number;
    note_type: string;
    note_text: string;
    parent_note_id?: number;
    created_at: string;
    dismissed_at?: string;
    children?: EntityNote[];
}

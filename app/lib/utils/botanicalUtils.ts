export function normalizeBotanicalName(name: string): string {
    // Remove trailing/leading spaces
    let normalized = name.trim();
    
    // Extract the genus (first word)
    const genus = normalized.split(' ')[0];
    
    // Handle common patterns
    if (normalized.includes('x ')) {
        // Handle hybrids: "Genus x species" or "Genus x"
        normalized = normalized.split("'")[0]; // Remove cultivar names
        normalized = normalized.split(' x ')[0] + ' x'; // Standardize hybrid notation
    } else if (normalized.includes('sp.')) {
        // Handle species notation
        normalized = genus;
    } else if (normalized.includes('(')) {
        // Remove parenthetical notes
        normalized = normalized.split('(')[0].trim();
    }

    // Special cases
    const specialCases: { [key: string]: string } = {
        'Bada Bing / Bada Boom': 'Begonia',
        'Tender Perennial Lantana': 'Lantana',
        'Tender Perennial Verbena': 'Verbena',
        'Kong Series': 'Coleus',
        'Fairway Mix': 'Mixed Variety'
    };

    if (specialCases[normalized]) {
        return specialCases[normalized];
    }

    return normalized;
}

export function groupBotanicalNames(names: string[]): { [key: string]: string[] } {
    const grouped: { [key: string]: string[] } = {};

    names.forEach(name => {
        const normalized = normalizeBotanicalName(name);
        if (!grouped[normalized]) {
            grouped[normalized] = [];
        }
        if (!grouped[normalized].includes(name)) {
            grouped[normalized].includes(name);
        }
    });

    return grouped;
}

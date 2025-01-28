interface BotanicalNameParts {
    genus: string;
    species: string | null;
    cultivar: string | null;
    variety: string | null;
    forma: string | null;
    hybrid: boolean;
    subspecies: string | null;
    authority: string | null;
    commonErrors: string[];
}

class BotanicalName {
    private static readonly HYBRID_MARKERS = ['×', 'x', ' x ', ' × '];
    private static readonly CULTIVAR_PATTERN = /'[^']+'/;
    private static readonly VARIETY_PATTERN = /var\.?\s+([a-z-]+)/i;
    private static readonly FORMA_PATTERN = /f\.?\s+([a-z-]+)/i;
    private static readonly SUBSPECIES_PATTERN = /subsp\.?\s+([a-z-]+)/i;
    private static readonly AUTHORITY_PATTERN = /\s+([A-Z][a-z\.]+(?:\s+(?:ex|et)\s+[A-Z][a-z\.]+)*)\s*$/;

    private static readonly COMMON_ERRORS = new Map([
        ['japonicus', 'japonica'],
        ['chinenses', 'chinensis'],
        ['guarantica', 'guaranitica'],
        ['tussilaginea', 'tussilagina'],
        ['ilex', 'Ilex'],
        // Add more common misspellings here
    ]);

    protected parts: BotanicalNameParts;

    constructor(name: string) {
        this.parts = this.parse(name);
    }

    private parse(name: string): BotanicalNameParts {
        let cleanName = name.trim()
            .replace(/\s+/g, ' ')
            .replace(/[\(\)]/g, '')
            .replace(/["`]/g, "'");

        const parts: BotanicalNameParts = {
            genus: '',
            species: null,
            cultivar: null,
            variety: null,
            forma: null,
            hybrid: false,
            subspecies: null,
            authority: null,
            commonErrors: []
        };

        // Check for hybrid marker
        parts.hybrid = BotanicalName.HYBRID_MARKERS.some(marker => cleanName.includes(marker));
        cleanName = cleanName.replace(/\s*[×x]\s*/g, ' × ');

        // Extract cultivar
        const cultivarMatch = cleanName.match(BotanicalName.CULTIVAR_PATTERN);
        if (cultivarMatch) {
            parts.cultivar = cultivarMatch[0];
            cleanName = cleanName.replace(parts.cultivar, '').trim();
        }

        // Extract authority
        const authorityMatch = cleanName.match(BotanicalName.AUTHORITY_PATTERN);
        if (authorityMatch) {
            parts.authority = authorityMatch[1];
            cleanName = cleanName.replace(authorityMatch[0], '').trim();
        }

        // Extract subspecies, variety, and forma
        const subspeciesMatch = cleanName.match(BotanicalName.SUBSPECIES_PATTERN);
        if (subspeciesMatch) {
            parts.subspecies = subspeciesMatch[1];
            cleanName = cleanName.replace(subspeciesMatch[0], '').trim();
        }

        const varietyMatch = cleanName.match(BotanicalName.VARIETY_PATTERN);
        if (varietyMatch) {
            parts.variety = varietyMatch[1];
            cleanName = cleanName.replace(varietyMatch[0], '').trim();
        }

        const formaMatch = cleanName.match(BotanicalName.FORMA_PATTERN);
        if (formaMatch) {
            parts.forma = formaMatch[1];
            cleanName = cleanName.replace(formaMatch[0], '').trim();
        }

        // Split remaining parts
        const nameParts = cleanName.split(' ');
        parts.genus = nameParts[0];

        if (nameParts.length > 1) {
            const speciesName = nameParts[1];
            parts.species = speciesName;

            const correctedSpecies = BotanicalName.COMMON_ERRORS.get(speciesName);
            if (correctedSpecies) {
                parts.commonErrors.push(`Species "${speciesName}" corrected to "${correctedSpecies}"`);
                parts.species = correctedSpecies;
            }
        }

        return parts;
    }

    public normalize(): string {
        const parts: string[] = [this.parts.genus];

        if (this.parts.hybrid) {
            parts.push('×');
        }

        if (this.parts.species) {
            parts.push(this.parts.species);
        }

        if (this.parts.subspecies) {
            parts.push(`subsp. ${this.parts.subspecies}`);
        }

        if (this.parts.variety) {
            parts.push(`var. ${this.parts.variety}`);
        }

        if (this.parts.forma) {
            parts.push(`f. ${this.parts.forma}`);
        }

        if (this.parts.cultivar) {
            parts.push(this.parts.cultivar);
        }

        return parts.join(' ');
    }

    public getGroupKey(): string {
        if (this.parts.hybrid) {
            return `${this.parts.genus} ×`;
        }

        return this.parts.species ? `${this.parts.genus} ${this.parts.species}` : this.parts.genus;
    }
}

export function groupBotanicalNames(names: string[]): { [key: string]: string[] } {
    const nameObjects = names
        .filter(Boolean)
        .map(name => new BotanicalName(name));

    const groups: Map<string, Set<string>> = new Map();

    nameObjects.forEach(nameObj => {
        const key = nameObj.getGroupKey();
        if (!groups.has(key)) {
            groups.set(key, new Set());
        }
        groups.get(key)!.add(nameObj.normalize());
    });

    return Object.fromEntries(
        Array.from(groups.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, values]) => [key, Array.from(values)])
    );
}

export function botanicalNameMatches(plantName: string, filterName: string): boolean {
    if (!plantName || !filterName) return false;
    const plant = new BotanicalName(plantName);
    const filter = new BotanicalName(filterName);
    return plant.normalize() === filter.normalize();
}

export function parseBotanicalName(name: string): BotanicalNameParts {
    const botanicalName = new BotanicalName(name);
    return botanicalName.parts;
}

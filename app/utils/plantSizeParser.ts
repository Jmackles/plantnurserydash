type SizeRange = {
  min: number;
  max: number;
  unit: string;
  type: 'height' | 'width';
  growth: 'clumping' | 'spreading' | 'normal';
};

export function parsePlantSize(sizeString: string): SizeRange[] {
  const sizes: SizeRange[] = [];
  
  // Convert all double quotes to single quotes for consistency
  sizeString = sizeString.replace(/""/g, '"').replace(/'/g, 'ft');

  // Extract height and width if present
  const parts = sizeString.split('x').map(part => part.trim());
  
  // Parse height
  const heightMatch = parts[0].match(/(\d+)(?:-(\d+))?\s*("|ft|in|cm)?\s*(H)?\s*(clumping|spreading)?/i);
  if (heightMatch) {
    sizes.push({
      min: Number(heightMatch[1]),
      max: Number(heightMatch[2] || heightMatch[1]),
      unit: heightMatch[3] || 'ft',
      type: 'height',
      growth: (heightMatch[5]?.toLowerCase() as 'clumping' | 'spreading') || 'normal'
    });
  }

  // Parse width if present
  if (parts[1]) {
    const widthMatch = parts[1].match(/(\d+)(?:-(\d+))?\s*("|ft|in|cm)?\s*(W)?/i);
    if (widthMatch) {
      sizes.push({
        min: Number(widthMatch[1]),
        max: Number(widthMatch[2] || widthMatch[1]),
        unit: widthMatch[3] || 'ft',
        type: 'width',
        growth: 'normal'
      });
    }
  }

  return sizes;
}

export function getSizeCategory(size: string): string {
  const sizes = parsePlantSize(size);
  const height = sizes.find(s => s.type === 'height');
  
  if (!height) return 'Unknown';

  // Normalize to inches for comparison
  const maxHeight = height.max * (height.unit === 'ft' ? 12 : 1);
  
  if (maxHeight <= 6) return 'Ground Cover (0-6")';
  if (maxHeight <= 24) return 'Small (6"-24")';
  if (maxHeight <= 48) return 'Medium (2\'-4\')';
  if (maxHeight <= 96) return 'Large (4\'-8\')';
  if (maxHeight <= 240) return 'X-Large (8\'-20\')';
  return 'Giant (20\'+)';
}

export const SIZE_CATEGORIES = [
  'Ground Cover (0-6")',
  'Small (6"-24")',
  'Medium (2\'-4\')',
  'Large (4\'-8\')',
  'X-Large (8\'-20\')',
  'Giant (20\'+)'
];

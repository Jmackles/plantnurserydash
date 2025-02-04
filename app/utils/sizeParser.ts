export const parseSizeString = (sizeStr: string): SizeRange[] => {
  const ranges: SizeRange[] = [];
  
  // Handle different size formats
  const heightMatch = sizeStr.match(/(\d+(?:-\d+)?['"]?)\s*H/i);
  const widthMatch = sizeStr.match(/(\d+(?:-\d+)?['"]?)\s*W/i);
  
  if (heightMatch) {
    const [min, max] = parseRange(heightMatch[1]);
    ranges.push({
      min,
      max,
      unit: heightMatch[1].includes('"') ? 'inches' : 'feet',
      type: 'height'
    });
  }
  
  if (widthMatch) {
    const [min, max] = parseRange(widthMatch[1]);
    ranges.push({
      min,
      max,
      unit: widthMatch[1].includes('"') ? 'inches' : 'feet',
      type: 'width'
    });
  }
  
  return ranges;
};

const parseRange = (rangeStr: string): [number, number] => {
  // Remove any quotes and parentheses
  const cleanStr = rangeStr.replace(/['"()]/g, '');
  
  // Check if it's a range (e.g., "10-20") or single number
  if (cleanStr.includes('-')) {
    const [min, max] = cleanStr.split('-').map(Number);
    return [min, max];
  }
  
  const num = Number(cleanStr);
  return [num, num];
};

export const getSizeCategory = (size: SizeRange): 'small' | 'medium' | 'large' | 'xlarge' => {
  // Convert to feet if in inches
  const maxHeight = size.unit === 'inches' ? size.max / 12 : size.max;
  
  if (maxHeight <= 3) return 'small';
  if (maxHeight <= 6) return 'medium';
  if (maxHeight <= 12) return 'large';
  return 'xlarge';
};

export const getGrowthHabit = (sizeStr: string): string | null => {
  const habits = ['clumping', 'spreading'];
  for (const habit of habits) {
    if (sizeStr.toLowerCase().includes(habit)) {
      return habit;
    }
  }
  return null;
};

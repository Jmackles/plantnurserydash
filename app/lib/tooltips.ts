export const getWinterizingTooltip = (type: string): string => {
    const tooltips = {
        'mulch': 'Requires winter mulching for protection. Apply 2-3 inches of mulch around base before first frost.',
        'indoor': 'Must be moved indoors during winter months to protect from frost damage.',
        'protect': 'Needs winter protection such as covering or wrapping during extreme cold.',
        'hardy': 'Winter hardy in its specified zones. No special winter protection needed.',
        'default': 'Check specific winterizing requirements for this plant.'
    };
    return tooltips[type.toLowerCase()] || tooltips.default;
};

export const getDeerResistanceTooltip = (level: string): string => {
    const tooltips = {
        'none': 'Highly attractive to deer. Will likely require protection if deer are present.',
        'fair': 'Deer will eat if preferred food is scarce. May need occasional protection.',
        'good': 'Deer typically avoid but may sample. Usually left alone.',
        'very good': 'Deer resistant. Rarely damaged except in extreme conditions.',
        'default': 'Deer resistance level unknown.'
    };
    return tooltips[level.toLowerCase()] || tooltips.default;
};

export const getGrowthRateTooltip = (rate: string): string => {
    const tooltips = {
        'fast': 'Rapid growth rate. Expect significant size increase each growing season.',
        'moderate': 'Average growth rate. Steady, predictable growth each season.',
        'slow': 'Slow growth rate. Takes several seasons to reach mature size.',
        'default': 'Growth rate varies based on conditions.'
    };
    return tooltips[rate.toLowerCase()] || tooltips.default;
};

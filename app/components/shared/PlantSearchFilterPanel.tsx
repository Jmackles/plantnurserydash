import React from 'react';

export interface FilterState {
	// Updated filter keys including new ones
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

interface PlantSearchFilterPanelProps {
	filters: FilterState;
	setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
	isVisible: boolean;
	toggleVisibility: () => void;
}

const PlantSearchFilterPanel: React.FC<PlantSearchFilterPanelProps> = ({
	filters,
	setFilters,
	isVisible,
	toggleVisibility
}) => {
	if (!isVisible) return null;

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFilters({ ...filters, searchQuery: e.target.value });
	};

	// Toggle mechanism for array-based filters 
	const toggleFilter = (key: keyof FilterState, value: string) => {
		const current = filters[key] as string[];
		setFilters({
			...filters,
			[key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value]
		});
	};

	// Options for winterizing and updated sun exposure
	const sunOptions = [
		{ label: 'Melting Sun', value: 'MeltingSun' },
		{ label: 'Full Sun', value: 'Full' },
		{ label: 'Partial Sun', value: 'Partial' },
		{ label: 'Shade', value: 'Shade' }
	];
	const winterizingOptions = [
		'Evergreen', 'Deciduous', 'Semi-Evergreen', 'Perennial', 'Tender Perennial',
		'Perennial Evergreen', 'Perennial Semi-Evergreen', 'Tropical', 'Annual',
		'Variable', 'Perennial/Winter Annual', 'Winter Annual'
	];
	const carNativeOptions = [
		'1', // Carolina Native
		'0'  // Not Carolina Native
	];

	return (
		<>
			{/* Overlay for mobile/smaller viewports */}
			{isVisible && (
				<div 
					className="lg:hidden fixed inset-0 bg-black/30 z-40 transition-opacity"
					onClick={toggleVisibility}
				/>
			)}
			<aside 
				className={`
					fixed lg:sticky top-0 left-0 h-full 
					bg-white border-r border-gray-200
					transition-all duration-300 ease-in-out
					overflow-y-auto z-50 lg:z-0
					w-[280px] lg:w-80
					${isVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
				`}
			>
				<div className="p-4">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-bold text-[hsl(var(--accent-hsl))]">Filters</h2>
						<button
							onClick={toggleVisibility}
							className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
						>
							<span className="sr-only">Close filters</span>
							✕
						</button>
					</div>
					{/* Search Query Input */}
					<div className="mb-4">
						<label className="block font-medium mb-1">Search</label>
						<input 
							type="text" 
							value={filters.searchQuery} 
							onChange={handleSearchChange}
							placeholder="Search plants..."
							className="w-full p-2 border border-gray-300 rounded"
						/>
					</div>
					{/* Sun Exposure Filter */}
					<div className="mb-4">
						<label className="block font-medium mb-1">Sun Exposure</label>
						<div className="flex flex-wrap gap-2">
							{sunOptions.map(option => (
								<button
									key={option.value}
									onClick={() => toggleFilter('sunExposure', option.value)}
									className={`px-3 py-1 border rounded ${
										filters.sunExposure.includes(option.value)
											? 'bg-blue-600 text-white'
											: 'bg-white text-gray-600'
									}`}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>
					{/* Winterizing Filter */}
					<div className="mb-4">
						<label className="block font-medium mb-1">Winterizing Habit</label>
						<div className="flex flex-wrap gap-2">
							{winterizingOptions.map(option => (
								<button
									key={option}
									onClick={() => toggleFilter('winterizing', option)}
									className={`px-3 py-1 border rounded text-xs ${
										filters.winterizing.includes(option)
											? 'bg-green-600 text-white'
											: 'bg-white text-gray-600'
									}`}
								>
									{option}
								</button>
							))}
						</div>
					</div>
					{/* CarNative Filter */}
					<div className="mb-4">
						<label className="block font-medium mb-1">Carolina Native</label>
						<div className="flex flex-wrap gap-2">
							{carNativeOptions.map(option => (
								<button
									key={option}
									onClick={() => toggleFilter('carNative', option)}
									className={`px-3 py-1 border rounded ${
										filters.carNative.includes(option)
											? 'bg-purple-600 text-white'
											: 'bg-white text-gray-600'
									}`}
								>
									{option === '1' ? 'Native' : 'Not Native'}
								</button>
							))}
						</div>
					</div>
					{/* ...other filters can be implemented similarly... */}
				</div>
			</aside>
		</>
	);
};

export default PlantSearchFilterPanel;

import React, { useState, useRef, useEffect } from 'react';
import { PRICE_OPTIONS } from '../constants';

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const SelectAllIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const DeselectAllIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const FavoriteIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={filled ? 'white' : 'currentColor'}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const ChevronUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const LocationMarkerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const ClearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;


// --- Reusable MultiSelectDropdown Component ---
interface MultiSelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selectedOptions: string[];
  onToggleOption: (optionValue: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isOpen: boolean;
  onToggle: () => void;
  disabled: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, selectedOptions, onToggleOption, onSelectAll, onDeselectAll, isOpen, onToggle, disabled }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectionText = selectedOptions.length > 0 ? `${label.split(' ')[2]} (${selectedOptions.length})` : label;

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={onToggle} 
        disabled={disabled}
        className="bg-white dark:bg-gray-700 text-sm font-medium w-full text-left px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectionText}</span>
        <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-56 max-h-96 overflow-y-auto bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-20" role="listbox">
          <div className="p-2 border-b dark:border-gray-600 flex justify-end space-x-2">
            <button onClick={onSelectAll} title="Marcar Todos" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"><SelectAllIcon /></button>
            <button onClick={onDeselectAll} title="Desmarcar Todos" className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"><DeselectAllIcon /></button>
          </div>
          <ul>
            {options.map(option => (
              <li key={option.value} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                <label className="flex items-center space-x-2 text-sm cursor-pointer text-gray-800 dark:text-gray-200">
                  <input 
                    type="checkbox" 
                    onChange={() => onToggleOption(option.value)}
                    checked={selectedOptions.includes(option.value)}
                    className="rounded text-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-500"
                  />
                  <span>{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- HeaderControls Component ---
interface HeaderControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  cities: string[];
  selectedCities: string[];
  toggleCity: (city: string) => void;
  selectAllCities: () => void;
  deselectAllCities: () => void;
  selectedPrices: string[];
  togglePrice: (price: string) => void;
  selectAllPrices: () => void;
  deselectAllPrices: () => void;
  viewMode: 'map' | 'list';
  onViewChange: (mode: 'map' | 'list') => void;
  showFavoritesOnly: boolean;
  onToggleShowFavorites: () => void;
  proximityCenter: [number, number] | null;
  proximityRadius: number;
  onSetProximityRadius: (radius: number) => void;
  onUseGeolocation: () => void;
  onClearProximity: () => void;
  geolocationError: string | null;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  searchTerm, onSearchChange,
  cities, selectedCities, toggleCity, selectAllCities, deselectAllCities,
  selectedPrices, togglePrice, selectAllPrices, deselectAllPrices,
  viewMode, onViewChange,
  showFavoritesOnly, onToggleShowFavorites,
  proximityCenter, proximityRadius, onSetProximityRadius, onUseGeolocation, onClearProximity,
  geolocationError,
}) => {
  const cityOptions = cities.map(city => ({ value: city, label: city }));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelRef]);

  const handleToggleDropdown = (name: string) => {
    setOpenDropdown(current => (current === name ? null : name));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLHeadingElement>) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (panelRef.current) {
      panelRef.current.style.left = `${e.clientX - offset.current.x}px`;
      panelRef.current.style.top = `${e.clientY - offset.current.y}px`;
      panelRef.current.style.right = 'auto'; 
      panelRef.current.style.bottom = 'auto';
    }
  };
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = '';
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLHeadingElement>) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    offset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.body.style.userSelect = 'none';
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (panelRef.current) {
        const touch = e.touches[0];
        panelRef.current.style.left = `${touch.clientX - offset.current.x}px`;
        panelRef.current.style.top = `${touch.clientY - offset.current.y}px`;
        panelRef.current.style.right = 'auto';
        panelRef.current.style.bottom = 'auto';
    }
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.body.style.userSelect = '';
  };
  
  const isProximityActive = proximityCenter !== null;

  return (
    <div 
        ref={panelRef}
        className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-lg shadow-lg flex flex-col gap-3 w-60"
    >
        <div className="flex justify-between items-center">
            <h2 
                className="font-bold text-lg text-gray-800 dark:text-gray-100 cursor-move select-none flex-grow"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                Controles
            </h2>
            <div className="flex items-center">
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
                </button>
            </div>
        </div>
        <div className={`transition-all duration-300 ease-in-out flex flex-col gap-3 ${isCollapsed ? 'max-h-0' : 'max-h-[40rem]'} ${openDropdown ? 'overflow-visible' : 'overflow-hidden'}`}>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon />
                </span>
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Buscar por nombre"
                />
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            {/* Proximity Search Section */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Búsqueda por Proximidad</h3>
                <button 
                    onClick={onUseGeolocation}
                    className="w-full flex items-center justify-center text-xs px-2 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                    <LocationMarkerIcon/>
                    <span className="ml-1.5">Buscar Cerca de Mí</span>
                </button>
                 {geolocationError && (
                    <p className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded-md border border-red-200 dark:border-red-800/50">
                        {geolocationError}
                    </p>
                )}
                <div className="text-xs text-gray-600 dark:text-gray-400">
                    <label htmlFor="radius-slider" className="flex justify-between">
                        <span>Radio:</span>
                        <span className="font-bold">{proximityRadius} km</span>
                    </label>
                    <input
                        id="radius-slider"
                        type="range"
                        min="1"
                        max="50"
                        step="1"
                        value={proximityRadius}
                        onChange={(e) => onSetProximityRadius(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                </div>
                 {isProximityActive && (
                    <button 
                        onClick={onClearProximity}
                        className="w-full flex items-center justify-center text-xs px-2 py-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                    >
                        <ClearIcon/>
                        <span className="ml-1.5">Limpiar</span>
                    </button>
                )}
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            {/* Standard Filters */}
            <div className={`transition-opacity duration-300 ${isProximityActive ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="space-y-3">
                    <MultiSelectDropdown 
                        label="Filtrar por ciudad"
                        options={cityOptions}
                        selectedOptions={selectedCities}
                        onToggleOption={toggleCity}
                        onSelectAll={selectAllCities}
                        onDeselectAll={deselectAllCities}
                        isOpen={openDropdown === 'city'}
                        onToggle={() => handleToggleDropdown('city')}
                        disabled={isProximityActive}
                    />
                    <MultiSelectDropdown 
                        label="Filtrar por precio"
                        options={PRICE_OPTIONS}
                        selectedOptions={selectedPrices}
                        onToggleOption={togglePrice}
                        onSelectAll={selectAllPrices}
                        onDeselectAll={deselectAllPrices}
                        isOpen={openDropdown === 'price'}
                        onToggle={() => handleToggleDropdown('price')}
                        disabled={isProximityActive}
                    />
                </div>
            </div>

            <div className="inline-flex rounded-lg shadow-sm w-full" role="group">
                <button
                    type="button"
                    onClick={() => onViewChange('map')}
                    className={`flex-1 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-l-lg transition-colors ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    aria-pressed={viewMode === 'map'}
                >
                    Mapa
                </button>
                <button
                    type="button"
                    onClick={() => onViewChange('list')}
                    className={`flex-1 px-4 py-2 text-sm font-medium border-t border-b border-gray-200 dark:border-gray-600 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    aria-pressed={viewMode === 'list'}
                >
                    Lista
                </button>
                <button
                    type="button"
                    onClick={onToggleShowFavorites}
                    title="Mostrar solo favoritas"
                    className={`flex-1 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-r-lg transition-colors ${showFavoritesOnly ? 'bg-amber-500 text-white' : 'bg-white dark:bg-gray-700 text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    aria-pressed={showFavoritesOnly}
                >
                    <FavoriteIcon filled={showFavoritesOnly} />
                </button>
            </div>
        </div>
    </div>
  );
};
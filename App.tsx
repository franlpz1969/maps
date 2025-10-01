import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MapComponent } from './components/Map';
import { ResidenceInfo } from './components/ResidenceInfo';
import { HeaderControls } from './components/HeaderControls';
import { ListComponent } from './components/ListComponent';
import { RESIDENCES, PRICE_OPTIONS } from './constants';
import { Residence, GeminiSummary } from './types';

// Helper function to extract city from address
const extractCity = (address: string): string => {
  const parts = address.split(',');
  if (parts.length > 1) {
    const cityPart = parts[parts.length - 2].trim();
    return cityPart.replace(/^\d{5}\s*/, '');
  }
  return 'Desconocida';
};

// Helper function to parse the lower bound of a price range
const parsePrice = (priceRange: string): number | null => {
    if (!priceRange || ['ND', 'No especificado', 'Concertada'].includes(priceRange)) {
        return null;
    }
    const numbers = priceRange.match(/\d+/g);
    return numbers ? parseInt(numbers[0], 10) : null;
};

// Helper to calculate distance between two lat/lon points in km (Haversine formula)
const calculateDistance = (coords1: [number, number], coords2: [number, number]): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(coords2[0] - coords1[0]);
    const dLon = toRad(coords2[1] - coords1[1]);
    const lat1 = toRad(coords1[0]);
    const lat2 = toRad(coords2[0]);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};


// Pre-calculate all unique cities from the dataset
const allCities = Array.from(new Set(RESIDENCES.map(res => extractCity(res.address)))).sort();

const App: React.FC = () => {
  const [activeResidence, setActiveResidence] = useState<Residence | null>(null);
  const [infoPosition, setInfoPosition] = useState<{ x: number; y: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // --- Proximity Search State ---
  const [proximityCenter, setProximityCenter] = useState<[number, number] | null>(null);
  const [proximityRadius, setProximityRadius] = useState<number>(10); // Default 10km
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  // --- Route Display State ---
  const [activeRoute, setActiveRoute] = useState<{ from: [number, number]; to: [number, number]; } | null>(null);

  // --- State Management for User Data ---
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('favoriteResidences');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [contacted, setContacted] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('contactedResidences');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('residenceNotes');
    return saved ? JSON.parse(saved) : {};
  });

  const [summaries, setSummaries] = useState<Record<string, GeminiSummary>>(() => {
    const savedSummaries = localStorage.getItem('geminiSummaries');
    return savedSummaries ? JSON.parse(savedSummaries) : {};
  });

  // --- Persistence Effects ---
  useEffect(() => {
    document.documentElement.className = 'light';
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteResidences', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('contactedResidences', JSON.stringify(Array.from(contacted)));
  }, [contacted]);

  useEffect(() => {
    localStorage.setItem('residenceNotes', JSON.stringify(notes));
  }, [notes]);
  
  // --- UI and Filter Handlers ---
  const [selectedCities, setSelectedCities] = useState<string[]>(allCities);
  const [selectedPrices, setSelectedPrices] = useState<string[]>(() => PRICE_OPTIONS.map(p => p.value));

  const priceRangeCheck = (price: number | null, ranges: string[]): boolean => {
    if (ranges.length === 0) return false;
    
    const wantsNA = ranges.includes('na');
    if (price === null) {
        return wantsNA;
    }
    
    return ranges.some(range => {
        switch (range) {
            case '<2000': return price < 2000;
            case '2000-2500': return price >= 2000 && price <= 2500;
            case '2500-3000': return price >= 2500 && price <= 3000;
            case '>3000': return price > 3000;
            default: return false;
        }
    });
  };

  const enrichedResidences = useMemo(() => RESIDENCES.map(res => ({
    ...res,
    notes: notes[res.name] || ''
  })), [notes]);


  const filteredResidences = useMemo(() => {
    let baseResidences = enrichedResidences;

    // Proximity filter takes precedence over city/price filters
    if (proximityCenter) {
        baseResidences = baseResidences.filter(res =>
            calculateDistance(res.coords, proximityCenter) <= proximityRadius
        );
    } else {
        // Apply city and price filters only if proximity is not active
        baseResidences = baseResidences.filter(res => {
            const cityMatch = selectedCities.length === 0 ? false : selectedCities.includes(extractCity(res.address));
            const priceMatch = priceRangeCheck(parsePrice(res.priceRange), selectedPrices);
            return cityMatch && priceMatch;
        });
    }

    // Then, apply favorite and search term filters on the result
    if (showFavoritesOnly) {
        baseResidences = baseResidences.filter(res => favorites.has(res.name));
    }

    return baseResidences.filter(res =>
        searchTerm === '' || res.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enrichedResidences, selectedCities, selectedPrices, favorites, showFavoritesOnly, searchTerm, proximityCenter, proximityRadius]);

  const toggleFavorite = useCallback((name: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(name)) {
        newFavorites.delete(name);
      } else {
        newFavorites.add(name);
      }
      return newFavorites;
    });
  }, []);
  
  const toggleContacted = useCallback((name: string) => {
    setContacted(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  }, []);
  
  const handleUpdateNote = useCallback((residenceName: string, note: string) => {
    setNotes(prev => {
        const newNotes = { ...prev };
        if (note.trim()) {
            newNotes[residenceName] = note;
        } else {
            delete newNotes[residenceName];
        }
        return newNotes;
    });
  }, []);

  const handleSetSummary = useCallback((residenceName: string, summary: GeminiSummary) => {
    setSummaries(prev => {
        const newSummaries = { ...prev, [residenceName]: summary };
        localStorage.setItem('geminiSummaries', JSON.stringify(newSummaries));
        return newSummaries;
    });
  }, []);

  const toggleCity = useCallback((city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  }, []);

  const togglePrice = useCallback((priceRange: string) => {
    setSelectedPrices(prev => 
      prev.includes(priceRange) ? prev.filter(p => p !== priceRange) : [...prev, priceRange]
    );
  }, []);
  
  const selectAllCities = useCallback(() => setSelectedCities(allCities), []);
  const deselectAllCities = useCallback(() => setSelectedCities([]), []);
  
  const selectAllPrices = useCallback(() => setSelectedPrices(PRICE_OPTIONS.map(p => p.value)), []);
  const deselectAllPrices = useCallback(() => setSelectedPrices([]), []);

  const toggleShowFavorites = useCallback(() => setShowFavoritesOnly(prev => !prev), []);

  const handleMarkerClick = useCallback((residence: Residence, position: { x: number; y: number }) => {
    // Find the residence from the enriched list to ensure notes are included
    const active = enrichedResidences.find(r => r.name === residence.name) || residence;
    setActiveResidence(active);
    setInfoPosition(position);
  }, [enrichedResidences]);

  const clearActiveResidence = useCallback(() => {
    setActiveResidence(null);
    setInfoPosition(null);
    setActiveRoute(null); // Clear route when closing info card
  }, []);

  const handleInfoCardDrag = useCallback((newPosition: {x: number, y: number}) => {
    setInfoPosition(newPosition);
  }, []);

  const handleUseGeolocation = useCallback(() => {
    setGeolocationError(null);
    if (!navigator.geolocation) {
        setGeolocationError("La geolocalización no es soportada por tu navegador.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            setProximityCenter([position.coords.latitude, position.coords.longitude]);
            setGeolocationError(null);
        },
        (error: GeolocationPositionError) => {
            console.error(`Error getting geolocation (Code ${error.code}): ${error.message}`);
            let userMessage = "No se pudo obtener tu ubicación. ";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    userMessage += "Has denegado el permiso de geolocalización. Por favor, actívalo en los ajustes de tu navegador.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    userMessage += "La información de ubicación no está disponible en este momento.";
                    break;
                case error.TIMEOUT:
                    userMessage += "La solicitud para obtener la ubicación ha caducado.";
                    break;
                default:
                    userMessage += "Ha ocurrido un error desconocido.";
                    break;
            }
            setGeolocationError(userMessage);
        }
    );
  }, []);
  
  const handleClearProximity = useCallback(() => {
    setProximityCenter(null);
    setGeolocationError(null);
  }, []);


  return (
    <main className="h-screen w-screen relative text-gray-800 bg-white dark:bg-gray-900 dark:text-gray-200">
      <HeaderControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cities={allCities}
        selectedCities={selectedCities}
        toggleCity={toggleCity}
        selectAllCities={selectAllCities}
        deselectAllCities={deselectAllCities}
        selectedPrices={selectedPrices}
        togglePrice={togglePrice}
        selectAllPrices={selectAllPrices}
        deselectAllPrices={deselectAllPrices}
        viewMode={viewMode}
        onViewChange={setViewMode}
        showFavoritesOnly={showFavoritesOnly}
        onToggleShowFavorites={toggleShowFavorites}
        proximityCenter={proximityCenter}
        proximityRadius={proximityRadius}
        onSetProximityRadius={setProximityRadius}
        onUseGeolocation={handleUseGeolocation}
        onClearProximity={handleClearProximity}
        geolocationError={geolocationError}
      />
      
      <div className="h-full w-full">
        {viewMode === 'map' ? (
          <MapComponent
            residences={filteredResidences}
            favorites={favorites}
            contacted={contacted}
            onMarkerClick={handleMarkerClick}
            onMapClick={clearActiveResidence}
            proximityCenter={proximityCenter}
            proximityRadius={proximityRadius}
            activeRoute={activeRoute}
          />
        ) : (
          <ListComponent
            residences={filteredResidences}
            favorites={favorites}
            contacted={contacted}
            toggleFavorite={toggleFavorite}
            toggleContacted={toggleContacted}
            onUpdateNote={handleUpdateNote}
            summaries={summaries}
            onSetSummary={handleSetSummary}
          />
        )}
      </div>

      {viewMode === 'map' && 
        <ResidenceInfo 
            residence={activeResidence} 
            position={infoPosition} 
            favorites={favorites} 
            contacted={contacted}
            toggleFavorite={toggleFavorite}
            toggleContacted={toggleContacted}
            onClose={clearActiveResidence} 
            onDrag={handleInfoCardDrag}
            onUpdateNote={handleUpdateNote}
            summaries={summaries}
            onSetSummary={handleSetSummary}
            activeRoute={activeRoute}
            onSetActiveRoute={setActiveRoute}
        />}
    </main>
  );
};

export default App;
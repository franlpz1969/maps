import React, { useRef, useState, useEffect } from 'react';
import { Residence, GeminiSummary } from '../types';
import { GeminiInfo } from './GeminiInfo';
import { CASA1_COORDS, CASA2_COORDS } from '../constants';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ResidenceInfoProps {
  residence: Residence | null;
  position: { x: number; y: number } | null;
  favorites: Set<string>;
  contacted: Set<string>;
  toggleFavorite: (name: string) => void;
  toggleContacted: (name: string) => void;
  onClose: () => void;
  onDrag: (position: { x: number; y: number }) => void;
  onUpdateNote: (residenceName: string, note: string) => void;
  summaries: Record<string, GeminiSummary>;
  onSetSummary: (residenceName: string, summary: GeminiSummary) => void;
  activeRoute: { from: [number, number]; to: [number, number]; } | null;
  onSetActiveRoute: (route: { from: [number, number]; to: [number, number]; } | null) => void;
}

const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

const PriceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.134 0V7.418zM11.567 7.151c.22.071.409.164.567.267v1.698a2.5 2.5 0 01-1.134 0V7.151z" />
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.876.763.75.75 0 00.75 1.304 3 3 0 013.252 0 .75.75 0 00.75-1.304A4.5 4.5 0 0011 5.092V5zM10 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
  </svg>
);

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
);

const WebsiteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.522 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const MapRouteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-600 dark:text-sky-400" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.134 0V7.418zM11.567 7.151c.22.071.409.164.567.267v1.698a2.5 2.5 0 01-1.134 0V7.151z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.876.763.75.75 0 00.75 1.304 3 3 0 013.252 0 .75.75 0 00.75-1.304A4.5 4.5 0 0011 5.092V5zM10 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;

const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>;
const FavoriteIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={filled ? '#FBBF24' : 'currentColor'}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const ContactedIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={filled ? '#10B981' : 'currentColor'}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;

const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
    </div>
);

const handleShare = (residence: Residence) => {
    const text = encodeURIComponent(`Echa un vistazo a esta residencia:\n*${residence.name}*\n${residence.address}\nTel: ${residence.contactPhones.join(' / ')}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

export const ResidenceInfo: React.FC<ResidenceInfoProps> = ({ residence, position, favorites, contacted, toggleFavorite, toggleContacted, onClose, onDrag, onUpdateNote, summaries, onSetSummary, activeRoute, onSetActiveRoute }) => {
  const dragOffset = useRef({ x: 0, y: 0 });
  const [distances, setDistances] = useState<{ casa1: { distancia: string; tiempo: string }; casa2: { distancia: string; tiempo: string }; } | null>(null);
  const [isLoadingDistances, setIsLoadingDistances] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);

  useEffect(() => {
    // Reset distance info when residence changes
    setDistances(null);
    setIsLoadingDistances(false);
    setDistanceError(null);
  }, [residence]);

  if (!residence || !position) {
    return null;
  }
  const isFavorite = favorites.has(residence.name);
  const isContacted = contacted.has(residence.name);

  const handleMouseDown = (e: React.MouseEvent<HTMLHeadingElement>) => {
    e.preventDefault();
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    onDrag({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = '';
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLHeadingElement>) => {
    const touch = e.touches[0];
    dragOffset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.body.style.userSelect = 'none';
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    onDrag({
      x: touch.clientX - dragOffset.current.x,
      y: touch.clientY - dragOffset.current.y,
    });
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.body.style.userSelect = '';
  };

  const handleCalculateDistances = async () => {
    if (!residence) return;

    setIsLoadingDistances(true);
    setDistanceError(null);
    setDistances(null);

    try {
        const prompt = `Calcula la distancia en coche en kilómetros y el tiempo estimado de viaje entre el punto de origen A (latitud: ${residence.coords[0]}, longitud: ${residence.coords[1]}) y el punto de destino B (latitud: ${CASA1_COORDS[0]}, longitud: ${CASA1_COORDS[1]}). Luego, calcula lo mismo entre el punto de origen A y el punto de destino C (latitud: ${CASA2_COORDS[0]}, longitud: ${CASA2_COORDS[1]}). Devuelve exclusivamente un objeto JSON válido con la siguiente estructura: {"casa1": {"distancia": "X km", "tiempo": "Y minutos"}, "casa2": {"distancia": "Z km", "tiempo": "W minutos"}}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        casa1: {
                            type: Type.OBJECT,
                            properties: {
                                distancia: { type: Type.STRING },
                                tiempo: { type: Type.STRING },
                            },
                        },
                        casa2: {
                            type: Type.OBJECT,
                            properties: {
                                distancia: { type: Type.STRING },
                                tiempo: { type: Type.STRING },
                            },
                        },
                    },
                },
            },
        });
        
        const result = JSON.parse(response.text);
        setDistances(result);

    } catch (e) {
        console.error("Error calculating distances:", e);
        setDistanceError("No se pudo calcular la distancia.");
    } finally {
        setIsLoadingDistances(false);
    }
  };


  return (
    <div
      className="fixed p-4 bg-white/95 rounded-lg shadow-2xl backdrop-blur-sm border border-gray-200 w-80 z-[1001] dark:bg-gray-800/95 dark:border-gray-700 dark:text-gray-200 transition-opacity duration-300"
      style={{ top: position.y, left: position.x }}
      onClick={(e) => e.stopPropagation()}
    >
        <div className="flex justify-between items-start mb-2">
            <h3 
                className="text-xl font-bold text-gray-800 dark:text-gray-100 flex-grow pr-8 cursor-move select-none"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {residence.name}
            </h3>
            <button 
                onClick={onClose} 
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Cerrar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="flex items-center flex-wrap gap-2 mb-3 border-b pb-2 dark:border-gray-600">
            <button 
                onClick={() => handleShare(residence)}
                className="flex items-center text-xs px-2 py-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                aria-label="Compartir residencia"
            >
                <ShareIcon />
                <span className="ml-1">Compartir</span>
            </button>
            <button 
                onClick={() => toggleFavorite(residence.name)}
                className="flex items-center text-xs px-2 py-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                aria-label="Marcar como favorita"
            >
                <FavoriteIcon filled={isFavorite} />
                <span className="ml-1">{isFavorite ? 'Favorito' : 'Añadir'}</span>
            </button>
            <button 
                onClick={() => toggleContacted(residence.name)}
                className="flex items-center text-xs px-2 py-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                aria-label="Marcar como contactada"
            >
                <ContactedIcon filled={isContacted} />
                <span className="ml-1">{isContacted ? 'Contactado' : 'Contactar'}</span>
            </button>
        </div>
      
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <div className="flex items-start">
          <PersonIcon />
          <span>{residence.contactPersons.join(', ')}</span>
        </div>
        <div className="flex items-start">
          <PhoneIcon />
          <div>
            {residence.contactPhones.map((phone, index) => (
              <React.Fragment key={phone}>
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
                {index < residence.contactPhones.length - 1 && ' / '}
              </React.Fragment>
            ))}
          </div>
        </div>
        {residence.email && (
          <div className="flex items-start">
            <EmailIcon />
            <a href={`mailto:${residence.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">{residence.email}</a>
          </div>
        )}
        {residence.website && (
          <div className="flex items-start">
            <WebsiteIcon />
            <a href={residence.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">{residence.website}</a>
          </div>
        )}
        <div className="flex items-start">
          <LocationIcon />
          <a
            href={`https://www.google.com/maps?layer=c&cbll=${residence.coords[0]},${residence.coords[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {residence.address}
          </a>
        </div>
        <div className="flex items-start">
          <PriceIcon />
          <span className="font-semibold">{residence.priceRange}</span>
        </div>
      </div>
       <div className="mt-3">
        <label htmlFor={`notes-popup-${residence.name}`} className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notas Personales</label>
        <textarea
            id={`notes-popup-${residence.name}`}
            defaultValue={residence.notes || ''}
            onBlur={(e) => onUpdateNote(residence.name, e.target.value)}
            placeholder="Escribe algo aquí..."
            className="w-full text-sm p-2 mt-1 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            aria-label={`Notas para ${residence.name}`}
        />
      </div>

       <div className="mt-3 pt-3 border-t dark:border-gray-600">
        <button 
            onClick={handleCalculateDistances}
            disabled={isLoadingDistances}
            className="w-full text-xs px-2 py-1.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoadingDistances ? 'Calculando...' : 'Calcular Distancias en Coche'}
        </button>
        {isLoadingDistances && <LoadingSpinner />}
        {distanceError && <p className="text-xs text-red-500 text-center mt-2">{distanceError}</p>}
        {distances && (
            <div className="mt-2 text-xs space-y-1 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                <div className="flex items-center justify-between">
                    <p className="flex items-center"><HomeIcon/> <strong>Casa 1 (Pardillo):</strong><span className="ml-1">{distances.casa1.distancia} ({distances.casa1.tiempo})</span></p>
                    <button onClick={() => onSetActiveRoute({ from: residence.coords, to: CASA1_COORDS })} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title="Mostrar ruta en mapa"><MapRouteIcon /></button>
                </div>
                <div className="flex items-center justify-between">
                    <p className="flex items-center"><HomeIcon/> <strong>Casa 2 (Móstoles):</strong><span className="ml-1">{distances.casa2.distancia} ({distances.casa2.tiempo})</span></p>
                     <button onClick={() => onSetActiveRoute({ from: residence.coords, to: CASA2_COORDS })} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title="Mostrar ruta en mapa"><MapRouteIcon /></button>
                </div>
                 {activeRoute && (
                    <button 
                        onClick={() => onSetActiveRoute(null)} 
                        className="w-full mt-2 text-xs text-red-700 dark:text-red-400 hover:underline"
                    >
                        Ocultar Ruta
                    </button>
                )}
            </div>
        )}
       </div>

      <GeminiInfo residence={residence} summaries={summaries} onSetSummary={onSetSummary} />
    </div>
  );
};
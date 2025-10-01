import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Residence, GeminiSummary } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SearchInternetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-1">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
    </div>
);

const TextSizeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M16.44 3.102a.75.75 0 01.918.42l3.5 8.75a.75.75 0 01-1.318.527L18.06 9.5h-4.12l-1.48 3.33a.75.75 0 01-1.318-.527l3.5-8.75a.75.75 0 01.918-.42zM15.42 8h-1.84l.92-2.3.92 2.3z" />
        <path fillRule="evenodd" d="M4.75 3a.75.75 0 00-1.5 0v1.5h-1.5a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5V3z" clipRule="evenodd" />
    </svg>
);

// Fix: Explicitly type Star as a React.FC to allow the 'key' prop.
const Star: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star key={i} filled={i < rating} />
    ))}
  </div>
);


const FONT_SIZES = ['text-xs', 'text-sm', 'text-base'];

interface GeminiInfoProps {
    residence: Residence;
    summaries: Record<string, GeminiSummary>;
    onSetSummary: (residenceName: string, summary: GeminiSummary) => void;
}

export const GeminiInfo: React.FC<GeminiInfoProps> = ({ residence, summaries, onSetSummary }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState<GeminiSummary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fontSizeLevel, setFontSizeLevel] = useState(1); // Default to medium size

    // Effect to check for cached summary when component mounts or residence changes
    useEffect(() => {
        const cachedSummary = summaries[residence.name];
        if (cachedSummary) {
            setSummaryData(cachedSummary);
        } else {
            setSummaryData(null); // Clear previous summary if any
        }
        setError(null);
    }, [residence, summaries]);


    const fetchSummary = async () => {
        const cachedSummary = summaries[residence.name];
        if (cachedSummary) {
            setSummaryData(cachedSummary);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const prompt = `Busca en internet información y un resumen de opiniones sobre la residencia de mayores '${residence.name}' ubicada en '${residence.address}'. Analiza los servicios que ofrece, la calidad de las instalaciones y el feedback de los residentes o sus familias. Devuelve exclusivamente un objeto JSON válido con la siguiente estructura: {"summary": "un resumen conciso y objetivo en español de no más de 100 palabras", "services": una puntuación numérica entera del 1 al 5 para los servicios, "opinions": una puntuación numérica entera del 1 al 5 para las opiniones}. No incluyas información de contacto.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            services: { type: Type.INTEGER },
                            opinions: { type: Type.INTEGER },
                        },
                        required: ['summary', 'services', 'opinions'],
                    },
                },
            });

            const newSummary = JSON.parse(response.text);
            // Clamp ratings between 1 and 5
            newSummary.services = Math.max(1, Math.min(5, newSummary.services || 0));
            newSummary.opinions = Math.max(1, Math.min(5, newSummary.opinions || 0));

            setSummaryData(newSummary);
            onSetSummary(residence.name, newSummary);

        } catch (e) {
            console.error("Error fetching Gemini summary:", e);
            setError("No se pudo obtener la información. Por favor, inténtelo de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSummaryData(null);
        setError(null);
    };

    return (
        <div className="mt-3 pt-3 border-t dark:border-gray-600">
            {!summaryData && !isLoading && (
                <button
                    onClick={fetchSummary}
                    className="flex items-center justify-center text-xs w-full px-2 py-1.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                    aria-label="Buscar información y opiniones"
                >
                    <SearchInternetIcon />
                    <span className="ml-1.5 font-semibold">Valoración con IA</span>
                </button>
            )}

            {isLoading && <LoadingSpinner />}
            
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            
            {summaryData && (
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                     <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-700 dark:text-gray-300">Resumen de IA</p>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setFontSizeLevel(prev => (prev + 1) % FONT_SIZES.length)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Cambiar tamaño de letra">
                                <TextSizeIcon />
                            </button>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Cerrar resumen">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md border border-gray-200 dark:border-gray-600 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Servicios:</span>
                            <StarRating rating={summaryData.services} />
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Opiniones:</span>
                            <StarRating rating={summaryData.opinions} />
                        </div>
                        <p className={`pt-1 border-t border-gray-200 dark:border-gray-600 transition-all ${FONT_SIZES[fontSizeLevel]}`}>{summaryData.summary}</p>
                    </div>
                    <p className="text-gray-400 italic text-center text-xs">Información generada por IA. Verificar detalles importantes.</p>
                </div>
            )}
        </div>
    );
};
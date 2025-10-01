import React from 'react';
import { Residence, GeminiSummary } from '../types';
import { GeminiInfo } from './GeminiInfo';

// Icons
const PersonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 inline" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 inline" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500 inline" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500 inline" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.134 0V7.418zM11.567 7.151c.22.071.409.164.567.267v1.698a2.5 2.5 0 01-1.134 0V7.151z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.876.763.75.75 0 00.75 1.304 3 3 0 013.252 0 .75.75 0 00.75-1.304A4.5 4.5 0 0011 5.092V5zM10 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" /></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500 inline" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const WebsiteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-500 inline" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.522 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>;
const FavoriteIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={filled ? '#FBBF24' : 'currentColor'}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const ContactedIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={filled ? '#10B981' : 'currentColor'}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;

interface ListComponentProps {
  residences: Residence[];
  favorites: Set<string>;
  contacted: Set<string>;
  toggleFavorite: (name: string) => void;
  toggleContacted: (name: string) => void;
  onUpdateNote: (residenceName: string, note: string) => void;
  summaries: Record<string, GeminiSummary>;
  onSetSummary: (residenceName: string, summary: GeminiSummary) => void;
}

const handleShare = (residence: Residence) => {
    const text = encodeURIComponent(`Echa un vistazo a esta residencia:\n*${residence.name}*\n${residence.address}\nTel: ${residence.contactPhones.join(' / ')}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

export const ListComponent: React.FC<ListComponentProps> = ({ residences, favorites, contacted, toggleFavorite, toggleContacted, onUpdateNote, summaries, onSetSummary }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 px-2 sm:px-4 pb-4">
        {residences.length > 0 ? residences.map(residence => (
          <div key={residence.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{residence.name}</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center"><PersonIcon /> {residence.contactPersons.join(', ') || 'No disponible'}</p>
                <div className="flex items-center"><PhoneIcon />
                  <div>
                    {residence.contactPhones.map((phone, index) => (
                      <React.Fragment key={phone}>
                        <a href={`tel:${phone}`} className="hover:underline">
                          {phone}
                        </a>
                        {index < residence.contactPhones.length - 1 && <span className="mx-1">/</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                {residence.email && <p className="flex items-center"><EmailIcon /><a href={`mailto:${residence.email}`} className="text-blue-600 dark:text-blue-400 hover:underline truncate">{residence.email}</a></p>}
                {residence.website && <p className="flex items-center"><WebsiteIcon /><a href={residence.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">{residence.website}</a></p>}
                <div className="flex items-start">
                  <LocationIcon /> 
                  <a href={`https://www.google.com/maps?layer=c&cbll=${residence.coords[0]},${residence.coords[1]}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="hover:underline"
                  >{residence.address}</a>
                </div>
                <p className="flex items-center"><PriceIcon /> <span className="font-semibold">{residence.priceRange}</span></p>
              </div>
            </div>
            <div>
              <div className="mt-2 mb-2">
                  <label htmlFor={`notes-${residence.name}`} className="text-xs font-semibold text-gray-500 dark:text-gray-400">Notas Personales</label>
                  <textarea
                      id={`notes-${residence.name}`}
                      defaultValue={residence.notes || ''}
                      onBlur={(e) => onUpdateNote(residence.name, e.target.value)}
                      placeholder="Escribe algo aquí..."
                      className="w-full text-sm p-2 mt-1 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={2}
                      aria-label={`Notas para ${residence.name}`}
                  />
              </div>
              <GeminiInfo residence={residence} summaries={summaries} onSetSummary={onSetSummary} />
              <div className="pt-2 flex justify-end items-center gap-2">
                  <button 
                      onClick={() => handleShare(residence)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      aria-label="Compartir residencia"
                  >
                      <ShareIcon />
                  </button>
                  <button 
                      onClick={() => toggleFavorite(residence.name)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      aria-label="Marcar como favorita"
                  >
                      <FavoriteIcon filled={favorites.has(residence.name)} />
                  </button>
                  <button 
                      onClick={() => toggleContacted(residence.name)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      aria-label="Marcar como contactada"
                  >
                      <ContactedIcon filled={contacted.has(residence.name)} />
                  </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="md:col-span-2 text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">No se encontraron residencias con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

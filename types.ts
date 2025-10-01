export interface Residence {
  name: string;
  contactPersons: string[];
  contactPhones: string[];
  address: string;
  priceRange: string;
  coords: [number, number]; // [latitude, longitude]
  email: string;
  website?: string;
  notes?: string;
}

export interface GeminiSummary {
  summary: string;
  services: number; // Puntuación de 1 a 5
  opinions: number; // Puntuación de 1 a 5
}

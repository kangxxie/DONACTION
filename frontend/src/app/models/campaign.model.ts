// src/app/models/campaign.model.ts
export interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  collected: number;
  imageUrl?: string; // Aggiunta questa proprietà con "?" per renderla opzionale
}
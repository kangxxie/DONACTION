// src/app/models/donation.model.ts
export interface Donation {
  id: number;
  campaign_id: number;
  user_id?: number;
  donor_name?: string;
  email?: string;
  amount: number;
  payment_method: string;
  payment_status?: string;
  donated_at?: string;
  campaign_collected?: number; // Importo aggiornato raccolto dalla campagna dopo la donazione
  campaign_title?: string; // Titolo della campagna (utile per le liste)
}

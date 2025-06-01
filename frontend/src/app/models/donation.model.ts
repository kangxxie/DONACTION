// src/app/models/donation.model.ts
export interface Donation {
  id: number;
  campaign_id: number;
  donor_name?: string;
  amount: number;
  donated_at?: string;
}

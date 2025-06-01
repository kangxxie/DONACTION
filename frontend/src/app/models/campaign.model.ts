// src/app/models/campaign.model.ts
export interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  collected: number;
  created_at: string;
}

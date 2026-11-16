
export interface Campaign {
  publicId: string;
  name: string;
  description: string;
  inviteCode: number | null;
  status: 'ACTIVE' | 'PAUSED' | 'FINISHED';
}

export interface CampaignRequest {
  name: string;
  description: string;
}

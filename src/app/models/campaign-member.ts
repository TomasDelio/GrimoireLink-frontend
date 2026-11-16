
export interface CampaignMember {
  publicId: string;
  name: string;
  email: string;
  joinDate: string;
  role: 'PLAYER' | 'DUNGEON_MASTER';
}

export interface MediaItem {
  url: string;
  type: 'photo' | 'video';
}

export interface UserProfile {
  id: number;
  date: string;
  username: string;
  name: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  measurements: string | null;
  about: string | null;
  photoUrl: string[] | null;
  videoUrl: string[] | null;
  adminNotes: string | null;
}

export interface AnalyticsData {
  totalProfiles: number;
  avgAge: number | null;
  profilesWithPhoto: number;
  profilesWithVideo: number;
  dailyCounts: { date: string; count: number }[];
}
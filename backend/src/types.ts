
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

export interface ParsedUserData {
  name: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  measurements: string | null;
  about: string | null;
}

export interface ProfileData extends ParsedUserData {
    username: string;
    photoUrl: string[] | null;
    videoUrl: string[] | null;
}
export interface Insignia {
  insignia_id: string;
  tenant_id?: string;
  name?: string;
  description?: string;
  category?: string;
  requirements?: string[];
  progress?: number;
  image_url?: string;
  level?: "basico" | "intermedio" | "avanzado";
  points?: number;
  status?: "active" | "inactive" | string;
  created_at?: string;
  updated_at?: string;
  date_obtained?: string | null;
}

export interface memberInsigniasWithBadges {
  memberId: number;
  memberName: string;
  branch: string;
  age: number;
  completedBadges: number;
  totalBadges: number;
  badges: Insignia[];
  id?: string;
  status?: string;
  city?: string;
}

export interface InsigniaPayload {
  tenant_id: string;
  name: string;
  description: string;
  category: string;
  requirements: string[];
  image_url?: string;
  level: "basico" | "intermedio" | "avanzado";
  points: number;
  status: "active" | "inactive";
}

export interface UpdateInsignia {
  name?: string;
  description?: string;
  category?: string;
  requirements?: string[];
  image_url?: string;
  level?: "basico" | "intermedio" | "avanzado";
  points?: number;
  status?: "active" | "inactive";
}

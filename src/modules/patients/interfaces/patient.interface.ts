export interface IPatientsAllFormatRow {
  id: number;
  fullName: string;
  phone: string | null;
  avatarUrl?: string | null;
  birthday: Date;
  age: number;
  gender: string;
  hasAllergies: boolean;
  allergicReactions?: string | null;
  medicalHistory?: string | null;
  completeOdontogram: boolean;
  hasSystemicRisk: boolean;
}

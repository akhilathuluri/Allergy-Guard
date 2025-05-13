export interface User {
  id: string;
  email: string;
}

export interface Allergy {
  id: string;
  user_id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
  created_at: string;
}

export interface ScanHistory {
  id: string;
  user_id: string;
  product_name?: string;
  ingredients: string[];
  matched_allergies: string[];
  has_matches: boolean;
  analysis: string;
  created_at: string;
}
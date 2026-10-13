export interface SchoolRecord {
  id: string;
  school: string;
  district: string;
  subject: string;
  required: number;
  available: number;
  km: number; // Approximate distance from district center (km)
  studentCount?: number;
  coordinates?: { x: number; y: number }; // Relative coordinate on district map (0-100)
}

export interface RedeploymentMove {
  id: string;
  fromSchool: string;
  toSchool: string;
  district: string;
  subject: string;
  count: number;
  distance: number;
  status: 'recommended' | 'applied' | 'dismissed';
}

export type ViewMode = 
  | 'overview' 
  | 'roster' 
  | 'redeployment' 
  | 'visualizations' 
  | 'map' 
  | 'audit';

export type StatusFilter = 'all' | 'shortage' | 'surplus' | 'balanced';

export interface FilterState {
  district: string;
  subject: string;
  search: string;
  status: StatusFilter;
  maxDistance: number;
}

export interface SubjectSummary {
  subject: string;
  required: number;
  available: number;
  deficit: number;
  surplus: number;
  netGap: number;
  coverageRatio: number;
}

export interface DistrictSummary {
  district: string;
  totalSchools: number;
  totalRequired: number;
  totalAvailable: number;
  deficit: number;
  surplus: number;
  parityScore: number;
}

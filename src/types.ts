export type Language =
  | 'EN' // English
  | 'MK' // Macedonian
  | 'AL' // Albanian
  | 'DE' // German
  | 'ES' // Spanish
  | 'EL' // Greek
  | 'PL' // Polish
  | 'SV'; // Swedish

export interface Sector {
  id: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  description: Record<string, string>;
  highlights: Record<string, string[]>;
  image: string;
  demandRate: number; // Percentage
  avgLeadTime: Record<string, string>;
}

export interface RoadmapStep {
  number: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  description: Record<string, string>;
  complianceCheck: Record<string, string>;
}

export interface WorkforceRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  sector: string;
  workerCount: number;
  durationMonths: number;
  urgency: 'immediate' | 'medium' | 'planning';
  notes?: string;
  createdAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'PROCESSING';
}

export interface CandidateApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  experienceYears: number;
  sector: string;
  hasPassport: boolean;
  notes?: string;
  createdAt: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED';
}

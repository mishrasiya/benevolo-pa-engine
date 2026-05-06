export type PAStatus = 'DRAFT' | 'PENDING' | 'AI_REVIEW' | 'APPROVED' | 'DENIED' | 'APPEALED';
export type AIVerdict = 'LIKELY_APPROVED' | 'LIKELY_DENIED' | 'NEEDS_MORE_INFO';
export type Payer = 'MEDICARE' | 'MEDICAID';
export type Urgency = 'ROUTINE' | 'URGENT' | 'EMERGENT';
export type Role = 'PROVIDER' | 'ADMIN';
export type AppealStrength = 'STRONG' | 'MODERATE' | 'WEAK';

export interface PARequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  patientName: string;
  patientDOB: string;
  patientMemberId: string;
  diagnosisCodes: string;
  procedureCode: string;
  procedureDescription: string;
  payer: Payer;
  urgency: Urgency;
  clinicalNotes: string;
  documentationUrl?: string | null;
  status: PAStatus;
  aiVerdict?: AIVerdict | null;
  aiConfidence?: number | null;
  aiRationale?: string | null;
  aiDocGaps?: string | null;
  aiSuggestedCodes?: string | null;
  turnaroundEstimate?: string | null;
  appealStrength?: string | null;
  aiSummary?: string | null;
  providerId: string;
  provider?: { name: string; email: string };
  auditLog?: AuditEntry[];
  notes?: ProviderNote[];
}

export interface AuditEntry {
  id: string;
  createdAt: string;
  paRequestId: string;
  action: string;
  performedBy: string;
  details?: string | null;
}

export interface ProviderNote {
  id: string;
  createdAt: string;
  paRequestId: string;
  authorId: string;
  author?: { name: string };
  content: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface PAFormData {
  patientName: string;
  patientDOB: string;
  patientMemberId: string;
  diagnosisCodes: string;
  procedureCode: string;
  procedureDescription: string;
  payer: Payer;
  urgency: Urgency;
  clinicalNotes: string;
}

export interface AIAnalysis {
  verdict: AIVerdict;
  confidence: number;
  rationale: string[];
  documentationGaps: string[];
  suggestedCodes: { code: string; description: string }[];
  turnaroundEstimate: string;
  appealStrength: AppealStrength;
  summaryForProvider: string;
}

export interface DashboardMetrics {
  total: number;
  approved: number;
  denied: number;
  pending: number;
  approvalRate: number;
  avgConfidence: number;
}

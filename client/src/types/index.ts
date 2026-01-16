import { PolicyType } from "@/lib/mockData";

export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
export type RenewalStatus = 'UPCOMING' | 'PROCESSING' | 'AWAITING_PAYMENT' | 'PAID' | 'OVERDUE';

export interface Claim {
  id: string;
  policyNumber: string;
  policyHolder: string;
  type: PolicyType;
  amount: number;
  date: string;
  status: ClaimStatus;
}

export interface Renewal {
  id: string;
  policyNumber: string;
  clientName: string;
  premium: number;
  dueDate: string;
  status: RenewalStatus;
  type: PolicyType;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface StatusColor {
  text: string;
  background: string;
  border: string;
}

export interface ClaimsStatusData {
  name: string;
  value: number;
  color: string;
}

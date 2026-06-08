export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  source: string;
  industry: string;
  status: 'new' | 'following' | 'converted' | 'invalid';
  remarks?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  scale: string;
  address: string;
  status: 'active' | 'dormant' | 'lost';
  owner: string;
  createdAt: string;
  lostReason?: string;
  lostAt?: string;
}

export interface Contact {
  id: string;
  customerId: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  isDecisionMaker: boolean;
  remarks?: string;
}

export interface Opportunity {
  id: string;
  customerId: string;
  name: string;
  stage: 'initial' | 'requirement' | 'proposal' | 'negotiation' | 'won' | 'lost';
  amount: number;
  winRate: number;
  expectedCloseDate: string;
  owner: string;
  createdAt: string;
  lostReason?: string;
}

export interface QuoteItem {
  id: string;
  opportunityId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  description?: string;
}

export interface Followup {
  id: string;
  customerId: string;
  opportunityId?: string;
  type: 'call' | 'meeting' | 'email' | 'visit' | 'other';
  content: string;
  followDate: string;
  nextFollowDate?: string;
  nextFollowContent?: string;
  owner: string;
}

export interface Contract {
  id: string;
  customerId: string;
  opportunityId?: string;
  contractNo: string;
  name: string;
  amount: number;
  signDate: string;
  status: 'pending' | 'executing' | 'completed' | 'terminated';
  owner: string;
  remarks?: string;
}

export interface Payment {
  id: string;
  contractId: string;
  name: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface SalesRep {
  id: string;
  name: string;
  avatar?: string;
}

export interface FieldConfig {
  leads: string[];
  customers: string[];
  opportunities: string[];
  contracts: string[];
}

export interface AppSettings {
  fieldConfig: FieldConfig;
}

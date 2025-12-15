export interface UserProfile {
  name: string;
  email?: string;
  country: string;
  currency?: string; // e.g., 'EUR', 'XOF', 'USD'
  businessName?: string;
  industry?: string;
  // New fields from onboarding
  stage?: BusinessStage;
  businessType?: BusinessType;
  mainGoal?: string;
}

export enum BusinessStage {
  IDEA = 'Idée / Concept',
  MVP = 'Lancement / MVP',
  SCALING = 'Croissance / Scale',
  PIVOT = 'Restructuration / Pivot'
}

export enum BusinessType {
  SERVICE = 'Service & Consulting',
  ECOMMERCE = 'E-commerce & Retail',
  SAAS = 'Tech & SaaS',
  INDUSTRIAL = 'Industrie & Artisanat',
  CREATIVE = 'Arts & Média'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export enum PlanSection {
  IDEA_VALIDATION = 'Validation',
  MARKET_STUDY = 'Étude de Marché',
  BUSINESS_MODEL = 'Business Model',
  FINANCIALS = 'Stratégie Financière',
  LEGAL = 'Structure Légale',
  OPERATIONS = 'Système & Pilotage',
  MARKETING = 'Marketing & Acquisition',
  GROWTH = 'Croissance & Expansion'
}

export interface SimulationDataPoint {
  month: number;
  revenue: number;
  expenses: number;
  stress: number; // 0-100
  stability: number; // 0-100
}
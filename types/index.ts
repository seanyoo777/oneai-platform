export type MembershipType = "free" | "referral" | "vip";
export type UserRole = "free_member" | "referral_member" | "vip_member" | "admin";

export interface User {
  id: string;
  email: string;
  nickname: string;
  referralCode: string;
  referredBy?: string;
  role: UserRole;
  membershipType: MembershipType;
  membershipExpiresAt?: string;
  createdAt: string;
}

export interface Signal {
  id: string;
  marketType: "crypto" | "kr_stock" | "us_stock" | "kr_futures" | "global_futures";
  symbol: string;
  direction: "LONG" | "SHORT" | "buy" | "sell" | "watch";
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  strategyName: string;
  confidenceScore: number;
  reason: string;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  source: string;
  importance: "low" | "medium" | "high" | "urgent";
  sentiment: "positive" | "neutral" | "negative";
  relatedSymbols: string[];
  createdAt: string;
}

export interface Strategy {
  id: string;
  name: string;
  marketType: string;
  description: string;
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  riskLevel: "low" | "medium" | "high";
  isActive: boolean;
}

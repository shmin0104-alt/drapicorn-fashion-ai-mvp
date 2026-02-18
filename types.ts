
export enum ToolType {
  AI_PACK = 'AI_PACK',
  PRO_TECHPACK = 'PRO_TECHPACK',
  CLOTH_ONLY_FLAT = 'CLOTH_ONLY_FLAT',
  REAL_FLAT = 'REAL_FLAT',
  FIT_PREVIEW = 'FIT_PREVIEW',
  MATERIAL_ENHANCE = 'MATERIAL_ENHANCE'
}

export enum ItemType {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  DRESS = 'DRESS',
  JEANS = 'JEANS',
  SETUP = 'SETUP'
}

export interface ModelMeasurements {
  height: string;
  weight: string;
  chest: string;
  waist: string;
  hip: string;
  shoulder: string;
  armLength: string;
  inseam: string;
}

export interface TechPackMeta {
  brandName: string;
  itemName: string;
  styleNo: string;
  season: string;
  requestDate: string;
  dueDate: string;
  quantity: string;
  sizeLabel: string;
  requester: string;
  manager: string;
  additionalNotes: string;
}

export interface PreviewOptions {
  itemType: ItemType;
  lang: string;
  fit: string;
  length: string;
  measurements?: ModelMeasurements;
}

export interface GenerationResult {
  imageUrl?: string;
  imageUrl2?: string;
  text?: string;
  techPackData?: any;
  uiMessage?: string;
}

export interface Variation {
  id: string;
  thumbnail: string;
  title: string;
  tags: string[];
  note: string;
}

export interface DnaProfile {
  score: number;
  tags: {
    silhouette: string[];
  };
}

export interface MarketReaction {
  fundingRate: number; // Percentage
  currentAmount: number;
  targetAmount: number;
  backers: number;
  chips: string[]; // Positive keywords
  feedback: {
    complaint: string;
    praise: string;
  };
  demographics: {
    label: string;
    percent: number;
  }[];
}

export interface ToolConfig {
  id: ToolType;
  title: string;
  description: string;
  icon: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  image: string;
  title: string;
  likes: number; // Upvotes
  downvotes: number;
  comments: number;
  views: number;
  tags: string[];
  timestamp: string;
  boardName: string; // The "Subreddit" or "Gallery"
}

export interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  date: string;
  thumbnail?: string;
  features?: string[]; // For New Drops analysis
}

export interface QCReport {
  sampleRound: string; // e.g., "1st Sample", "2nd Sample"
  image?: string;
  corrections: string[];
  status: 'SENT' | 'CHECKED' | 'APPROVED';
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'FACTORY';
  text: string;
  timestamp: string;
  isRead: boolean;
  type?: 'TEXT' | 'QC_REPORT';
  qcData?: QCReport;
}

export interface ChatPartner {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  lastMessage?: string;
  unreadCount: number;
}

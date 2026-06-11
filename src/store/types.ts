export type SceneType = 'island' | 'garden';
export type TimeMode = 'day' | 'night';
export type FurnitureType = 'table_round' | 'table_long' | 'chair' | 'podium' | 'flower' | 'light';
export type DecorationType = 'flower_arrangement' | 'lantern' | 'arch' | 'candle' | 'light_string';

export interface Position {
  x: number;
  y: number;
}

export interface Furniture {
  id: string;
  type: FurnitureType;
  subtype: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  price: number;
  guestId?: string;
  label?: string;
}

export interface Guest {
  id: string;
  name: string;
  isVip: boolean;
  avatar?: string;
  seatId?: string;
  tableNumber?: number;
}

export interface StageConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  hasTStage: boolean;
  tStageLength: number;
  podiumX: number;
  podiumY: number;
  podiumStyle: string;
}

export interface Decoration {
  id: string;
  type: DecorationType;
  style: string;
  x: number;
  y: number;
  color: string;
  config: Record<string, any>;
  price: number;
}

export interface CeremonyStep {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  order: number;
  host: string;
  icon: string;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'venue' | 'seating' | 'stage' | 'decoration' | 'ceremony' | 'other';
}

export interface RsvpResponse {
  id: string;
  guestName: string;
  guestId?: string;
  attending: boolean;
  guestCount: number;
  message?: string;
  submittedAt: string;
}

export interface WeddingPlan {
  id: string;
  name: string;
  sceneType: SceneType;
  timeMode: TimeMode;
  stageConfig: StageConfig;
  furniture: Furniture[];
  guests: Guest[];
  decorations: Decoration[];
  ceremonySteps: CeremonyStep[];
  todos: TodoItem[];
  brideImage?: string;
  groomImage?: string;
  backgroundMusic?: string;
  musicName?: string;
  musicVolume: number;
  budget: number;
  entrancePath: Position[];
  rsvpResponses: RsvpResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  currentPlanId: string;
  plans: Record<string, WeddingPlan>;
  selectedFurnitureId: string | null;
  selectedDecorationId: string | null;
  comparePlanIds: string[];
  isDrawingPath: boolean;
  activeTool: 'select' | 'rotate' | 'delete' | 'path';
}

export interface FurnitureTemplate {
  type: FurnitureType;
  subtype: string;
  name: string;
  icon: string;
  defaultPrice: number;
  defaultColor: string;
  width: number;
  height: number;
}

export interface DecorationTemplate {
  type: DecorationType;
  style: string;
  name: string;
  icon: string;
  defaultPrice: number;
  defaultColor: string;
  size?: number;
}

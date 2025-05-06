// Scene definition
export interface Scene {
  id: string;
  name: string;
  background: string; // URL to the background image
  emoji: string;
  attribution: string; // Attribution for the image source
}

export interface GifPosition {
  id: number;
  x: number;
  y: number;
}

export interface GifData {
  id: number;
  url: string;
  text: string;
  x: number;
  y: number;
  personality: string;
  name: string;
  description: string;
  lastTalked: number;
  isBusy: boolean;
}

export interface ChatMessage {
  id: number;
  sender: string; // 'user' or 'gif'
  text: string;
  timestamp: number;
}

export interface DraggableGifProps {
  gifUrl: string;
  initialX: number;
  initialY: number;
  text: string;
  onTextChange: (text: string) => void;
  onRemove: () => void;
  gifId: number;
  onPositionChange: (id: number, x: number, y: number) => void;
  otherGifs: GifPosition[];
  personality: string;
  name: string;
  description: string;
  onStartConversation: (initiatorId: number, targetId: number, message: string) => void;
  onRespondToConversation: (responderId: number, initiatorId: number, message: string) => void;
  recentlySpokenTo: boolean;
  setRecentlySpokenTo: (value: boolean) => void;
  dailyTopic: string;
  onOpenChat: () => void;
} 
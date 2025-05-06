import { Scene } from '../types';

// Predefined scenes list with real background images
export const SCENES: Scene[] = [
  {
    id: 'forest',
    name: '森林',
    background: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1770&auto=format&fit=crop',
    emoji: '🌳',
    attribution: 'Photo by Lukasz Szmigiel on Unsplash'
  },
  {
    id: 'beach',
    name: '海滩',
    background: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1773&auto=format&fit=crop',
    emoji: '🏖️',
    attribution: 'Photo by Sean O. on Unsplash'
  },
  {
    id: 'space',
    name: '太空',
    background: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1822&auto=format&fit=crop',
    emoji: '🚀',
    attribution: 'Photo by NASA on Unsplash'
  },
  {
    id: 'school',
    name: '教室',
    background: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1632&auto=format&fit=crop',
    emoji: '🏫',
    attribution: 'Photo by Taylor Flowe on Unsplash'
  },
  {
    id: 'party',
    name: '派对',
    background: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1674&auto=format&fit=crop',
    emoji: '🎉',
    attribution: 'Photo by Pablo Heimplatz on Unsplash'
  },
  {
    id: 'winter',
    name: '冬季',
    background: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?q=80&w=1770&auto=format&fit=crop',
    emoji: '❄️',
    attribution: 'Photo by Wil Stewart on Unsplash'
  },
  {
    id: 'city',
    name: '城市',
    background: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1664&auto=format&fit=crop',
    emoji: '🏙️',
    attribution: 'Photo by Anders Jildén on Unsplash'
  },
  {
    id: 'farm',
    name: '农场',
    background: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=1771&auto=format&fit=crop',
    emoji: '🚜',
    attribution: 'Photo by Pete Nuij on Unsplash'
  }
];

// API URL
export const API_URL = 'http://localhost:5000';

// Random phrases for fallback
export const randomPhrases = [
  "你好！",
  "嗨！",
  "看我！",
  "我会动！",
  "拖动我！",
  "我会说话！",
  "耶！",
  "太酷了！",
  "我是会说话的GIF！",
  "真好玩！",
  "一起玩吧！",
  "我在这里！"
];

// Daily topics for GIF conversations
export const DAILY_TOPICS = [
  "有趣的动物",
  "最喜欢的食物",
  "太空冒险",
  "神奇的超能力",
  "海底世界",
  "未来的科技",
  "好玩的游戏",
  "四季的变化",
  "神奇的梦境",
  "学校生活"
];

// AI personalities for the GIFs
export const personalities = [
  "friendly",
  "curious",
  "silly",
  "energetic",
  "calm",
  "playful",
  "dramatic",
  "mischievous",
  "wise",
  "shy"
];

// Fun names for GIFs
export const gifNames = [
  "Blinky", "Zippy", "Bubbles", "Giggles", "Bouncy",
  "Sparkles", "Wiggles", "Glimmer", "Twinkle", "Zappy",
  "Doodle", "Wobble", "Jitters", "Hopper", "Flicker",
  "Sprinkles", "Swirly", "Dizzy", "Breezy", "Poppy"
]; 
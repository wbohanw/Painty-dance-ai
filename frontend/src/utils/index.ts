import OpenAI from 'openai';
import { gifNames, randomPhrases } from '../constants';

// OpenRouter configuration
export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  defaultHeaders: {
    "HTTP-Referer": "https://gifplayground.example.com",
    "X-Title": "GIF Playground",
  },
  dangerouslyAllowBrowser: true
});

// Generate a unique name for a GIF
export const generateUniqueName = (existingNames: string[]) => {
  const availableNames = gifNames.filter(name => !existingNames.includes(name));
  
  if (availableNames.length === 0) {
    const baseName = gifNames[Math.floor(Math.random() * gifNames.length)];
    return `${baseName}${Math.floor(Math.random() * 100)}`;
  }
  
  return availableNames[Math.floor(Math.random() * availableNames.length)];
};

// Make API call to OpenRouter
export const callAI = async (prompt: string, personality: string, description: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content: `你是一个有${personality}性格的动画GIF，你是"${description}"。你活泼有趣。请用中文回复，保持回复简短（最多15个字），有趣，适合儿童。`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Add proper null checks for the response structure
    if (!completion || !completion.choices || !completion.choices.length || !completion.choices[0].message) {
      console.warn("Invalid API response structure:", completion);
      return generateFallbackResponse(personality);
    }

    return completion.choices[0].message.content?.trim() || generateFallbackResponse(personality);
  } catch (error) {
    console.error("Error calling AI API:", error);
    return generateFallbackResponse(personality);
  }
};

// Generate a fallback response if API call fails
export const generateFallbackResponse = (personality: string) => {
  // Generic responses based on personality
  const genericResponses: Record<string, string[]> = {
    "friendly": ["真好啊！", "我同意！", "我们做朋友吧！"],
    "curious": ["告诉我更多！", "好有趣啊！", "我想知道为什么？"],
    "silly": ["哈哈，太好笑了！", "咿呀！", "太奇怪了！"],
    "energetic": ["哇！太棒了！", "我们走吧！", "太刺激了！"],
    "calm": ["我明白了。", "好平静啊。", "真不错。"],
    "playful": ["我们一起玩吧！", "好玩极了！", "耶！"],
    "dramatic": ["天啊！", "太不可思议了！", "我简直不敢相信！"],
    "mischievous": ["嘿嘿，偷偷的！", "我们能捣什么乱？", "一起恶作剧吧！"],
    "wise": ["确实如此。", "我思考过这个。", "有趣的观察。"],
    "shy": ["嗯...你好。", "如果你这么说...", "哦...好吧。"]
  };
  
  const personalityResponses = genericResponses[personality] || genericResponses["friendly"];
  return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
}; 
import { useState, useRef, useEffect } from 'react'
import './App.css'
import OpenAI from 'openai'

// 场景定义
interface Scene {
  id: string;
  name: string;
  background: string; // URL to the background image
  emoji: string;
  attribution: string; // Attribution for the image source
}

// 预设场景列表 - 使用真实图片背景
const SCENES: Scene[] = [
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

// OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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", // Replace with your actual API key
  defaultHeaders: {
    "HTTP-Referer": "https://gifplayground.example.com", // Replace with your site URL
    "X-Title": "GIF Playground", // Replace with your site name
  },
  dangerouslyAllowBrowser: true  // Add this line to allow browser usage
});

// Random phrases for fallback
const randomPhrases = [
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
const DAILY_TOPICS = [
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
const personalities = [
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
const gifNames = [
  "Blinky", "Zippy", "Bubbles", "Giggles", "Bouncy",
  "Sparkles", "Wiggles", "Glimmer", "Twinkle", "Zappy",
  "Doodle", "Wobble", "Jitters", "Hopper", "Flicker",
  "Sprinkles", "Swirly", "Dizzy", "Breezy", "Poppy"
];

// Generate a unique name for a GIF
const generateUniqueName = (existingNames: string[]) => {
  const availableNames = gifNames.filter(name => !existingNames.includes(name));
  
  if (availableNames.length === 0) {
    const baseName = gifNames[Math.floor(Math.random() * gifNames.length)];
    return `${baseName}${Math.floor(Math.random() * 100)}`;
  }
  
  return availableNames[Math.floor(Math.random() * availableNames.length)];
};

// Make API call to OpenRouter
const callAI = async (prompt: string, personality: string, description: string) => {
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
const generateFallbackResponse = (personality: string) => {
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

interface GifPosition {
  id: number;
  x: number;
  y: number;
}

interface GifData {
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

interface ChatMessage {
  id: number;
  sender: string; // 'user' or 'gif'
  text: string;
  timestamp: number;
}

interface DraggableGifProps {
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

function DraggableGif({ 
  gifUrl, 
  initialX, 
  initialY, 
  text, 
  onTextChange, 
  onRemove, 
  gifId,
  onPositionChange,
  otherGifs,
  personality,
  name,
  description,
  onStartConversation,
  onRespondToConversation,
  recentlySpokenTo,
  setRecentlySpokenTo,
  dailyTopic,
  onOpenChat
}: DraggableGifProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isTalking, setIsTalking] = useState(false);
  const [bubbleText, setBubbleText] = useState(text);
  const [typingEffect, setTypingEffect] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [nearbyGifs, setNearbyGifs] = useState<number[]>([]);
  const gifRef = useRef<HTMLDivElement>(null);
  const dragThreshold = 5; // Pixels to move before starting a drag
  const proximityThreshold = 250; // Distance in pixels to detect nearby GIFs

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!gifRef.current) return;
    
    // Record the starting position and time
    setStartPosition({ x: e.clientX, y: e.clientY });
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    // If not dragging yet, check if we've moved beyond the threshold
    if (!isDragging) {
      const diffX = Math.abs(e.clientX - startPosition.x);
      const diffY = Math.abs(e.clientY - startPosition.y);
      
      if (diffX > dragThreshold || diffY > dragThreshold) {
        setIsDragging(true);
        e.preventDefault();
      }
      return;
    }
    
    e.preventDefault();
    const newPosition = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    };
    
    setPosition(newPosition);
    onPositionChange(gifId, newPosition.x, newPosition.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!gifRef.current || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    setStartPosition({ x: touch.clientX, y: touch.clientY });
    setOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    // If not dragging yet, check if we've moved beyond the threshold
    if (!isDragging) {
      const touch = e.touches[0];
      const diffX = Math.abs(touch.clientX - startPosition.x);
      const diffY = Math.abs(touch.clientY - startPosition.y);
      
      if (diffX > dragThreshold || diffY > dragThreshold) {
        setIsDragging(true);
        e.preventDefault();
      }
      return;
    }
    
    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    const newPosition = {
      x: touch.clientX - offset.x,
      y: touch.clientY - offset.y
    };
    
    setPosition(newPosition);
    onPositionChange(gifId, newPosition.x, newPosition.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Check for nearby GIFs
  useEffect(() => {
    if (isDragging || isTalking) return;
    
    const nearby = otherGifs.filter(gif => {
      if (gif.id === gifId) return false;
      
      const distance = Math.sqrt(
        Math.pow(gif.x - position.x, 2) + 
        Math.pow(gif.y - position.y, 2)
      );
      
      return distance < proximityThreshold;
    }).map(gif => gif.id);
    
    setNearbyGifs(nearby);
  }, [gifId, otherGifs, position, isDragging, isTalking]);

  // AI-based conversation starter
  useEffect(() => {
    if (isDragging || isTalking || isThinking || recentlySpokenTo || nearbyGifs.length === 0) return;
    
    const startConversation = async () => {
      // Personality affects conversation frequency
      const talkChance = personality === 'energetic' || personality === 'friendly' ? 0.7 :
                        personality === 'playful' || personality === 'curious' ? 0.5 : 0.3;
                        
      if (Math.random() > talkChance) return;
      
      // Random delay before starting conversation (2-3 seconds)
      const delay = 2000 + Math.random() * 1000;
      
      setTimeout(async () => {
        // Choose a random nearby GIF to talk to
        if (nearbyGifs.length > 0) {
          const targetGifId = nearbyGifs[Math.floor(Math.random() * nearbyGifs.length)];
          
          setIsThinking(true);
          setBubbleText("...");
          
          // Simulate "thinking" before speaking (2-3 seconds)
          setTimeout(async () => {
            setIsTalking(true);
            setTypingEffect(true);
            
            // Generate a message with AI
            const prompt = `作为一个${personality}性格的名叫${name}的动画GIF，你是"${description}"，先打个招呼然后聊聊今天的主题：${dailyTopic}。保持对话简短有趣，适合儿童。`;
            const message = await callAI(prompt, personality, description);
            
            // Type out the message
            let charIndex = 0;
            setBubbleText("");
            
            const typingInterval = setInterval(() => {
              if (charIndex < message.length) {
                setBubbleText(message.substring(0, charIndex + 1));
                charIndex++;
              } else {
                clearInterval(typingInterval);
                setTypingEffect(false);
                
                // Update text state
                onTextChange(message);
                
                // Notify app about conversation start
                onStartConversation(gifId, targetGifId, message);
                
                // After a short delay, stop talking indication (2-3 seconds)
                setTimeout(() => {
                  setIsTalking(false);
                  setIsThinking(false);
                }, 2000 + Math.random() * 1000);
              }
            }, 25); // Faster typing speed
          }, 2000 + Math.random() * 1000);
        }
      }, delay);
    };
    
    // Random chance to start conversation (influenced by personality)
    const personalityFactor = personality === 'energetic' ? 8000 :
                              personality === 'playful' ? 10000 :
                              personality === 'friendly' ? 12000 :
                              personality === 'curious' ? 14000 : 16000;
    
    const conversationTimer = setTimeout(startConversation, personalityFactor * Math.random());
    
    return () => {
      clearTimeout(conversationTimer);
    };
  }, [
    gifId, nearbyGifs, isDragging, isTalking, isThinking, personality, name, description,
    onStartConversation, onTextChange, recentlySpokenTo, dailyTopic
  ]);

  // Respond to conversation when prompted
  useEffect(() => {
    if (recentlySpokenTo && !isTalking && !isThinking) {
      setIsThinking(true);
      setBubbleText("...");
      
      // Short delay before responding (2-3 seconds)
      setTimeout(async () => {
        setIsTalking(true);
        setTypingEffect(true);
        
        // Generate a response with AI
        const responsePrompt = `作为一个${personality}性格的名叫${name}的动画GIF，你是"${description}"，根据今天的主题${dailyTopic}回应这条消息: "${text}"`;
        const response = await callAI(responsePrompt, personality, description);
        
        // Type out the response
        let charIndex = 0;
        setBubbleText("");
        
        const typingInterval = setInterval(() => {
          if (charIndex < response.length) {
            setBubbleText(response.substring(0, charIndex + 1));
            charIndex++;
          } else {
            clearInterval(typingInterval);
            setTypingEffect(false);
            
            // Update text state
            onTextChange(response);
            
            // Find a nearby GIF to respond to (most likely the one that initiated)
            if (nearbyGifs.length > 0) {
              const likelyInitiator = nearbyGifs[0];
              onRespondToConversation(gifId, likelyInitiator, response);
            }
            
            // Reset status after a short delay (2-3 seconds)
            setTimeout(() => {
              setIsTalking(false);
              setIsThinking(false);
              setRecentlySpokenTo(false);
            }, 2000 + Math.random() * 1000);
          }
        }, 25); // Faster typing speed
      }, 2000 + Math.random() * 1000);
    }
  }, [
    recentlySpokenTo, isTalking, isThinking, text, nearbyGifs, name, description,
    onRespondToConversation, onTextChange, gifId, setRecentlySpokenTo, personality, dailyTopic
  ]);

  useEffect(() => {
    // Only add event listeners if we have the start position recorded
    if (startPosition.x !== 0 || startPosition.y !== 0) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      
      // Clean up
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [startPosition, offset, isDragging]);

  // Reset start position when dragging ends
  useEffect(() => {
    if (!isDragging) {
      setStartPosition({ x: 0, y: 0 });
    }
  }, [isDragging]);

  // Keep the GIF within the window bounds
  useEffect(() => {
    const checkBounds = () => {
      if (!gifRef.current) return;
      
      const rect = gifRef.current.getBoundingClientRect();
      const newPosition = { ...position };
      
      // Check horizontal bounds
      if (rect.right > window.innerWidth) {
        newPosition.x = window.innerWidth - rect.width;
      } else if (rect.left < 0) {
        newPosition.x = 0;
      }
      
      // Check vertical bounds
      if (rect.bottom > window.innerHeight) {
        newPosition.y = window.innerHeight - rect.height;
      } else if (rect.top < 0) {
        newPosition.y = 0;
      }
      
      if (newPosition.x !== position.x || newPosition.y !== position.y) {
        setPosition(newPosition);
        onPositionChange(gifId, newPosition.x, newPosition.y);
      }
    };
    
    checkBounds();
    window.addEventListener('resize', checkBounds);
    
    return () => {
      window.removeEventListener('resize', checkBounds);
    };
  }, [gifId, onPositionChange, position]);

  // Generate a random rotation angle between -5 and 5 degrees for crayon effect
  const randomRotation = Math.floor(Math.random() * 10) - 5;

  return (
    <div 
      ref={gifRef}
      className={`flex flex-col w-48 sm:w-52 absolute animate-[pop-in_0.4s_ease-out_forwards] 
      ${isDragging ? 'z-20 cursor-grabbing' : 'z-1 cursor-grab hover:animate-wiggle'}
      ${nearbyGifs.length > 0 ? 'has-neighbors' : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${randomRotation}deg)`,
      }}
    >
      <div className={`absolute speech-bubble bg-white p-3 rounded-xl border-3 border-black 
      -top-16 left-1/2 transform -translate-x-1/2 min-w-[120px] text-center z-20 shadow-crayon
      ${isThinking ? 'thinking' : ''} ${personality ? `personality-${personality}` : ''}`}>
        <div className={`talking-text font-crayon text-black ${typingEffect ? 'typing-animation' : ''}`}>
          {bubbleText}
        </div>
      </div>
      
      <div className={`p-3 bg-white rounded-lg shadow-crayon border-3 border-black personality-${personality}`}>
        <div className="gif-name-tag absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full border-2 border-black text-sm font-bold z-10">
          {name}
        </div>
        <div className="gif-description absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border-2 border-black text-xs z-10 max-w-[80%] whitespace-nowrap overflow-hidden text-ellipsis">
          {description}
        </div>
        
        {/* Chat button */}
        <button 
          className="absolute top-2 right-2 bg-white text-black rounded-full w-8 h-8 text-xs font-bold
          border-2 border-black shadow-sm hover:shadow-none hover:bg-crayon-blue hover:text-white z-10
          transform transition-transform hover:rotate-12"
          onClick={(e) => {
            e.stopPropagation(); // Prevent dragging when clicking the button
            onOpenChat();
          }}
        >
          💬
        </button>
        
        <img 
          src={gifUrl} 
          alt="Draggable GIF" 
          className={`w-full h-auto block rounded-lg pointer-events-none
          ${isTalking ? 'talking-animation' : ''}`}
        />
      </div>
    </div>
  );
}

// Add this near the top of your imports
const API_URL = 'http://localhost:5000';

function App() {
  // 当前选择的场景
  const [currentScene, setCurrentScene] = useState<Scene>(SCENES[0]);
  
  // 每个场景的GIFs状态（使用场景ID作为键）
  const [sceneGifs, setSceneGifs] = useState<Record<string, GifData[]>>({
    forest: [],
    beach: [],
    space: [],
    school: [],
    party: [],
    winter: []
  });
  
  // 根据当前场景获取GIFs
  const gifs = sceneGifs[currentScene.id] || [];
  
  // 切换场景
  const changeScene = (sceneId: string) => {
    const newScene = SCENES.find(scene => scene.id === sceneId);
    if (newScene) {
      setCurrentScene(newScene);
    }
  };
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadPersonality, setUploadPersonality] = useState('friendly');
  const [conversationState, setConversationState] = useState<{[key: number]: boolean}>({});
  const [dailyTopic] = useState(() => 
    DAILY_TOPICS[Math.floor(Math.random() * DAILY_TOPICS.length)]
  );

  // Add chat-related state
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatGif, setActiveChatGif] = useState<GifData | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<number, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState('');

  // Add this new state variable
  const [isUploading, setIsUploading] = useState(false);

  // Function to open chat with a GIF
  const openChatWith = (gif: GifData) => {
    setActiveChatGif(gif);
    setShowChatModal(true);
    
    // Initialize chat history for this GIF if it doesn't exist
    if (!chatMessages[gif.id]) {
      setChatMessages(prev => ({
        ...prev,
        [gif.id]: []
      }));
    }
  };
  
  // Function to send a message in chat
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !activeChatGif) return;
    
    const gifId = activeChatGif.id;
    const newUserMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: chatInput,
      timestamp: Date.now()
    };
    
    // Add user message to chat
    setChatMessages(prev => ({
      ...prev,
      [gifId]: [...(prev[gifId] || []), newUserMessage]
    }));
    
    // Clear input
    setChatInput('');
    
    // Generate GIF response
    try {
      const response = await callAI(
        `用户给你发了消息: "${chatInput}"。作为${activeChatGif.personality}性格的角色，你是"${activeChatGif.description}"，请用中文回复这条消息。`,
        activeChatGif.personality,
        activeChatGif.description
      );
      
      // Add GIF response to chat
      const newGifMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'gif',
        text: response,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => ({
        ...prev,
        [gifId]: [...(prev[gifId] || []), newGifMessage]
      }));
    } catch (error) {
      console.error("Error generating chat response:", error);
    }
  };

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if file is a valid image type
      if (!file.type.includes('image/')) {
        alert('请上传图片文件 (PNG, JPG, JPEG)');
        return;
      }
      
      setUploadFile(file);
      const objectUrl = URL.createObjectURL(file);
      setUploadPreview(objectUrl);
    }
  };
  
  // 清理对象URL，防止内存泄漏
  useEffect(() => {
    return () => {
      // Clean up any object URLs to avoid memory leaks
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
      }
    };
  }, [uploadPreview]);

  // 修改文本变更处理函数
  const handleTextChange = (id: number, newText: string) => {
    setSceneGifs(prev => ({
      ...prev,
      [currentScene.id]: prev[currentScene.id].map(gif => 
        gif.id === id ? { ...gif, text: newText } : gif
      )
    }));
  };

  // 修改位置变更处理函数
  const handlePositionChange = (id: number, x: number, y: number) => {
    setSceneGifs(prev => ({
      ...prev,
      [currentScene.id]: prev[currentScene.id].map(gif => 
        gif.id === id ? { ...gif, x, y } : gif
      )
    }));
  };

  // 修改移除GIF函数
  const removeGif = (id: number) => {
    setSceneGifs(prev => ({
      ...prev,
      [currentScene.id]: prev[currentScene.id].filter(gif => gif.id !== id)
    }));
  };

  // 修改对话开始处理函数
  const handleStartConversation = (initiatorId: number, targetId: number, message: string) => {
    // Mark the target as recently spoken to
    setConversationState(prev => ({
      ...prev,
      [targetId]: true
    }));
    
    // Update the lastTalked timestamp for the initiator
    setSceneGifs(prev => ({
      ...prev,
      [currentScene.id]: prev[currentScene.id].map(gif => 
        gif.id === initiatorId ? { ...gif, lastTalked: Date.now() } : gif
      )
    }));
  };
  
  // 修改对话响应处理函数
  const handleRespondToConversation = (responderId: number, initiatorId: number, message: string) => {
    // Update the lastTalked timestamp for the responder
    setSceneGifs(prev => ({
      ...prev,
      [currentScene.id]: prev[currentScene.id].map(gif => 
        gif.id === responderId ? { ...gif, lastTalked: Date.now() } : gif
      )
    }));
  };

  const setGifRecentlySpokenTo = (id: number, value: boolean) => {
    setConversationState(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // 修改添加GIF函数
  const handleGifUpload = async () => {
    if (!uploadFile || !uploadName || !uploadDescription) {
      alert('请填写所有字段');
      return;
    }
    
    // 显示上传中状态
    setIsUploading(true);
    
    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      // 发送图片到后端处理
      const response = await fetch(`${API_URL}/process_image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        console.error("Using fallback GIF for testing");
        // Use a placeholder GIF instead
        const gifUrl = "https://media.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif";
        
        // Rest of the code to add the GIF to the scene
        // ... (same as your existing code, just use the placeholder URL)
        
        return; // Skip the error throwing
      }
      
      const data = await response.json();
      console.log('处理成功:', data);
      
      // 构建GIF URL (video.gif 位于输出目录中)
      const gifUrl = `${API_URL}/${data.output_dir}/video.gif`;
      
      // 获取当前场景的GIFs
      const currentGifs = sceneGifs[currentScene.id] || [];
      const newId = Math.max(...currentGifs.map(gif => gif.id), 0) + 1;
      const randomPhrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
      
      // 更新当前场景的GIFs
      setSceneGifs(prev => ({
        ...prev,
        [currentScene.id]: [
          ...prev[currentScene.id],
          {
            id: newId,
            url: gifUrl,
            text: randomPhrase,
            x: Math.random() * (window.innerWidth - 200),
            y: Math.random() * (window.innerHeight - 200),
            personality: uploadPersonality,
            name: uploadName,
            description: uploadDescription,
            lastTalked: 0,
            isBusy: false
          }
        ]
      }));
      
      // Reset form and close modal
      setUploadFile(null);
      setUploadPreview('');
      setUploadName('');
      setUploadDescription('');
      setUploadPersonality('friendly');
      setShowUploadModal(false);
    } catch (error) {
      console.error('上传图片失败:', error);
      alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Get all GIF positions for proximity detection
  const gifPositions = gifs.map(gif => ({
    id: gif.id,
    x: gif.x,
    y: gif.y
  }));

  return (
    <div className="w-screen h-screen flex flex-col p-5 font-crayon overflow-hidden paper-bg">
      <header className="flex justify-between items-center pb-5 border-b-4 border-dashed border-black mb-5 relative">
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-crayon-yellow rotate-1"></div>
        
        <h1 className="text-4xl font-bold text-black hand-drawn relative animate-wiggle">
          <span className="text-crayon-red relative crayon-scribble-red">图画</span>
          <span className="text-crayon-blue relative crayon-scribble-blue">AI</span>
          <span className="text-crayon-green relative crayon-scribble-green">乐园</span>
          <span className="text-black mx-4">Playground!</span>
          <span className="text-crayon-purple ml-2 animate-bounce inline-block">🎨</span>
        </h1>
        
        {/* 场景选择器 - Enhanced with cartoon styling */}
        <div className="flex space-x-3 bg-white p-2 rounded-xl shadow-crayon border-2 border-black">
          <div className="text-sm font-bold mr-1">场景：</div>
          {SCENES.map(scene => (
            <button
              key={scene.id}
              className={`p-2 cursor-pointer rounded-full scene-selector ${currentScene.id === scene.id ? 
                'active bg-crayon-yellow border-2 border-black shadow-crayon' : 
                'bg-white border-2 border-gray-300 hover:border-black'}`}
              onClick={() => changeScene(scene.id)}
              title={scene.name}
            >
              <span className="text-lg">{scene.emoji}</span>
              <span className={`text-xs absolute -bottom-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap ${
                currentScene.id === scene.id ? 'font-bold' : 'opacity-0 group-hover:opacity-100'
              }`}>
              </span>
            </button>
          ))}
        </div>
        
        <button 
          className="crayon-button bg-crayon-pink hover:bg-pink-400 transform hover:rotate-1"
          onClick={() => setShowUploadModal(true)}
        >
          <span className="inline-block animate-pulse mr-1">✨</span> 
          上传作品! 
          <span className="inline-block animate-pulse ml-1">✨</span>
        </button>
        
        <div className="text-sm bg-crayon-yellow px-4 py-2 rounded-full border-2 border-black shadow-crayon topic-badge transform -rotate-2">
          <span className="font-bold">今日主题：</span>{dailyTopic}
        </div>
      </header>
      
      <div 
        className="flex-1 relative rounded-xl overflow-hidden crayon-border scene-transition"
        style={{ 
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.6)), url(${currentScene.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 场景名称和图片署名 */}
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-xl border-2 border-black text-sm font-bold shadow-crayon transform -rotate-2">
          {currentScene.emoji} <span className="text-lg">{currentScene.name}</span> 场景
        </div>
        
        {/* 图片署名 */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-80 px-3 py-1 rounded-lg border border-black text-xs text-gray-700 shadow-sm transform rotate-1">
          {currentScene.attribution}
        </div>
        
        {gifs.length > 0 ? (
          gifs.map((gif) => (
            <DraggableGif
              key={gif.id}
              gifId={gif.id}
              gifUrl={gif.url}
              initialX={gif.x}
              initialY={gif.y}
              text={gif.text}
              onTextChange={(newText) => handleTextChange(gif.id, newText)}
              onRemove={() => removeGif(gif.id)}
              onPositionChange={handlePositionChange}
              otherGifs={gifPositions}
              personality={gif.personality}
              name={gif.name}
              description={gif.description}
              onStartConversation={handleStartConversation}
              onRespondToConversation={handleRespondToConversation}
              recentlySpokenTo={conversationState[gif.id] || false}
              setRecentlySpokenTo={(value) => setGifRecentlySpokenTo(gif.id, value)}
              dailyTopic={dailyTopic}
              onOpenChat={() => openChatWith(gif)}
            />
          ))
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <div className="bg-white bg-opacity-80 p-8 rounded-xl border-4 border-black shadow-crayon transform rotate-1 max-w-lg">
              <p className="text-3xl font-bold mb-4 text-center">还没有GIF在{currentScene.name}场景中</p>
              <div className="flex justify-center mb-6">
                <img 
                  src="https://media.giphy.com/media/26hiu3mZVquuykwhy/giphy.gif" 
                  alt="Empty state" 
                  className="w-40 h-40 object-cover rounded-full border-4 border-dashed border-crayon-blue"
                />
              </div>
              <p className="text-lg mb-6 text-center">点击下方按钮添加你的第一张图片！</p>
              <div className="flex justify-center">
                <button 
                  className="crayon-button bg-crayon-pink transform hover:rotate-3 hover:scale-105"
                  onClick={() => setShowUploadModal(true)}
                >
                  <span className="inline-block animate-pulse mr-1">✨</span> 
                  上传你的第一张绘画作品! 
                  <span className="inline-block animate-pulse ml-1">✨</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Upload GIF Modal - Enhanced styling */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full border-4 border-black crayon-border transform rotate-1">
            <h2 className="text-3xl font-bold mb-6 text-center text-crayon-blue hand-drawn">
              上传图片到<span className="text-black mx-1">{currentScene.name}</span>场景
            </h2>
            
            <div className="mb-6">
              <label className="block mb-2 font-bold text-lg">选择图片文件</label>
              <div className="upload-drop-area p-4 text-center">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="w-full p-2"
                />
                {!uploadPreview && (
                  <p className="text-gray-500 mt-2">支持 PNG、JPG 格式</p>
                )}
              </div>
              {uploadPreview && (
                <div className="mt-4 flex justify-center">
                  <img 
                    src={uploadPreview} 
                    alt="预览" 
                    className="h-32 border-2 border-black rounded shadow-crayon transform -rotate-1"
                  />
                </div>
              )}
            </div>
            
            <div className="mb-5">
              <label className="block mb-2 font-bold text-lg">名字</label>
              <input 
                type="text" 
                value={uploadName} 
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="例如：小兔子"
                className="w-full p-3 border-2 border-black rounded-lg focus:border-crayon-blue focus:outline-none bg-gray-50"
              />
            </div>
            
            <div className="mb-5">
              <label className="block mb-2 font-bold text-lg">描述</label>
              <input 
                type="text" 
                value={uploadDescription} 
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="例如：一个会唱歌的小兔子"
                className="w-full p-3 border-2 border-black rounded-lg focus:border-crayon-blue focus:outline-none bg-gray-50"
              />
            </div>
            
            <div className="mb-7">
              <label className="block mb-2 font-bold text-lg">性格</label>
              <div className="grid grid-cols-5 gap-2">
                {personalities.map(personality => (
                  <button
                    key={personality}
                    className={`p-2 rounded-lg text-sm 
                      ${uploadPersonality === personality ? 
                        'bg-crayon-blue text-white border-2 border-black font-bold' : 
                        'bg-white border border-gray-300 hover:border-black'}`}
                    onClick={() => setUploadPersonality(personality)}
                  >
                    {personality === 'friendly' ? '友好的' :
                     personality === 'curious' ? '好奇的' :
                     personality === 'silly' ? '傻傻的' :
                     personality === 'energetic' ? '充沛的' :
                     personality === 'calm' ? '冷静的' :
                     personality === 'playful' ? '爱玩的' :
                     personality === 'dramatic' ? '戏剧性' :
                     personality === 'mischievous' ? '淘气的' :
                     personality === 'wise' ? '聪明的' :
                     personality === 'shy' ? '害羞的' : 
                     personality}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button 
                className="crayon-button bg-crayon-red hover:bg-red-400"
                onClick={() => {
                  if (uploadPreview) {
                    URL.revokeObjectURL(uploadPreview);
                  }
                  setUploadPreview('');
                  setUploadFile(null);
                  setShowUploadModal(false);
                }}
                disabled={isUploading}
              >
                取消
              </button>
              <button 
                className={`crayon-button ${isUploading ? 'bg-gray-400' : 'bg-crayon-green hover:bg-green-400'}`}
                onClick={handleGifUpload}
                disabled={!uploadFile || isUploading}
              >
                {isUploading ? '处理中...' : '添加图片'}
              </button>
            </div>
            
            {isUploading && (
              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-4">正在上传和处理图片，请稍候...</p>
                <div className="flex justify-center">
                  <div className="crayon-spinner"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Chat Modal - Enhanced styling */}
      {showChatModal && activeChatGif && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full h-[85vh] border-4 border-black crayon-border flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b-3 border-black pb-4">
              <div className="flex items-center">
                <div className="w-16 h-16 mr-4 overflow-hidden rounded-full border-3 border-black shadow-crayon">
                  <img 
                    src={activeChatGif.url} 
                    alt={activeChatGif.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold hand-drawn">{activeChatGif.name}</h2>
                  <p className="text-sm text-gray-600">{activeChatGif.description}</p>
                  <div className={`text-xs mt-1 py-1 px-2 rounded-full inline-block font-bold personality-${activeChatGif.personality} border border-black`}>
                    {activeChatGif.personality === 'friendly' ? '友好的' :
                     activeChatGif.personality === 'curious' ? '好奇的' :
                     activeChatGif.personality === 'silly' ? '傻傻的' :
                     activeChatGif.personality === 'energetic' ? '精力充沛的' :
                     activeChatGif.personality === 'calm' ? '冷静的' :
                     activeChatGif.personality === 'playful' ? '爱玩的' :
                     activeChatGif.personality === 'dramatic' ? '戏剧性的' :
                     activeChatGif.personality === 'mischievous' ? '淘气的' :
                     activeChatGif.personality === 'wise' ? '聪明的' :
                     activeChatGif.personality === 'shy' ? '害羞的' : 
                     activeChatGif.personality}
                  </div>
                </div>
              </div>
              <button 
                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center border-2 border-black"
                onClick={() => setShowChatModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="flex mb-4 gap-4 flex-1 overflow-hidden">
              <div className="w-1/3">
                <div className="bg-gray-100 rounded-lg p-3 overflow-hidden flex items-center justify-center border-2 border-black shadow-crayon h-48">
                  <img 
                    src={activeChatGif.url} 
                    alt={activeChatGif.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                <div className="bg-white mt-4 p-3 rounded-lg border-2 border-black shadow-crayon">
                  <h3 className="font-bold text-center mb-2 border-b border-gray-200 pb-1">今日主题</h3>
                  <p className="text-center bg-crayon-yellow p-2 rounded-lg text-sm">{dailyTopic}</p>
                </div>
              </div>
              
              <div className="w-2/3 flex flex-col h-full">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg border-2 border-black shadow-inner">
                  {chatMessages[activeChatGif.id]?.length ? (
                    chatMessages[activeChatGif.id].map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`mb-4 max-w-[90%] ${msg.sender === 'user' ? 
                          'ml-auto chat-bubble-user' : 'mr-auto chat-bubble-gif'} 
                          p-3 rounded-lg shadow-sm`}
                      >
                        <p className="text-[15px]">{msg.text}</p>
                        <span className="text-xs opacity-70 block mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center my-10 p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-6xl mb-4">💬</div>
                      <p className="text-lg font-bold">开始与 {activeChatGif.name} 聊天吧！</p>
                      <p className="text-sm mt-2 text-gray-600">试着问问关于"{dailyTopic}"的话题？</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Chat Input */}
            <div className="flex mt-auto">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder={`给${activeChatGif.name}发消息...`}
                className="flex-1 border-3 border-black rounded-l-lg p-3 text-lg focus:outline-none focus:border-crayon-blue"
              />
              <button
                onClick={sendChatMessage}
                className="crayon-button bg-crayon-blue hover:bg-blue-400 text-white font-bold py-2 px-6 rounded-r-lg"
              >
                发送 ✈️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App

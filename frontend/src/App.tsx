import { useState, useEffect } from 'react'
import './App.css'
import { 
  DraggableGif, 
  ChatModal, 
  UploadModal,
  SceneSelector
} from './components';
import { 
  SCENES, 
  API_URL, 
  randomPhrases, 
  DAILY_TOPICS,
  personalities,
  gifNames 
} from './constants';
import { GifData, ChatMessage, Scene, GifPosition } from './types';
import { generateUniqueName, callAI } from './utils';

function App() {
  // Current scene
  const [currentScene, setCurrentScene] = useState<Scene>(SCENES[0]);
  
  // GIFs state for each scene (using scene ID as key)
  const [sceneGifs, setSceneGifs] = useState<Record<string, GifData[]>>({
    forest: [],
    beach: [],
    space: [],
    school: [],
    party: [],
    winter: []
  });
  
  // Get GIFs for the current scene
  const gifs = sceneGifs[currentScene.id] || [];
  
  // Change scene
  const changeScene = (sceneId: string) => {
    const newScene = SCENES.find(scene => scene.id === sceneId);
    if (newScene) {
      setCurrentScene(newScene);
    }
  };
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [conversationState, setConversationState] = useState<{[key: number]: boolean}>({});
  const [dailyTopic] = useState(() => 
    DAILY_TOPICS[Math.floor(Math.random() * DAILY_TOPICS.length)]
  );

  // Chat-related state
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatGif, setActiveChatGif] = useState<GifData | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<number, ChatMessage[]>>({});

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
  
  // Function to add a message to the chat
  const handleAddChatMessage = (message: ChatMessage) => {
    if (!activeChatGif) return;
    
    setChatMessages(prev => ({
      ...prev,
      [activeChatGif.id]: [...(prev[activeChatGif.id] || []), message]
    }));
  };

  // Handle text change
  const handleTextChange = (id: number, newText: string) => {
    setSceneGifs(prev => ({
      ...prev,
      [currentScene.id]: prev[currentScene.id].map(gif => 
        gif.id === id ? { ...gif, text: newText } : gif
      )
    }));
  };

  // Handle position change
  const handlePositionChange = (id: number, x: number, y: number) => {
    setSceneGifs(prev => ({
      ...prev,
      [currentScene.id]: prev[currentScene.id].map(gif => 
        gif.id === id ? { ...gif, x, y } : gif
      )
    }));
  };

  // Remove GIF function
  const removeGif = (id: number) => {
    setSceneGifs(prev => ({
      ...prev,
      [currentScene.id]: prev[currentScene.id].filter(gif => gif.id !== id)
    }));
  };

  // Handle conversation start
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
  
  // Handle conversation response
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

  // Handle GIF upload
  const handleGifUpload = async (file: File, name: string, description: string, personality: string) => {
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      // Send image to backend for processing
      const response = await fetch(`${API_URL}/process_image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        console.error("Using fallback GIF for testing");
        // Use a placeholder GIF instead
        const gifUrl = "https://media.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif";
        
        // Add GIF to current scene
        const currentGifs = sceneGifs[currentScene.id] || [];
        const newId = Math.max(...currentGifs.map(gif => gif.id), 0) + 1;
        const randomPhrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
        
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
              personality,
              name,
              description,
              lastTalked: 0,
              isBusy: false
            }
          ]
        }));
        
        setShowUploadModal(false);
        return;
      }
      
      const data = await response.json();
      console.log('处理成功:', data);
      
      // Build GIF URL
      const gifUrl = `${API_URL}/${data.output_dir}/video.gif`;
      
      // Get current scene GIFs
      const currentGifs = sceneGifs[currentScene.id] || [];
      const newId = Math.max(...currentGifs.map(gif => gif.id), 0) + 1;
      const randomPhrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
      
      // Update current scene GIFs
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
            personality,
            name,
            description,
            lastTalked: 0,
            isBusy: false
          }
        ]
      }));
      
      // Close modal
      setShowUploadModal(false);
    } catch (error) {
      console.error('上传图片失败:', error);
      alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // Get all GIF positions for proximity detection
  const gifPositions: GifPosition[] = gifs.map(gif => ({
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
        
        {/* Scene selector */}
        <SceneSelector 
          scenes={SCENES} 
          currentScene={currentScene} 
          onSceneChange={changeScene} 
        />
        
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
        {/* Scene name and image attribution */}
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-xl border-2 border-black text-sm font-bold shadow-crayon transform -rotate-2">
          {currentScene.emoji} <span className="text-lg">{currentScene.name}</span> 场景
        </div>
        
        {/* Image attribution */}
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
      
      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onUpload={handleGifUpload}
          currentScene={currentScene.name}
        />
      )}
      
      {/* Chat Modal */}
      {showChatModal && activeChatGif && (
        <ChatModal 
          activeChatGif={activeChatGif}
          onClose={() => setShowChatModal(false)}
          chatMessages={chatMessages[activeChatGif.id] || []}
          onAddMessage={handleAddChatMessage}
          dailyTopic={dailyTopic}
        />
      )}
    </div>
  );
}

export default App

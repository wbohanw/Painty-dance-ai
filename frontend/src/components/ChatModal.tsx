import React, { useState } from 'react';
import { GifData, ChatMessage } from '../types';
import { callAI } from '../utils';

interface ChatModalProps {
  activeChatGif: GifData;
  onClose: () => void;
  chatMessages: ChatMessage[];
  onAddMessage: (message: ChatMessage) => void;
  dailyTopic: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ 
  activeChatGif, 
  onClose, 
  chatMessages, 
  onAddMessage,
  dailyTopic
}) => {
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to send a message in chat
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return;
    
    const newUserMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: chatInput,
      timestamp: Date.now()
    };
    
    onAddMessage(newUserMessage);
    setChatInput('');
    setIsLoading(true);
    
    try {
      const systemPrompt = `你是一个有${activeChatGif.personality}性格的动画GIF，你是"${activeChatGif.description}"。今天的主题是"${dailyTopic}"。你活泼有趣，请用中文回复，保持回复简短（最多15个字），有趣，适合儿童，并适当结合今日主题。`;
      
      const response = await callAI(
        `用户消息: ${chatInput}`,
        activeChatGif.personality,
        systemPrompt
      );
      
      const newGifMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'gif',
        text: response,
        timestamp: Date.now()
      };
      
      onAddMessage(newGifMessage);
    } catch (error) {
      console.error("聊天API错误:", error);
      onAddMessage({
        id: Date.now() + 1,
        sender: 'gif',
        text: '哎呀，我的小脑袋有点混乱了...再试一次吧！',
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            onClick={onClose}
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
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg border-2 border-black shadow-inner">
              {chatMessages.length ? (
                chatMessages.map((msg) => (
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
              {isLoading && (
                <div className="mr-auto chat-bubble-gif p-3 rounded-lg shadow-sm">
                  <div className="flex items-center text-gray-500">
                    <div className="animate-pulse mr-2">💭</div>
                    <span className="text-[15px]">思考中...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex mt-auto">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder={`给${activeChatGif.name}发消息...`}
            className="flex-1 border-3 border-black rounded-l-lg p-3 text-lg focus:outline-none focus:border-crayon-blue"
            disabled={isLoading}
          />
          <button
            onClick={sendChatMessage}
            className={`crayon-button bg-crayon-blue hover:bg-blue-400 text-white font-bold py-2 px-6 rounded-r-lg ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? '发送中...' : '发送 ✈️'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
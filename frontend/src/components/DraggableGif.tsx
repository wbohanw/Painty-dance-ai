import React, { useState, useRef, useEffect } from 'react';
import { DraggableGifProps } from '../types';
import { callAI } from '../utils';

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

export default DraggableGif; 
import React from 'react';
import { Scene } from '../types';

interface SceneSelectorProps {
  scenes: Scene[];
  currentScene: Scene;
  onSceneChange: (sceneId: string) => void;
}

const SceneSelector: React.FC<SceneSelectorProps> = ({ 
  scenes, 
  currentScene, 
  onSceneChange 
}) => {
  return (
    <div className="flex space-x-3 bg-white p-2 rounded-xl shadow-crayon border-2 border-black">
      <div className="text-sm font-bold mr-1">场景：</div>
      {scenes.map(scene => (
        <button
          key={scene.id}
          className={`p-2 cursor-pointer rounded-full scene-selector ${
            currentScene.id === scene.id ? 
            'active bg-crayon-yellow border-2 border-black shadow-crayon' : 
            'bg-white border-2 border-gray-300 hover:border-black'
          }`}
          onClick={() => onSceneChange(scene.id)}
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
  );
};

export default SceneSelector; 
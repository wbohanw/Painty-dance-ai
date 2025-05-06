import React, { useState, useEffect } from 'react';
import { personalities } from '../constants';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (file: File, name: string, description: string, personality: string) => Promise<void>;
  currentScene: string;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, currentScene }) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadPersonality, setUploadPersonality] = useState('friendly');
  const [isUploading, setIsUploading] = useState(false);

  // Handle file change
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

  // Submit handler
  const handleSubmit = async () => {
    if (!uploadFile || !uploadName || !uploadDescription) {
      alert('请填写所有字段');
      return;
    }

    setIsUploading(true);
    
    try {
      await onUpload(uploadFile, uploadName, uploadDescription, uploadPersonality);
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
      }
    };
  }, [uploadPreview]);

  // Translate personality to Chinese
  const getPersonalityText = (personality: string) => {
    switch(personality) {
      case 'friendly': return '友好的';
      case 'curious': return '好奇的';
      case 'silly': return '傻傻的';
      case 'energetic': return '充沛的';
      case 'calm': return '冷静的';
      case 'playful': return '爱玩的';
      case 'dramatic': return '戏剧性';
      case 'mischievous': return '淘气的';
      case 'wise': return '聪明的';
      case 'shy': return '害羞的';
      default: return personality;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full border-4 border-black crayon-border transform rotate-1">
        <h2 className="text-3xl font-bold mb-6 text-center text-crayon-blue hand-drawn">
          上传图片到<span className="text-black mx-1">{currentScene}</span>场景
        </h2>
        
        <div className="mb-6">
          <label className="block mb-2 font-bold text-lg">选择图片文件</label>
          <div className="upload-drop-area p-4 text-center">
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="w-full p-2"
              disabled={isUploading}
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
            disabled={isUploading}
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
            disabled={isUploading}
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
                disabled={isUploading}
              >
                {getPersonalityText(personality)}
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
              onClose();
            }}
            disabled={isUploading}
          >
            取消
          </button>
          <button 
            className={`crayon-button ${isUploading ? 'bg-gray-400' : 'bg-crayon-green hover:bg-green-400'}`}
            onClick={handleSubmit}
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
  );
};

export default UploadModal; 
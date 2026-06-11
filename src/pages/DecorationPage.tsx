import { useState, useRef } from 'react';
import {
  Flower2,
  Sparkles,
  Upload,
  X,
  Volume2,
  VolumeX,
  Music,
  Play,
  Pause,
  Sun,
  Moon,
  Trash2,
  GripVertical,
  CheckCircle2,
  CircleDot,
  Star,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import { DECORATION_TEMPLATES, DECORATION_CATEGORIES, SCENE_BACKGROUNDS } from '@/constants/templates';
import { fileToDataUrl } from '@/utils/exportUtils';
import type { Decoration } from '@/store/types';
import { cn } from '@/lib/utils';

const iconMap: Record<string, typeof Flower2> = {
  Flower2,
  Lamp: Sun,
  Lightbulb: Sun,
  Archway: CircleDot,
  Candle: Sparkles,
  Flame: Sparkles,
  Sparkles,
  Star,
};

export default function DecorationPage() {
  const {
    getCurrentPlan,
    addDecoration,
    updateDecoration,
    deleteDecoration,
    selectDecoration,
    selectedDecorationId,
    setBackgroundMusic,
    setMusicVolume,
    toggleTodo,
  } = useWeddingStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('flower_arrangement');
  const [draggedTemplate, setDraggedTemplate] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  const plan = getCurrentPlan();
  if (!plan) return null;

  const { decorations, sceneType, timeMode, backgroundMusic, musicName, musicVolume } = plan;
  const canvasBg = SCENE_BACKGROUNDS[sceneType][timeMode];

  const filteredTemplates = DECORATION_TEMPLATES.filter((t) => t.type === selectedCategory);

  const handleDragStart = (e: React.DragEvent, template: any) => {
    setDraggedTemplate(template);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTemplate || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addDecoration(draggedTemplate.type, draggedTemplate.style, x, y);
    setDraggedTemplate(null);

    const decoTodo = plan.todos.find((t) => t.category === 'decoration' && !t.completed);
    if (decoTodo) toggleTodo(decoTodo.id);
  };

  const handleDecorationMouseDown = (e: React.MouseEvent, decoration: Decoration) => {
    e.stopPropagation();
    selectDecoration(decoration.id);
    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedDecorationId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    updateDecoration(selectedDecorationId, { x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = () => {
    selectDecoration(null);
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await fileToDataUrl(file);
      setBackgroundMusic(dataUrl, file.name);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value);
    setMusicVolume(volume);
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  };

  const selectedDecoration = decorations.find((d) => d.id === selectedDecorationId);

  return (
    <div
      className="h-full flex"
      onMouseUp={isDragging ? handleMouseUp : undefined}
    >
      <div className="w-72 bg-white/90 backdrop-blur-sm border-r border-rose-gold/20 flex flex-col">
        <div className="p-4 border-b border-rose-gold/20">
          <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3">
            装饰库
          </h3>
          <div className="flex flex-wrap gap-1 mb-3">
            {DECORATION_CATEGORIES.map((cat) => {
              const Icon = iconMap[cat.icon] || Flower2;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all',
                    selectedCategory === cat.key
                      ? 'bg-champagne text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-rose-light'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cat.name}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {filteredTemplates.map((template) => {
              const Icon = iconMap[template.icon] || Flower2;
              return (
                <div
                  key={template.style}
                  draggable
                  onDragStart={(e) => handleDragStart(e, template)}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab hover:border-rose-gold hover:bg-rose-light/30 transition-all active:cursor-grabbing"
                >
                  <div
                    className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: template.defaultColor + '40' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: template.defaultColor }} />
                  </div>
                  <p className="text-xs text-center text-gray-700 font-medium truncate">
                    {template.name}
                  </p>
                  <p className="text-xs text-center text-champagne">¥{template.defaultPrice}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-b border-rose-gold/20">
          <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3">
            灯光效果
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-2">场景氛围</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    timeMode === 'day'
                      ? 'border-champagne bg-amber-50'
                      : 'border-gray-200 hover:border-rose-gold/50'
                  )}
                >
                  <Sun className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-center">明亮</p>
                </button>
                <button
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    timeMode === 'night'
                      ? 'border-champagne bg-indigo-50'
                      : 'border-gray-200 hover:border-rose-gold/50'
                  )}
                >
                  <Moon className="w-5 h-5 mx-auto mb-1 text-indigo-500" />
                  <p className="text-xs text-center">浪漫</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3">
            背景音乐
          </h3>

          <input
            ref={musicInputRef}
            type="file"
            accept="audio/*"
            onChange={handleMusicUpload}
            className="hidden"
          />

          {backgroundMusic ? (
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-rose-gold/10 to-champagne/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-gold to-champagne flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-champagne-dark truncate">
                      {musicName || '背景音乐'}
                    </p>
                    <p className="text-xs text-gray-500">已上传</p>
                  </div>
                  <button
                    onClick={() => setBackgroundMusic(undefined, undefined)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-champagne text-white flex items-center justify-center hover:bg-champagne-dark transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1 flex items-center gap-2">
                  {musicVolume === 0 ? (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-champagne" />
                  )}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={handleVolumeChange}
                    className="flex-1 accent-champagne"
                  />
                  <span className="text-xs text-gray-500 w-8">{musicVolume}%</span>
                </div>
              </div>

              {backgroundMusic && (
                <audio
                  ref={audioRef}
                  src={backgroundMusic}
                  loop
                  onEnded={() => setIsPlaying(false)}
                />
              )}
            </div>
          ) : (
            <button
              onClick={() => musicInputRef.current?.click()}
              className="w-full p-6 rounded-xl border-2 border-dashed border-rose-gold/30 flex flex-col items-center justify-center gap-2 hover:border-champagne hover:bg-rose-light/30 transition-all"
            >
              <Upload className="w-8 h-8 text-champagne" />
              <span className="text-sm text-gray-500">点击上传背景音乐</span>
              <span className="text-xs text-gray-400">支持 MP3, WAV 格式</span>
            </button>
          )}

          <div className="mt-6">
            <h4 className="font-medium text-gray-800 mb-3">推荐音乐</h4>
            <div className="space-y-2">
              {[
                { name: '婚礼进行曲', artist: '瓦格纳' },
                { name: '卡农', artist: '帕赫贝尔' },
                { name: 'A Thousand Years', artist: 'Christina Perri' },
              ].map((track, i) => (
                <button
                  key={i}
                  className="w-full p-2 rounded-lg bg-gray-50 hover:bg-rose-light/50 transition-colors flex items-center gap-2 text-left"
                >
                  <Music className="w-4 h-4 text-champagne" />
                  <div>
                    <p className="text-sm font-medium">{track.name}</p>
                    <p className="text-xs text-gray-500">{track.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-12 px-4 bg-white/80 backdrop-blur-sm border-b border-rose-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              装饰: {decorations.length} 件
            </span>
            <span className="text-sm text-gray-600">
              灯光模式: {timeMode === 'day' ? '白天' : '夜晚'}
            </span>
          </div>
          {selectedDecoration && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">选中:</span>
              <span className="font-medium text-champagne-dark">
                {DECORATION_TEMPLATES.find(
                  (t) => t.type === selectedDecoration.type && t.style === selectedDecoration.style
                )?.name}
              </span>
            </div>
          )}
        </div>

        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          style={{ background: canvasBg }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseMove={isDragging ? handleMouseMove : undefined}
          onClick={handleCanvasClick}
        >
          {timeMode === 'night' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-pulse-soft"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    backgroundColor: i % 2 === 0 ? '#FFD700' : '#FFE4B5',
                    boxShadow: `0 0 ${10 + Math.random() * 20}px rgba(255, 215, 0, ${0.3 + Math.random() * 0.5})`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          )}

          {decorations.map((decoration) => {
            const isSelected = selectedDecorationId === decoration.id;
            const template = DECORATION_TEMPLATES.find(
              (t) => t.type === decoration.type && t.style === decoration.style
            );
            const Icon = iconMap[template?.icon || 'Flower2'] || Flower2;

            return (
              <div
                key={decoration.id}
                className={cn(
                  'absolute w-12 h-12 flex items-center justify-center cursor-grab transition-all duration-150 rounded-xl',
                  isSelected && 'ring-2 ring-champagne ring-offset-2 z-10',
                  isDragging && isSelected && 'cursor-grabbing opacity-80'
                )}
                style={{
                  left: decoration.x - 24,
                  top: decoration.y - 24,
                  backgroundColor: decoration.color + '30',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(201, 169, 97, 0.5)'
                    : '0 4px 12px rgba(0,0,0,0.1)',
                }}
                onMouseDown={(e) => handleDecorationMouseDown(e, decoration)}
              >
                <Icon className="w-6 h-6" style={{ color: decoration.color }} />
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-champagne rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}

          {draggedTemplate && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-champagne text-white rounded-full text-sm shadow-elevated flex items-center gap-2">
              <GripVertical className="w-4 h-4" />
              拖拽到画布上放置
            </div>
          )}

          {decorations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Flower2 className="w-10 h-10 text-white/60" />
                </div>
                <p className="text-white/80 text-lg font-medium">
                  从左侧装饰库拖拽装饰物到此处
                </p>
                <p className="text-white/60 text-sm mt-1">
                  点亮您的婚礼现场
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedDecoration && (
        <div className="w-64 bg-white/90 backdrop-blur-sm border-l border-rose-gold/20 flex flex-col">
          <div className="p-4 border-b border-rose-gold/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg font-semibold text-champagne-dark">
                属性
              </h3>
              <button
                onClick={() => selectDecoration(null)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {DECORATION_TEMPLATES.find(
                (t) =>
                  t.type === selectedDecoration.type && t.style === selectedDecoration.style
              )?.name}
            </p>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                颜色
              </label>
              <div className="flex gap-2 flex-wrap">
                {['#FFB6C1', '#FF69B4', '#E6E6FA', '#FFD700', '#FFE4B5', '#FFFFFF', '#C9A961', '#FF6B6B'].map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() => updateDecoration(selectedDecoration.id, { color })}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2 transition-all',
                        selectedDecoration.color === color
                          ? 'border-champagne scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                缩放: {selectedDecoration.config.scale?.toFixed(1) || 1.0}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={selectedDecoration.config.scale || 1}
                onChange={(e) =>
                  updateDecoration(selectedDecoration.id, {
                    config: { ...selectedDecoration.config, scale: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-champagne"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                旋转: {selectedDecoration.config.rotation || 0}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedDecoration.config.rotation || 0}
                onChange={(e) =>
                  updateDecoration(selectedDecoration.id, {
                    config: { ...selectedDecoration.config, rotation: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-champagne"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">单价</span>
                <span className="font-medium text-champagne-dark">
                  ¥{selectedDecoration.price}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">位置</span>
                <span className="font-mono text-gray-700">
                  ({Math.round(selectedDecoration.x)}, {Math.round(selectedDecoration.y)})
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-rose-gold/20">
            <button
              onClick={() => deleteDecoration(selectedDecoration.id)}
              className="w-full btn-secondary text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              删除此装饰
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

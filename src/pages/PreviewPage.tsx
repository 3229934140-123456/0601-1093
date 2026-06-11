import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  MapPin,
  Users,
  Heart,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import {
  SCENE_BACKGROUNDS,
  SCENE_NAMES,
  TIME_MODE_NAMES,
  FURNITURE_TEMPLATES,
  DECORATION_TEMPLATES,
} from '@/constants/templates';
import { cn } from '@/lib/utils';
import type { Furniture, Decoration, Guest } from '@/store/types';

interface ViewPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  zoom: number;
  description: string;
}

const VIEW_POINTS: ViewPoint[] = [
  {
    id: 'entrance',
    name: '入口处',
    x: 400,
    y: 600,
    zoom: 1,
    description: '宾客入场视角，可看到整个婚礼场地的全貌',
  },
  {
    id: 'aisle',
    name: '红毯通道',
    x: 400,
    y: 400,
    zoom: 1.2,
    description: '沿着红毯走向舞台，感受仪式的庄重',
  },
  {
    id: 'stage-front',
    name: '舞台前方',
    x: 400,
    y: 200,
    zoom: 1.5,
    description: '近距离观看新人宣誓交换戒指',
  },
  {
    id: 'left-seat',
    name: '左侧观礼区',
    x: 150,
    y: 350,
    zoom: 1,
    description: '左侧宾客座位视角，清晰观看仪式',
  },
  {
    id: 'right-seat',
    name: '右侧观礼区',
    x: 650,
    y: 350,
    zoom: 1,
    description: '右侧宾客座位视角，温馨浪漫氛围',
  },
  {
    id: 'back-view',
    name: '后排全景',
    x: 400,
    y: 550,
    zoom: 0.8,
    description: '后排全景视角，俯瞰整个婚礼现场',
  },
];

interface FurniturePreviewProps {
  furniture: Furniture;
  guests: Guest[];
}

function FurniturePreview({ furniture, guests }: FurniturePreviewProps) {
  const template = FURNITURE_TEMPLATES.find(
    (t) => t.type === furniture.type && t.subtype === furniture.subtype
  );
  if (!template) return null;

  const assignedGuest = guests.find((g) => g.seatId === furniture.id);
  const width = template.width || 60;
  const height = template.height || 60;

  const getShape = () => {
    if (furniture.type === 'table_round') {
      return (
        <div
          className="rounded-full border-2 border-rose-200 flex items-center justify-center relative overflow-hidden"
          style={{
            width,
            height,
            backgroundColor: furniture.color,
            transform: `rotate(${furniture.rotation}deg) scale(${furniture.scale})`,
          }}
        >
          {furniture.label && (
            <span className="text-xs font-medium text-rose-600">
              {furniture.label}
            </span>
          )}
          {furniture.type === 'table_round' && furniture.subtype.includes('8') && (
            <div className="absolute inset-2 border border-dashed border-rose-200 rounded-full" />
          )}
        </div>
      );
    }
    if (furniture.type === 'table_long') {
      return (
        <div
          className="rounded-lg border-2 border-rose-200 flex items-center justify-center"
          style={{
            width,
            height,
            backgroundColor: furniture.color,
            transform: `rotate(${furniture.rotation}deg) scale(${furniture.scale})`,
          }}
        >
          {furniture.label && (
            <span className="text-xs font-medium text-rose-600">
              {furniture.label}
            </span>
          )}
        </div>
      );
    }
    if (furniture.type === 'chair') {
      return (
        <div
          className="rounded-lg border-2 border-amber-200 flex items-center justify-center relative"
          style={{
            width,
            height,
            backgroundColor: furniture.color,
            transform: `rotate(${furniture.rotation}deg) scale(${furniture.scale})`,
          }}
        >
          {assignedGuest && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {assignedGuest.isVip && '👑'}
            </div>
          )}
          {assignedGuest?.isVip && (
            <div className="absolute inset-0 rounded-lg border-2 border-amber-400 animate-pulse" />
          )}
        </div>
      );
    }
    if (furniture.type === 'podium') {
      return (
        <div
          className="rounded-t-lg border-2 border-amber-300 flex items-center justify-center"
          style={{
            width,
            height,
            backgroundColor: furniture.color,
            transform: `rotate(${furniture.rotation}deg) scale(${furniture.scale})`,
          }}
        >
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
        </div>
      );
    }
    if (furniture.type === 'flower') {
      return (
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width,
            height,
            backgroundColor: furniture.color,
            transform: `rotate(${furniture.rotation}deg) scale(${furniture.scale})`,
            boxShadow: `0 4px 12px ${furniture.color}40`,
          }}
        >
          <span className="text-lg">🌸</span>
        </div>
      );
    }
    if (furniture.type === 'light') {
      return (
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width,
            height,
            backgroundColor: furniture.color,
            transform: `rotate(${furniture.rotation}deg) scale(${furniture.scale})`,
            boxShadow: `0 0 20px ${furniture.color}`,
          }}
        >
          <span className="text-lg">💡</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="absolute cursor-pointer transition-transform hover:scale-105 group"
      style={{
        left: furniture.x - width / 2,
        top: furniture.y - height / 2,
        transform: `rotate(${furniture.rotation}deg)`,
      }}
    >
      {getShape()}
      {assignedGuest && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {assignedGuest.name}
          {assignedGuest.isVip && ' (VIP)'}
        </div>
      )}
    </div>
  );
}

interface DecorationPreviewProps {
  decoration: Decoration;
  timeMode: string;
}

function DecorationPreview({ decoration, timeMode }: DecorationPreviewProps) {
  const template = DECORATION_TEMPLATES.find(
    (t) => t.type === decoration.type && t.style === decoration.style
  );
  if (!template) return null;

  const getDecoration = () => {
    if (decoration.type === 'flower_arrangement') {
      return (
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: decoration.color,
              boxShadow: `0 4px 12px ${decoration.color}40`,
            }}
          >
            <span className="text-2xl">💐</span>
          </div>
        </div>
      );
    }
    if (decoration.type === 'lantern') {
      return (
        <div className="relative">
          <div
            className="w-8 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: decoration.color,
              boxShadow:
                timeMode === 'night'
                  ? `0 0 30px ${decoration.color}, 0 0 60px ${decoration.color}40`
                  : 'none',
            }}
          >
            <span className="text-lg">🏮</span>
          </div>
        </div>
      );
    }
    if (decoration.type === 'arch') {
      return (
        <div
          className="w-32 h-20 rounded-t-full border-4 flex items-center justify-center"
          style={{
            borderColor: decoration.color,
            borderBottom: 'none',
          }}
        >
          <span className="text-3xl">💒</span>
        </div>
      );
    }
    if (decoration.type === 'candle') {
      return (
        <div className="relative">
          <div
            className="w-6 h-8 rounded-sm flex items-end justify-center pb-1"
            style={{
              backgroundColor: decoration.color,
              boxShadow:
                timeMode === 'night'
                  ? `0 0 20px ${decoration.color}, 0 0 40px ${decoration.color}60`
                  : 'none',
            }}
          >
            <div
              className={cn(
                'w-2 h-3 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full',
                timeMode === 'night' && 'animate-pulse'
              )}
            />
          </div>
        </div>
      );
    }
    if (decoration.type === 'light_string') {
      return (
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: decoration.color,
                boxShadow:
                  timeMode === 'night'
                    ? `0 0 10px ${decoration.color}`
                    : 'none',
                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="absolute transition-transform hover:scale-110"
      style={{
        left: decoration.x - 24,
        top: decoration.y - 24,
      }}
    >
      {getDecoration()}
    </div>
  );
}

function StarField({ count }: { count: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 60,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
  }));

  return (
    <>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: 0,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}

function Fireflies({ count }: { count: number }) {
  const fireflies = Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * 100,
    startY: 40 + Math.random() * 50,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <>
      {fireflies.map((ff) => (
        <div
          key={ff.id}
          className="absolute w-2 h-2 rounded-full bg-yellow-300"
          style={{
            left: `${ff.startX}%`,
            top: `${ff.startY}%`,
            boxShadow: '0 0 10px #fef08a, 0 0 20px #fef08a',
            animation: `float ${ff.duration}s ease-in-out ${ff.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); opacity: 0.8; }
          25% { transform: translate(30px, -20px); opacity: 1; }
          50% { transform: translate(-20px, -40px); opacity: 0.6; }
          75% { transform: translate(20px, -10px); opacity: 0.9; }
        }
      `}</style>
    </>
  );
}

export default function PreviewPage() {
  const { getCurrentPlan } = useWeddingStore();
  const plan = getCurrentPlan();

  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const currentView = VIEW_POINTS[currentViewIndex];

  useEffect(() => {
    const targetX = (400 - currentView.x) * currentView.zoom;
    const targetY = (300 - currentView.y) * currentView.zoom;
    setOffset({ x: targetX, y: targetY });
    setZoom(currentView.zoom);
  }, [currentView]);

  useEffect(() => {
    if (plan?.backgroundMusic && !isMuted) {
      if (!audioRef.current) {
        audioRef.current = new Audio(plan.backgroundMusic);
        audioRef.current.loop = true;
        audioRef.current.volume = (plan.musicVolume || 50) / 100;
      }
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [plan?.backgroundMusic, isPlaying, isMuted, plan?.musicVolume]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    },
    [offset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(Math.max(0.5, z + delta), 2));
  }, []);

  const navigateView = (direction: 'prev' | 'next') => {
    setCurrentViewIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % VIEW_POINTS.length;
      }
      return (prev - 1 + VIEW_POINTS.length) % VIEW_POINTS.length;
    });
  };

  if (!plan) return null;

  const canvasBg = SCENE_BACKGROUNDS[plan.sceneType][plan.timeMode];
  const assignedSeats = plan.guests.filter((g) => g.seatId).length;
  const vipGuests = plan.guests.filter((g) => g.isVip).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-rose-500" />
            <span className="font-semibold text-gray-800">宾客视角预览</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{SCENE_NAMES[plan.sceneType]}</span>
            <span className="text-gray-300">·</span>
            <span>{TIME_MODE_NAMES[plan.timeMode]}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateView('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="px-3 py-1 bg-rose-50 rounded-full text-sm text-rose-600 font-medium">
            {currentView.name} ({currentViewIndex + 1}/{VIEW_POINTS.length})
          </div>
          <button
            onClick={() => navigateView('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-500 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-gray-600" />
          </button>
          <div className="h-4 w-px bg-gray-200 mx-1" />
          <button
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Maximize2 className="w-5 h-5 text-gray-600" />
          </button>
          <div className="h-4 w-px bg-gray-200 mx-1" />
          {plan.backgroundMusic && (
            <>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-rose-500" />
                ) : (
                  <Play className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </>
          )}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showInfo ? 'bg-rose-100' : 'hover:bg-gray-100'
            )}
          >
            <Info
              className={cn(
                'w-5 h-5',
                showInfo ? 'text-rose-500' : 'text-gray-600'
              )}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-48 bg-white border-r border-gray-100 p-4 overflow-auto">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">视角切换</h4>
          <div className="space-y-2">
            {VIEW_POINTS.map((view, index) => (
              <button
                key={view.id}
                onClick={() => setCurrentViewIndex(index)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                  currentViewIndex === index
                    ? 'bg-gradient-to-r from-rose-500 to-champagne-500 text-white shadow-sm'
                    : 'hover:bg-gray-50 text-gray-600'
                )}
              >
                <div className="font-medium">{view.name}</div>
                <div
                  className={cn(
                    'text-xs mt-0.5',
                    currentViewIndex === index
                      ? 'text-white/80'
                      : 'text-gray-400'
                  )}
                >
                  {view.description}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              现场统计
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  总宾客数
                </span>
                <span className="font-semibold text-gray-800">
                  {plan.guests.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  VIP 宾客
                </span>
                <span className="font-semibold text-amber-600">
                  {vipGuests}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  已安排座位
                </span>
                <span className="font-semibold text-green-600">
                  {assignedSeats}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  背景音乐
                </span>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    plan.backgroundMusic
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  )}
                >
                  {plan.backgroundMusic ? plan.musicName || '已设置' : '未设置'}
                </span>
              </div>
            </div>
          </div>

          {plan.guests.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                宾客列表
              </h4>
              <div className="space-y-1 max-h-48 overflow-auto">
                {plan.guests.map((guest) => (
                  <button
                    key={guest.id}
                    onClick={() => setSelectedGuest(guest)}
                    className={cn(
                      'w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors',
                      selectedGuest?.id === guest.id
                        ? 'bg-rose-50'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                        guest.isVip
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {guest.name.charAt(0)}
                    </div>
                    <span className="flex-1 truncate text-gray-700">
                      {guest.name}
                    </span>
                    {guest.isVip && <span className="text-amber-500">👑</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 relative overflow-hidden bg-gray-900">
          <div
            ref={canvasRef}
            className={cn(
              'absolute inset-0 overflow-hidden',
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            )}
            style={{ background: canvasBg }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {plan.timeMode === 'night' && (
              <>
                <StarField count={100} />
                <Fireflies count={20} />
              </>
            )}

            <div
              className="absolute inset-0 canvas-grid opacity-20"
              style={{
                backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
                backgroundPosition: `${offset.x}px ${offset.y}px`,
              }}
            />

            <div
              className="absolute top-0 left-0"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                width: '800px',
                height: '600px',
              }}
            >
              <div
                className="absolute bg-gradient-to-b from-rose-100/50 to-transparent"
                style={{
                  left: plan.stageConfig.x - plan.stageConfig.width / 2,
                  top: plan.stageConfig.y - plan.stageConfig.height / 2,
                  width: plan.stageConfig.width,
                  height: plan.stageConfig.height,
                  border: '3px solid',
                  borderColor:
                    plan.timeMode === 'night' ? '#fbbf24' : '#f43f5e',
                  borderRadius: '8px',
                  boxShadow:
                    plan.timeMode === 'night'
                      ? '0 0 30px rgba(251, 191, 36, 0.3)'
                      : '0 4px 20px rgba(244, 63, 94, 0.1)',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">💒</span>
                </div>
                {plan.stageConfig.hasTStage && (
                  <div
                    className="absolute bg-gradient-to-r from-rose-100/50 via-rose-50/50 to-rose-100/50"
                    style={{
                      left: plan.stageConfig.width / 2 - 30,
                      top: plan.stageConfig.height,
                      width: 60,
                      height: plan.stageConfig.tStageLength,
                      borderLeft: '2px dashed',
                      borderRight: '2px dashed',
                      borderColor: '#f43f5e',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-rose-200/30 to-transparent" />
                  </div>
                )}
              </div>

              {plan.entrancePath.length > 1 && (
                <svg className="absolute inset-0 pointer-events-none" width="800" height="600">
                  <path
                    d={plan.entrancePath
                      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                      .join(' ')}
                    fill="none"
                    stroke={plan.timeMode === 'night' ? '#fbbf24' : '#f43f5e'}
                    strokeWidth="3"
                    strokeDasharray="10,5"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              )}

              {plan.furniture.map((furniture) => (
                <FurniturePreview
                  key={furniture.id}
                  furniture={furniture}
                  guests={plan.guests}
                />
              ))}

              {plan.decorations.map((decoration) => (
                <DecorationPreview
                  key={decoration.id}
                  decoration={decoration}
                  timeMode={plan.timeMode}
                />
              ))}

              {(plan.brideImage || plan.groomImage) && (
                <div
                  className="absolute flex gap-4"
                  style={{
                    left: plan.stageConfig.x - 60,
                    top: plan.stageConfig.y - 20,
                  }}
                >
                  {plan.brideImage && (
                    <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      <img
                        src={plan.brideImage}
                        alt="新娘"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {plan.groomImage && (
                    <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      <img
                        src={plan.groomImage}
                        alt="新郎"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {showInfo && (
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-4 text-white max-w-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">当前视角信息</h4>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-white/60">视角位置：</span>
                  {currentView.name}
                </div>
                <div>
                  <span className="text-white/60">场景：</span>
                  {SCENE_NAMES[plan.sceneType]}
                </div>
                <div>
                  <span className="text-white/60">时间：</span>
                  {TIME_MODE_NAMES[plan.timeMode]}
                </div>
                <div>
                  <span className="text-white/60">缩放比例：</span>
                  {Math.round(zoom * 100)}%
                </div>
                <div className="pt-2 border-t border-white/20 text-white/60 text-xs">
                  <p>💡 提示：</p>
                  <p>• 拖拽画面可以移动视角</p>
                  <p>• 滚轮可以缩放画面</p>
                  <p>• 点击左侧切换不同视角</p>
                </div>
              </div>
            </div>
          )}

          {selectedGuest && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-champagne-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                    {selectedGuest.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {selectedGuest.name}
                      {selectedGuest.isVip && <span>👑</span>}
                    </h4>
                    <p className="text-white/80 text-sm">
                      {selectedGuest.isVip ? 'VIP 宾客' : '普通宾客'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">座位状态</span>
                    <span
                      className={cn(
                        'font-medium',
                        selectedGuest.seatId
                          ? 'text-green-600'
                          : 'text-gray-400'
                      )}
                    >
                      {selectedGuest.seatId ? '已安排' : '未安排'}
                    </span>
                  </div>
                  {selectedGuest.tableNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">桌号</span>
                      <span className="font-medium text-gray-800">
                        {selectedGuest.tableNumber} 号桌
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm flex items-center gap-2">
            <Move className="w-4 h-4" />
            拖拽移动 · 滚轮缩放 · 点击视角切换
          </div>
        </div>
      </div>
    </div>
  );
}

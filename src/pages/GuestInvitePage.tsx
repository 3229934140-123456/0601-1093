import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Calendar,
  Clock,
  Users,
  Music,
  ChevronLeft,
  ChevronRight,
  Move,
  ZoomIn,
  ZoomOut,
  Flower2,
  Crown,
  Sparkles,
  ArrowLeft,
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
import type { Furniture, Decoration, Guest, CeremonyStep } from '@/store/types';

interface ViewPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  zoom: number;
  description: string;
}

const VIEW_POINTS: ViewPoint[] = [
  { id: 'entrance', name: '入口处', x: 400, y: 600, zoom: 1, description: '宾客入场视角' },
  { id: 'aisle', name: '红毯通道', x: 400, y: 400, zoom: 1.2, description: '沿着红毯走向舞台' },
  { id: 'stage-front', name: '舞台前方', x: 400, y: 200, zoom: 1.5, description: '近距离观看仪式' },
  { id: 'left-seat', name: '左侧观礼区', x: 150, y: 350, zoom: 1, description: '左侧宾客座位视角' },
  { id: 'right-seat', name: '右侧观礼区', x: 650, y: 350, zoom: 1, description: '右侧宾客座位视角' },
  { id: 'back-view', name: '后排全景', x: 400, y: 550, zoom: 0.8, description: '俯瞰整个婚礼现场' },
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
            <span className="text-xs font-medium text-rose-600">{furniture.label}</span>
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
            <span className="text-xs font-medium text-rose-600">{furniture.label}</span>
          )}
        </div>
      );
    }
    if (furniture.type === 'chair') {
      return (
        <div
          className="rounded border-2 border-rose-200 flex items-center justify-center"
          style={{
            width,
            height,
            backgroundColor: furniture.color,
            transform: `rotate(${furniture.rotation}deg) scale(${furniture.scale})`,
          }}
        >
          {assignedGuest && (
            <div className="text-center">
              {assignedGuest.isVip && <Crown className="w-3 h-3 text-amber-500 mx-auto mb-0.5" />}
              <span className="text-xs text-gray-600">{assignedGuest.name.slice(0, 2)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="absolute transition-all duration-300 cursor-pointer group"
      style={{
        left: furniture.x - width / 2,
        top: furniture.y - height / 2,
        width,
        height,
      }}
    >
      {getShape()}
      {assignedGuest && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs bg-white/90 px-2 py-1 rounded shadow text-gray-700">
            {assignedGuest.name}
            {assignedGuest.isVip && <span className="text-amber-500 ml-1">VIP</span>}
          </span>
        </div>
      )}
    </div>
  );
}

interface DecorationPreviewProps {
  decoration: Decoration;
}

function DecorationPreview({ decoration }: DecorationPreviewProps) {
  const template = DECORATION_TEMPLATES.find(
    (t) => t.type === decoration.type && t.style === decoration.style
  );
  if (!template) return null;

  const size = template.size || 40;

  return (
    <div
      className="absolute flex items-center justify-center transition-all duration-300 pointer-events-none"
      style={{
        left: decoration.x - size / 2,
        top: decoration.y - size / 2,
        width: size,
        height: size,
      }}
    >
      {decoration.type === 'flower_arrangement' && (
        <Flower2 className="w-8 h-8 text-pink-400 drop-shadow-lg" />
      )}
      {decoration.type === 'lantern' && (
        <div className="w-6 h-8 bg-red-400 rounded-full shadow-lg animate-float" />
      )}
      {decoration.type === 'arch' && (
        <div className="w-12 h-10 border-t-4 border-l-4 border-r-4 border-pink-300 rounded-t-full" />
      )}
      {decoration.type === 'candle' && (
        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse-soft" />
      )}
      {decoration.type === 'light_string' && (
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-amber-300 rounded-full animate-pulse-soft" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GuestInvitePage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { plans, getCurrentPlan } = useWeddingStore();
  
  const [viewPoint, setViewPoint] = useState(VIEW_POINTS[0]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const plan = planId ? plans[planId] : getCurrentPlan();
  
  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
          <h2 className="text-xl font-display text-gray-700 mb-2">方案不存在</h2>
          <p className="text-gray-500 mb-4">抱歉，您访问的婚礼方案不存在或已被删除</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-champagne text-white rounded-lg hover:bg-champagne-dark transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const { sceneType, timeMode, furniture, guests, decorations, ceremonySteps, stageConfig, entrancePath, brideImage, groomImage, backgroundMusic, musicName } = plan;
  const canvasBg = SCENE_BACKGROUNDS[sceneType][timeMode];
  const assignedGuests = guests.filter((g) => g.seatId);
  const totalDuration = ceremonySteps.reduce((sum, s) => sum + s.durationMin, 0);

  const handleViewPointChange = (vp: ViewPoint) => {
    setViewPoint(vp);
    setOffset({ x: vp.x - 400, y: vp.y - 300 });
    setZoom(vp.zoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.5, Math.min(2, z * delta)));
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (min: number) => {
    const hours = Math.floor(min / 60);
    const mins = min % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  };

  const getStepTime = (index: number) => {
    let time = 0;
    for (let i = 0; i < index; i++) {
      time += ceremonySteps[i]?.durationMin || 0;
    }
    const hours = Math.floor(time / 60);
    const mins = time % 60;
    return `${10 + hours}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      {backgroundMusic && (
        <audio ref={audioRef} src={backgroundMusic} loop onEnded={() => setIsPlaying(false)} />
      )}

      {showHeader && (
        <div className="bg-white/80 backdrop-blur-md border-b border-rose-gold/20 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-champagne transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">返回编辑</span>
              </button>

              <div className="text-center">
                <h1 className="text-2xl font-display font-semibold text-champagne-dark flex items-center gap-2 justify-center">
                  <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
                  婚礼邀请函
                  <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
                </h1>
                <p className="text-sm text-gray-500">{plan.name}</p>
              </div>

              <div className="flex items-center gap-2">
                {backgroundMusic && (
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-champagne/10 hover:bg-champagne/20 transition-colors"
                  >
                    <Music className={cn('w-5 h-5', isPlaying ? 'text-champagne animate-pulse-soft' : 'text-gray-400')} />
                  </button>
                )}
                <button
                  onClick={() => setShowHeader(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-rose-gold/20 via-champagne/20 to-rose-gold/20 p-6 text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {brideImage ? (
                  <img src={brideImage} alt="新娘" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center">
                    <span className="text-3xl">👰</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Heart className="w-10 h-10 text-rose-400 fill-rose-400 mx-auto mb-2 animate-pulse-soft" />
                <p className="font-display text-2xl text-champagne-dark">我们结婚啦</p>
              </div>

              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {groomImage ? (
                  <img src={groomImage} alt="新郎" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center">
                    <span className="text-3xl">🤵</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-4">
              诚挚邀请您参加我们的婚礼庆典
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/60 rounded-xl p-3">
                <Calendar className="w-5 h-5 text-champagne mx-auto mb-1" />
                <p className="text-xs text-gray-500">婚礼日期</p>
                <p className="font-medium text-gray-800">2025年10月10日</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <Clock className="w-5 h-5 text-champagne mx-auto mb-1" />
                <p className="text-xs text-gray-500">仪式时间</p>
                <p className="font-medium text-gray-800">上午 10:00</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <MapPin className="w-5 h-5 text-champagne mx-auto mb-1" />
                <p className="text-xs text-gray-500">婚礼场地</p>
                <p className="font-medium text-gray-800">{SCENE_NAMES[sceneType]}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <Users className="w-5 h-5 text-champagne mx-auto mb-1" />
                <p className="text-xs text-gray-500">仪式时长</p>
                <p className="font-medium text-gray-800">{formatTime(totalDuration)}</p>
              </div>
            </div>
          </div>

          {assignedGuests.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                您的座位信息
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {assignedGuests.slice(0, 6).map((guest) => {
                  const seat = furniture.find((f) => f.id === guest.seatId);
                  return (
                    <div key={guest.id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        guest.isVip ? 'bg-amber-100' : 'bg-rose-100'
                      )}>
                        {guest.isVip && <Crown className="w-5 h-5 text-amber-500" />}
                        {!guest.isVip && <Users className="w-5 h-5 text-rose-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{guest.name}</p>
                        <p className="text-xs text-gray-500">
                          {seat?.label || '座位待定'}
                          {guest.isVip && <span className="text-amber-500 ml-1">VIP</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {assignedGuests.length > 6 && (
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center">
                    <span className="text-gray-500">...还有 {assignedGuests.length - 6} 位宾客</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-6 border-b border-gray-100">
            <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              仪式流程
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-rose-gold/20" />
              <div className="space-y-4">
                {ceremonySteps.sort((a, b) => a.order - b.order).map((step, index) => (
                  <div key={step.id} className="relative pl-10">
                    <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-champagne border-4 border-white shadow flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{step.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-champagne-dark">{getStepTime(index)}</p>
                          <p className="text-xs text-gray-400">{step.durationMin}分钟</p>
                        </div>
                      </div>
                      {step.host && (
                        <p className="text-xs text-gray-400 mt-1">主持人: {step.host}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              场地预览
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({TIME_MODE_NAMES[timeMode]}模式)
              </span>
            </h3>

            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {VIEW_POINTS.map((vp) => (
                <button
                  key={vp.id}
                  onClick={() => handleViewPointChange(vp)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all flex-shrink-0',
                    viewPoint.id === vp.id
                      ? 'bg-champagne text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {vp.name}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewPointChange(VIEW_POINTS[0])}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors ml-auto"
              >
                <Move className="w-4 h-4" />
              </button>
            </div>

            <div
              ref={canvasRef}
              className="relative w-full h-[400px] rounded-xl overflow-hidden cursor-move shadow-inner"
              style={{ background: canvasBg }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {timeMode === 'night' && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-pulse-soft"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 60}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        opacity: 0.6 + Math.random() * 0.4,
                      }}
                    />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={`firefly-${i}`}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-float"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${40 + Math.random() * 40}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${3 + Math.random() * 2}s`,
                        boxShadow: '0 0 10px #fde047, 0 0 20px #fde047',
                      }}
                    />
                  ))}
                </div>
              )}

              <div
                className="absolute inset-0 transition-transform duration-500 ease-out"
                style={{
                  transform: `translate(${400 - offset.x * zoom}px, ${300 - offset.y * zoom}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              >
                <div
                  className="absolute border-2 border-dashed border-champagne/30 rounded-lg"
                  style={{
                    left: stageConfig.x - stageConfig.width / 2,
                    top: stageConfig.y - stageConfig.height / 2,
                    width: stageConfig.width,
                    height: stageConfig.height,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,248,240,0.9))',
                    boxShadow: '0 8px 32px rgba(180,140,100,0.2)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-champagne-dark font-display text-sm">舞台</span>
                  </div>
                  {stageConfig.hasTStage && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 border-2 border-dashed border-champagne/30 rounded"
                      style={{
                        top: stageConfig.height,
                        width: 60,
                        height: stageConfig.tStageLength,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,248,240,0.7))',
                      }}
                    />
                  )}
                </div>

                {entrancePath.length > 1 && (
                  <svg className="absolute inset-0 pointer-events-none" style={{ width: 800, height: 600 }}>
                    <path
                      d={`M ${entrancePath.map((p) => `${p.x},${p.y}`).join(' L ')}`}
                      fill="none"
                      stroke="rgba(180,140,100,0.5)"
                      strokeWidth="4"
                      strokeDasharray="10,5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {furniture.map((f) => (
                  <FurniturePreview key={f.id} furniture={f} guests={guests} />
                ))}

                {decorations.map((d) => (
                  <DecorationPreview key={d.id} decoration={d} />
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>拖拽移动视角 · 滚轮缩放 · 点击上方按钮切换视角</span>
              <span className="text-champagne-dark font-medium">{viewPoint.description}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm pb-8">
          <p className="flex items-center justify-center gap-1">
            <Heart className="w-4 h-4" />
            期待您的光临，与我们共同见证这美好时刻
            <Heart className="w-4 h-4" />
          </p>
        </div>
      </div>
    </div>
  );
}

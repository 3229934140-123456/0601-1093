import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
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
  Search,
  Gift,
  CheckCircle2,
  AlertCircle,
  Star,
  Route,
  ArrowRight,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import {
  SCENE_BACKGROUNDS,
  SCENE_NAMES,
  TIME_MODE_NAMES,
  FURNITURE_TEMPLATES,
  DECORATION_TEMPLATES,
} from '@/constants/templates';
import { decodePlanData } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';
import type { Furniture, Decoration, Guest, CeremonyStep, WeddingPlan, TodoItem } from '@/store/types';

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
  highlightedGuestId?: string;
}

function FurniturePreview({ furniture, guests, highlightedGuestId }: FurniturePreviewProps) {
  const template = FURNITURE_TEMPLATES.find(
    (t) => t.type === furniture.type && t.subtype === furniture.subtype
  );
  if (!template) return null;

  const assignedGuest = guests.find((g) => g.seatId === furniture.id);
  const isHighlighted = highlightedGuestId && assignedGuest?.id === highlightedGuestId;
  const width = template.width || 60;
  const height = template.height || 60;

  const getShape = () => {
    if (furniture.type === 'table_round') {
      return (
        <div
          className={cn(
            'rounded-full border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300',
            isHighlighted ? 'border-champagne ring-4 ring-champagne/30 scale-110 z-10' : 'border-rose-200'
          )}
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
          className={cn(
            'rounded-lg border-2 flex items-center justify-center transition-all duration-300',
            isHighlighted ? 'border-champagne ring-4 ring-champagne/30 scale-110 z-10' : 'border-rose-200'
          )}
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
          className={cn(
            'rounded border-2 flex items-center justify-center transition-all duration-300',
            isHighlighted ? 'border-champagne ring-4 ring-champagne/30 scale-125 z-10' : 'border-rose-200'
          )}
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
          {isHighlighted && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs bg-champagne text-white px-2 py-1 rounded shadow font-medium">
                您的座位
              </span>
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
      {assignedGuest && !isHighlighted && (
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

interface GuestIdentityModalProps {
  guests: Guest[];
  onSelectGuest: (guest: Guest) => void;
}

function GuestIdentityModal({ guests, onSelectGuest }: GuestIdentityModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [showNotFound, setShowNotFound] = useState(false);

  const filteredGuests = guests.filter(
    (g) => g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if (!selectedName.trim()) {
      setShowNotFound(true);
      return;
    }
    const foundGuest = guests.find(
      (g) => g.name.toLowerCase() === selectedName.trim().toLowerCase()
    );
    if (foundGuest) {
      onSelectGuest(foundGuest);
    } else {
      setShowNotFound(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-rose-gold/20 via-champagne/20 to-rose-gold/20 p-6 text-center">
          <Heart className="w-12 h-12 text-rose-400 fill-rose-400 mx-auto mb-2 animate-pulse-soft" />
          <h2 className="text-xl font-display font-semibold text-champagne-dark">欢迎您</h2>
          <p className="text-sm text-gray-500 mt-1">请输入您的姓名查看专属席位</p>
        </div>

        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="请输入您的姓名"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedName(e.target.value);
                setShowNotFound(false);
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-champagne focus:ring-2 focus:ring-champagne/20 outline-none transition-all"
            />
          </div>

          {searchTerm && filteredGuests.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl mb-4">
              {filteredGuests.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => {
                    setSelectedName(guest.name);
                    setSearchTerm(guest.name);
                  }}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0',
                    selectedName === guest.name && 'bg-rose-50'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    guest.isVip ? 'bg-amber-100' : 'bg-rose-100'
                  )}>
                    {guest.isVip ? (
                      <Crown className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Users className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{guest.name}</p>
                    <p className="text-xs text-gray-400">
                      {guest.seatId ? '已安排座位' : '座位待定'}
                      {guest.isVip && <span className="text-amber-500 ml-1">· VIP</span>}
                    </p>
                  </div>
                  {selectedName === guest.name && (
                    <CheckCircle2 className="w-5 h-5 text-champagne flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {showNotFound && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">未找到您的信息</p>
                <p className="text-xs text-amber-600">请检查姓名拼写是否正确，或联系新人确认</p>
              </div>
            </div>
          )}

          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-gradient-to-r from-champagne to-rose-gold text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Star className="w-5 h-5" />
            查看我的邀请函
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            找不到您的信息？您仍然可以浏览婚礼场地和流程
          </p>
          <button
            onClick={() => onSelectGuest({ id: '', name: '', seatId: undefined, isVip: false })}
            className="w-full mt-2 py-2 text-gray-500 text-sm hover:text-champagne transition-colors"
          >
            以访客身份浏览
          </button>
        </div>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-rose-100 to-amber-100 rounded-full flex items-center justify-center">
            <Heart className="w-16 h-16 text-rose-300" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Heart className="w-8 h-8 text-rose-400 fill-rose-400 animate-pulse-soft" />
          </div>
        </div>

        <h1 className="text-2xl font-display font-semibold text-champagne-dark mb-2">
          邀请函已过期
        </h1>
        <p className="text-gray-500 mb-6">
          抱歉，您访问的婚礼邀请函链接已失效或方案不存在。
          <br />
          请联系新人获取最新的邀请链接。
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-rose-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">期待与您相见</p>
              <p className="text-sm text-gray-500">愿爱与幸福与您同在</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-rose-400">
            <Heart className="w-4 h-4 fill-rose-400" />
            <Heart className="w-5 h-5 fill-rose-400" />
            <Heart className="w-4 h-4 fill-rose-400" />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          如果您认为这是一个错误，请刷新页面或检查链接是否完整
        </p>
      </div>
    </div>
  );
}

interface CompletenessChecklistProps {
  plan: WeddingPlan | Partial<WeddingPlan>;
}

function CompletenessChecklist({ plan }: CompletenessChecklistProps) {
  const checks = [
    { label: '新娘照片', completed: !!plan.brideImage, icon: '👰' },
    { label: '新郎照片', completed: !!plan.groomImage, icon: '🤵' },
    { label: '背景音乐', completed: !!plan.backgroundMusic || !!plan.musicName, icon: '🎵' },
    { label: '入场路线', completed: (plan.entrancePath?.length || 0) > 0, icon: '🛤️' },
    { label: '家具布置', completed: (plan.furniture?.length || 0) > 0, icon: '🪑' },
    { label: '装饰布置', completed: (plan.decorations?.length || 0) > 0, icon: '💐' },
    { label: '宾客名单', completed: (plan.guests?.length || 0) > 0, icon: '👥' },
    { label: '仪式流程', completed: (plan.ceremonySteps?.length || 0) > 0, icon: '📋' },
  ];

  const completedCount = checks.filter((c) => c.completed).length;
  const progress = Math.round((completedCount / checks.length) * 100);

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800">准备进度</h4>
        <span className={cn(
          'text-sm font-semibold',
          progress >= 80 ? 'text-green-600' : progress >= 50 ? 'text-amber-600' : 'text-red-500'
        )}>
          {progress}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-400'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {checks.map((check, i) => (
          <div
            key={i}
            className={cn(
              'p-2 rounded-lg text-center transition-all',
              check.completed ? 'bg-green-50' : 'bg-red-50 opacity-60'
            )}
            title={check.label}
          >
            <span className="text-xl">{check.icon}</span>
            <div className="mt-1">
              {check.completed ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 mx-auto" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GuestInvitePage() {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { plans } = useWeddingStore();
  
  const [viewPoint, setViewPoint] = useState(VIEW_POINTS[0]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [plan, setPlan] = useState<WeddingPlan | Partial<WeddingPlan> | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sceneType = plan?.sceneType || 'island';
  const timeMode = plan?.timeMode || 'day';
  const furniture = plan?.furniture || [];
  const guests = plan?.guests || [];
  const decorations = plan?.decorations || [];
  const ceremonySteps = plan?.ceremonySteps || [];
  const stageConfig = plan?.stageConfig || { x: 400, y: 150, width: 200, height: 120, podiumX: 300, podiumY: 150, podiumStyle: 'classic', hasTStage: false, tStageLength: 100 };
  const entrancePath = plan?.entrancePath || [];
  const brideImage = plan?.brideImage;
  const groomImage = plan?.groomImage;
  const backgroundMusic = plan?.backgroundMusic;
  const musicName = plan?.musicName;
  const todos = plan?.todos || [];

  const canvasBg = SCENE_BACKGROUNDS[sceneType][timeMode];
  const assignedGuests = guests.filter((g) => g.seatId);
  const totalDuration = ceremonySteps.reduce((sum, s) => sum + s.durationMin, 0);

  const currentGuestSeat = useMemo(() => {
    if (!currentGuest?.seatId) return null;
    return furniture.find((f) => f.id === currentGuest.seatId);
  }, [currentGuest, furniture]);

  const currentGuestSteps = useMemo(() => {
    return ceremonySteps.sort((a, b) => a.order - b.order);
  }, [ceremonySteps]);

  const incompleteTodos = useMemo(() => {
    return todos.filter((t) => !t.completed);
  }, [todos]);

  useEffect(() => {
    const loadPlan = () => {
      let loadedPlan: WeddingPlan | Partial<WeddingPlan> | null = null;
      
      const encodedData = searchParams.get('data');
      if (encodedData) {
        const decoded = decodePlanData(decodeURIComponent(encodedData));
        if (decoded) {
          loadedPlan = decoded;
        }
      }
      
      if (!loadedPlan && planId) {
        loadedPlan = plans[planId] || null;
      }
      
      setPlan(loadedPlan);
      setPlanLoaded(true);
      
      if (loadedPlan) {
        const guestParam = searchParams.get('guest');
        if (guestParam && loadedPlan.guests) {
          const foundGuest = loadedPlan.guests.find(
            (g) => g.name.toLowerCase() === decodeURIComponent(guestParam).toLowerCase()
          );
          if (foundGuest) {
            setCurrentGuest(foundGuest);
          } else {
            setShowIdentityModal(true);
          }
        } else {
          setShowIdentityModal(true);
        }
      }
    };

    loadPlan();
  }, [planId, searchParams, plans]);

  const handleSelectGuest = (guest: Guest) => {
    setCurrentGuest(guest);
    setShowIdentityModal(false);
    
    if (guest.seatId && plan?.furniture) {
      const seatFurniture = plan.furniture.find((f) => f.id === guest.seatId);
      if (seatFurniture) {
        setOffset({ x: seatFurniture.x - 400, y: seatFurniture.y - 300 });
        setZoom(1.5);
      }
    }
  };

  if (!planLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-300 animate-pulse-soft mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return <NotFoundPage />;
  }

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

  const focusOnMySeat = () => {
    if (currentGuestSeat) {
      setOffset({ x: currentGuestSeat.x - 400, y: currentGuestSeat.y - 300 });
      setZoom(2);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      {backgroundMusic && (
        <audio ref={audioRef} src={backgroundMusic} loop onEnded={() => setIsPlaying(false)} />
      )}

      {showIdentityModal && (
        <GuestIdentityModal guests={guests} onSelectGuest={handleSelectGuest} />
      )}

      {showHeader && (
        <div className="bg-white/80 backdrop-blur-md border-b border-rose-gold/20 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentGuest && currentGuest.name && (
                  <div className="flex items-center gap-2 bg-champagne/10 px-3 py-1.5 rounded-full">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center',
                      currentGuest.isVip ? 'bg-amber-100' : 'bg-rose-100'
                    )}>
                      {currentGuest.isVip ? (
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-champagne-dark">
                      {currentGuest.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setShowIdentityModal(true)}
                  className="text-sm text-gray-500 hover:text-champagne transition-colors"
                >
                  切换身份
                </button>
              </div>

              <div className="text-center">
                <h1 className="text-xl font-display font-semibold text-champagne-dark flex items-center gap-2 justify-center">
                  <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                  婚礼邀请函
                  <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                </h1>
                <p className="text-xs text-gray-500">{plan.name}</p>
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

      {!showHeader && (
        <button
          onClick={() => setShowHeader(true)}
          className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {currentGuest && currentGuest.name && (
          <div className="bg-gradient-to-r from-champagne/20 via-rose-gold/20 to-champagne/20 rounded-2xl p-6 mb-6 text-center">
            <p className="text-sm text-champagne-dark mb-2">尊敬的</p>
            <h2 className="text-2xl font-display font-semibold text-champagne mb-2 flex items-center justify-center gap-2">
              {currentGuest.isVip && <Star className="w-6 h-6 text-amber-500 fill-amber-500" />}
              {currentGuest.name} 先生/女士
              {currentGuest.isVip && <Star className="w-6 h-6 text-amber-500 fill-amber-500" />}
            </h2>
            <p className="text-gray-600 mb-4">
              诚挚邀请您参加我们的婚礼庆典，与我们共同见证这美好时刻
            </p>
            {currentGuestSeat && (
              <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                <MapPin className="w-4 h-4 text-champagne" />
                <span className="text-sm font-medium text-champagne-dark">
                  您的座位: {currentGuestSeat.label || '贵宾席'}
                </span>
                <button
                  onClick={focusOnMySeat}
                  className="ml-2 text-xs text-champagne hover:text-rose-gold transition-colors flex items-center gap-1"
                >
                  在地图中查看
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-rose-gold/20 via-champagne/20 to-rose-gold/20 p-6 text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {brideImage ? (
                  <img src={brideImage} alt="新娘" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center">
                    <span className="text-2xl">👰</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Heart className="w-8 h-8 text-rose-400 fill-rose-400 mx-auto mb-1 animate-pulse-soft" />
                <p className="font-display text-xl text-champagne-dark">我们结婚啦</p>
              </div>

              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {groomImage ? (
                  <img src={groomImage} alt="新郎" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center">
                    <span className="text-2xl">🤵</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <div className="bg-white/60 rounded-xl p-3">
                <Calendar className="w-5 h-5 text-champagne mx-auto mb-1" />
                <p className="text-xs text-gray-500">婚礼日期</p>
                <p className="font-medium text-gray-800 text-sm">2025年10月10日</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <Clock className="w-5 h-5 text-champagne mx-auto mb-1" />
                <p className="text-xs text-gray-500">仪式时间</p>
                <p className="font-medium text-gray-800 text-sm">上午 10:00</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <MapPin className="w-5 h-5 text-champagne mx-auto mb-1" />
                <p className="text-xs text-gray-500">婚礼场地</p>
                <p className="font-medium text-gray-800 text-sm">{SCENE_NAMES[sceneType]}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <Route className="w-5 h-5 text-champagne mx-auto mb-1" />
                <p className="text-xs text-gray-500">仪式时长</p>
                <p className="font-medium text-gray-800 text-sm">{formatTime(totalDuration)}</p>
              </div>
            </div>
          </div>

          {currentGuest && currentGuest.name && currentGuestSeat && (
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-champagne/5 to-rose-gold/5">
              <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                您的专属安排
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-champagne/20">
                  <MapPin className="w-5 h-5 text-champagne mb-2" />
                  <p className="text-xs text-gray-500 mb-1">座位位置</p>
                  <p className="font-semibold text-gray-800">
                    {currentGuestSeat.label || '贵宾席'}
                  </p>
                  {currentGuest.isVip && (
                    <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      VIP 宾客
                    </span>
                  )}
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-champagne/20">
                  <Route className="w-5 h-5 text-champagne mb-2" />
                  <p className="text-xs text-gray-500 mb-1">入场路线</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {entrancePath.length > 0 ? '红毯通道入场' : '由迎宾区引导入场'}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-champagne/20">
                  <Music className="w-5 h-5 text-champagne mb-2" />
                  <p className="text-xs text-gray-500 mb-1">背景音乐</p>
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {musicName || '婚礼进行曲'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {assignedGuests.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                出席宾客
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {assignedGuests.slice(0, 10).map((guest) => {
                  const seat = furniture.find((f) => f.id === guest.seatId);
                  const isCurrentGuest = guest.id === currentGuest?.id;
                  return (
                    <div
                      key={guest.id}
                      className={cn(
                        'rounded-lg p-2 flex items-center gap-2 transition-all',
                        isCurrentGuest
                          ? 'bg-champagne/20 border-2 border-champagne'
                          : 'bg-gray-50 hover:bg-gray-100'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        guest.isVip ? 'bg-amber-100' : 'bg-rose-100'
                      )}>
                        {guest.isVip ? (
                          <Crown className="w-4 h-4 text-amber-500" />
                        ) : (
                          <span className="text-xs font-medium text-rose-400">
                            {guest.name.slice(0, 1)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm truncate',
                          isCurrentGuest ? 'font-semibold text-champagne-dark' : 'text-gray-700'
                        )}>
                          {guest.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {seat?.label || '待定'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {assignedGuests.length > 10 && (
                  <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                    <span className="text-xs text-gray-400">+{assignedGuests.length - 10} 位</span>
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
              <div className="space-y-3">
                {ceremonySteps.sort((a, b) => a.order - b.order).map((step, index) => (
                  <div key={step.id} className="relative pl-10">
                    <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-champagne border-4 border-white shadow flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{step.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-champagne-dark">{getStepTime(index)}</p>
                          <p className="text-xs text-gray-400">{step.durationMin}分钟</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              场地预览
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({TIME_MODE_NAMES[timeMode]}模式)
              </span>
            </h3>

            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {currentGuestSeat && (
                <button
                  onClick={focusOnMySeat}
                  className="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all flex-shrink-0 bg-gradient-to-r from-champagne to-rose-gold text-white flex items-center gap-1"
                >
                  <Star className="w-4 h-4" />
                  我的座位
                </button>
              )}
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
                  <FurniturePreview
                    key={f.id}
                    furniture={f}
                    guests={guests}
                    highlightedGuestId={currentGuest?.id}
                  />
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

          <div className="p-6 bg-gray-50">
            <CompletenessChecklist plan={plan} />
            
            {incompleteTodos.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  待办事项 ({incompleteTodos.length}项)
                </h4>
                <div className="space-y-2">
                  {incompleteTodos.slice(0, 5).map((todo) => (
                    <div key={todo.id} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded border-2 border-amber-300 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{todo.title}</span>
                    </div>
                  ))}
                  {incompleteTodos.length > 5 && (
                    <p className="text-xs text-gray-400 pl-7">还有 {incompleteTodos.length - 5} 项准备中...</p>
                  )}
                </div>
              </div>
            )}
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

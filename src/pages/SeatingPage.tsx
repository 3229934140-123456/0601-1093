import { useState, useRef, useCallback, useEffect } from 'react';
import {
  MousePointer2,
  RotateCw,
  Trash2,
  Route,
  Plus,
  X,
  Crown,
  User,
  Edit3,
  MapPin,
  GripVertical,
  CheckCircle2,
  Circle,
  RectangleHorizontal,
  Armchair,
  Mic2,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import { FURNITURE_TEMPLATES, FURNITURE_CATEGORIES, SCENE_BACKGROUNDS } from '@/constants/templates';
import type { Furniture, FurnitureType, Guest } from '@/store/types';
import { cn } from '@/lib/utils';

const iconMap: Record<string, typeof Circle> = {
  Circle,
  RectangleHorizontal,
  Armchair,
  Mic2,
};

export default function SeatingPage() {
  const {
    getCurrentPlan,
    addFurniture,
    updateFurniture,
    deleteFurniture,
    selectFurniture,
    selectedFurnitureId,
    addGuest,
    updateGuest,
    deleteGuest,
    assignGuestToSeat,
    unassignGuest,
    setEntrancePath,
    entrancePath,
    isDrawingPath,
    setDrawingPath,
    activeTool,
    setActiveTool,
    toggleTodo,
  } = useWeddingStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('table_round');
  const [draggedTemplate, setDraggedTemplate] = useState<any>(null);
  const [editingGuest, setEditingGuest] = useState<string | null>(null);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestIsVip, setNewGuestIsVip] = useState(false);
  const [tempPath, setTempPath] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const plan = getCurrentPlan();
  if (!plan) return null;

  const canvasBg = SCENE_BACKGROUNDS[plan.sceneType][plan.timeMode];

  const filteredTemplates = FURNITURE_TEMPLATES.filter((t) => t.type === selectedCategory);

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

    addFurniture(draggedTemplate.type, draggedTemplate.subtype, x, y);
    setDraggedTemplate(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'path' || isDrawingPath) {
      setTempPath((prev) => [...prev, { x, y }]);
      return;
    }

    if (activeTool === 'select') {
      selectFurniture(null);
    }
  };

  const handleFurnitureMouseDown = (e: React.MouseEvent, furniture: Furniture) => {
    e.stopPropagation();
    
    if (activeTool === 'delete') {
      deleteFurniture(furniture.id);
      return;
    }

    if (activeTool === 'rotate') {
      updateFurniture(furniture.id, { rotation: (furniture.rotation + 45) % 360 });
      return;
    }

    if (activeTool === 'select') {
      selectFurniture(furniture.id);
      setIsDragging(true);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !selectedFurnitureId || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      updateFurniture(selectedFurnitureId, { x, y });
    },
    [isDragging, selectedFurnitureId, dragOffset, updateFurniture]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleAddGuest = () => {
    if (newGuestName.trim()) {
      addGuest(newGuestName.trim(), newGuestIsVip);
      setNewGuestName('');
      setNewGuestIsVip(false);
      
      const seatingTodo = plan.todos.find((t) => t.category === 'seating' && !t.completed);
      if (seatingTodo) toggleTodo(seatingTodo.id);
    }
  };

  const handleAssignGuest = (guestId: string) => {
    if (selectedFurnitureId) {
      assignGuestToSeat(guestId, selectedFurnitureId);
      setEditingGuest(null);
    }
  };

  const handleFinishPath = () => {
    setEntrancePath([...tempPath]);
    setTempPath([]);
    setDrawingPath(false);
    setActiveTool('select');
  };

  const handleClearPath = () => {
    setEntrancePath([]);
    setTempPath([]);
    setDrawingPath(false);
    setActiveTool('select');
  };

  const getFurnitureSize = (furniture: Furniture) => {
    const template = FURNITURE_TEMPLATES.find(
      (t) => t.type === furniture.type && t.subtype === furniture.subtype
    );
    return {
      width: (template?.width || 60) * furniture.scale,
      height: (template?.height || 60) * furniture.scale,
    };
  };

  const getFurnitureGuest = (furniture: Furniture): Guest | undefined => {
    if (!furniture.guestId) return undefined;
    return plan.guests.find((g) => g.id === furniture.guestId);
  };

  const tools = [
    { id: 'select', icon: MousePointer2, label: '选择' },
    { id: 'rotate', icon: RotateCw, label: '旋转' },
    { id: 'delete', icon: Trash2, label: '删除' },
    { id: 'path', icon: Route, label: '路线' },
  ] as const;

  const selectedFurniture = plan.furniture.find((f) => f.id === selectedFurnitureId);
  const selectedFurnitureGuest = selectedFurniture ? getFurnitureGuest(selectedFurniture) : null;
  const unassignedGuests = plan.guests.filter((g) => !g.seatId);

  const pathToRender = isDrawingPath ? tempPath : plan.entrancePath;

  return (
    <div className="h-full flex">
      <div className="w-72 bg-white/90 backdrop-blur-sm border-r border-rose-gold/20 flex flex-col">
        <div className="p-4 border-b border-rose-gold/20">
          <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3">
            工具栏
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  if (tool.id === 'path') {
                    setDrawingPath(true);
                    setTempPath([]);
                  } else {
                    setDrawingPath(false);
                  }
                  setActiveTool(tool.id as any);
                }}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                  activeTool === tool.id
                    ? 'bg-gradient-to-br from-rose-gold to-champagne text-white shadow-soft'
                    : 'bg-gray-100 text-gray-600 hover:bg-rose-light hover:text-champagne-dark'
                )}
                title={tool.label}
              >
                <tool.icon className="w-5 h-5" />
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isDrawingPath && (
          <div className="p-4 bg-champagne/10 border-b border-rose-gold/20">
            <p className="text-sm text-champagne-dark mb-3">
              点击画布添加路径点，完成后点击保存
            </p>
            <div className="flex gap-2">
              <button onClick={handleFinishPath} className="btn-primary flex-1 py-2 text-sm">
                保存路线
              </button>
              <button onClick={handleClearPath} className="btn-ghost py-2 text-sm">
                取消
              </button>
            </div>
          </div>
        )}

        <div className="p-4 border-b border-rose-gold/20">
          <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3">
            家具库
          </h3>
          <div className="flex flex-wrap gap-1 mb-3">
            {FURNITURE_CATEGORIES.map((cat) => {
              const Icon = iconMap[cat.icon] || Circle;
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
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {filteredTemplates.map((template) => {
              const Icon = iconMap[template.icon] || Circle;
              return (
                <div
                  key={template.subtype}
                  draggable
                  onDragStart={(e) => handleDragStart(e, template)}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab hover:border-rose-gold hover:bg-rose-light/30 transition-all active:cursor-grabbing"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-white flex items-center justify-center">
                    <Icon className="w-5 h-5 text-champagne-dark" />
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

        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="font-display text-lg font-semibold text-champagne-dark mb-3">
            宾客名单 ({plan.guests.length})
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              placeholder="宾客姓名"
              className="input-field flex-1 text-sm py-2"
              onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
            />
            <button
              onClick={() => setNewGuestIsVip(!newGuestIsVip)}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                newGuestIsVip
                  ? 'bg-champagne text-white'
                  : 'bg-gray-100 text-gray-400 hover:bg-rose-light'
              )}
              title="VIP宾客"
            >
              <Crown className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddGuest}
              disabled={!newGuestName.trim()}
              className="w-10 h-10 rounded-lg bg-champagne text-white flex items-center justify-center hover:bg-champagne-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {plan.guests.map((guest) => (
              <div
                key={guest.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg transition-all',
                  editingGuest === guest.id
                    ? 'bg-champagne/10 border-2 border-dashed border-champagne'
                    : 'bg-gray-50 hover:bg-rose-light/50'
                )}
              >
                {guest.isVip && (
                  <Crown className="w-4 h-4 text-champagne flex-shrink-0" />
                )}
                <User
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    guest.seatId ? 'text-green-500' : 'text-gray-400'
                  )}
                />
                {editingGuest === guest.id ? (
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) => updateGuest(guest.id, { name: e.target.value })}
                    className="flex-1 text-sm bg-transparent border-b border-champagne focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span
                    className={cn(
                      'flex-1 text-sm truncate',
                      guest.seatId ? 'text-gray-800' : 'text-gray-500'
                    )}
                  >
                    {guest.name}
                  </span>
                )}
                {guest.seatId ? (
                  <button
                    onClick={() => unassignGuest(guest.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="取消座位"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  selectedFurnitureId && editingGuest !== guest.id && (
                    <button
                      onClick={() => handleAssignGuest(guest.id)}
                      className="p-1 text-green-500 hover:text-green-600 transition-colors"
                      title="分配到选中座位"
                    >
                      <MapPin className="w-3 h-3" />
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setEditingGuest(editingGuest === guest.id ? null : guest.id)
                  }
                  className="p-1 text-gray-400 hover:text-champagne transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteGuest(guest.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {plan.guests.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                暂无宾客，添加第一位宾客吧
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-12 px-4 bg-white/80 backdrop-blur-sm border-b border-rose-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              家具: {plan.furniture.length} 件
            </span>
            <span className="text-sm text-gray-600">
              宾客: {plan.guests.length} 人
            </span>
            <span className="text-sm text-gray-600">
              已入座: {plan.guests.filter((g) => g.seatId).length} 人
            </span>
          </div>
          {selectedFurniture && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">选中:</span>
              <span className="font-medium text-champagne-dark">
                {FURNITURE_TEMPLATES.find(
                  (t) =>
                    t.type === selectedFurniture.type && t.subtype === selectedFurniture.subtype
                )?.name}
              </span>
              {selectedFurnitureGuest && (
                <span className="flex items-center gap-1 text-green-600">
                  <User className="w-3 h-3" />
                  {selectedFurnitureGuest.name}
                  {selectedFurnitureGuest.isVip && (
                    <Crown className="w-3 h-3 text-champagne" />
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden canvas-grid cursor-crosshair"
          style={{ background: canvasBg }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleCanvasClick}
        >
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
            {pathToRender.length > 1 && (
              <>
                <path
                  d={`M ${pathToRender.map((p) => `${p.x},${p.y}`).join(' L ')}`}
                  stroke="#C9A961"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="10,5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
                {pathToRender.map((point, i) => (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill="#C9A961"
                    stroke="white"
                    strokeWidth="2"
                  />
                ))}
                {pathToRender.length > 0 && (
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#C9A961" />
                    </marker>
                  </defs>
                )}
              </>
            )}
          </svg>

          {plan.furniture.map((furniture) => {
            const size = getFurnitureSize(furniture);
            const guest = getFurnitureGuest(furniture);
            const isSelected = selectedFurnitureId === furniture.id;
            const template = FURNITURE_TEMPLATES.find(
              (t) => t.type === furniture.type && t.subtype === furniture.subtype
            );
            const Icon = iconMap[template?.icon || 'Circle'] || Circle;

            return (
              <div
                key={furniture.id}
                className={cn(
                  'absolute flex items-center justify-center cursor-grab transition-all duration-150',
                  isSelected && 'ring-2 ring-champagne ring-offset-2 z-10',
                  isDragging && isSelected && 'cursor-grabbing opacity-80',
                  activeTool === 'delete' && 'hover:ring-2 hover:ring-red-500',
                  activeTool === 'rotate' && 'hover:ring-2 hover:ring-blue-500'
                )}
                style={{
                  left: furniture.x - size.width / 2,
                  top: furniture.y - size.height / 2,
                  width: size.width,
                  height: size.height,
                  transform: `rotate(${furniture.rotation}deg)`,
                  backgroundColor: furniture.color,
                  borderRadius:
                    furniture.type === 'table_round' ? '50%' : '8px',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(201, 169, 97, 0.5)'
                    : '0 4px 12px rgba(0,0,0,0.1)',
                }}
                onMouseDown={(e) => handleFurnitureMouseDown(e, furniture)}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-transform',
                    furniture.type === 'chair' && guest?.isVip && 'text-champagne'
                  )}
                  style={{ color: guest?.isVip ? '#C9A961' : 'rgba(0,0,0,0.3)' }}
                />
                {guest && (
                  <div
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white rounded-full text-xs shadow-soft whitespace-nowrap flex items-center gap-1"
                    style={{ transform: `translateX(-50%) rotate(-${furniture.rotation}deg)` }}
                  >
                    {guest.isVip && <Crown className="w-3 h-3 text-champagne" />}
                    <span className={guest.isVip ? 'text-champagne-dark font-medium' : 'text-gray-600'}>
                      {guest.name}
                    </span>
                  </div>
                )}
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

          {plan.furniture.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <GripVertical className="w-10 h-10 text-white/60" />
                </div>
                <p className="text-white/80 text-lg font-medium">
                  从左侧家具库拖拽家具到此处
                </p>
                <p className="text-white/60 text-sm mt-1">
                  或点击路线按钮规划入场路线
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedFurniture && (
        <div className="w-72 bg-white/90 backdrop-blur-sm border-l border-rose-gold/20 flex flex-col">
          <div className="p-4 border-b border-rose-gold/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg font-semibold text-champagne-dark">
                属性面板
              </h3>
              <button
                onClick={() => selectFurniture(null)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {FURNITURE_TEMPLATES.find(
                (t) =>
                  t.type === selectedFurniture.type && t.subtype === selectedFurniture.subtype
              )?.name}
            </p>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                颜色
              </label>
              <div className="flex gap-2 flex-wrap">
                {['#FFFFFF', '#F5E6E0', '#E8C4A0', '#C9A961', '#FFB6C1', '#D4E4DB', '#1A2A4A'].map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() => updateFurniture(selectedFurniture.id, { color })}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2 transition-all',
                        selectedFurniture.color === color
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
                旋转角度: {selectedFurniture.rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedFurniture.rotation}
                onChange={(e) =>
                  updateFurniture(selectedFurniture.id, {
                    rotation: parseInt(e.target.value),
                  })
                }
                className="w-full accent-champagne"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                缩放: {selectedFurniture.scale.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={selectedFurniture.scale}
                onChange={(e) =>
                  updateFurniture(selectedFurniture.id, {
                    scale: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-champagne"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                座位标签
              </label>
              <input
                type="text"
                value={selectedFurniture.label || ''}
                onChange={(e) =>
                  updateFurniture(selectedFurniture.id, { label: e.target.value })
                }
                placeholder="如：主桌、1号桌"
                className="input-field text-sm"
              />
            </div>

            {selectedFurnitureGuest ? (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800 mb-1">已分配宾客</p>
                <div className="flex items-center gap-2">
                  {selectedFurnitureGuest.isVip && (
                    <Crown className="w-4 h-4 text-champagne" />
                  )}
                  <span className="text-green-700">{selectedFurnitureGuest.name}</span>
                </div>
                <button
                  onClick={() => unassignGuest(selectedFurnitureGuest.id)}
                  className="mt-2 text-sm text-green-600 hover:text-green-700"
                >
                  取消分配
                </button>
              </div>
            ) : unassignedGuests.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分配宾客
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {unassignedGuests.map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => handleAssignGuest(guest.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm hover:bg-rose-light/50 transition-colors"
                    >
                      {guest.isVip && <Crown className="w-3 h-3 text-champagne" />}
                      <User className="w-3 h-3 text-gray-400" />
                      <span>{guest.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">单价</span>
                <span className="font-medium text-champagne-dark">
                  ¥{selectedFurniture.price}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">位置</span>
                <span className="font-mono text-gray-700">
                  ({Math.round(selectedFurniture.x)}, {Math.round(selectedFurniture.y)})
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-rose-gold/20">
            <button
              onClick={() => deleteFurniture(selectedFurniture.id)}
              className="w-full btn-secondary text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              删除此家具
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

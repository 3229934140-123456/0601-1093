import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Mic2,
  User,
  Upload,
  X,
  Move,
  Maximize2,
  ChevronRight,
  Crown,
  Sparkles,
  Users,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import { SCENE_BACKGROUNDS } from '@/constants/templates';
import { fileToDataUrl } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';

export default function StagePage() {
  const {
    getCurrentPlan,
    setStageConfig,
    setBrideImage,
    setGroomImage,
    toggleTodo,
  } = useWeddingStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const brideInputRef = useRef<HTMLInputElement>(null);
  const groomInputRef = useRef<HTMLInputElement>(null);

  const plan = getCurrentPlan();
  if (!plan) return null;

  const { stageConfig, brideImage, groomImage, timeMode, sceneType } = plan;
  const canvasBg = SCENE_BACKGROUNDS[sceneType][timeMode];

  const handleStageMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - stageConfig.x,
        y: e.clientY - rect.top - stageConfig.y,
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    if (isDragging) {
      setStageConfig({
        x: Math.max(50, Math.min(rect.width - stageConfig.width - 50, x)),
        y: Math.max(50, Math.min(rect.height - stageConfig.height - 50, y)),
        podiumX: stageConfig.podiumX + (x - stageConfig.x),
        podiumY: stageConfig.podiumY + (y - stageConfig.y),
      });
    }

    if (isResizing) {
      const newWidth = Math.max(100, e.clientX - rect.left - stageConfig.x);
      const newHeight = Math.max(60, e.clientY - rect.top - stageConfig.y);
      setStageConfig({
        width: newWidth,
        height: newHeight,
      });
    }
  }, [isDragging, isResizing, dragOffset, stageConfig]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    
    const stageTodo = plan.todos.find((t) => t.category === 'stage' && !t.completed);
    if (stageTodo) toggleTodo(stageTodo.id);
  }, [plan.todos, toggleTodo]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleBrideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await fileToDataUrl(file);
      setBrideImage(dataUrl);
    }
  };

  const handleGroomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await fileToDataUrl(file);
      setGroomImage(dataUrl);
    }
  };

  const handlePodiumStyleChange = (style: string) => {
    setStageConfig({ podiumStyle: style });
  };

  const handleToggleTStage = () => {
    setStageConfig({ hasTStage: !stageConfig.hasTStage });
  };

  return (
    <div className="h-full flex">
      <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-rose-gold/20 flex flex-col">
        <div className="p-4 border-b border-rose-gold/20">
          <h3 className="font-display text-lg font-semibold text-champagne-dark mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-champagne" />
            舞台配置
          </h3>
          <p className="text-sm text-gray-500">调整舞台大小、位置和样式</p>
        </div>

        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-champagne" />
              舞台尺寸
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">宽度</label>
                <input
                  type="number"
                  value={stageConfig.width}
                  onChange={(e) => setStageConfig({ width: parseInt(e.target.value) || 200 })}
                  className="input-field text-sm py-2"
                  min="100"
                  max="500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">高度</label>
                <input
                  type="number"
                  value={stageConfig.height}
                  onChange={(e) => setStageConfig({ height: parseInt(e.target.value) || 120 })}
                  className="input-field text-sm py-2"
                  min="60"
                  max="300"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Move className="w-4 h-4 text-champagne" />
              舞台位置
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">X 坐标</label>
                <input
                  type="number"
                  value={Math.round(stageConfig.x)}
                  onChange={(e) => setStageConfig({ x: parseInt(e.target.value) || 400 })}
                  className="input-field text-sm py-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Y 坐标</label>
                <input
                  type="number"
                  value={Math.round(stageConfig.y)}
                  onChange={(e) => setStageConfig({ y: parseInt(e.target.value) || 100 })}
                  className="input-field text-sm py-2"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-champagne" />
                T型舞台
              </h4>
              <div
                className={cn(
                  'toggle-switch',
                  stageConfig.hasTStage && 'active'
                )}
                onClick={handleToggleTStage}
              />
            </div>
            {stageConfig.hasTStage && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">T台长度</label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={stageConfig.tStageLength}
                  onChange={(e) => setStageConfig({ tStageLength: parseInt(e.target.value) })}
                  className="w-full accent-champagne"
                />
                <p className="text-xs text-gray-500 text-right mt-1">{stageConfig.tStageLength}px</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-champagne" />
              司仪台样式
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {['classic', 'modern', 'minimal', 'ornate'].map((style) => (
                <button
                  key={style}
                  onClick={() => handlePodiumStyleChange(style)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    stageConfig.podiumStyle === style
                      ? 'border-champagne bg-champagne/10'
                      : 'border-gray-200 hover:border-rose-gold/50'
                  )}
                >
                  <Mic2
                    className={cn(
                      'w-5 h-5 mb-1',
                      stageConfig.podiumStyle === style ? 'text-champagne' : 'text-gray-400'
                    )}
                  />
                  <p className="text-xs font-medium">
                    {style === 'classic' && '经典'}
                    {style === 'modern' && '现代'}
                    {style === 'minimal' && '简约'}
                    {style === 'ornate' && '华丽'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 text-champagne" />
              新人形象
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-2">新娘照片</label>
                <input
                  ref={brideInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBrideUpload}
                  className="hidden"
                />
                <div className="relative">
                  {brideImage ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-rose-gold/30">
                      <img
                        src={brideImage}
                        alt="新娘"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setBrideImage(undefined)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => brideInputRef.current?.click()}
                      className="w-full h-32 rounded-xl border-2 border-dashed border-rose-gold/30 flex flex-col items-center justify-center gap-2 hover:border-champagne hover:bg-rose-light/30 transition-all"
                    >
                      <Upload className="w-6 h-6 text-champagne" />
                      <span className="text-sm text-gray-500">点击上传新娘照片</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-2">新郎照片</label>
                <input
                  ref={groomInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGroomUpload}
                  className="hidden"
                />
                <div className="relative">
                  {groomImage ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-rose-gold/30">
                      <img
                        src={groomImage}
                        alt="新郎"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setGroomImage(undefined)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => groomInputRef.current?.click()}
                      className="w-full h-32 rounded-xl border-2 border-dashed border-rose-gold/30 flex flex-col items-center justify-center gap-2 hover:border-champagne hover:bg-rose-light/30 transition-all"
                    >
                      <Upload className="w-6 h-6 text-champagne" />
                      <span className="text-sm text-gray-500">点击上传新郎照片</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-12 px-4 bg-white/80 backdrop-blur-sm border-b border-rose-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              舞台: {stageConfig.width} x {stageConfig.height}px
            </span>
            <span className="text-sm text-gray-600">
              位置: ({Math.round(stageConfig.x)}, {Math.round(stageConfig.y)})
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Move className="w-4 h-4" />
            拖拽舞台调整位置，拖动右下角调整大小
          </div>
        </div>

        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          style={{ background: canvasBg }}
        >
          <div
            className={cn(
              'absolute bg-gradient-to-br from-rose-gold/40 to-champagne/40 border-2 border-champagne/60 rounded-lg shadow-elevated transition-shadow',
              isDragging && 'shadow-gold',
              'cursor-move'
            )}
            style={{
              left: stageConfig.x,
              top: stageConfig.y,
              width: stageConfig.width,
              height: stageConfig.height,
            }}
            onMouseDown={handleStageMouseDown}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-end gap-4">
                {brideImage ? (
                  <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-white/60 shadow-lg">
                    <img src={brideImage} alt="新娘" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-20 rounded-lg bg-white/60 flex flex-col items-center justify-center border-2 border-dashed border-white/60">
                    <User className="w-6 h-6 text-champagne-dark" />
                    <span className="text-xs text-champagne-dark">新娘</span>
                  </div>
                )}
                <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-lg mb-8">
                  <Crown className="w-5 h-5 text-champagne" />
                </div>
                {groomImage ? (
                  <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-white/60 shadow-lg">
                    <img src={groomImage} alt="新郎" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-20 rounded-lg bg-white/60 flex flex-col items-center justify-center border-2 border-dashed border-white/60">
                    <User className="w-6 h-6 text-champagne-dark" />
                    <span className="text-xs text-champagne-dark">新郎</span>
                  </div>
                )}
              </div>
            </div>

            {stageConfig.hasTStage && (
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-rose-gold/30 to-rose-gold/10 border-x-2 border-b-2 border-champagne/40 rounded-b-lg"
                style={{
                  top: stageConfig.height,
                  width: stageConfig.width * 0.4,
                  height: stageConfig.tStageLength,
                }}
              />
            )}

            <div
              className="absolute w-8 h-8 bg-champagne/80 rounded-lg flex items-center justify-center cursor-move hover:bg-champagne transition-colors shadow-lg"
              style={{
                left: (stageConfig.width * 0.1) - 16,
                top: (stageConfig.height * 0.3) - 16,
              }}
            >
              <Mic2 className="w-4 h-4 text-white" />
            </div>

            <div
              className="absolute bottom-0 right-0 w-6 h-6 bg-champagne cursor-se-resize rounded-tl-lg flex items-center justify-center"
              onMouseDown={handleResizeMouseDown}
            >
              <Maximize2 className="w-3 h-3 text-white" />
            </div>

            <div className="absolute top-2 left-2 px-2 py-1 bg-white/80 rounded text-xs font-medium text-champagne-dark">
              舞台
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex gap-4">
            <div className="flex-1 card">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-champagne" />
                舞台预览
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>尺寸: {stageConfig.width} x {stageConfig.height}</span>
                <span>T台: {stageConfig.hasTStage ? '已开启' : '未开启'}</span>
                <span>司仪台: {stageConfig.podiumStyle === 'classic' ? '经典' : stageConfig.podiumStyle === 'modern' ? '现代' : stageConfig.podiumStyle === 'minimal' ? '简约' : '华丽'}</span>
              </div>
            </div>
          </div>

          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-elevated max-w-xs">
            <h4 className="font-medium text-champagne-dark mb-2">💡 布置建议</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 舞台通常位于会场正前方中央</li>
              <li>• T台长度建议为150-200cm</li>
              <li>• 司仪台放在舞台左侧不遮挡新人</li>
              <li>• 上传新人照片增强预览效果</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

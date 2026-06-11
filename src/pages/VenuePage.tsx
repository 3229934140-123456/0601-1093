import { useState } from 'react';
import {
  Sun,
  Moon,
  Palmtree,
  Flower2,
  Check,
  Sparkles,
  Waves,
  Trees,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import type { SceneType, TimeMode } from '@/store/types';
import { SCENE_NAMES, TIME_MODE_NAMES, SCENE_BACKGROUNDS } from '@/constants/templates';
import { cn } from '@/lib/utils';

const scenes: { type: SceneType; icon: typeof Palmtree; title: string; desc: string }[] = [
  {
    type: 'island',
    icon: Waves,
    title: '海岛婚礼',
    desc: '碧海蓝天，白沙滩，椰林树影，浪漫海滨仪式',
  },
  {
    type: 'garden',
    icon: Trees,
    title: '花园婚礼',
    desc: '繁花似锦，绿草如茵，欧式喷泉，自然清新',
  },
];

export default function VenuePage() {
  const { getCurrentPlan, setScene, setTimeMode, toggleTodo } = useWeddingStore();
  const [animatingScene, setAnimatingScene] = useState<SceneType | null>(null);

  const plan = getCurrentPlan();
  if (!plan) return null;

  const handleSceneSelect = (type: SceneType) => {
    setAnimatingScene(type);
    setTimeout(() => {
      setScene(type);
      setAnimatingScene(null);
      const venueTodo = plan.todos.find((t) => t.category === 'venue' && !t.completed);
      if (venueTodo) toggleTodo(venueTodo.id);
    }, 300);
  };

  const handleTimeModeToggle = (mode: TimeMode) => {
    setTimeMode(mode);
  };

  const currentBg = SCENE_BACKGROUNDS[plan.sceneType][plan.timeMode];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-display font-semibold text-champagne-dark mb-2">
          场地选择
        </h2>
        <p className="text-gray-600 mb-6">
          选择您心仪的婚礼场地场景，体验不同的浪漫氛围
        </p>
      </div>

      <div className="flex-1 p-6 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-champagne" />
              选择场景
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scenes.map((scene) => (
                <button
                  key={scene.type}
                  onClick={() => handleSceneSelect(scene.type)}
                  className={cn(
                    'relative p-6 rounded-xl border-2 transition-all duration-300 text-left group overflow-hidden',
                    plan.sceneType === scene.type
                      ? 'border-champagne bg-gradient-to-br from-rose-gold/10 to-champagne/10 shadow-gold'
                      : 'border-gray-200 hover:border-rose-gold/50 hover:bg-rose-light/30'
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-0 transition-all duration-500',
                      animatingScene === scene.type && 'animate-pulse-soft'
                    )}
                    style={{
                      background: SCENE_BACKGROUNDS[scene.type][plan.timeMode],
                      opacity: 0.3,
                    }}
                  />

                  <div className="relative">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110',
                        plan.sceneType === scene.type
                          ? 'bg-gradient-to-br from-rose-gold to-champagne text-white'
                          : 'bg-rose-light text-champagne-dark'
                      )}
                    >
                      <scene.icon className="w-7 h-7" />
                    </div>

                    <h4 className="font-display text-lg font-semibold text-gray-800 mb-1">
                      {scene.title}
                    </h4>
                    <p className="text-sm text-gray-600">{scene.desc}</p>

                    {plan.sceneType === scene.type && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-champagne rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              {plan.timeMode === 'day' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500" />
              )}
              氛围切换
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {(['day', 'night'] as TimeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleTimeModeToggle(mode)}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3',
                    plan.timeMode === mode
                      ? 'border-champagne bg-gradient-to-br from-rose-gold/10 to-champagne/10'
                      : 'border-gray-200 hover:border-rose-gold/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      mode === 'day' ? 'bg-amber-100' : 'bg-indigo-100'
                    )}
                  >
                    {mode === 'day' ? (
                      <Sun className="w-6 h-6 text-amber-500" />
                    ) : (
                      <Moon className="w-6 h-6 text-indigo-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">
                      {TIME_MODE_NAMES[mode]}模式
                    </p>
                    <p className="text-xs text-gray-500">
                      {mode === 'day' ? '阳光明媚，温暖浪漫' : '星光璀璨，温馨梦幻'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">当前配置</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">场地类型</span>
                <span className="font-medium text-champagne-dark">
                  {SCENE_NAMES[plan.sceneType]}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">时间氛围</span>
                <span className="font-medium text-champagne-dark">
                  {TIME_MODE_NAMES[plan.timeMode]}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">待办进度</span>
                <span className="font-medium text-champagne-dark">
                  {plan.todos.filter((t) => t.completed).length}/{plan.todos.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div
            className="flex-1 rounded-2xl overflow-hidden relative transition-all duration-1000 ease-in-out shadow-elevated"
            style={{ background: currentBg }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-float">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  {plan.sceneType === 'island' ? (
                    <Palmtree className="w-16 h-16 text-white/80" />
                  ) : (
                    <Flower2 className="w-16 h-16 text-white/80" />
                  )}
                </div>
                <h3 className="text-3xl font-display font-bold text-white mb-2 drop-shadow-lg">
                  {SCENE_NAMES[plan.sceneType]}
                </h3>
                <p className="text-white/80 drop-shadow">
                  {TIME_MODE_NAMES[plan.timeMode]} · 浪漫呈现
                </p>
              </div>
            </div>

            {plan.timeMode === 'night' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse-soft"
                    style={{
                      top: `${Math.random() * 60}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      opacity: Math.random() * 0.8 + 0.2,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">当前场景</p>
                  <p className="font-display text-lg font-semibold text-champagne-dark">
                    {SCENE_NAMES[plan.sceneType]} · {TIME_MODE_NAMES[plan.timeMode]}
                  </p>
                </div>
                <div className="flex gap-2">
                  {plan.timeMode === 'day' ? (
                    <Sun className="w-6 h-6 text-amber-500" />
                  ) : (
                    <Moon className="w-6 h-6 text-indigo-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">布置小贴士</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-champagne">💡</span>
                海岛场景适合搭配白色和金色装饰，营造清新浪漫氛围
              </li>
              <li className="flex items-start gap-2">
                <span className="text-champagne">💡</span>
                花园场景建议选择粉色和绿色系花艺，与自然环境融合
              </li>
              <li className="flex items-start gap-2">
                <span className="text-champagne">💡</span>
                夜间模式可增加灯光和蜡烛装饰，增强温馨感
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

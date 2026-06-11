import { useState } from 'react';
import {
  Save,
  RotateCcw,
  Download,
  Plus,
  List,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import { SCENE_NAMES, TIME_MODE_NAMES } from '@/constants/templates';
import dayjs from 'dayjs';

export default function Header() {
  const {
    currentPlanId,
    plans,
    getCurrentPlan,
    setTimeMode,
    switchPlan,
    createNewPlan,
    resetPlanToDefault,
  } = useWeddingStore();

  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const currentPlan = getCurrentPlan();
  const planList = Object.values(plans);

  const handleCreatePlan = () => {
    if (newPlanName.trim()) {
      createNewPlan(newPlanName.trim());
      setNewPlanName('');
      setShowNewPlanModal(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('确定要恢复默认布局吗？所有修改将被清除。')) {
      resetPlanToDefault(currentPlanId);
    }
  };

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-rose-gold/20 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowPlanMenu(!showPlanMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-rose-light/50 transition-colors"
            >
              <List className="w-5 h-5 text-champagne-dark" />
              <span className="font-medium text-gray-800 max-w-[200px] truncate">
                {currentPlan?.name || '未命名方案'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showPlanMenu && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-elevated border border-rose-gold/20 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">我的方案</p>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {planList.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => {
                          switchPlan(plan.id);
                          setShowPlanMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          plan.id === currentPlanId
                            ? 'bg-rose-light text-champagne-dark'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium truncate">{plan.name}</div>
                        <div className="text-xs text-gray-500">
                          {SCENE_NAMES[plan.sceneType]} · {TIME_MODE_NAMES[plan.timeMode]} ·{' '}
                          {dayjs(plan.updatedAt).format('MM-DD HH:mm')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-2 py-2">
                  <button
                    onClick={() => {
                      setShowPlanMenu(false);
                      setShowNewPlanModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-champagne-dark hover:bg-rose-light/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    新建方案
                  </button>
                </div>
              </div>
            )}
          </div>

          {currentPlan && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              {currentPlan.timeMode === 'day' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
              <span className="text-sm text-gray-600">
                {TIME_MODE_NAMES[currentPlan.timeMode]}
              </span>
              <div
                className={`toggle-switch ${currentPlan.timeMode === 'night' ? 'active' : ''}`}
                onClick={() =>
                  setTimeMode(currentPlan.timeMode === 'day' ? 'night' : 'day')
                }
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 btn-ghost"
            title="恢复默认布局"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">恢复默认</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 btn-secondary">
            <Save className="w-4 h-4" />
            <span className="text-sm">保存</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 btn-primary">
            <Download className="w-4 h-4" />
            <span className="text-sm">导出</span>
          </button>
        </div>
      </header>

      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-elevated animate-slide-up">
            <h3 className="text-xl font-display font-semibold text-champagne-dark mb-4">
              新建方案
            </h3>
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="请输入方案名称"
              className="input-field mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlan()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNewPlanModal(false)}
                className="btn-ghost"
              >
                取消
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={!newPlanName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

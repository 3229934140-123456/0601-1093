import { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  File,
  Trash2,
  Plus,
  Edit3,
  BarChart3,
  CheckCircle2,
  Circle,
  MapPin,
  Users,
  Flower2,
  Music,
  Mic2,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  Calendar,
  MessageSquare,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  generateShareLink,
  generateGuestShareLink,
  generateLightweightShareLink,
  copyToClipboard,
} from '@/utils/exportUtils';
import {
  SCENE_NAMES,
  TIME_MODE_NAMES,
  FURNITURE_TEMPLATES,
  DECORATION_TEMPLATES,
} from '@/constants/templates';
import { cn } from '@/lib/utils';
import type { WeddingPlan, TodoItem, Guest, RsvpResponse } from '@/store/types';
import dayjs from 'dayjs';

const TODO_CATEGORY_ICONS: Record<string, typeof MapPin> = {
  venue: MapPin,
  seating: Users,
  stage: Mic2,
  decoration: Flower2,
  ceremony: Music,
  other: Sparkles,
};

const TODO_CATEGORY_NAMES: Record<string, string> = {
  venue: '场地',
  seating: '座位',
  stage: '舞台',
  decoration: '装饰',
  ceremony: '流程',
  other: '其他',
};

const TODO_CATEGORY_COLORS: Record<string, string> = {
  venue: 'bg-blue-100 text-blue-600',
  seating: 'bg-green-100 text-green-600',
  stage: 'bg-purple-100 text-purple-600',
  decoration: 'bg-pink-100 text-pink-600',
  ceremony: 'bg-amber-100 text-amber-600',
  other: 'bg-gray-100 text-gray-600',
};

interface PlanCardProps {
  plan: WeddingPlan;
  isActive: boolean;
  isComparing: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleCompare: () => void;
}

function PlanCard({
  plan,
  isActive,
  isComparing,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleCompare,
}: PlanCardProps) {
  const furnitureCost = plan.furniture.reduce((sum, f) => sum + f.price, 0);
  const decorationCost = plan.decorations.reduce((sum, d) => sum + d.price, 0);
  const totalBudget = furnitureCost + decorationCost;
  const completedTodos = plan.todos.filter((t) => t.completed).length;
  const totalTodos = plan.todos.length;
  const progress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl border-2 p-5 transition-all cursor-pointer group',
        isActive
          ? 'border-rose-400 shadow-lg shadow-rose-100'
          : 'border-gray-100 hover:border-rose-200 hover:shadow-md'
      )}
      onClick={onSelect}
    >
      {isActive && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-800 truncate">{plan.name}</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            更新于 {dayjs(plan.updatedAt).format('MM-DD HH:mm')}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare();
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isComparing
                ? 'bg-rose-100 text-rose-500'
                : 'hover:bg-gray-100 text-gray-400'
            )}
            title={isComparing ? '取消对比' : '加入对比'}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-gray-400 hover:text-blue-500"
            title="复制方案"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            title="删除方案"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-500 rounded-full">
          {SCENE_NAMES[plan.sceneType]}
        </span>
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
          {TIME_MODE_NAMES[plan.timeMode]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-rose-500">
            {plan.furniture.length}
          </div>
          <div className="text-xs text-gray-400">家具</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-champagne-500">
            {plan.decorations.length}
          </div>
          <div className="text-xs text-gray-400">装饰</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-green-500">
            {plan.guests.length}
          </div>
          <div className="text-xs text-gray-400">宾客</div>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">完成进度</span>
          <span className="text-gray-600 font-medium">
            {completedTodos}/{totalTodos}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-champagne-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">预算</span>
          <div className="text-lg font-bold text-gray-800">
            ¥{totalBudget.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BudgetCompareModalProps {
  plans: Record<string, WeddingPlan>;
  comparePlanIds: string[];
  onClose: () => void;
}

function BudgetCompareModal({
  plans,
  comparePlanIds,
  onClose,
}: BudgetCompareModalProps) {
  const comparePlans = comparePlanIds
    .map((id) => plans[id])
    .filter(Boolean)
    .slice(0, 3);

  if (comparePlans.length < 2) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            请选择至少2个方案
          </h3>
          <p className="text-gray-500 mb-6">
            点击方案卡片右上角的图表图标，将方案加入对比
          </p>
          <button onClick={onClose} className="btn-primary">
            知道了
          </button>
        </div>
      </div>
    );
  }

  const getPlanStats = (plan: WeddingPlan) => {
    const furnitureCost = plan.furniture.reduce((sum, f) => sum + f.price, 0);
    const decorationCost = plan.decorations.reduce((sum, d) => sum + d.price, 0);
    return {
      furnitureCost,
      decorationCost,
      total: furnitureCost + decorationCost,
      furnitureCount: plan.furniture.length,
      decorationCount: plan.decorations.length,
      guestCount: plan.guests.length,
      ceremonySteps: plan.ceremonySteps.length,
      completedTodos: plan.todos.filter((t) => t.completed).length,
      totalTodos: plan.todos.length,
    };
  };

  const stats = comparePlans.map(getPlanStats);
  const maxTotal = Math.max(...stats.map((s) => s.total));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="bg-gradient-to-r from-rose-500 to-champagne-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">预算对比分析</h3>
              <p className="text-white/80 text-sm mt-1">
                对比 {comparePlans.length} 个方案的详细配置和预算
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  对比项
                </th>
                {comparePlans.map((plan) => (
                  <th
                    key={plan.id}
                    className="text-center py-3 px-4 font-semibold text-gray-800"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-3 px-4 text-gray-600">场地类型</td>
                {comparePlans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    <span className="text-sm px-2 py-1 bg-rose-50 text-rose-500 rounded-full">
                      {SCENE_NAMES[plan.sceneType]}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600">时间模式</td>
                {comparePlans.map((plan) => (
                  <td key={plan.id} className="text-center py-3 px-4">
                    {TIME_MODE_NAMES[plan.timeMode]}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600">家具数量</td>
                {stats.map((s, i) => (
                  <td key={i} className="text-center py-3 px-4 font-medium">
                    {s.furnitureCount} 件
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600">家具预算</td>
                {stats.map((s, i) => (
                  <td key={i} className="text-center py-3 px-4 font-medium">
                    ¥{s.furnitureCost.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600">装饰数量</td>
                {stats.map((s, i) => (
                  <td key={i} className="text-center py-3 px-4 font-medium">
                    {s.decorationCount} 件
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600">装饰预算</td>
                {stats.map((s, i) => (
                  <td key={i} className="text-center py-3 px-4 font-medium">
                    ¥{s.decorationCost.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600">宾客人数</td>
                {stats.map((s, i) => (
                  <td key={i} className="text-center py-3 px-4 font-medium">
                    {s.guestCount} 人
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600">仪式环节</td>
                {stats.map((s, i) => (
                  <td key={i} className="text-center py-3 px-4 font-medium">
                    {s.ceremonySteps} 个
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600">完成进度</td>
                {stats.map((s, i) => (
                  <td key={i} className="text-center py-3 px-4 font-medium">
                    {s.completedTodos}/{s.totalTodos}
                  </td>
                ))}
              </tr>
              <tr className="bg-rose-50/50">
                <td className="py-4 px-4 font-semibold text-gray-800">
                  总预算
                </td>
                {stats.map((s, i) => (
                  <td key={i} className="text-center py-4 px-4">
                    <div className="text-xl font-bold text-rose-500">
                      ¥{s.total.toLocaleString()}
                    </div>
                    <div className="mt-2 h-2 bg-rose-100 rounded-full overflow-hidden max-w-[120px] mx-auto">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-champagne-400"
                        style={{ width: `${(s.total / maxTotal) * 100}%` }}
                      />
                    </div>
                    {s.total === maxTotal && (
                      <span className="text-xs text-amber-500 mt-1 inline-flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        最高
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
            <button onClick={onClose} className="btn-primary">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddTodoModalProps {
  onClose: () => void;
  onAdd: (title: string, category: TodoItem['category']) => void;
}

function AddTodoModal({ onClose, onAdd }: AddTodoModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TodoItem['category']>('other');

  const categories: { key: TodoItem['category']; name: string }[] = [
    { key: 'venue', name: '场地' },
    { key: 'seating', name: '座位' },
    { key: 'stage', name: '舞台' },
    { key: 'decoration', name: '装饰' },
    { key: 'ceremony', name: '流程' },
    { key: 'other', name: '其他' },
  ];

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), category);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-champagne-500 p-6 text-white">
          <h3 className="text-xl font-bold">添加待办事项</h3>
          <p className="text-white/80 text-sm mt-1">记录婚礼准备的待办任务</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务内容
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full"
              placeholder="请输入待办事项..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={cn(
                    'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                    category === cat.key
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="btn-primary"
          >
            <Check className="w-4 h-4" />
            添加
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  const {
    getCurrentPlan,
    plans,
    currentPlanId,
    switchPlan,
    createNewPlan,
    deletePlan,
    duplicatePlan,
    toggleComparePlan,
    comparePlanIds,
    clearComparePlans,
    calculateBudget,
    addTodo,
    toggleTodo,
    deleteTodo,
    exportPlanData,
  } = useWeddingStore();

  const [copied, setCopied] = useState(false);
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);
  const [showGuestLinks, setShowGuestLinks] = useState(false);
  const [showRsvpDetails, setShowRsvpDetails] = useState(false);
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'pending' | 'attending' | 'declined'>('all');
  const [copiedRsvpId, setCopiedRsvpId] = useState<string | null>(null);
  const [shareMode, setShareMode] = useState<'full' | 'light'>('full');
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState<string | null>(
    null
  );
  const [duplicateName, setDuplicateName] = useState('');
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const plan = getCurrentPlan();
  if (!plan) return null;

  const budget = calculateBudget(currentPlanId);
  const shareLink = shareMode === 'full' ? generateShareLink(plan) : generateLightweightShareLink(plan);
  const shareLinkSize = Math.round((new TextEncoder().encode(shareLink).length) / 1024 * 10) / 10;
  const isLargeLink = shareLink.length > 2000;

  const rsvpResponses = plan.rsvpResponses || [];
  const attendingCount = rsvpResponses.filter(r => r.attending).length;
  const declinedCount = rsvpResponses.filter(r => !r.attending).length;
  const totalAttendingGuests = rsvpResponses.filter(r => r.attending).reduce((sum, r) => sum + r.guestCount, 0);
  const respondedGuests = new Set(rsvpResponses.map(r => r.guestId || r.guestName)).size;
  const responseRate = plan.guests.length > 0 ? Math.round((respondedGuests / plan.guests.length) * 100) : 0;

  const respondedGuestIds = new Set(
    rsvpResponses.map(r => r.guestId).filter(Boolean) as string[]
  );
  const respondedGuestNames = new Set(
    rsvpResponses.filter(r => !r.guestId).map(r => r.guestName)
  );

  const pendingGuests = plan.guests.filter(
    g => !respondedGuestIds.has(g.id) && !respondedGuestNames.has(g.name)
  );

  const attendingResponses = rsvpResponses.filter(r => r.attending);
  const declinedResponses = rsvpResponses.filter(r => !r.attending);

  const getFilteredRsvpList = () => {
    switch (rsvpFilter) {
      case 'attending':
        return attendingResponses.map(r => ({ type: 'response', data: r } as const));
      case 'declined':
        return declinedResponses.map(r => ({ type: 'response', data: r } as const));
      case 'pending':
        return pendingGuests.map(g => ({ type: 'guest', data: g } as const));
      default:
        return [];
    }
  };

  const generateReminderText = (guest: Guest) => {
    return `【婚礼提醒】亲爱的${guest.name}，您好！${plan.name}婚礼将于近期举行，我们还未收到您的出席确认，请尽快回复哦~`;
  };

  const handleCopyReminder = async (guest: Guest) => {
    const text = generateReminderText(guest);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedRsvpId(guest.id);
      setTimeout(() => setCopiedRsvpId(null), 2000);
    }
  };

  const handleExportRsvp = (format: 'csv' | 'copy') => {
    const rows = [['宾客姓名', 'VIP', '座位号', '回复状态', '出席人数', '祝福语', '回复时间']];
    
    const allGuests = plan.guests;
    allGuests.forEach((guest) => {
      const rsvp = rsvpResponses.find(
        r => r.guestId === guest.id || r.guestName === guest.name
      );
      const seatLabel = plan.furniture.find(f => f.id === guest.seatId)?.label || '未安排';
      
      let status = '未回复';
      let guestCount = '-';
      let message = '-';
      let submitTime = '-';
      
      if (rsvp) {
        status = rsvp.attending ? '确认出席' : '无法出席';
        guestCount = rsvp.attending ? rsvp.guestCount.toString() : '0';
        message = rsvp.message || '-';
        submitTime = new Date(rsvp.submittedAt).toLocaleString('zh-CN');
      }
      
      rows.push([
        guest.name,
        guest.isVip ? '是' : '否',
        seatLabel,
        status,
        guestCount,
        message,
        submitTime,
      ]);
    });

    if (format === 'csv') {
      const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${plan.name}-RSVP回执清单.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const textContent = rows.map(row => row.join('\t')).join('\n');
      copyToClipboard(textContent);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const planData = getCurrentPlan();
    if (!planData) return;
    const planBudget = calculateBudget(currentPlanId);

    if (format === 'csv') {
      exportToCSV(planData, planBudget);
    } else if (format === 'excel') {
      exportToExcel(planData, planBudget);
    } else {
      exportToPDF(planData, planBudget);
    }
  };

  const handleCopyGuestLink = async (guestId: string, link: string) => {
    const success = await copyToClipboard(link);
    if (success) {
      setCopiedGuestId(guestId);
      setTimeout(() => setCopiedGuestId(null), 2000);
    }
  };

  const handleExportGuestLinks = () => {
    if (!plan || plan.guests.length === 0) return;
    
    const rows = [['宾客姓名', 'VIP', '座位号', '专属邀请链接']];
    plan.guests.forEach((guest) => {
      const link = generateGuestShareLink(plan, guest);
      rows.push([
        guest.name,
        guest.isVip ? '是' : '否',
        guest.seatId ? '已安排' : '未安排',
        link,
      ]);
    });

    const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.name}-宾客邀请链接.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDuplicate = (planId: string) => {
    const originalPlan = plans[planId];
    if (!originalPlan) return;
    setDuplicateName(`${originalPlan.name} (副本)`);
    setShowDuplicateModal(planId);
  };

  const confirmDuplicate = () => {
    if (showDuplicateModal && duplicateName.trim()) {
      duplicatePlan(showDuplicateModal, duplicateName.trim());
      setShowDuplicateModal(null);
      setDuplicateName('');
    }
  };

  const handleCreateNewPlan = () => {
    if (newPlanName.trim()) {
      createNewPlan(newPlanName.trim());
      setShowNewPlanModal(false);
      setNewPlanName('');
    }
  };

  const handleAddTodo = (title: string, category: TodoItem['category']) => {
    addTodo(title, category);
  };

  const todosByCategory = plan.todos.reduce(
    (acc, todo) => {
      if (!acc[todo.category]) acc[todo.category] = [];
      acc[todo.category].push(todo);
      return acc;
    },
    {} as Record<string, TodoItem[]>
  );

  const planList = Object.values(plans).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              分享与导出
            </h2>
            <p className="text-gray-500">
              生成邀请链接、导出布置清单、管理多个方案
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-rose-500 to-champagne-500 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Share2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">生成邀请链接</h3>
                  <p className="text-white/80 text-sm">分享给宾客预览婚礼场地</p>
                </div>
                <div className="flex bg-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setShareMode('full')}
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-medium transition-all',
                      shareMode === 'full' ? 'bg-white text-rose-500' : 'text-white/80 hover:text-white'
                    )}
                  >
                    完整
                  </button>
                  <button
                    onClick={() => setShareMode('light')}
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-medium transition-all',
                      shareMode === 'light' ? 'bg-white text-rose-500' : 'text-white/80 hover:text-white'
                    )}
                  >
                    轻量
                  </button>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-white/70">
                    {shareMode === 'full' ? '完整分享链接' : '轻量分享链接'}
                  </p>
                  <span className="text-xs text-white/60">
                    {shareLinkSize} KB
                    {shareMode === 'full' && isLargeLink && <span className="ml-1 text-amber-200">· 较大</span>}
                  </span>
                </div>
                <p className="text-sm font-mono truncate">{shareLink}</p>
              </div>

              {shareMode === 'full' && isLargeLink && (
                <div className="bg-amber-500/20 border border-amber-300/30 rounded-lg p-2.5 mb-3">
                  <p className="text-xs text-amber-100 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      链接较大（含照片/音乐），部分浏览器可能受限。建议使用「轻量」模式或直接通过聊天软件发送。
                    </span>
                  </p>
                </div>
              )}

              {shareMode === 'light' && (
                <div className="bg-white/10 rounded-lg p-2.5 mb-3">
                  <p className="text-xs text-white/80 flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      轻量模式保留核心数据（场地布置、座位安排、仪式流程），照片音乐等本地加载，链接更短更稳定。
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={handleCopyLink}
                className={cn(
                  'w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-rose-500 hover:bg-white/90'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    已复制链接
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    复制{shareMode === 'full' ? '完整' : '轻量'}链接
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">
                    宾客专属链接
                  </h3>
                  <p className="text-gray-500 text-sm">按宾客生成专属链接，打开自动识别身份</p>
                </div>
              </div>
              
              {plan.guests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无宾客，请先在座位图页面添加宾客</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">
                      共 {plan.guests.length} 位宾客
                    </span>
                    <button
                      onClick={handleExportGuestLinks}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      批量导出
                    </button>
                  </div>
                  <button
                    onClick={() => setShowGuestLinks(!showGuestLinks)}
                    className="w-full py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {showGuestLinks ? '收起宾客列表' : '展开宾客列表'}
                    </span>
                    {showGuestLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showGuestLinks && (
                    <div className="mt-3 max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                      {plan.guests.map((guest) => {
                        const guestLink = generateGuestShareLink(plan, guest);
                        return (
                          <div key={guest.id} className="flex items-center gap-2 p-2 hover:bg-gray-50">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                              guest.isVip ? 'bg-amber-100' : 'bg-rose-100'
                            )}>
                              {guest.isVip ? (
                                <span className="text-xs text-amber-600 font-bold">VIP</span>
                              ) : (
                                <span className="text-xs text-rose-500">{guest.name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{guest.name}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {guest.seatId ? '已安排座位' : '座位待定'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopyGuestLink(guest.id, guestLink)}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors flex-shrink-0',
                                copiedGuestId === guest.id
                                  ? 'bg-green-100 text-green-600'
                                  : 'hover:bg-blue-50 text-gray-400 hover:text-blue-500'
                              )}
                              title="复制专属链接"
                            >
                              {copiedGuestId === guest.id ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">
                    RSVP 回执中心
                  </h3>
                  <p className="text-gray-500 text-sm">宾客出席确认与跟进管理</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportRsvp('copy')}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    复制
                  </button>
                  <button
                    onClick={() => handleExportRsvp('csv')}
                    className="px-3 py-1.5 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    导出
                  </button>
                </div>
                <div className="text-right pl-4 border-l border-gray-100">
                  <div className="text-2xl font-bold text-champagne-dark">{responseRate}%</div>
                  <div className="text-xs text-gray-400">回复率</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <UserCheck className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-green-600">{attendingCount}</div>
                  <div className="text-xs text-green-600">确认出席</div>
                </div>
                <div className="bg-rose-50 rounded-xl p-4 text-center">
                  <UserX className="w-6 h-6 text-rose-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-rose-500">{declinedCount}</div>
                  <div className="text-xs text-rose-500">无法出席</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-amber-600">{totalAttendingGuests}</div>
                  <div className="text-xs text-amber-600">预计出席人数</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <AlertCircle className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-gray-600">
                    {pendingGuests.length}
                  </div>
                  <div className="text-xs text-gray-500">待回复</div>
                </div>
              </div>

              <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                {[
                  { key: 'all', label: '全部回执', icon: MessageSquare },
                  { key: 'pending', label: `待回复 (${pendingGuests.length})`, icon: AlertCircle },
                  { key: 'attending', label: `确认出席 (${attendingCount})`, icon: UserCheck },
                  { key: 'declined', label: `无法出席 (${declinedCount})`, icon: UserX },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setRsvpFilter(tab.key as any)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5',
                      rsvpFilter === tab.key
                        ? 'bg-champagne text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {rsvpFilter === 'all' ? (
                <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                  {rsvpResponses.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无回执数据，请将邀请链接分享给宾客</p>
                    </div>
                  ) : (
                    [...rsvpResponses].reverse().map((rsvp) => (
                      <div key={rsvp.id} className="p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                              rsvp.attending ? 'bg-green-100' : 'bg-rose-100'
                            )}>
                              {rsvp.attending ? (
                                <UserCheck className="w-4 h-4 text-green-600" />
                              ) : (
                                <UserX className="w-4 h-4 text-rose-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-sm truncate">
                                {rsvp.guestName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(rsvp.submittedAt).toLocaleString('zh-CN')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={cn(
                              'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                              rsvp.attending
                                ? 'bg-green-100 text-green-700'
                                : 'bg-rose-100 text-rose-700'
                            )}>
                              {rsvp.attending ? `出席 ${rsvp.guestCount}人` : '无法出席'}
                            </span>
                          </div>
                        </div>
                        {rsvp.message && (
                          <div className="mt-2 ml-10 bg-gray-50 rounded-lg p-2">
                            <p className="text-sm text-gray-600">💌 {rsvp.message}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                  {getFilteredRsvpList().length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无数据</p>
                    </div>
                  ) : (
                    getFilteredRsvpList().map((item) => {
                      if (item.type === 'guest') {
                        const guest = item.data;
                        const seatLabel = plan.furniture.find(f => f.id === guest.seatId)?.label || '未安排';
                        return (
                          <div key={guest.id} className="p-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                  <AlertCircle className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 text-sm">
                                    {guest.name}
                                    {guest.isVip && <span className="ml-1 text-amber-500 text-xs">VIP</span>}
                                  </p>
                                  <p className="text-xs text-gray-400">座位：{seatLabel}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleCopyReminder(guest)}
                                className={cn(
                                  'px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 flex-shrink-0',
                                  copiedRsvpId === guest.id
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                )}
                              >
                                {copiedRsvpId === guest.id ? (
                                  <><Check className="w-3.5 h-3.5" />已复制</>
                                ) : (
                                  <><Copy className="w-3.5 h-3.5" />提醒话术</>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      } else {
                        const rsvp = item.data;
                        return (
                          <div key={rsvp.id} className="p-3 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                  rsvp.attending ? 'bg-green-100' : 'bg-rose-100'
                                )}>
                                  {rsvp.attending ? (
                                    <UserCheck className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <UserX className="w-4 h-4 text-rose-500" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 text-sm truncate">
                                    {rsvp.guestName}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(rsvp.submittedAt).toLocaleString('zh-CN')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className={cn(
                                  'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                                  rsvp.attending
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-rose-100 text-rose-700'
                                )}>
                                  {rsvp.attending ? `出席 ${rsvp.guestCount}人` : '无法出席'}
                                </span>
                              </div>
                            </div>
                            {rsvp.message && (
                              <div className="mt-2 ml-10 bg-gray-50 rounded-lg p-2">
                                <p className="text-sm text-gray-600">💌 {rsvp.message}</p>
                              </div>
                            )}
                          </div>
                        );
                      }
                    })
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Download className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    导出布置清单
                  </h3>
                  <p className="text-gray-500 text-sm">支持多种格式导出</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleExport('excel')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-green-100 hover:bg-green-50 transition-colors"
                >
                  <FileSpreadsheet className="w-8 h-8 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Excel</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors"
                >
                  <FileText className="w-8 h-8 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">CSV</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
                >
                  <File className="w-8 h-8 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">PDF</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-500" />
                方案管理 ({planList.length} 个方案)
              </h3>
              <div className="flex items-center gap-2">
                {comparePlanIds.length > 0 && (
                  <button
                    onClick={() => setShowCompareModal(true)}
                    className="btn-secondary text-sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    对比选中 ({comparePlanIds.length})
                  </button>
                )}
                <button
                  onClick={() => setShowNewPlanModal(true)}
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4" />
                  新建方案
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planList.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  isActive={p.id === currentPlanId}
                  isComparing={comparePlanIds.includes(p.id)}
                  onSelect={() => switchPlan(p.id)}
                  onDuplicate={() => handleDuplicate(p.id)}
                  onDelete={() => {
                    if (
                      window.confirm(`确定要删除方案「${p.name}」吗？`)
                    ) {
                      deletePlan(p.id);
                    }
                  }}
                  onToggleCompare={() => toggleComparePlan(p.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-rose-500" />
                待办事项
              </h3>
              <button
                onClick={() => setShowAddTodoModal(true)}
                className="btn-secondary text-sm"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(todosByCategory).map(([category, todos]) => {
                const Icon = TODO_CATEGORY_ICONS[category] || Sparkles;
                const completedCount = todos.filter((t) => t.completed).length;
                const isExpanded = expandedCategory === category;

                return (
                  <div
                    key={category}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedCategory(isExpanded ? null : category)
                      }
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            TODO_CATEGORY_COLORS[category]
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-800">
                            {TODO_CATEGORY_NAMES[category] || category}
                          </div>
                          <div className="text-xs text-gray-400">
                            {completedCount}/{todos.length} 已完成
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-400 to-champagne-400 transition-all"
                            style={{
                              width: `${(completedCount / todos.length) * 100}%`,
                            }}
                          />
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-2">
                        {todos.map((todo) => (
                          <div
                            key={todo.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
                          >
                            <button
                              onClick={() => toggleTodo(todo.id)}
                              className="flex-shrink-0"
                            >
                              {todo.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                              )}
                            </button>
                            <span
                              className={cn(
                                'flex-1 text-sm',
                                todo.completed &&
                                  'text-gray-400 line-through'
                              )}
                            >
                              {todo.title}
                            </span>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {Object.keys(todosByCategory).length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-rose-400" />
                  </div>
                  <h4 className="text-gray-600 font-medium mb-2">
                    暂无待办事项
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">
                    添加待办事项来跟踪婚礼准备进度
                  </p>
                  <button
                    onClick={() => setShowAddTodoModal(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                    添加待办
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-80 bg-white border-l border-gray-100 p-5 overflow-auto">
        <h3 className="font-semibold text-gray-800 mb-4">当前方案概要</h3>

        <div className="bg-gradient-to-br from-rose-50 to-champagne-50 rounded-xl p-4 mb-5">
          <h4 className="font-semibold text-gray-800 mb-3">{plan.name}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">场地类型</span>
              <span className="text-gray-800 font-medium">
                {SCENE_NAMES[plan.sceneType]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">时间模式</span>
              <span className="text-gray-800 font-medium">
                {TIME_MODE_NAMES[plan.timeMode]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">创建时间</span>
              <span className="text-gray-800">
                {dayjs(plan.createdAt).format('YYYY-MM-DD')}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h4 className="text-sm font-medium text-gray-700 mb-3">预算明细</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">家具费用</span>
              <span className="font-medium text-gray-800">
                ¥
                {plan.furniture
                  .reduce((sum, f) => sum + f.price, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">装饰费用</span>
              <span className="font-medium text-gray-800">
                ¥
                {plan.decorations
                  .reduce((sum, d) => sum + d.price, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">总计</span>
              <span className="text-xl font-bold text-rose-500">
                ¥{budget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h4 className="text-sm font-medium text-gray-700 mb-3">布置统计</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-3 bg-rose-50 rounded-lg">
              <div className="text-lg font-bold text-rose-500">
                {plan.furniture.length}
              </div>
              <div className="text-xs text-gray-500">家具</div>
            </div>
            <div className="text-center p-3 bg-champagne-50 rounded-lg">
              <div className="text-lg font-bold text-champagne-500">
                {plan.decorations.length}
              </div>
              <div className="text-xs text-gray-500">装饰</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-500">
                {plan.guests.length}
              </div>
              <div className="text-xs text-gray-500">宾客</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-500">
                {plan.ceremonySteps.length}
              </div>
              <div className="text-xs text-gray-500">环节</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">快速操作</h4>
          <div className="space-y-2">
            <button
              onClick={() => handleExport('excel')}
              className="w-full flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">导出 Excel 清单</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <File className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-700">导出 PDF 报告</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <Share2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">复制分享链接</span>
            </button>
          </div>
        </div>
      </div>

      {showCompareModal && (
        <BudgetCompareModal
          plans={plans}
          comparePlanIds={comparePlanIds}
          onClose={() => {
            setShowCompareModal(false);
            clearComparePlans();
          }}
        />
      )}

      {showAddTodoModal && (
        <AddTodoModal
          onClose={() => setShowAddTodoModal(false)}
          onAdd={handleAddTodo}
        />
      )}

      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-champagne-500 p-6 text-white">
              <h3 className="text-xl font-bold">复制方案</h3>
              <p className="text-white/80 text-sm mt-1">
                为新方案输入一个名称
              </p>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                className="input-field w-full"
                placeholder="方案名称"
                autoFocus
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDuplicateModal(null)}
                className="btn-ghost"
              >
                取消
              </button>
              <button
                onClick={confirmDuplicate}
                disabled={!duplicateName.trim()}
                className="btn-primary"
              >
                <Check className="w-4 h-4" />
                确认复制
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-champagne-500 p-6 text-white">
              <h3 className="text-xl font-bold">新建方案</h3>
              <p className="text-white/80 text-sm mt-1">
                创建一个全新的婚礼方案
              </p>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="input-field w-full"
                placeholder="请输入方案名称"
                autoFocus
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowNewPlanModal(false)}
                className="btn-ghost"
              >
                取消
              </button>
              <button
                onClick={handleCreateNewPlan}
                disabled={!newPlanName.trim()}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

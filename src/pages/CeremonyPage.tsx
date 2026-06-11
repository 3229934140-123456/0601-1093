import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Trash2,
  Edit3,
  Clock,
  User,
  GripVertical,
  X,
  Check,
  Heart,
  FileText,
  CircleDot,
  Users,
  Wine,
  Flower2,
  PartyPopper,
  Music,
  Mic2,
  Camera,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import type { CeremonyStep } from '@/store/types';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

const iconMap: Record<string, typeof Heart> = {
  Heart,
  FileText,
  CircleDot,
  Users,
  Wine,
  Flower2,
  PartyPopper,
  Music,
  Mic2,
  Camera,
  Sparkles,
};

const iconOptions = [
  { key: 'Heart', name: '爱心' },
  { key: 'FileText', name: '文件' },
  { key: 'CircleDot', name: '戒指' },
  { key: 'Users', name: '人群' },
  { key: 'Wine', name: '酒杯' },
  { key: 'Flower2', name: '鲜花' },
  { key: 'PartyPopper', name: '礼炮' },
  { key: 'Music', name: '音乐' },
  { key: 'Mic2', name: '话筒' },
  { key: 'Camera', name: '相机' },
  { key: 'Sparkles', name: '闪耀' },
];

interface SortableItemProps {
  step: CeremonyStep;
  onEdit: (step: CeremonyStep) => void;
  onDelete: (id: string) => void;
  startTime: string;
}

function SortableItem({ step, onEdit, onDelete, startTime }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = iconMap[step.icon] || Heart;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-white rounded-xl p-4 shadow-sm border border-rose-100 transition-all duration-200',
        isDragging && 'opacity-50 shadow-xl z-50',
        !isDragging && 'hover:shadow-md hover:border-rose-200'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <GripVertical className="w-5 h-5 text-rose-300" />
        </div>

        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-rose-100 to-champagne-100 flex items-center justify-center">
          <IconComponent className="w-7 h-7 text-rose-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-rose-400 bg-rose-50 px-2 py-0.5 rounded-full">
              {startTime}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {step.durationMin} 分钟
            </span>
          </div>
          <h4 className="font-semibold text-gray-800 mb-1">{step.title}</h4>
          <p className="text-sm text-gray-500 line-clamp-2">{step.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <User className="w-3 h-3" />
              {step.host}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(step)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4 text-blue-500" />
          </button>
          <button
            onClick={() => onDelete(step.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      <div className="absolute left-[52px] top-[72px] w-0.5 h-8 bg-gradient-to-b from-rose-200 to-transparent" />
    </div>
  );
}

interface EditModalProps {
  step: CeremonyStep | null;
  onClose: () => void;
  onSave: (step: Omit<CeremonyStep, 'id' | 'order'> | CeremonyStep) => void;
}

function EditModal({ step, onClose, onSave }: EditModalProps) {
  const [title, setTitle] = useState(step?.title || '');
  const [description, setDescription] = useState(step?.description || '');
  const [durationMin, setDurationMin] = useState(step?.durationMin || 5);
  const [host, setHost] = useState(step?.host || '司仪');
  const [icon, setIcon] = useState(step?.icon || 'Heart');

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (step) {
      onSave({ ...step, title, description, durationMin, host, icon });
    } else {
      onSave({ title, description, durationMin, host, icon });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-champagne-500 p-6 text-white">
          <h3 className="text-xl font-bold">
            {step ? '编辑仪式环节' : '添加仪式环节'}
          </h3>
          <p className="text-white/80 text-sm mt-1">
            完善仪式环节的详细信息
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              环节名称
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full"
              placeholder="如：新人入场"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              环节描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field w-full min-h-[80px] resize-none"
              placeholder="描述这个环节的具体内容..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                持续时间（分钟）
              </label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="input-field w-full"
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主持人
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="input-field w-full"
                placeholder="如：司仪"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择图标
            </label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((opt) => {
                const IconComp = iconMap[opt.key] || Heart;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setIcon(opt.key)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all',
                      icon === opt.key
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-200'
                    )}
                    title={opt.name}
                  >
                    <IconComp
                      className={cn(
                        'w-5 h-5 mx-auto',
                        icon === opt.key ? 'text-rose-500' : 'text-gray-400'
                      )}
                    />
                  </button>
                );
              })}
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
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CeremonyPage() {
  const {
    getCurrentPlan,
    addCeremonyStep,
    updateCeremonyStep,
    deleteCeremonyStep,
    reorderCeremonySteps,
  } = useWeddingStore();

  const [editingStep, setEditingStep] = useState<CeremonyStep | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const plan = getCurrentPlan();
  if (!plan) return null;

  const sortedSteps = [...plan.ceremonySteps].sort((a, b) => a.order - b.order);
  const totalDuration = sortedSteps.reduce((sum, s) => sum + s.durationMin, 0);

  const getStepStartTime = (index: number): string => {
    let minutes = 0;
    for (let i = 0; i < index; i++) {
      minutes += sortedSteps[i].durationMin;
    }
    return dayjs()
      .hour(10)
      .minute(0)
      .add(minutes, 'minute')
      .format('HH:mm');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortedSteps.findIndex((s) => s.id === active.id);
      const newIndex = sortedSteps.findIndex((s) => s.id === over.id);
      const newSteps = arrayMove(sortedSteps, oldIndex, newIndex);
      reorderCeremonySteps(newSteps);
    }
  };

  const handleSave = (
    stepData: Omit<CeremonyStep, 'id' | 'order'> | CeremonyStep
  ) => {
    if ('id' in stepData) {
      updateCeremonyStep(stepData.id, stepData);
    } else {
      addCeremonyStep(stepData);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              仪式流程安排
            </h2>
            <p className="text-gray-500">
              拖拽调整流程顺序，编辑每个环节的详细信息
            </p>
          </div>

          <div className="bg-gradient-to-r from-rose-50 to-champagne-50 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Clock className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">预计总时长</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.floor(totalDuration / 60) > 0 &&
                      `${Math.floor(totalDuration / 60)} 小时 `}
                    {totalDuration % 60} 分钟
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">预计开始</div>
                <div className="text-xl font-semibold text-gray-800">10:00</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">预计结束</div>
                <div className="text-xl font-semibold text-gray-800">
                  {dayjs()
                    .hour(10)
                    .minute(0)
                    .add(totalDuration, 'minute')
                    .format('HH:mm')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">
              仪式流程 ({sortedSteps.length} 个环节)
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" />
              添加环节
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedSteps.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {sortedSteps.map((step, index) => (
                  <SortableItem
                    key={step.id}
                    step={step}
                    onEdit={setEditingStep}
                    onDelete={deleteCeremonyStep}
                    startTime={getStepStartTime(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {sortedSteps.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-rose-400" />
              </div>
              <h4 className="text-gray-600 font-medium mb-2">暂无仪式流程</h4>
              <p className="text-gray-400 text-sm mb-4">
                点击上方按钮添加第一个仪式环节
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                添加环节
              </button>
            </div>
          )}

          {sortedSteps.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-rose-500 to-champagne-500 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <PartyPopper className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">婚礼礼成</div>
                  <div className="text-white/80 text-sm">
                    预计 {dayjs()
                      .hour(10)
                      .minute(0)
                      .add(totalDuration, 'minute')
                      .format('HH:mm')} 仪式圆满结束
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-72 bg-white border-l border-gray-100 p-5 overflow-auto">
        <h3 className="font-semibold text-gray-800 mb-4">流程时间轴</h3>

        <div className="relative">
          {sortedSteps.map((step, index) => (
            <div key={step.id} className="flex mb-4 last:mb-0">
              <div className="flex flex-col items-center mr-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-champagne-400 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                  {index + 1}
                </div>
                {index < sortedSteps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-rose-200 to-champagne-200 mt-1" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="text-xs font-medium text-gray-800 truncate">
                  {step.title}
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getStepStartTime(index)} -{' '}
                  {dayjs()
                    .hour(10)
                    .minute(0)
                    .add(
                      sortedSteps
                        .slice(0, index + 1)
                        .reduce((sum, s) => sum + s.durationMin, 0),
                      'minute'
                    )
                    .format('HH:mm')}
                </div>
              </div>
            </div>
          ))}

          {sortedSteps.length > 0 && (
            <div className="flex">
              <div className="flex flex-col items-center mr-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-champagne-500 flex items-center justify-center text-white shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="text-xs font-medium text-rose-600">礼成</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {dayjs()
                    .hour(10)
                    .minute(0)
                    .add(totalDuration, 'minute')
                    .format('HH:mm')}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">快速提示</h4>
          <ul className="space-y-2 text-xs text-gray-500">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
              拖拽左侧手柄可以调整环节顺序
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
              悬停显示编辑和删除按钮
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
              时间会自动根据时长计算
            </li>
          </ul>
        </div>
      </div>

      {(editingStep || showAddModal) && (
        <EditModal
          step={editingStep}
          onClose={() => {
            setEditingStep(null);
            setShowAddModal(false);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

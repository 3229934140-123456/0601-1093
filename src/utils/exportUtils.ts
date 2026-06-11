import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import type { WeddingPlan, Furniture, Decoration, Guest, CeremonyStep } from '@/store/types';
import { FURNITURE_TEMPLATES, DECORATION_TEMPLATES, SCENE_NAMES, TIME_MODE_NAMES } from '@/constants/templates';

export const encodePlanData = (plan: WeddingPlan): string => {
  try {
    const dataToEncode = {
      id: plan.id,
      name: plan.name,
      sceneType: plan.sceneType,
      timeMode: plan.timeMode,
      stageConfig: plan.stageConfig,
      furniture: plan.furniture,
      guests: plan.guests.map(({ id, name, seatId, isVip }) => ({ id, name, seatId, isVip })),
      decorations: plan.decorations,
      ceremonySteps: plan.ceremonySteps,
      todos: plan.todos,
      entrancePath: plan.entrancePath,
      musicName: plan.musicName,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
    
    const jsonStr = JSON.stringify(dataToEncode);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error('Failed to encode plan data:', error);
    return '';
  }
};

export const decodePlanData = (encoded: string): Partial<WeddingPlan> | null => {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const paddedBase64 = base64 + '='.repeat(padLen);
    const jsonStr = decodeURIComponent(escape(atob(paddedBase64)));
    return JSON.parse(jsonStr) as Partial<WeddingPlan>;
  } catch (error) {
    console.error('Failed to decode plan data:', error);
    return null;
  }
};

export const generateShareLink = (plan: WeddingPlan): string => {
  const baseUrl = window.location.origin;
  const encodedData = encodePlanData(plan);
  return `${baseUrl}/invite/${plan.id}?data=${encodeURIComponent(encodedData)}`;
};

interface CompletenessCheck {
  category: string;
  item: string;
  completed: boolean;
  status: string;
}

export const getCompletenessChecks = (plan: WeddingPlan): CompletenessCheck[] => {
  return [
    { category: '新人形象', item: '新娘照片', completed: !!plan.brideImage, status: plan.brideImage ? '已完成' : '待上传' },
    { category: '新人形象', item: '新郎照片', completed: !!plan.groomImage, status: plan.groomImage ? '已完成' : '待上传' },
    { category: '场地布置', item: '场地选择', completed: !!plan.sceneType, status: plan.sceneType ? '已完成' : '待选择' },
    { category: '场地布置', item: '时间模式', completed: !!plan.timeMode, status: plan.timeMode ? '已完成' : '待选择' },
    { category: '场地布置', item: '入场路线', completed: plan.entrancePath.length > 0, status: plan.entrancePath.length > 0 ? `已设置 (${plan.entrancePath.length}个点)` : '待设置' },
    { category: '舞台配置', item: '舞台尺寸', completed: plan.stageConfig.width > 0 && plan.stageConfig.height > 0, status: '已配置' },
    { category: '舞台配置', item: '司仪台', completed: !!plan.stageConfig.podiumStyle, status: `样式: ${plan.stageConfig.podiumStyle || '默认'}` },
    { category: '家具布置', item: '家具布置', completed: plan.furniture.length > 0, status: plan.furniture.length > 0 ? `${plan.furniture.length}件` : '待布置' },
    { category: '家具布置', item: '宾客座位', completed: plan.guests.some(g => g.seatId), status: `${plan.guests.filter(g => g.seatId).length}/${plan.guests.length}人已安排` },
    { category: '装饰布置', item: '装饰布置', completed: plan.decorations.length > 0, status: plan.decorations.length > 0 ? `${plan.decorations.length}件` : '待布置' },
    { category: '音乐音效', item: '背景音乐', completed: !!plan.backgroundMusic || !!plan.musicName, status: plan.musicName || (plan.backgroundMusic ? '已上传' : '待设置') },
    { category: '仪式流程', item: '仪式流程', completed: plan.ceremonySteps.length > 0, status: plan.ceremonySteps.length > 0 ? `${plan.ceremonySteps.length}个环节` : '待编辑' },
    { category: '宾客管理', item: '宾客名单', completed: plan.guests.length > 0, status: plan.guests.length > 0 ? `${plan.guests.length}人` : '待添加' },
  ];
};

export const exportToCSV = (plan: WeddingPlan, budget: number): void => {
  const rows: string[][] = [];
  
  rows.push(['婚礼布置清单', plan.name]);
  rows.push(['生成日期', new Date().toLocaleDateString('zh-CN')]);
  rows.push(['场地类型', SCENE_NAMES[plan.sceneType]]);
  rows.push(['时间模式', TIME_MODE_NAMES[plan.timeMode]]);
  rows.push(['预算总额', `¥${budget.toLocaleString()}`]);
  rows.push(['新娘照片', plan.brideImage ? '已上传' : '未上传']);
  rows.push(['新郎照片', plan.groomImage ? '已上传' : '未上传']);
  rows.push(['背景音乐', plan.musicName || (plan.backgroundMusic ? '已上传' : '未设置')]);
  rows.push(['入场路线', plan.entrancePath.length > 0 ? `已设置 (${plan.entrancePath.length}个点)` : '未设置']);
  rows.push(['司仪台', `位置(${plan.stageConfig.podiumX}, ${plan.stageConfig.podiumY}) 样式: ${plan.stageConfig.podiumStyle}`]);
  rows.push([]);
  
  rows.push(['=== 家具清单 ===']);
  rows.push(['类型', '名称', '数量', '单价', '小计']);
  
  const furnitureSummary = summarizeFurniture(plan.furniture);
  furnitureSummary.forEach((item) => {
    rows.push([item.type, item.name, item.count.toString(), `¥${item.price}`, `¥${item.total}`]);
  });
  const furnitureTotal = furnitureSummary.reduce((sum, i) => sum + i.total, 0);
  rows.push(['', '', '', '家具小计', `¥${furnitureTotal.toLocaleString()}`]);
  rows.push([]);
  
  rows.push(['=== 装饰清单 ===']);
  rows.push(['类型', '名称', '数量', '单价', '小计']);
  
  const decorationSummary = summarizeDecorations(plan.decorations);
  decorationSummary.forEach((item) => {
    rows.push([item.type, item.name, item.count.toString(), `¥${item.price}`, `¥${item.total}`]);
  });
  const decorationTotal = decorationSummary.reduce((sum, i) => sum + i.total, 0);
  rows.push(['', '', '', '装饰小计', `¥${decorationTotal.toLocaleString()}`]);
  rows.push([]);
  
  rows.push(['=== 宾客名单 ===']);
  rows.push(['序号', '姓名', 'VIP', '座位号']);
  plan.guests.forEach((guest, index) => {
    const tableNum = plan.furniture.find((f) => f.id === guest.seatId)?.label || '未分配';
    rows.push([(index + 1).toString(), guest.name, guest.isVip ? '是' : '否', tableNum]);
  });
  rows.push([]);
  
  rows.push(['=== 仪式流程 ===']);
  rows.push(['序号', '环节', '主持人', '时长(分钟)', '说明']);
  plan.ceremonySteps
    .sort((a, b) => a.order - b.order)
    .forEach((step, index) => {
      rows.push([(index + 1).toString(), step.title, step.host, step.durationMin.toString(), step.description]);
    });
  
  const csvContent = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${plan.name}_布置清单.csv`);
};

export const exportToExcel = (plan: WeddingPlan, budget: number): void => {
  const wb = XLSX.utils.book_new();
  
  const summaryData = [
    ['婚礼布置清单', plan.name],
    ['生成日期', new Date().toLocaleDateString('zh-CN')],
    ['场地类型', SCENE_NAMES[plan.sceneType]],
    ['时间模式', TIME_MODE_NAMES[plan.timeMode]],
    ['预算总额', budget],
    ['宾客总数', plan.guests.length],
    ['VIP宾客', plan.guests.filter((g) => g.isVip).length],
    ['新娘照片', plan.brideImage ? '已上传' : '未上传'],
    ['新郎照片', plan.groomImage ? '已上传' : '未上传'],
    ['背景音乐', plan.musicName || (plan.backgroundMusic ? '已上传' : '未设置')],
    ['入场路线', plan.entrancePath.length > 0 ? `已设置 (${plan.entrancePath.length}个点)` : '未设置'],
    ['司仪台位置', `X: ${plan.stageConfig.podiumX}, Y: ${plan.stageConfig.podiumY}`],
    ['司仪台样式', plan.stageConfig.podiumStyle],
    ['舞台尺寸', `宽: ${plan.stageConfig.width}, 高: ${plan.stageConfig.height}`],
    ['T型舞台', plan.stageConfig.hasTStage ? `是 (长度: ${plan.stageConfig.tStageLength})` : '否'],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, '概要');
  
  const completenessData = [
    ['分类', '检查项', '状态', '完成情况'],
    ...getCompletenessChecks(plan).map((c) => [
      c.category,
      c.item,
      c.status,
      c.completed ? '已完成' : '待完成',
    ]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(completenessData);
  XLSX.utils.book_append_sheet(wb, ws2, '完整度检查');
  
  const todoData = [
    ['分类', '事项', '完成状态'],
    ...plan.todos.map((t) => [
      t.category,
      t.title,
      t.completed ? '已完成' : '待完成',
    ]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(todoData);
  XLSX.utils.book_append_sheet(wb, ws3, '待办事项');
  
  const furnitureData = [
    ['类型', '名称', '数量', '单价', '小计'],
    ...summarizeFurniture(plan.furniture).map((i) => [i.type, i.name, i.count, i.price, i.total]),
    ['', '', '', '家具小计', furnitureSummaryTotal(plan.furniture)],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(furnitureData);
  XLSX.utils.book_append_sheet(wb, ws4, '家具清单');
  
  const decorationData = [
    ['类型', '名称', '数量', '单价', '小计'],
    ...summarizeDecorations(plan.decorations).map((i) => [i.type, i.name, i.count, i.price, i.total]),
    ['', '', '', '装饰小计', decorationSummaryTotal(plan.decorations)],
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(decorationData);
  XLSX.utils.book_append_sheet(wb, ws5, '装饰清单');
  
  const guestData = [
    ['序号', '姓名', 'VIP', '座位号'],
    ...plan.guests.map((g, i) => [
      i + 1,
      g.name,
      g.isVip ? '是' : '否',
      plan.furniture.find((f) => f.id === g.seatId)?.label || '未分配',
    ]),
  ];
  const ws6 = XLSX.utils.aoa_to_sheet(guestData);
  XLSX.utils.book_append_sheet(wb, ws6, '宾客名单');
  
  const ceremonyData = [
    ['序号', '环节', '主持人', '时长(分钟)', '说明'],
    ...plan.ceremonySteps
      .sort((a, b) => a.order - b.order)
      .map((s, i) => [i + 1, s.title, s.host, s.durationMin, s.description]),
  ];
  const ws7 = XLSX.utils.aoa_to_sheet(ceremonyData);
  XLSX.utils.book_append_sheet(wb, ws7, '仪式流程');
  
  XLSX.writeFile(wb, `${plan.name}_布置清单.xlsx`);
};

export const exportToPDF = (plan: WeddingPlan, budget: number): void => {
  const doc = new jsPDF();
  let y = 20;
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('婚礼布置清单', 105, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(14);
  doc.text(plan.name, 105, y, { align: 'center' });
  y += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const addInfoLine = (label: string, value: string, isCompleted?: boolean) => {
    doc.text(label, 20, y);
    if (isCompleted !== undefined) {
      if (isCompleted) {
        doc.setTextColor(34, 197, 94);
      } else {
        doc.setTextColor(239, 68, 68);
      }
    }
    doc.text(value, 170, y, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    y += 7;
  };
  
  addInfoLine(`生成日期: ${new Date().toLocaleDateString('zh-CN')}`, '');
  y += 3;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('基本信息', 20, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  addInfoLine('场地类型:', `${SCENE_NAMES[plan.sceneType]} / ${TIME_MODE_NAMES[plan.timeMode]}`, true);
  addInfoLine('预算总额:', `¥${budget.toLocaleString()}`, true);
  addInfoLine('宾客总数:', `${plan.guests.length}人 (VIP: ${plan.guests.filter(g => g.isVip).length}人)`, plan.guests.length > 0);
  addInfoLine('新娘照片:', plan.brideImage ? '已上传' : '未上传', !!plan.brideImage);
  addInfoLine('新郎照片:', plan.groomImage ? '已上传' : '未上传', !!plan.groomImage);
  addInfoLine('背景音乐:', plan.musicName || (plan.backgroundMusic ? '已上传' : '未设置'), !!(plan.backgroundMusic || plan.musicName));
  addInfoLine('入场路线:', plan.entrancePath.length > 0 ? `已设置 (${plan.entrancePath.length}个点)` : '未设置', plan.entrancePath.length > 0);
  addInfoLine('司仪台:', `位置(${plan.stageConfig.podiumX}, ${plan.stageConfig.podiumY}) 样式: ${plan.stageConfig.podiumStyle}`, true);
  addInfoLine('舞台尺寸:', `宽${plan.stageConfig.width} x 高${plan.stageConfig.height}`, true);
  addInfoLine('T型舞台:', plan.stageConfig.hasTStage ? `是 (长度: ${plan.stageConfig.tStageLength})` : '否', true);
  y += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('准备完整度检查', 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const completenessChecks = getCompletenessChecks(plan);
  const completedCount = completenessChecks.filter(c => c.completed).length;
  const progress = Math.round((completedCount / completenessChecks.length) * 100);
  
  doc.setTextColor(0, 0, 0);
  doc.text(`整体进度: ${progress}% (${completedCount}/${completenessChecks.length}项)`, 20, y);
  y += 8;
  
  let currentCategory = '';
  completenessChecks.forEach((check) => {
    if (check.category !== currentCategory) {
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 140, 100);
      doc.text(`【${check.category}】`, 25, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      currentCategory = check.category;
    }
    
    if (check.completed) {
      doc.setTextColor(34, 197, 94);
      doc.text('✓', 25, y);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text('✗', 25, y);
    }
    doc.setTextColor(0, 0, 0);
    doc.text(check.item, 32, y);
    
    if (check.completed) {
      doc.setTextColor(34, 197, 94);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    doc.text(check.status, 170, y, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    y += 6;
    
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });
  
  const incompleteTodos = plan.todos.filter(t => !t.completed);
  if (incompleteTodos.length > 0) {
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text(`待办缺口 (${incompleteTodos.length}项)`, 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    incompleteTodos.slice(0, 10).forEach((todo) => {
      doc.setTextColor(239, 68, 68);
      doc.text('□', 25, y);
      doc.setTextColor(0, 0, 0);
      doc.text(todo.title, 32, y);
      doc.setTextColor(156, 163, 175);
      doc.text(todo.category, 170, y, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      y += 6;
      
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    
    if (incompleteTodos.length > 10) {
      doc.setTextColor(156, 163, 175);
      doc.text(`...还有 ${incompleteTodos.length - 10} 项待办`, 32, y);
      y += 6;
    }
    y += 8;
  }
  
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('家具清单', 20, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const furnitureSummary = summarizeFurniture(plan.furniture);
  furnitureSummary.forEach((item) => {
    doc.text(`${item.name} x ${item.count}`, 25, y);
    doc.text(`¥${item.total.toLocaleString()}`, 170, y, { align: 'right' });
    y += 6;
  });
  const furnitureTotal = furnitureSummary.reduce((sum, i) => sum + i.total, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`家具小计: ¥${furnitureTotal.toLocaleString()}`, 170, y, { align: 'right' });
  y += 12;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('装饰清单', 20, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const decorationSummary = summarizeDecorations(plan.decorations);
  decorationSummary.forEach((item) => {
    doc.text(`${item.name} x ${item.count}`, 25, y);
    doc.text(`¥${item.total.toLocaleString()}`, 170, y, { align: 'right' });
    y += 6;
  });
  const decorationTotal = decorationSummary.reduce((sum, i) => sum + i.total, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`装饰小计: ¥${decorationTotal.toLocaleString()}`, 170, y, { align: 'right' });
  y += 15;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`总计: ¥${(furnitureTotal + decorationTotal).toLocaleString()}`, 170, y, { align: 'right' });
  
  doc.save(`${plan.name}_布置清单.pdf`);
};

function summarizeFurniture(furniture: Furniture[]) {
  const map = new Map<string, { type: string; name: string; count: number; price: number; total: number }>();
  
  furniture.forEach((f) => {
    const key = `${f.type}-${f.subtype}`;
    const template = FURNITURE_TEMPLATES.find((t) => t.type === f.type && t.subtype === f.subtype);
    const name = template?.name || f.subtype;
    
    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.count += 1;
      existing.total += f.price;
    } else {
      map.set(key, {
        type: f.type,
        name,
        count: 1,
        price: f.price,
        total: f.price,
      });
    }
  });
  
  return Array.from(map.values());
}

function summarizeDecorations(decorations: Decoration[]) {
  const map = new Map<string, { type: string; name: string; count: number; price: number; total: number }>();
  
  decorations.forEach((d) => {
    const key = `${d.type}-${d.style}`;
    const template = DECORATION_TEMPLATES.find((t) => t.type === d.type && t.style === d.style);
    const name = template?.name || d.style;
    
    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.count += 1;
      existing.total += d.price;
    } else {
      map.set(key, {
        type: d.type,
        name,
        count: 1,
        price: d.price,
        total: d.price,
      });
    }
  });
  
  return Array.from(map.values());
}

function furnitureSummaryTotal(furniture: Furniture[]): number {
  return summarizeFurniture(furniture).reduce((sum, i) => sum + i.total, 0);
}

function decorationSummaryTotal(decorations: Decoration[]): number {
  return summarizeDecorations(decorations).reduce((sum, i) => sum + i.total, 0);
}

function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

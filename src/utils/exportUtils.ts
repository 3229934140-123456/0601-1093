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
      guests: plan.guests.map(({ id, name, seatId, isVip, tableNumber }) => ({ id, name, seatId, isVip, tableNumber })),
      decorations: plan.decorations,
      ceremonySteps: plan.ceremonySteps,
      todos: plan.todos,
      entrancePath: plan.entrancePath,
      musicName: plan.musicName,
      backgroundMusic: plan.backgroundMusic,
      brideImage: plan.brideImage,
      groomImage: plan.groomImage,
      budget: plan.budget,
      musicVolume: plan.musicVolume,
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

export const generateGuestShareLink = (plan: WeddingPlan, guest: Guest): string => {
  const baseUrl = window.location.origin;
  const encodedData = encodePlanData(plan);
  return `${baseUrl}/invite/${plan.id}?data=${encodeURIComponent(encodedData)}&guest=${encodeURIComponent(guest.name)}`;
};

export const generateLightweightShareLink = (plan: WeddingPlan, guest?: Guest): string => {
  try {
    const baseUrl = window.location.origin;
    const lightweightData = {
      id: plan.id,
      name: plan.name,
      sceneType: plan.sceneType,
      timeMode: plan.timeMode,
      stageConfig: plan.stageConfig,
      furniture: plan.furniture.map(({ id, type, subtype, x, y, rotation, scale, color, guestId, label }) => ({
        id, type, subtype, x, y, rotation, scale, color, guestId, label
      })),
      guests: plan.guests.map(({ id, name, seatId, isVip, tableNumber }) => ({ id, name, seatId, isVip, tableNumber })),
      decorations: plan.decorations.map(({ id, type, style, x, y, color, price }) => ({
        id, type, style, x, y, color, price
      })),
      ceremonySteps: plan.ceremonySteps,
      entrancePath: plan.entrancePath,
      musicName: plan.musicName,
      brideImage: plan.brideImage,
      groomImage: plan.groomImage,
      budget: plan.budget,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
    
    const jsonStr = JSON.stringify(lightweightData);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const encodedData = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    if (guest) {
      return `${baseUrl}/invite/${plan.id}?data=${encodeURIComponent(encodedData)}&guest=${encodeURIComponent(guest.name)}`;
    }
    return `${baseUrl}/invite/${plan.id}?data=${encodeURIComponent(encodedData)}`;
  } catch (error) {
    console.error('Failed to generate lightweight share link:', error);
    return generateShareLink(plan);
  }
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

export const exportToPDF = async (plan: WeddingPlan, budget: number): Promise<void> => {
  const completenessChecks = getCompletenessChecks(plan);
  const completedCount = completenessChecks.filter(c => c.completed).length;
  const progress = Math.round((completedCount / completenessChecks.length) * 100);
  const incompleteTodos = plan.todos.filter(t => !t.completed);
  const furnitureSummary = summarizeFurniture(plan.furniture);
  const decorationSummary = summarizeDecorations(plan.decorations);
  const furnitureTotal = furnitureSummary.reduce((sum, i) => sum + i.total, 0);
  const decorationTotal = decorationSummary.reduce((sum, i) => sum + i.total, 0);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '新人形象': '#ec4899',
      '场地布置': '#3b82f6',
      '舞台配置': '#8b5cf6',
      '家具布置': '#10b981',
      '装饰布置': '#f43f5e',
      '音乐音效': '#f59e0b',
      '仪式流程': '#06b6d4',
      '宾客管理': '#6366f1',
    };
    return colors[category] || '#6b7280';
  };

  const todoCategoryNames: Record<string, string> = {
    venue: '场地',
    seating: '座位',
    stage: '舞台',
    decoration: '装饰',
    ceremony: '流程',
    other: '其他',
  };

  const checksByCategory = completenessChecks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, typeof completenessChecks>);

  const printHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${plan.name} - 婚礼布置清单</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; 
    padding: 40px; 
    color: #1f2937; 
    background: white; 
  }
  .header { 
    text-align: center; 
    padding-bottom: 24px; 
    border-bottom: 3px solid #d4a574; 
    margin-bottom: 28px; 
  }
  .header h1 { 
    font-size: 28px; 
    color: #92400e; 
    margin-bottom: 8px; 
  }
  .header h2 { 
    font-size: 18px; 
    color: #6b7280; 
    font-weight: normal; 
  }
  .header .meta { 
    margin-top: 12px; 
    color: #9ca3af; 
    font-size: 13px; 
  }
  .section { 
    margin-bottom: 28px; 
  }
  .section-title { 
    font-size: 18px; 
    font-weight: 600; 
    color: #92400e; 
    padding-bottom: 8px; 
    border-bottom: 2px solid #fde68a; 
    margin-bottom: 16px; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
  }
  .section-title::before { 
    content: ''; 
    width: 4px; 
    height: 18px; 
    background: #d97706; 
    border-radius: 2px; 
  }
  .info-grid { 
    display: grid; 
    grid-template-columns: repeat(3, 1fr); 
    gap: 12px; 
  }
  .info-card { 
    background: #fffbeb; 
    border: 1px solid #fde68a; 
    border-radius: 8px; 
    padding: 14px; 
  }
  .info-card .label { 
    font-size: 12px; 
    color: #92400e; 
    margin-bottom: 4px; 
  }
  .info-card .value { 
    font-size: 15px; 
    font-weight: 600; 
    color: #78350f; 
  }
  .info-card .value.incomplete { 
    color: #dc2626; 
  }
  .progress-section { 
    background: linear-gradient(135deg, #fef3c7, #fce7f3); 
    border-radius: 12px; 
    padding: 20px; 
    margin-bottom: 20px; 
  }
  .progress-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 12px; 
  }
  .progress-header .label { 
    font-size: 16px; 
    font-weight: 600; 
    color: #92400e; 
  }
  .progress-header .percent { 
    font-size: 24px; 
    font-weight: bold; 
    color: #d97706; 
  }
  .progress-bar { 
    height: 12px; 
    background: #fef3c7; 
    border-radius: 6px; 
    overflow: hidden; 
  }
  .progress-bar-fill { 
    height: 100%; 
    background: linear-gradient(90deg, #f59e0b, #ec4899); 
    border-radius: 6px; 
    transition: width 0.5s; 
  }
  .checks-grid { 
    display: grid; 
    grid-template-columns: repeat(2, 1fr); 
    gap: 16px; 
  }
  .check-category { 
    background: #fafafa; 
    border-radius: 8px; 
    padding: 14px; 
  }
  .check-category-title { 
    font-size: 14px; 
    font-weight: 600; 
    margin-bottom: 10px; 
    display: flex; 
    align-items: center; 
    gap: 6px; 
  }
  .check-category-title .dot { 
    width: 8px; 
    height: 8px; 
    border-radius: 50%; 
  }
  .check-item { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    padding: 6px 0; 
    font-size: 13px; 
    border-bottom: 1px solid #f3f4f6; 
  }
  .check-item:last-child { 
    border-bottom: none; 
  }
  .check-item .name { 
    display: flex; 
    align-items: center; 
    gap: 6px; 
  }
  .check-item .status { 
    font-size: 12px; 
    padding: 2px 8px; 
    border-radius: 10px; 
  }
  .status.completed { 
    background: #dcfce7; 
    color: #166534; 
  }
  .status.incomplete { 
    background: #fee2e2; 
    color: #991b1b; 
  }
  .icon-check { 
    color: #22c55e; 
    font-weight: bold; 
  }
  .icon-cross { 
    color: #ef4444; 
    font-weight: bold; 
  }
  .todos-section { 
    background: #fef2f2; 
    border-radius: 8px; 
    padding: 16px; 
  }
  .todos-section h4 { 
    color: #991b1b; 
    margin-bottom: 12px; 
    font-size: 15px; 
  }
  .todo-item { 
    display: flex; 
    align-items: flex-start; 
    gap: 8px; 
    padding: 8px 0; 
    border-bottom: 1px dashed #fecaca; 
    font-size: 13px; 
  }
  .todo-item:last-child { 
    border-bottom: none; 
  }
  .todo-item .todo-box { 
    width: 16px; 
    height: 16px; 
    border: 2px solid #ef4444; 
    border-radius: 3px; 
    flex-shrink: 0; 
    margin-top: 1px; 
  }
  .todo-item .todo-cat { 
    margin-left: auto; 
    font-size: 11px; 
    color: #9ca3af; 
    background: white; 
    padding: 2px 6px; 
    border-radius: 4px; 
  }
  .items-table { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 13px; 
  }
  .items-table th { 
    background: #fef3c7; 
    color: #92400e; 
    padding: 10px 12px; 
    text-align: left; 
    font-weight: 600; 
    border-bottom: 2px solid #d97706; 
  }
  .items-table td { 
    padding: 9px 12px; 
    border-bottom: 1px solid #f3f4f6; 
  }
  .items-table tr:last-child td { 
    border-bottom: none; 
  }
  .items-table .total-row td { 
    background: #fef3c7; 
    font-weight: 600; 
    color: #92400e; 
    padding-top: 12px; 
  }
  .budget-summary { 
    background: linear-gradient(135deg, #ec4899, #d97706); 
    color: white; 
    border-radius: 12px; 
    padding: 24px; 
    text-align: center; 
  }
  .budget-summary .label { 
    font-size: 14px; 
    opacity: 0.9; 
    margin-bottom: 6px; 
  }
  .budget-summary .amount { 
    font-size: 32px; 
    font-weight: bold; 
  }
  .budget-breakdown { 
    display: grid; 
    grid-template-columns: repeat(3, 1fr); 
    gap: 12px; 
    margin-top: 20px; 
  }
  .budget-item { 
    text-align: center; 
    padding: 14px; 
    background: rgba(255,255,255,0.15); 
    border-radius: 8px; 
  }
  .budget-item .b-label { 
    font-size: 12px; 
    opacity: 0.85; 
  }
  .budget-item .b-value { 
    font-size: 18px; 
    font-weight: 600; 
    margin-top: 4px; 
  }
  .guest-list { 
    display: grid; 
    grid-template-columns: repeat(4, 1fr); 
    gap: 8px; 
  }
  .guest-chip { 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    padding: 6px 10px; 
    background: #f5f3ff; 
    border-radius: 16px; 
    font-size: 12px; 
  }
  .guest-chip.vip { 
    background: #fef3c7; 
  }
  .guest-chip .seat { 
    color: #6b7280; 
    font-size: 11px; 
  }
  .ceremony-list { 
    display: flex; 
    flex-direction: column; 
    gap: 10px; 
  }
  .ceremony-step { 
    display: flex; 
    gap: 14px; 
    padding: 12px; 
    background: #f0fdfa; 
    border-radius: 8px; 
    border-left: 4px solid #14b8a6; 
  }
  .ceremony-step .step-num { 
    width: 28px; 
    height: 28px; 
    background: #14b8a6; 
    color: white; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-weight: 600; 
    font-size: 13px; 
    flex-shrink: 0; 
  }
  .ceremony-step .step-content { 
    flex: 1; 
  }
  .ceremony-step .step-title { 
    font-weight: 600; 
    font-size: 14px; 
    color: #115e59; 
    margin-bottom: 3px; 
  }
  .ceremony-step .step-desc { 
    font-size: 12px; 
    color: #6b7280; 
  }
  .ceremony-step .step-meta { 
    text-align: right; 
    font-size: 12px; 
    color: #0d9488; 
    flex-shrink: 0; 
  }
  @media print {
    body { padding: 20px; }
    .page-break { page-break-before: always; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>💍 婚礼布置清单</h1>
    <h2>${plan.name}</h2>
    <div class="meta">生成日期：${new Date().toLocaleDateString('zh-CN')} · 打印时间：${new Date().toLocaleString('zh-CN')}</div>
  </div>

  <div class="section">
    <div class="section-title">方案概览</div>
    <div class="info-grid">
      <div class="info-card">
        <div class="label">场地类型</div>
        <div class="value">${SCENE_NAMES[plan.sceneType]} · ${TIME_MODE_NAMES[plan.timeMode]}</div>
      </div>
      <div class="info-card">
        <div class="label">宾客总数</div>
        <div class="value">${plan.guests.length} 人 ${plan.guests.filter(g => g.isVip).length > 0 ? `(VIP ${plan.guests.filter(g => g.isVip).length}人)` : ''}</div>
      </div>
      <div class="info-card">
        <div class="label">仪式环节</div>
        <div class="value">${plan.ceremonySteps.length} 个步骤</div>
      </div>
      <div class="info-card">
        <div class="label">新娘照片</div>
        <div class="value ${plan.brideImage ? '' : 'incomplete'}">${plan.brideImage ? '✓ 已上传' : '✗ 未上传'}</div>
      </div>
      <div class="info-card">
        <div class="label">新郎照片</div>
        <div class="value ${plan.groomImage ? '' : 'incomplete'}">${plan.groomImage ? '✓ 已上传' : '✗ 未上传'}</div>
      </div>
      <div class="info-card">
        <div class="label">背景音乐</div>
        <div class="value ${plan.backgroundMusic || plan.musicName ? '' : 'incomplete'}">${plan.musicName || (plan.backgroundMusic ? '已上传' : '未设置')}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">准备完整度</div>
    <div class="progress-section">
      <div class="progress-header">
        <span class="label">整体准备进度</span>
        <span class="percent">${progress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${progress}%"></div>
      </div>
      <div style="text-align:center; margin-top: 8px; font-size: 13px; color: #92400e;">
        ${completedCount} / ${completenessChecks.length} 项已完成
      </div>
    </div>
    <div class="checks-grid">
      ${Object.entries(checksByCategory).map(([category, checks]) => `
        <div class="check-category">
          <div class="check-category-title">
            <span class="dot" style="background: ${getCategoryColor(category)}"></span>
            ${category}
            <span style="margin-left: auto; font-size: 12px; color: #6b7280; font-weight: normal;">
              ${checks.filter(c => c.completed).length}/${checks.length}
            </span>
          </div>
          ${checks.map(check => `
            <div class="check-item">
              <span class="name">
                <span class="${check.completed ? 'icon-check' : 'icon-cross'}">${check.completed ? '✓' : '✗'}</span>
                ${check.item}
              </span>
              <span class="status ${check.completed ? 'completed' : 'incomplete'}">${check.status}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  </div>

  ${incompleteTodos.length > 0 ? `
  <div class="section page-break">
    <div class="section-title">待办缺口</div>
    <div class="todos-section">
      <h4>⚠️ 还有 ${incompleteTodos.length} 项待完成，请优先处理：</h4>
      ${incompleteTodos.map(todo => `
        <div class="todo-item">
          <span class="todo-box"></span>
          <span>${todo.title}</span>
          <span class="todo-cat">${todoCategoryNames[todo.category] || todo.category}</span>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="section page-break">
    <div class="section-title">预算与清单</div>
    <div class="budget-summary">
      <div class="label">布置总预算</div>
      <div class="amount">¥ ${(furnitureTotal + decorationTotal).toLocaleString()}</div>
      <div class="budget-breakdown">
        <div class="budget-item">
          <div class="b-label">家具费用</div>
          <div class="b-value">¥ ${furnitureTotal.toLocaleString()}</div>
        </div>
        <div class="budget-item">
          <div class="b-label">装饰费用</div>
          <div class="b-value">¥ ${decorationTotal.toLocaleString()}</div>
        </div>
        <div class="budget-item">
          <div class="b-label">规划预算</div>
          <div class="b-value">¥ ${budget.toLocaleString()}</div>
        </div>
      </div>
    </div>

    ${furnitureSummary.length > 0 ? `
    <div style="margin-top: 24px;">
      <h4 style="font-size: 15px; color: #065f46; margin-bottom: 10px;">🪑 家具清单</h4>
      <table class="items-table">
        <thead>
          <tr><th>类型</th><th>名称</th><th style="text-align: center;">数量</th><th style="text-align: right;">单价</th><th style="text-align: right;">小计</th></tr>
        </thead>
        <tbody>
          ${furnitureSummary.map(item => `
            <tr>
              <td>${item.type}</td>
              <td>${item.name}</td>
              <td style="text-align: center;">${item.count}</td>
              <td style="text-align: right;">¥ ${item.price.toLocaleString()}</td>
              <td style="text-align: right;">¥ ${item.total.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4">家具小计</td>
            <td style="text-align: right;">¥ ${furnitureTotal.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ''}

    ${decorationSummary.length > 0 ? `
    <div style="margin-top: 24px;">
      <h4 style="font-size: 15px; color: #9d174d; margin-bottom: 10px;">🌸 装饰清单</h4>
      <table class="items-table">
        <thead>
          <tr><th>类型</th><th>名称</th><th style="text-align: center;">数量</th><th style="text-align: right;">单价</th><th style="text-align: right;">小计</th></tr>
        </thead>
        <tbody>
          ${decorationSummary.map(item => `
            <tr>
              <td>${item.type}</td>
              <td>${item.name}</td>
              <td style="text-align: center;">${item.count}</td>
              <td style="text-align: right;">¥ ${item.price.toLocaleString()}</td>
              <td style="text-align: right;">¥ ${item.total.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4">装饰小计</td>
            <td style="text-align: right;">¥ ${decorationTotal.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ''}
  </div>

  ${plan.guests.length > 0 ? `
  <div class="section page-break">
    <div class="section-title">宾客名单 (${plan.guests.length}人)</div>
    <div class="guest-list">
      ${plan.guests.map(guest => `
        <div class="guest-chip ${guest.isVip ? 'vip' : ''}">
          ${guest.isVip ? '👑' : '👤'} ${guest.name}
          <span class="seat">${guest.seatId ? '有座' : '待安排'}</span>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${plan.ceremonySteps.length > 0 ? `
  <div class="section">
    <div class="section-title">仪式流程</div>
    <div class="ceremony-list">
      ${[...plan.ceremonySteps].sort((a, b) => a.order - b.order).map((step, i) => `
        <div class="ceremony-step">
          <div class="step-num">${i + 1}</div>
          <div class="step-content">
            <div class="step-title">${step.title}</div>
            <div class="step-desc">${step.description}${step.host ? ` · 主持人: ${step.host}` : ''}</div>
          </div>
          <div class="step-meta">${step.durationMin} 分钟</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
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

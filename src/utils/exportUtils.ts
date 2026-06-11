import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import type { WeddingPlan, Furniture, Decoration, Guest, CeremonyStep } from '@/store/types';
import { FURNITURE_TEMPLATES, DECORATION_TEMPLATES, SCENE_NAMES, TIME_MODE_NAMES } from '@/constants/templates';

export const exportToCSV = (plan: WeddingPlan, budget: number): void => {
  const rows: string[][] = [];
  
  rows.push(['婚礼布置清单', plan.name]);
  rows.push(['生成日期', new Date().toLocaleDateString('zh-CN')]);
  rows.push(['场地类型', SCENE_NAMES[plan.sceneType]]);
  rows.push(['时间模式', TIME_MODE_NAMES[plan.timeMode]]);
  rows.push(['预算总额', `¥${budget.toLocaleString()}`]);
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
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, '概要');
  
  const furnitureData = [
    ['类型', '名称', '数量', '单价', '小计'],
    ...summarizeFurniture(plan.furniture).map((i) => [i.type, i.name, i.count, i.price, i.total]),
    ['', '', '', '家具小计', furnitureSummaryTotal(plan.furniture)],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(furnitureData);
  XLSX.utils.book_append_sheet(wb, ws2, '家具清单');
  
  const decorationData = [
    ['类型', '名称', '数量', '单价', '小计'],
    ...summarizeDecorations(plan.decorations).map((i) => [i.type, i.name, i.count, i.price, i.total]),
    ['', '', '', '装饰小计', decorationSummaryTotal(plan.decorations)],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(decorationData);
  XLSX.utils.book_append_sheet(wb, ws3, '装饰清单');
  
  const guestData = [
    ['序号', '姓名', 'VIP', '座位号'],
    ...plan.guests.map((g, i) => [
      i + 1,
      g.name,
      g.isVip ? '是' : '否',
      plan.furniture.find((f) => f.id === g.seatId)?.label || '未分配',
    ]),
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(guestData);
  XLSX.utils.book_append_sheet(wb, ws4, '宾客名单');
  
  const ceremonyData = [
    ['序号', '环节', '主持人', '时长(分钟)', '说明'],
    ...plan.ceremonySteps
      .sort((a, b) => a.order - b.order)
      .map((s, i) => [i + 1, s.title, s.host, s.durationMin, s.description]),
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(ceremonyData);
  XLSX.utils.book_append_sheet(wb, ws5, '仪式流程');
  
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
  doc.text(`生成日期: ${new Date().toLocaleDateString('zh-CN')}`, 20, y);
  y += 7;
  doc.text(`场地类型: ${SCENE_NAMES[plan.sceneType]} / ${TIME_MODE_NAMES[plan.timeMode]}`, 20, y);
  y += 7;
  doc.text(`预算总额: ¥${budget.toLocaleString()}`, 20, y);
  y += 7;
  doc.text(`宾客总数: ${plan.guests.length}人 (VIP: ${plan.guests.filter(g => g.isVip).length}人)`, 20, y);
  y += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
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

export const generateShareLink = (planId: string): string => {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?plan=${planId}&preview=true`;
};

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

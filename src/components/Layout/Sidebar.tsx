import { NavLink } from 'react-router-dom';
import {
  MapPin,
  Armchair,
  Mic2,
  Flower2,
  ListChecks,
  Eye,
  Share2,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/venue', label: '场地选择', icon: MapPin },
  { path: '/seating', label: '座位图', icon: Armchair },
  { path: '/stage', label: '舞台', icon: Mic2 },
  { path: '/decoration', label: '装饰', icon: Flower2 },
  { path: '/ceremony', label: '流程', icon: ListChecks },
  { path: '/preview', label: '宾客预览', icon: Eye },
  { path: '/share', label: '分享', icon: Share2 },
];

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        'h-full bg-white/90 backdrop-blur-md border-r border-rose-gold/20 flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-6 border-b border-rose-gold/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-gold to-champagne flex items-center justify-center shadow-gold">
            <Heart className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-lg font-semibold text-champagne-dark whitespace-nowrap">
                婚礼策划
              </h1>
              <p className="text-xs text-gray-500 whitespace-nowrap">元宇宙平台</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-rose-gold/20 to-champagne/20 text-champagne-dark shadow-soft'
                  : 'text-gray-600 hover:bg-rose-light/50 hover:text-champagne'
              )
            }
          >
            <item.icon
              className={cn(
                'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                'group-hover:scale-110'
              )}
            />
            {!collapsed && (
              <span className="font-medium whitespace-nowrap">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-rose-gold/20">
          <div className="bg-gradient-to-br from-rose-gold/10 to-champagne/10 rounded-xl p-4">
            <p className="text-sm text-champagne-dark font-medium mb-1">💡 小提示</p>
            <p className="text-xs text-gray-600">
              按 Ctrl+Z 可以撤销上一步操作，按住空格拖拽可以平移画布
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

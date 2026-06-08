import { NavLink } from 'react-router-dom';
import {
  Users,
  UserSquare2,
  Target,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Play,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  onOpenWizard: () => void;
}

const navItems = [
  { path: '/leads', label: '线索池', icon: Users },
  { path: '/customers', label: '客户档案', icon: UserSquare2 },
  { path: '/opportunities', label: '商机管理', icon: Target },
  { path: '/followups', label: '跟进记录', icon: MessageSquare },
  { path: '/contracts', label: '合同管理', icon: FileText },
  { path: '/reports', label: '报表分析', icon: BarChart3 },
  { path: '/settings', label: '系统设置', icon: Settings },
];

export default function Sidebar({ onOpenWizard }: SidebarProps) {
  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CRM</span>
          </div>
          <span className="font-semibold text-slate-800">客户关系管理</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <button
          onClick={onOpenWizard}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-200"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">销售流程演示</p>
            <p className="text-xs text-primary-100">7步走完完整流程</p>
          </div>
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </button>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-medium text-sm">演示</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">演示用户</p>
            <p className="text-xs text-slate-500">销售经理</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

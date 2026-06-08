import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'rose';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  rose: 'bg-rose-50 text-rose-600',
};

export default function StatCard({ title, value, icon, trend, trendLabel, color = 'blue' }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs',
              trend >= 0 ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend >= 0 ? '+' : ''}{trend}%</span>
              {trendLabel && <span className="text-slate-400"> {trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

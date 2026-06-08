import { ReactNode } from 'react';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.icon || <Plus className="w-4 h-4 mr-1.5" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useCRMStore } from '../../store/crmStore';

export default function Toast() {
  const { toast, hideToast } = useCRMStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-primary-500" />,
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-rose-50 border-rose-200',
    info: 'bg-primary-50 border-primary-200',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <span className="text-sm font-medium text-slate-700">{toast.message}</span>
        <button
          onClick={hideToast}
          className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

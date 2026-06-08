import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'danger',
}: ConfirmDialogProps) {
  const iconColors = {
    danger: 'text-rose-500 bg-rose-100',
    warning: 'text-amber-500 bg-amber-100',
    info: 'text-primary-500 bg-primary-100',
  };

  const btnColors = {
    danger: 'btn-danger',
    warning: 'btn-primary',
    info: 'btn-primary',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={btnColors[type]}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconColors[type]}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-1">{title}</h4>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </Modal>
  );
}

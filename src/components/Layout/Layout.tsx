import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Toast from '../UI/Toast';
import SalesWizard from '../SalesWizard/SalesWizard';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onOpenWizard={() => setIsWizardOpen(true)} />
      <main className="flex-1 min-w-0">
        <div className="p-6">{children}</div>
      </main>
      <Toast />
      <SalesWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}

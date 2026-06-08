import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Toast from '../UI/Toast';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="p-6">{children}</div>
      </main>
      <Toast />
    </div>
  );
}

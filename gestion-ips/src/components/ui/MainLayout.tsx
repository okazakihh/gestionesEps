import React from 'react';
import { VerticalNavbar } from '@/components/ui/VerticalNavbar';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Vertical Navbar */}
      <VerticalNavbar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {(title || subtitle) && (
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              {title && (
                <h1 className="text-2xl font-semibold text-gray-900">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

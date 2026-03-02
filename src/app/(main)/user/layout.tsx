import React from 'react';
import UserSidebar from '@/modules/user/components/UserSidebar';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
             <div className="bg-white rounded-xl shadow-theme-sm p-4 sticky top-24">
                <UserSidebar />
             </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-theme-sm min-h-[500px]">
                {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
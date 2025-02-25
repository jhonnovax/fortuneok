'use client';

export default function RightSidebar({ children }) {
  return (
    <aside className="hidden lg:block fixed right-0 top-16 w-80 h-[calc(100vh-4rem)] bg-base-100 border-l">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b bg-base-100">
          <h2 className="font-semibold">My Assets</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
} 
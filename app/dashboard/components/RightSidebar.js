'use client';

export default function RightSidebar({ children }) {
  return (
    <aside className="hidden lg:block fixed right-0 top-16 w-96 h-[calc(100vh-4rem)] bg-base-100 border-l border-base-content/10">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-base-content/10 bg-base-100">
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
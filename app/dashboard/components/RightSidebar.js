'use client';

export default function RightSidebar({ children }) {
  return (
    <aside className="hidden lg:block fixed right-0 top-16 w-80 h-[calc(100vh-4rem)] border-l bg-base-100">
      <div className="p-4">
        <h2 className="text-xl font-bold">My Assets</h2>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </aside>
  );
} 
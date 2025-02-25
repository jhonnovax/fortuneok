'use client';

export default function MobileSidebar({ isOpen, setIsOpen, children }) {
  return (
    <div className={`lg:hidden ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[60] ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-base-100 transform transition-transform duration-300 ease-in-out z-[70] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-base-100">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">My Assets</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-circle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 
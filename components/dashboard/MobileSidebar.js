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
      <div className={`fixed inset-y-0 right-0 w-96 bg-base-100 transform transition-transform duration-300 ease-in-out z-[70] border-l border-base-content/10 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-base-content/10 bg-base-100">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                </svg>
                My Assets
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-circle btn-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
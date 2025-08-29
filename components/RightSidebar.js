'use client';

export default function RightSidebar({ children, isLoading, title, onAddAsset }) {

  return (
    <aside className="hidden lg:block fixed right-0 top-16 w-[420px] h-[calc(100vh-4rem)] bg-base-100 border-l border-base-content/10">
      <div className="flex flex-col h-full">

        <div className="p-4 border-b border-base-content/10 bg-base-100">
          <h2 className="font-semibold flex items-center gap-2 italic">
            {isLoading && (
              <div className="skeleton h-6 w-full"></div>
            )}

            {!isLoading && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                </svg>
                {title}
                <button className="btn btn-primary ml-auto" onClick={onAddAsset}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Add Asset</span>
                </button>
              </>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pt-0">
            {children}
          </div>
        </div>

      </div>
    </aside>

  );
  
} 
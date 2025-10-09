'use client';

import AssetTopBarNavigation from './AssetTopBarNavigation';

export default function Sidebar({ children, isLoading, assetData, selectedCategory, setSelectedCategory }) {

  return (
    <aside className="hidden lg:block fixed left-0 top-16 w-[420px] xl:w-[520px] h-[calc(100vh-4rem)] bg-base-100 border-l border-base-content/10">
      <div className="flex flex-col h-full">

        <div className="border-b border-base-content/10 bg-base-100">
          {isLoading && (
            <div className="p-4 lg:p-6">
              <div className="skeleton h-6 w-full"></div>
            </div>
          )}

          {!isLoading && (
            <AssetTopBarNavigation 
              assetData={assetData}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

      </div>
    </aside>

  );
  
} 
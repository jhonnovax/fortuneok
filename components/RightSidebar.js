'use client';

import AssetTopBarNavigation from './AssetTopBarNavigation';

export default function RightSidebar({ children, isLoading, assetData, onAddAsset, selectedCategory, setSelectedCategory }) {

  return (
    <aside className="hidden lg:block fixed right-0 top-16 w-[420px] h-[calc(100vh-4rem)] bg-base-100 border-l border-base-content/10">
      <div className="flex flex-col h-full">

        <div className="p-4 border-b border-base-content/10 bg-base-100">
          {isLoading && (
            <div className="skeleton h-6 w-full"></div>
          )}

          {!isLoading && (
            <AssetTopBarNavigation 
              onAddAsset={onAddAsset} 
              assetData={assetData}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pt-0 pb-0">
            {children}
          </div>
        </div>

      </div>
    </aside>

  );
  
} 
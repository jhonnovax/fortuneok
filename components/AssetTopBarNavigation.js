import { getAssetCategoryDescription } from '@/services/assetService';

export default function AssetTopBarNavigation({ onAddAsset, assetData, selectedCategory, setSelectedCategory }) {

  const totalAssets = assetData.length;

  function getTopbarTitle() {
    if (!selectedCategory) {
      return (
        <span className="inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="transparent" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pie-chart w-4 h-4 mr-1">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
          All Categories
        </span>
      );
    }

    if (selectedCategory === 'all') {
      return '📊 All Assets';
    } 

    return `${getAssetCategoryDescription(selectedCategory)}`;
  }

  return (
    <div className="flex justify-between items-center !mt-0">
      <div className="items-start">
        {/* Topbar Title */}
        <h2 className="italic font-semibold flex items-center gap-1 text-xs sm:text-sm md:text-base">
          {getTopbarTitle()} <span className="badge badge-ghost badge-md">{totalAssets}</span>
        </h2>
      </div>

      <div className="ml-auto">
        {/* View All Assets button */}
        {!selectedCategory && (
          <div className="mb-0">
            <button className="btn btn-sm btn-default" onClick={() => setSelectedCategory('all')}>
              📊 All Assets 
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className="w-4 h-4 mr-1">
                <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Back button to go back to the asset groups */}
        {selectedCategory && (
          <button className="btn btn-sm btn-default gap-0.5" onClick={() => setSelectedCategory(null)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className="w-4 h-4">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="transparent" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pie-chart w-4 h-4">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
            Categories
          </button>
        )}
      </div>

      <button 
        className="fixed bottom-6 right-6 btn btn-primary rounded-full flex items-center gap-0 hover:gap-2 group opacity-60 hover:opacity-100 transition-opacity duration-300"
        onClick={onAddAsset}
      >
        {/* Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-4 h-4">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>

        {/* Hidden text, revealed on hover */}
        <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
          Add Asset
        </span>
      </button>

    </div>
  );

}
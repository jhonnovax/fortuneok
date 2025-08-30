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
          Categories
        </span>
      );
    }

    if (selectedCategory === 'all') {
      return '📊 Assets';
    } 

    return `${getAssetCategoryDescription(selectedCategory)} Assets`;
  }

  return (
    <div className="flex justify-between items-center !mt-0">
      <div className="items-start">
        {/* Topbar Title */}
        <h2 className="italic font-semibold flex items-center gap-1 text-xs sm:text-sm md:text-base">
          {getTopbarTitle()} <span className="badge badge-ghost badge-md">{totalAssets}</span>
        </h2>

        <div className="mt-1">
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
      </div>

      <button 
        className="btn btn-primary flex items-center gap-2 ml-auto"
        onClick={onAddAsset}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span>Add Asset</span>
      </button>

    </div>
  );

}
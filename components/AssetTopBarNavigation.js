import { getAssetCategoryDescription } from '@/services/assetService';

export default function AssetTopBarNavigation({ onAddAsset, assetData, selectedCategory, setSelectedCategory }) {

  const totalAssets = assetData.length;

  function getTopbarTitle() {
    if (!selectedCategory) {
      return (
        <span className="inline-flex items-center mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
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
          <div className="badge badge-ghost badge-md">{totalAssets}</div> {getTopbarTitle()}
        </h2>

        <div className="mt-1">
          {/* View All Assets button */}
          {!selectedCategory && (
            <div className="mb-0">
              <button className="btn btn-sm btn-default" onClick={() => setSelectedCategory('all')}>
                📊 All Assets 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className="w-4 h-4">
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
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
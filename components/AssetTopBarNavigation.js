import { getAssetCategoryDescription } from '@/services/assetService';

export default function AssetTopBarNavigation({ onAddAsset, assetData, selectedCategory, setSelectedCategory }) {

  const totalAssets = assetData.length;

  function getTopbarTitle() {
    if (!selectedCategory) {
      return 'Categories';
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
        <h2 className="italic font-semibold">
          <div className="badge badge-primary badge-md">{totalAssets}</div> {getTopbarTitle()}
        </h2>

        <div className="mt-1">
          {/* View All Assets button */}
          {!selectedCategory && (
            <div className="mb-0">
              <button className="btn btn-sm btn-default" onClick={() => setSelectedCategory('all')}>
                📊 All Assets 
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
                </svg>
              </button>
            </div>
          )}

          {/* Back button to go back to the asset groups */}
          {selectedCategory && (
            <button className="btn btn-sm btn-default" onClick={() => setSelectedCategory(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
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
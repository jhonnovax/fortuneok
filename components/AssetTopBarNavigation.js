import { getAssetCategoryDescription } from '@/services/assetService';

export default function AssetTopBarNavigation({ assetData, selectedCategory, setSelectedCategory }) {

  const totalAssets = assetData.length;

  function getTopbarTitle() {
    if (!selectedCategory) {
      return (
        <span className="inline-flex items-center">
          All Categories
        </span>
      );
    }

    if (selectedCategory === 'all') {
      return 'All Assets';
    } 

    return `${getAssetCategoryDescription(selectedCategory)}`;
  }

  return (
    <div className="flex justify-between items-center flex-wrap p-4 lg:p-6 shadow-md !mt-0">
      <div className="items-start">
        {/* Topbar Title */}
        <h2 className="font-semibold flex items-center gap-1">
          {getTopbarTitle()} <span className="badge badge-ghost badge-sm">{totalAssets}</span>
        </h2>
      </div>

      <div className="ml-auto">
        {/* View All Assets button */}
        {!selectedCategory && (
          <div className="mb-0">
            <button className="btn btn-sm btn-default" onClick={() => setSelectedCategory('all')}>
              All Assets 
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
            Categories
          </button>
        )}
      </div>

    </div>
  );

}
export default function AddAssetFloatingButton({ onAddAsset }) {

  return (
    <button 
      className="fixed bottom-3 right-0 md:bottom-3 md:right-3 btn btn-primary lg:btn-lg py-2 md:py-3 px-3 md:px-4 rounded-r-none md:rounded-full flex items-center gap-0 md:gap-2 hover:gap-2 group duration-300 z-99999 box-shadow-lg"
      title="Add Asset"
      onClick={onAddAsset}
    >
      {/* Icon */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-6 h-6">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>

      {/* Hidden text, displayed on desktop */}
      <span className="hidden md:block pr-2">
        Add Asset
      </span>
    </button>
  )
  
}
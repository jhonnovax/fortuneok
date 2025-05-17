export default function LoadingSpinner({ className, loadingText = "Loading..." }) {

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
        <span className="loading loading-spinner loading-md"></span>
        <span className="text-gray-500 ml-1">{loadingText}</span>
    </div>
  );

}
export default function LoadingSpinner({ loadingText = "Loading..." }) {

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
        <span className="loading loading-spinner loading-md"></span>
        <span className="text-gray-500 ml-1">{loadingText}</span>
    </div>
  );

}
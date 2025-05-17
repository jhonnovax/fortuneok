export default function ErrorLoadingData({ error }) {
  
  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <div className="text-error text-center">
        <p>{error}</p>
        <button className="btn btn-sm btn-outline mt-2" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    </div>
  );

}

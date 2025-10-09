export default function AllocationChartSkeleton() {

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-4 lg:p-6 h-[300px] lg:h-[400px] items-center justify-center">

        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-center mx-auto gap-4">
            <div className="skeleton h-48 w-48 md:h-64 md:w-64 shrink-0 rounded-full"></div>
            <div className="flex w-full flex-col gap-4 hidden md:flex">
              <div className="skeleton h-4 w-20"></div>
              <div className="skeleton h-4 w-32"></div>
              <div className="skeleton h-4 w-32"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
  
}
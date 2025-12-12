'use client';

export default function EmptyState({ 
  title = "Start Building Your Portfolio", 
  description = "Add your first asset to begin tracking your wealth and see your portfolio grow.",
  icon,
  onAction,
  actionLabel = "Add Your First Asset",
  variant = "default" // 'default' or 'chart'
}) {
  
  const defaultIcon = (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      className="w-16 h-16 md:w-20 md:h-20 text-primary/60"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0a3 3 0 11-6 0 3 3 0 016 0z" 
      />
    </svg>
  );

  const chartIcon = (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      className="w-16 h-16 md:w-20 md:h-20 text-primary/60"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" 
      />
    </svg>
  );

  const displayIcon = icon || (variant === 'chart' ? chartIcon : defaultIcon);

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4 text-center">
      {/* Animated Icon Container */}
      <div className="mb-6 animate-bounce-slow">
        <div className="relative">
          {displayIcon}
          {/* Decorative circles */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-bold text-base-content mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-base md:text-lg text-base-content/70 mb-6 max-w-md">
        {description}
      </p>

      {/* Action Button */}
      {onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary btn-lg gap-2 group hover:scale-105 transition-transform duration-200"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          {actionLabel}
        </button>
      )}

      {/* Motivational Tips */}
      {variant === 'default' && (
        <div className="mt-8 pt-6 border-t border-base-300 w-full max-w-md">
          <p className="text-sm text-base-content/60 mb-4 font-medium">Quick Tips:</p>
          <div className="flex flex-col gap-2 text-sm text-base-content/50">
            <div className="flex items-start gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4 mt-0.5 text-primary flex-shrink-0"
              >
                <path d="M5 12l5 5 10-10" />
              </svg>
              <span>Track stocks, bonds, crypto, and more</span>
            </div>
            <div className="flex items-start gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4 mt-0.5 text-primary flex-shrink-0"
              >
                <path d="M5 12l5 5 10-10" />
              </svg>
              <span>Monitor your portfolio allocation in real-time</span>
            </div>
            <div className="flex items-start gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4 mt-0.5 text-primary flex-shrink-0"
              >
                <path d="M5 12l5 5 10-10" />
              </svg>
              <span>Get insights into your financial growth</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

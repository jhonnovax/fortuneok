/**
 * Flag component that displays country flags using flag-icons CSS library
 * This provides cross-platform compatibility, especially for Windows
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'EU')
 * @param {string} className - Additional CSS classes
 * @param {string} size - Size of the flag ('sm', 'md', 'lg', 'xl', or custom)
 */
export default function Flag({ countryCode, className = '', size = 'md' }) {
  if (!countryCode) return null;

  // Map size to Tailwind width/height classes for flag-icons
  // flag-icons uses background images, so we need to set width and height
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6',
    xl: 'w-10 h-8',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <span
      className={`fi fi-${countryCode.toLowerCase()} ${sizeClass} ${className}`}
      style={{
        backgroundSize: 'contain',
        backgroundPosition: '50%',
        backgroundRepeat: 'no-repeat',
        display: 'inline-block'
      }}
      role="img"
      aria-label={`${countryCode} flag`}
    />
  );
}

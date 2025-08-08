import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          <svg 
            className="w-6 h-6 text-secondary-400" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-400 rounded-full animate-bounce-light" />
      </div>
      {showText && (
        <span className="font-sans font-bold text-xl text-gray-900">
          HolidayHeroes
        </span>
      )}
    </Link>
  );
}
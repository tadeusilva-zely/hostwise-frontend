import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// SVG logos inline das plataformas

function BookingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#003580" />
      <text x="3" y="17" fontSize="13" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">B.</text>
    </svg>
  );
}

function TripAdvisorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#00AF87" />
      {/* Owl eyes */}
      <circle cx="8.5" cy="13" r="3.2" fill="white" />
      <circle cx="15.5" cy="13" r="3.2" fill="white" />
      <circle cx="8.5" cy="13" r="1.8" fill="#00AF87" />
      <circle cx="15.5" cy="13" r="1.8" fill="#00AF87" />
      <circle cx="8.5" cy="13" r="0.9" fill="black" />
      <circle cx="15.5" cy="13" r="0.9" fill="black" />
      {/* Nose */}
      <ellipse cx="12" cy="15" rx="1.2" ry="0.7" fill="#FF5A00" />
      {/* Ears */}
      <path d="M5 10 L3 7 L7 8 Z" fill="white" />
      <path d="M19 10 L21 7 L17 8 Z" fill="white" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />
      <path d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5c-.2 1.2-1 2.3-2 3v2.5h3.3c1.9-1.8 3-4.4 3-7.3z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6C4.8 19.9 8.2 22 12 22z" fill="#34A853" />
      <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3A9.9 9.9 0 0 0 2 12c0 1.6.4 3.1 1 4.5l3.4-2.5z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 8.2 2 4.8 4.1 3 7.4l3.4 2.6C7.2 7.6 9.4 5.9 12 5.9z" fill="#EA4335" />
    </svg>
  );
}

interface OtaBadgesProps {
  bookingMapped: boolean;
  tripadvisorMapped: boolean;
  googleMapped: boolean;
  onRemapTripadvisor: () => void;
  isRemappingTripadvisor: boolean;
  // Google ainda não implementado — só visual
  googleComingSoon?: boolean;
}

function OtaBadge({
  icon,
  label,
  mapped,
  onClick,
  isLoading,
  disabled,
  comingSoon,
}: {
  icon: React.ReactNode;
  label: string;
  mapped: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}) {
  const isClickable = !mapped && !disabled && !comingSoon && onClick;

  return (
    <div
      className={cn(
        'group relative flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all',
        mapped && 'cursor-default',
        isClickable && 'cursor-pointer hover:opacity-80',
        disabled && 'cursor-not-allowed opacity-50',
        comingSoon && 'cursor-not-allowed opacity-40',
      )}
      style={{
        backgroundColor: mapped
          ? 'rgba(34,197,94,0.12)'
          : 'rgba(245,158,11,0.1)',
        border: mapped
          ? '1px solid rgba(34,197,94,0.3)'
          : '1px solid rgba(245,158,11,0.25)',
        color: mapped ? '#16a34a' : '#d97706',
      }}
      onClick={isClickable ? onClick : undefined}
      title={
        comingSoon
          ? `${label}: em breve`
          : mapped
          ? `${label}: mapeado`
          : `${label}: não mapeado — clique para mapear`
      }
    >
      <span className="flex-shrink-0 w-4 h-4">{icon}</span>

      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <span
          className={cn(
            'w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold',
            mapped ? 'bg-green-500 text-white' : 'bg-amber-400 text-white',
          )}
        >
          {mapped ? '✓' : '?'}
        </span>
      )}

      {/* Tooltip on hover when not mapped */}
      {!mapped && !disabled && !comingSoon && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          {isLoading ? 'Mapeando...' : 'Clique para mapear'}
        </span>
      )}
      {comingSoon && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          Em breve
        </span>
      )}
    </div>
  );
}

export function OtaBadges({
  bookingMapped,
  tripadvisorMapped,
  googleMapped,
  onRemapTripadvisor,
  isRemappingTripadvisor,
  googleComingSoon = true,
}: OtaBadgesProps) {
  return (
    <div className="flex items-center gap-1.5">
      <OtaBadge
        icon={<BookingIcon />}
        label="Booking.com"
        mapped={bookingMapped}
        disabled={true}
      />
      <OtaBadge
        icon={<TripAdvisorIcon />}
        label="TripAdvisor"
        mapped={tripadvisorMapped}
        onClick={onRemapTripadvisor}
        isLoading={isRemappingTripadvisor}
      />
      <OtaBadge
        icon={<GoogleIcon />}
        label="Google"
        mapped={googleMapped}
        comingSoon={googleComingSoon}
      />
    </div>
  );
}

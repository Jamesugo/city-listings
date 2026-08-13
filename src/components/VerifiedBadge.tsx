import type { VerificationTier } from '@/lib/types';

interface Props {
  tier: VerificationTier;
  size?: 'sm' | 'md';
}

const TIER_CONFIG = {
  none: null,
  phone: {
    label: '✓ Phone Verified',
    className: 'verified-badge verified-badge--phone',
    icon: '📱',
    title: 'Phone number has been verified',
  },
  cac: {
    label: '✓ CAC Registered',
    className: 'verified-badge verified-badge--cac',
    icon: '🏛️',
    title: 'Business is registered with the Corporate Affairs Commission (CAC)',
  },
};

export default function VerifiedBadge({ tier }: Props) {
  const config = TIER_CONFIG[tier];
  if (!config) return null;

  return (
    <span
      className={config.className}
      title={config.title}
      aria-label={config.label}
    >
      {config.icon} {config.label}
    </span>
  );
}

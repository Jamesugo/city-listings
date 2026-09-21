'use client';

import { incrementCallClicks } from '../actions';

export default function CallClientLink({ 
  businessId, 
  href, 
  children,
  className,
  id,
  'aria-label': ariaLabel
}: { 
  businessId: string;
  href: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  'aria-label'?: string;
}) {
  const handleClick = () => {
    incrementCallClicks(businessId).catch(console.error);
    // Don't prevent default — let the tel: link work natively
  };

  return (
    <a
      href={href}
      className={className}
      id={id}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

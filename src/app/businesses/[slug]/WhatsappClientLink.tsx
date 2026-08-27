'use client';

import { incrementWhatsappClicks } from '../actions';

export default function WhatsappClientLink({ 
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
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    incrementWhatsappClicks(businessId).catch(console.error);
    window.open(href, '_blank', 'noopener,noreferrer');
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

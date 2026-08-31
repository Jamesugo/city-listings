import React from 'react';

type IconProps = React.HTMLAttributes<HTMLElement> & {
  size?: number | string;
  strokeWidth?: number | string; // Ignored for font icons, kept for compat
  fill?: string;
  stroke?: string;
};

const createFontIcon = (iconClass: string) => {
  return function FontIcon({ size = 24, strokeWidth: _sw, fill, stroke, className = '', style, ...rest }: IconProps) {
    return (
      <i
        className={`${iconClass} ${className}`}
        style={{
          fontSize: size,
          color: stroke || fill || 'inherit',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
        {...rest}
      />
    );
  };
};

export const Plus = createFontIcon('fa-solid fa-plus');
export const Edit = createFontIcon('fa-solid fa-pen');
export const ImagePlus = createFontIcon('fa-solid fa-images');
export const Trash2 = createFontIcon('fa-solid fa-trash-can');
export const X = createFontIcon('fa-solid fa-xmark');
export const Loader2 = createFontIcon('fa-solid fa-spinner fa-spin');
export const Star = createFontIcon('fa-solid fa-star');
export const CheckCircle = createFontIcon('fa-solid fa-circle-check');
export const Phone = createFontIcon('fa-solid fa-phone');
export const Landmark = createFontIcon('fa-solid fa-building-columns');
export const Eye = createFontIcon('fa-solid fa-eye');
export const Edit2 = createFontIcon('fa-solid fa-pen-to-square');
export const Lightbulb = createFontIcon('fa-solid fa-lightbulb');
export const Save = createFontIcon('fa-solid fa-floppy-disk');
export const Building2 = createFontIcon('fa-solid fa-building');
export const FolderOpen = createFontIcon('fa-regular fa-folder-open');
export const Globe2 = createFontIcon('fa-solid fa-globe');
export const LayoutDashboard = createFontIcon('fa-solid fa-table-columns');
export const KeyRound = createFontIcon('fa-solid fa-key');
export const MapPin = createFontIcon('fa-solid fa-location-dot');
export const Lock = createFontIcon('fa-solid fa-lock');
export const Sparkles = createFontIcon('fa-solid fa-wand-magic-sparkles');
export const ClipboardList = createFontIcon('fa-solid fa-clipboard-list');
export const LogOut = createFontIcon('fa-solid fa-right-from-bracket');
export const User = createFontIcon('fa-solid fa-user');

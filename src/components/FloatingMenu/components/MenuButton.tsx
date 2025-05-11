import { ReactNode } from 'react';

interface MenuButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  darkMode?: boolean;
  showTooltip?: boolean;
}

export const MenuButton = ({
  icon,
  label,
  onClick,
  isActive = false,
  darkMode = false,
  showTooltip = true
}: MenuButtonProps) => {
  return (
    <button
      className={`p-2 rounded-lg transition-colors group relative
        ${darkMode 
          ? isActive ? 'bg-violet-600 text-black' : 'hover:bg-white/10 text-white' 
          : isActive ? 'bg-violet-600 text-white' : 'hover:bg-black/10 text-black'}`}
      onClick={onClick}
      aria-label={label}
    >
      <span className={`${isActive ? 'text-white' : ''}`}>
        {icon}
      </span>
      {showTooltip && (
        <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded
          hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
          ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
        >
          {label}
        </span>
      )}
    </button>
  );
};
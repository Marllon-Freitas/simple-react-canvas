interface MenuDividerProps {
  darkMode?: boolean;
}

export const MenuDivider = ({ darkMode = false }: MenuDividerProps) => {
  return (
    <div className={`h-6 w-px ${darkMode ? 'bg-white/20' : 'bg-black/20'}`} />
  );
};
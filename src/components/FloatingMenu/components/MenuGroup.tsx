import { MenuItem } from '../../../types';
import { MenuButton } from './MenuButton';
import { MenuDivider } from './MenuDivider';

interface MenuGroupProps {
  items: MenuItem[];
  activeTool?: string | null;
  nodeTypeToAdd?: string | null;
  darkMode?: boolean;
  showDivider?: boolean;
}

export const MenuGroup = ({
  items,
  activeTool,
  nodeTypeToAdd,
  darkMode = false,
  showDivider = true
}: MenuGroupProps) => {
  return (
    <div className="flex items-center">
      <div className="flex gap-1">
        {items.map((item) => {
          const isActive = activeTool === item.label.toLowerCase() || 
                         nodeTypeToAdd === item.label.toLowerCase();
          return (
            <MenuButton
              key={item.label}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
              isActive={isActive}
              darkMode={darkMode}
            />
          );
        })}
      </div>
      {showDivider && <MenuDivider darkMode={darkMode} />}
    </div>
  );
};
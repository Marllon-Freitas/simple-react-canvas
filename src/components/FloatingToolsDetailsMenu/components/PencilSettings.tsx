import React, { useEffect, useState } from 'react';

interface PencilSettingsProps {
  lineColor: string;
  setLineColor: (color: string) => void;
  isDarkMode: boolean;
}

export const PencilSettings: React.FC<PencilSettingsProps> = ({
  lineColor,
  setLineColor,
  isDarkMode
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const lightModeColors = [
    '#000000',
    '#FF4D4D',
    '#4DFF4D',
    '#4D4DFF',
    '#FFB84D',
    '#A64DA6',
    '#FFFF66',
    '#FF66FF'
  ];
  
  const darkModeColors = [
    '#FFFFFF',
    '#FF6666',
    '#66FF66',
    '#6666FF',
    '#FFB366',
    '#CC99CC',
    '#FFFF99',
    '#FF99FF' 
  ];

  const colors = isDarkMode ? darkModeColors : lightModeColors;

  useEffect(() => {
    setLineColor(colors[selectedColorIndex]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkMode]);
  
  const handleColorSelect = (color: string, index: number) => {
    setLineColor(color);
    setSelectedColorIndex(index);
  };

  return (
    <div className="w-full">
      <div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-white">Selected Color</label>
          <div className="w-full h-16 rounded-md flex items-center justify-center" style={{ backgroundColor: lineColor }}>
            <span className={`font-mono ${isDarkMode && lineColor === '#FFFFFF' ? 'text-black' : lineColor === '#000000' ? 'text-white' : ''}`}>
              {lineColor}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {colors.map((color, index) => (
            <button
              key={color}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                index === selectedColorIndex ? 'border-blue-500 scale-110' : 'border-transparent'
              }`}
              style={{ 
                backgroundColor: color,
                boxShadow: index === selectedColorIndex ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none'
              }}
              onClick={() => handleColorSelect(color, index)}
              aria-label={`Select ${color} color`}
            />
          ))}
        </div>    
      </div>
    </div>
  );
};
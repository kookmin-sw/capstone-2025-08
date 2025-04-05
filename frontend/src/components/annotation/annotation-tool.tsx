import React, { useEffect, useRef, useState } from 'react';
import {
  CircleDot,
  Waypoints,
  Paintbrush,
  Eraser,
  Palette,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HexColorPicker } from 'react-colorful';

interface AnnotationToolProps {
  modelType: string;
  isActive: boolean;
  penColor: string;
  penSize: number;
  onSelectPen: () => void;
  onToggleEraser: () => void;
  onChangePenColor: (color: string) => void;
  onChangePenSize: (size: number) => void;
}

const AnnotationTool: React.FC<AnnotationToolProps> = ({
  modelType,
  isActive,
  penColor,
  penSize,
  onSelectPen,
  onToggleEraser,
  onChangePenColor,
  onChangePenSize,
}) => {
  const [activeTool, setActiveTool] = useState<string | null>('paintbrush');
  const [penSizeMenuOpen, setPenSizeMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);

  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const sizeButtonRef = useRef<HTMLButtonElement>(null);
  const paletteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        sizeMenuRef.current &&
        !sizeMenuRef.current.contains(target) &&
        !sizeButtonRef.current?.contains(target)
      ) {
        setPenSizeMenuOpen(false);
      }
      if (
        colorMenuRef.current &&
        !colorMenuRef.current.contains(target) &&
        !paletteButtonRef.current?.contains(target)
      ) {
        setColorMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isActive) return null;

  const handleSelectTool = (tool: string) => {
    setActiveTool(tool);
    if (tool === 'eraser') {
      onToggleEraser();
    } else {
      onSelectPen();
    }
  };

  const renderToolButtons = () => {
    switch (modelType) {
      case 'CELL':
        return (
          <Button
            variant={'ghost'}
            size={'icon'}
            onClick={() => handleSelectTool('circle')}
            className={activeTool === 'circle' ? 'bg-primary text-white' : ''}
          >
            <CircleDot />
          </Button>
        );
      case 'TISSUE':
      case 'MULTI':
        return (
          <>
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => handleSelectTool('circle')}
              className={activeTool === 'circle' ? 'bg-primary text-white' : ''}
            >
              <CircleDot />
            </Button>
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => handleSelectTool('waypoints')}
              className={
                activeTool === 'waypoints' ? 'bg-primary text-white' : ''
              }
            >
              <Waypoints />
            </Button>
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => handleSelectTool('paintbrush')}
              className={
                activeTool === 'paintbrush' ? 'bg-primary text-white' : ''
              }
            >
              <Paintbrush />
            </Button>
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => handleSelectTool('eraser')}
              className={activeTool === 'eraser' ? 'bg-primary text-white' : ''}
            >
              <Eraser />
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex w-14 flex-col items-center justify-center gap-2 rounded-lg bg-white p-2 shadow">
      {renderToolButtons()}

      {/* 색상 선택 */}
      <div className="relative">
        <Button
          ref={paletteButtonRef}
          variant="ghost"
          size="icon"
          onClick={() => setColorMenuOpen((prev) => !prev)}
        >
          <Palette />
        </Button>
        <span
          className="absolute bottom-1 right-1 h-2 w-2 rounded-full"
          style={{ backgroundColor: penColor }}
        />
        {colorMenuOpen && (
          <div
            ref={colorMenuRef}
            className="absolute bottom-0 left-full z-50 ml-4 rounded-lg bg-white p-4 shadow"
          >
            <HexColorPicker
              color={penColor}
              onChange={(newColor) => onChangePenColor(newColor)}
            />
          </div>
        )}
      </div>

      {/* 펜 크기 선택 */}
      <Button
        ref={sizeButtonRef}
        variant="ghost"
        size="icon"
        onClick={() => setPenSizeMenuOpen((prev) => !prev)}
      >
        <SlidersHorizontal />
      </Button>

      {/* 펜 크기 Preset Dot */}
      {penSizeMenuOpen && (
        <div
          ref={sizeMenuRef}
          className="absolute bottom-0 left-full z-50 ml-2 flex flex-col items-center gap-3 rounded-lg bg-white p-4 shadow"
        >
          {[0.1, 0.3, 0.5, 0.7, 1.0].map((size) => {
            const isSelected = penSize === size;
            return (
              <button
                key={size}
                onClick={() => {
                  onChangePenSize(size); // ✅ 상위에서 관리
                  setPenSizeMenuOpen(false);
                }}
                className={`rounded-full transition-all duration-150 ${
                  isSelected ? 'ring ring-black ring-offset-2' : ''
                }`}
                style={{
                  width: size + 8,
                  height: size + 8,
                  backgroundColor: penColor,
                  boxSizing: 'content-box',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnotationTool;

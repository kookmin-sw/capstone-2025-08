import React, { useState } from 'react';
import {
  Move,
  PenTool,
  SquareDashedMousePointer,
  MessageSquare,
  Undo2,
  Redo2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  onToggleAnnotationMode: () => boolean;
  onSetMove: () => void;
  onSelectROI: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

const Index: React.FC<ControlPanelProps> = ({
  onToggleAnnotationMode,
  onSetMove,
  onSelectROI,
  onUndo,
  onRedo,
  onReset,
}) => {
  // 기본 활성 도구는 "move"로 설정
  const [activeTool, setActiveTool] = useState<
    'move' | 'annotation' | 'roiSelect' | 'message' | null
  >('move');

  // Annotation 버튼 클릭 시 onToggleDrawingMode 호출 후
  // 성공(true)이면 drawingMode, 실패(false)이면 자동으로 move 버튼 활성화
  const handleAnnotationModeClick = () => {
    const success = onToggleAnnotationMode();
    if (success) {
      setActiveTool('annotation');
    } else {
      setActiveTool('move');
    }
  };

  // 단순한 버튼 클릭 시 처리 함수
  const handleToolClick = (tool: typeof activeTool, callback?: () => void) => {
    setActiveTool(tool);
    if (callback) callback();
  };

  return (
    <div className="flex h-fit flex-col items-center justify-center gap-2 rounded-lg bg-white p-2 shadow">
      <Button
        variant={'ghost'}
        size={'icon'}
        onClick={() => handleToolClick('move', onSetMove)}
        className={activeTool === 'move' ? 'bg-primary text-white' : ''}
      >
        <Move />
      </Button>

      <Button
        variant={'ghost'}
        size={'icon'}
        onClick={handleAnnotationModeClick}
        className={activeTool === 'annotation' ? 'bg-primary text-white' : ''}
      >
        <PenTool />
      </Button>

      <Button
        variant={'ghost'}
        size={'icon'}
        onClick={() => handleToolClick('roiSelect', onSelectROI)}
        className={activeTool === 'roiSelect' ? 'bg-primary text-white' : ''}
      >
        <SquareDashedMousePointer />
      </Button>

      <Button
        variant={'ghost'}
        size={'icon'}
        onClick={() => handleToolClick('message')}
        className={activeTool === 'message' ? 'bg-primary text-white' : ''}
      >
        <MessageSquare />
      </Button>

      {/* 단발성 액션은 toggle state 없이 바로 실행 */}
      <Button variant={'ghost'} size={'icon'} onClick={onUndo}>
        <Undo2 />
      </Button>

      <Button variant={'ghost'} size={'icon'} onClick={onRedo}>
        <Redo2 />
      </Button>

      <Button variant={'ghost'} size={'icon'} onClick={onReset}>
        <Trash2 />
      </Button>
    </div>
  );
};

export default Index;

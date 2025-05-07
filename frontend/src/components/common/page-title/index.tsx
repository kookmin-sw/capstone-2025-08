import { Button } from '@/components/ui/button';
import { type ReactNode } from 'react';

export default function PageTitle({
  title,
  icon,
  buttonName,
  buttonVariant = 'default',
  buttonSize = '32',
  onButtonClick,
  showDivider = true,
}: {
  title: string;
  icon?: ReactNode;
  buttonName?: string;
  buttonSize?: string;
  buttonVariant?: 'default' | 'outline';
  onButtonClick?: () => void;
  showDivider?: boolean;
}) {
  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        {buttonName && (
          <Button
            variant={buttonVariant}
            className={`flex items-center gap-2 w-${buttonSize}`}
            onClick={onButtonClick}
          >
            {icon}
            {buttonName}
          </Button>
        )}
      </div>
      {showDivider && <div className="my-8 border-b" />}
    </>
  );
}

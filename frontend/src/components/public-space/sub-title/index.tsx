import type { ReactNode } from 'react';

interface SubTitleProps {
  title: string;
  icon?: ReactNode;
}

export default function SubTitle({ title, icon }: SubTitleProps): ReactNode {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
}

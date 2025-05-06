import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import Image from 'next/image';

interface ProjectItemProps {
  project: {
    id: string;
    title: string;
    author: string;
    tags: string[];
    thumbnail: string;
    downloadCount: string;
  };
}

export default function ProjectItem({ project }: ProjectItemProps) {
  return (
    <div className="flex cursor-pointer flex-col gap-3 rounded-md border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-[205px] w-full overflow-hidden rounded-md">
        <Image
          fill
          src={project.thumbnail}
          alt={project.title}
          className="object-cover"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="text-muted-foreground flex gap-1 text-xs">
          <Download size={12} />
          {project.downloadCount}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold">{project.title}</div>
        <div className="text-muted-foreground text-sm">{project.author}</div>
      </div>
    </div>
  );
}

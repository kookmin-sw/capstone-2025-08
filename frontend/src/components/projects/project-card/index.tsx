'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  EllipsisVertical,
  PenTool,
  Copy,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react';
import { Project, SubProject } from '@/types/project-schema';
import { formatDateTime } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  subProjects: SubProject[];
}

export default function ProjectCard({
  project,
  subProjects,
}: ProjectCardProps) {
  const router = useRouter();
  const thumbnails = subProjects
    .filter((sp) => sp.projectId === String(project.id))
    .slice(0, 4);

  const created = formatDateTime(project.createdAt);
  const updated = formatDateTime(project.updatedAt);

  return (
    <div
      onClick={() => router.push(`/main/projects/${project.id}`)}
      className="flex cursor-pointer flex-row items-center gap-3 rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="grid shrink-0 grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((i) => {
          const thumb = thumbnails[i];
          return thumb ? (
            <Image
              key={i}
              src={thumb.thumbnail}
              alt="Thumbnail"
              width={50}
              height={50}
              className="h-10 w-11 rounded object-cover"
            />
          ) : (
            <div key={i} className="bg-muted h-10 w-11 rounded" />
          );
        })}
      </div>

      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{project.modelType}</Badge>
            <Badge
              variant="secondary"
              className="inline-block max-w-[12ch] overflow-hidden truncate whitespace-nowrap"
            >
              {project.modelName}
            </Badge>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary cursor-pointer hover:bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisVertical className="h-3 w-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-36 p-2"
              side="right"
              align="start"
              sideOffset={20}
            >
              <div className="flex flex-col">
                {[
                  {
                    icon: <PenTool className="h-4 w-4" />,
                    label: 'Annotation',
                    onClick: () =>
                      router.push(`/main/projects/annotation/${project.id}`),
                  },
                  {
                    icon: <Copy className="h-4 w-4" />,
                    label: 'Duplicate',
                  },
                  {
                    icon: <Pencil className="h-4 w-4" />,
                    label: 'Rename',
                  },
                  {
                    icon: <Share2 className="h-4 w-4" />,
                    label: 'Share',
                  },
                ].map(({ icon, label, onClick }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    className="flex items-center justify-start gap-2 px-2 py-1.5 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick?.();
                    }}
                  >
                    {icon}
                    {label}
                  </Button>
                ))}
                <div className="my-1 border-b" />
                <Button
                  variant="ghost"
                  className="text-destructive flex items-center justify-start gap-2 px-2 py-1.5 text-sm hover:text-red-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4 -translate-y-[1px]" />
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <h3 className="text-md font-bold">{project.title}</h3>
        <p className="text-muted-foreground text-xs">
          Created At : {created.full}
        </p>
        <p className="text-muted-foreground text-xs">
          Updated At : {updated.full}
        </p>
      </div>
    </div>
  );
}

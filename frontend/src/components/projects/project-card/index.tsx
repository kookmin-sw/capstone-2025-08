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
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react';
import { Project, SubProject } from '@/types/project-schema';
import { formatDateTime } from '@/lib/utils';
import { useRef, useState } from 'react';
import ProjectEditModal from '@/components/projects/project-edit-modal';
import ProjectDeleteModal from '@/components/projects/poject-delete-modal';

interface ProjectCardProps {
  project: Project;
  subProjects: SubProject[];
}

export default function ProjectCard({
  project,
  subProjects,
}: ProjectCardProps) {
  // TODO: 프로젝트 수정, 삭제 (모달) Api 연동

  const router = useRouter();
  const thumbnails = subProjects
    .filter((sp) => sp.projectId === String(project.id))
    .slice(0, 4);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const created = formatDateTime(project.createdAt);
  const updated = formatDateTime(project.updatedAt);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const suppressClickRef = useRef(false);

  const handleSuppressClick = () => {
    suppressClickRef.current = true;
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 300);
  };

  return (
    <div
      onClick={(e) => {
        if (suppressClickRef.current) return;
        if (editOpen || deleteOpen) {
          e.stopPropagation();
          return;
        }
        router.push(`/main/projects/${project.id}`);
      }}
      className="flex cursor-pointer flex-row items-center gap-3 rounded-lg border bg-white py-4 pl-3 pr-1 shadow-sm transition-shadow hover:shadow-md"
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
              className="size-11 rounded object-cover"
            />
          ) : (
            <div key={i} className="bg-muted size-11 rounded" />
          );
        })}
      </div>

      <div className="-mt-1 flex w-full flex-col">
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

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary cursor-pointer hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPopoverOpen(true);
                }}
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
                    icon: <Pencil className="h-4 w-4" />,
                    label: 'Edit',
                    onClick: () => setEditOpen(true),
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
                  className="text-destructive flex translate-y-[1.5px] items-center justify-start gap-2 px-2 py-1.5 text-sm hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 -translate-y-[1.5px]" />
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

      <ProjectEditModal
        open={editOpen}
        onClose={() => {
          handleSuppressClick();
          setEditOpen(false);
          setIsPopoverOpen(false);
        }}
        onClickEdit={() => {
          handleSuppressClick();
          setEditOpen(false);
          setIsPopoverOpen(false);
        }}
        initialTitle={project.title}
        initialDescription={project.description}
      />

      <ProjectDeleteModal
        open={deleteOpen}
        onClose={() => {
          handleSuppressClick();
          setDeleteOpen(false);
          setIsPopoverOpen(false);
        }}
        projectTitle={project.title}
        onClickDelete={() => {
          handleSuppressClick();
          setDeleteOpen(false);
          setIsPopoverOpen(false);
        }}
      />
    </div>
  );
}

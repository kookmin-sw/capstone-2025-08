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
import { useMemo, useRef, useState } from 'react';
import ProjectEditModal from '@/components/projects/project-edit-modal';
import ProjectDeleteModal from '@/components/projects/poject-delete-modal';
import { ProjectAPIApi, GetProjectsResponseDetailDto } from '@/generated-api';
import { toast } from 'sonner';

interface ProjectCardProps {
  project: GetProjectsResponseDetailDto;
  refetchProjects: () => void;
}

export default function ProjectCard({
  project,
  refetchProjects,
}: ProjectCardProps) {
  const projectApi = useMemo(() => new ProjectAPIApi(), []);
  const router = useRouter();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const suppressClickRef = useRef(false);

  const blockNavigationRef = () => {
    suppressClickRef.current = true;
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 300);
  };

  const closeModals = () => {
    blockNavigationRef();
    setEditOpen(false);
    setDeleteOpen(false);
    setIsPopoverOpen(false);
  };

  const handleUpdateProject = async (title: string, description: string) => {
    try {
      await projectApi.updateProject({
        projectId: project.projectId || -1,
        updateProjectRequestDto: { title, description },
      });

      toast.success('The project has been updated successfully.');
      refetchProjects();
    } catch (error) {
      toast.error('Failed to update the project. Please try again.');
    } finally {
      blockNavigationRef();
      setEditOpen(false);
      setIsPopoverOpen(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectApi.deleteProject({ projectId: project.projectId || -1 });
      toast.success('The project has been deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete the project. Please try again.');
    } finally {
      blockNavigationRef();
      setDeleteOpen(false);
      setIsPopoverOpen(false);
      refetchProjects();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (suppressClickRef.current) return;
        if (editOpen || deleteOpen) {
          e.stopPropagation();
          return;
        }
        router.push(`/main/projects/${project.projectId}`);
      }}
      className="flex cursor-pointer flex-row items-center gap-3 rounded-lg border bg-white py-4 pl-3 pr-1 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="grid shrink-0 grid-cols-2 gap-1">
        {(project.thumbnailUrl && project.thumbnailUrl.length > 0
          ? project.thumbnailUrl
          : []
        ).map((url, index) => (
          <Image
            key={index}
            src={url}
            alt="Thumbnail"
            width={50}
            height={50}
            className="size-11 rounded object-cover"
            unoptimized
          />
        ))}

        {Array.from({
          length: Math.max(0, 4 - (project.thumbnailUrl?.length || 0)),
        }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="bg-muted size-11 rounded"
          />
        ))}
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
                      router.push(
                        `/main/projects/annotation/${project.projectId}`,
                      ),
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
          Created : {project.createdAt}
        </p>
        <p className="text-muted-foreground text-xs">
          Edited : {project.updatedAt}
        </p>
      </div>

      <ProjectEditModal
        open={editOpen}
        onClose={closeModals}
        onClickEdit={async ({ title, description }) => {
          await handleUpdateProject(title, description);
        }}
        initialTitle={project.title || ''}
        initialDescription={project.description || ''}
      />

      <ProjectDeleteModal
        open={deleteOpen}
        onClose={closeModals}
        projectTitle={project.title || ''}
        onClickDelete={handleDeleteProject}
      />
    </div>
  );
}

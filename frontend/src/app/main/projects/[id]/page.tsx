'use client';

import { useParams, useRouter } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ChevronLeft,
  PenTool,
  Share2,
  Trash2,
  Image as ImageIcon,
  Bot,
  Pencil,
  CalendarClock,
  Clock3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProjectInfoCard from '@/components/projects/project-info-card';
import SubProjectTable from '@/components/projects/subproject-table';
import { StatusBadge, StatusType } from '@/components/common/status-badge';
import ImageUploadModal from '@/components/projects/image-upload-modal';
import ProjectEditModal from '@/components/projects/project-edit-modal';
import ProjectDeleteModal from '@/components/projects/poject-delete-modal';
import ModelTrainingMetricsChart from '@/components/projects/model-training-metrics-chart';
import { ProjectAPIApi, GetProjectDetailResponseDto } from '@/generated-api';
import { toast } from 'sonner';

export default function ProjectDetails() {
  // TODO: 서브프로젝트 추가, 프로젝트 수정 에러 해결
  const projectApi = useMemo(() => new ProjectAPIApi(), []);
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<GetProjectDetailResponseDto | null>(
    null,
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      const detail = await projectApi.getProjectDetail({
        projectId: Number(id),
      });
      setProject(detail);
    } catch (error) {
      toast.error('Failed to load project details.');
    }
  }, [id, projectApi]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleEdit = async (updated: {
    title: string;
    description: string;
  }) => {
    try {
      await projectApi.updateProject({
        projectId: Number(id),
        updateProjectRequestDto: updated,
      });
      toast.success('Project updated successfully.');
      await fetchProject();
    } catch (error) {
      toast.error('Failed to update the project.');
    } finally {
      setEditOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      await projectApi.deleteProject({ projectId: Number(id) });
      toast.success('Project deleted successfully.');
      router.push('/main/projects');
    } catch (error) {
      toast.error('Failed to delete the project.');
    } finally {
      setDeleteOpen(false);
    }
  };

  if (!project) return null;

  return (
    <div className="flex flex-col px-20 py-16">
      <Header
        title={project.title || ''}
        description={project.description || ''}
        onBack={router.back}
        onAnnotate={() =>
          router.push(`/main/projects/annotation/${project?.projectId}`)
        }
        onDelete={() => setDeleteOpen(true)}
      />
      <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-0">
        <div className="col-span-2 flex flex-col">
          <StatsCards
            project={project}
            onUploadClick={() => setUploadOpen(true)}
          />
          <div className="my-8 w-full border-b" />
          <ProjectTabs project={project} />
        </div>

        <div className="col-span-1">
          <ProjectSidebar project={project} onEdit={() => setEditOpen(true)} />
        </div>
      </div>

      <ImageUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        mode="append"
      />

      <ProjectEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onClickEdit={handleEdit}
        initialTitle={project.title || ''}
        initialDescription={project.description || ''}
      />

      <ProjectDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        projectTitle={project.title || ''}
        onClickDelete={handleDelete}
      />
    </div>
  );
}

function Header({
  title,
  description,
  onBack,
  onAnnotate,
  onDelete,
}: {
  title: string;
  description: string;
  onBack: () => void;
  onAnnotate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-3 items-start justify-between gap-6">
      <div className="col-span-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack}>
            <ChevronLeft className="cursor-pointer" />
          </button>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <p className="text-muted-foreground text-lg font-medium">
          {description}
        </p>
      </div>

      <div className="col-span-1 flex w-full justify-end">
        <div className="flex w-full flex-row gap-2">
          <Button onClick={onAnnotate} className="flex-1">
            <PenTool className="h-4 w-4" />
            Annotation
          </Button>
          <Button className="flex-1">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onDelete}>
            <div className="flex translate-y-[1.5px] flex-row items-center">
              <Trash2 className="mr-1.5 h-4 w-4 -translate-y-[1.5px]" />
              Delete
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatsCards({
  project,
  onUploadClick,
}: {
  project: GetProjectDetailResponseDto;
  onUploadClick: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <ProjectInfoCard
        icon={<ImageIcon className="h-5 w-5" />}
        iconBgColor="bg-sky-100"
        iconColor="text-sky-600"
        label="Slides"
        value={
          project.slideSummary?.totalSlides &&
          project.slideSummary.totalSlides > 0 ? (
            project.slideSummary.totalSlides
          ) : (
            <span className="text-muted-foreground">No slides</span>
          )
        }
        progress={project.slideSummary?.uploadProgress ?? 0}
        subText={
          project.slideSummary?.lastUploadedDateTime ? (
            `Last uploaded: ${project.slideSummary.lastUploadedDateTime}`
          ) : (
            <span className="text-muted-foreground">No uploads yet</span>
          )
        }
        rightElement={
          <Button variant="outline" onClick={onUploadClick}>
            Upload
          </Button>
        }
      />

      <ProjectInfoCard
        icon={<Bot className="h-5 w-5" />}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        label="Recent Model Training & Inference"
        value={
          project.modelProcess?.progress &&
          project.modelProcess.progress > 0 ? (
            `${project.modelProcess.progress}%`
          ) : (
            <span className="text-muted-foreground">No progress</span>
          )
        }
        progress={project.modelProcess?.progress ?? 0}
        subText={
          project.modelProcess?.currentEpoch &&
          project.modelProcess?.totalEpoch ? (
            `Epoch ${project.modelProcess.currentEpoch}/${
              project.modelProcess.totalEpoch
            } • Est. completion: ${
              project.modelProcess.estimatedCompletionDateTime ?? 'Unknown'
            }`
          ) : (
            <span className="text-muted-foreground">Not started</span>
          )
        }
        rightElement={
          <StatusBadge
            status={(project.modelProcess?.status as StatusType) ?? 'pending'}
          />
        }
      />
    </div>
  );
}

function ProjectTabs({ project }: { project: GetProjectDetailResponseDto }) {
  return (
    <Tabs defaultValue="sub-project" className="col-span-2">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sub-project" className="w-full font-semibold">
          Slides
        </TabsTrigger>
        <TabsTrigger value="analytics" className="w-full font-semibold">
          Analytics
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sub-project">
        <SubProjectTable subProjects={project.slides || []} />
      </TabsContent>
      <TabsContent value="analytics">
        <ModelTrainingMetricsChart
          data={project.analytics || {}}
          f1Score={project.analytics?.f1Score ?? 0}
        />
      </TabsContent>
    </Tabs>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const matches = hex.replace('#', '').match(/.{1,2}/g);
  if (!matches || matches.length < 3) {
    throw new Error('Invalid hex color');
  }
  const [r, g, b] = matches.map((x) => parseInt(x, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ProjectSidebar({
  project,
  onEdit,
}: {
  project: GetProjectDetailResponseDto;
  onEdit: () => void;
}) {
  const [hasScroll, setHasScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const checkScroll = () => {
      setHasScroll(el.scrollHeight > el.clientHeight);
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className="col-span-1 flex flex-col gap-6">
      <div className="rounded-md border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Label</h3>
          <span className="text-muted-foreground text-sm">
            total: {project.labels?.length ?? 0}
          </span>
        </div>

        <div className="my-4 border-b" />

        <div
          ref={scrollRef}
          className={`scroll-hide-track flex max-h-52 flex-col gap-2 overflow-y-auto ${
            hasScroll ? 'pr-1' : ''
          }`}
        >
          {project.labels && project.labels.length > 0 ? (
            project.labels.map(
              (label) =>
                label.name &&
                label.color && (
                  <div
                    key={label.id ?? label.name}
                    className="flex w-full items-center justify-between rounded-md px-4 py-2"
                    style={{ backgroundColor: hexToRgba(label.color, 0.2) }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm font-medium">{label.name}</span>
                    </div>
                  </div>
                ),
            )
          ) : (
            <p className="text-muted-foreground text-sm">No labels available</p>
          )}
        </div>
      </div>
      <div className="rounded-md border p-6">
        <h3 className="text-lg font-bold">Project Details</h3>
        <div className="my-4 border-b" />
        <div className="flex flex-col gap-3 text-sm">
          <DetailItem
            label="Model Type"
            value={<Badge variant="secondary">{project.modelType}</Badge>}
          />
          <DetailItem
            label="Model Name"
            value={<Badge variant="secondary">{project.modelName}</Badge>}
          />
          <DetailItem
            label="Created"
            value={
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                {project.createdAt}
              </span>
            }
          />
          <DetailItem
            label="Edited"
            value={
              <span className="flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                {project.updatedAt}
              </span>
            }
          />
        </div>
        <div className="my-4 border-b" />
        <Button className="w-full" onClick={onEdit}>
          <Pencil className="h-3 w-3" /> Edit Project
        </Button>
      </div>

      <div className="rounded-md border p-6">
        <h3 className="text-lg font-bold">Recent Activity</h3>
        <div className="my-4 border-b" />
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-row items-center justify-between">
      <span className="text-muted-foreground font-semibold">{label}</span>
      {value}
    </div>
  );
}

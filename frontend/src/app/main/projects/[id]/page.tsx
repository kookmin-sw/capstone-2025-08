'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
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

import { dummyProjects, dummySubProject } from '@/data/dummy';
import { Project, SubProject } from '@/types/project-schema';
import { formatDateTime } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProjectInfoCard from '@/components/projects/project-info-card';
import SubProjectTable from '@/components/projects/subproject-table';
import { StatusBadge } from '@/components/common/status-badge';
import ImageUploadModal from '@/components/projects/image-upload-modal';
import ProjectEditModal from '@/components/projects/project-edit-modal';
import ProjectDeleteModal from '@/components/projects/poject-delete-modal';
import ModelTrainingMetricsChart from '@/components/projects/model-training-metrics-chart';

const dummyMetrics = [
  { epoch: 1, loss: 0.9, iou: 0.45, f1: 0.52 },
  { epoch: 2, loss: 0.7, iou: 0.55, f1: 0.6 },
  { epoch: 3, loss: 0.5, iou: 0.62, f1: 0.68 },
  { epoch: 4, loss: 0.42, iou: 0.68, f1: 0.75 },
  { epoch: 5, loss: 0.35, iou: 0.73, f1: 0.81 },
];

const dummyLabels = [
  { name: 'Tumor', color: '#EF4444' }, // Red
  { name: 'Stroma', color: '#10B981' }, // Green
  { name: 'Lymphocyte', color: '#3B82F6' }, // Blue
  { name: 'Necrosis', color: '#FACC15' }, // Yellow
  { name: 'Blood Vessel', color: '#8B5CF6' }, // Purple
  { name: 'Background', color: '#9CA3AF' }, // Gray
  { name: 'Artifact', color: '#EC4899' }, // Pink
];

export default function ProjectDetails() {
  // TODO: 프로젝트 상세 정보 Api 연동 / 이미지 추가 (모달) Api 연동 / 프로젝트 수정, 삭제 (모달) Api 연동 / Recent Activity 기획 및 퍼블리싱

  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const p = dummyProjects.find((d) => d.id === Number(id)) ?? null;
    setProject(p);
    setSubProjects(dummySubProject.filter((sp) => sp.projectId === id));
  }, [id]);

  const handleEdit = (updated: { title: string; description: string }) => {
    if (!project) return;
    setProject({ ...project, ...updated });
    setEditOpen(false);
  };

  if (!project) return null;

  return (
    <div className="flex flex-col px-20 py-16">
      <Header
        title={project.title}
        description={project.description}
        onBack={router.back}
        onAnnotate={() =>
          router.push(`/main/projects/annotation/${project.id}`)
        }
        onDelete={() => setDeleteOpen(true)}
      />
      <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-0">
        <div className="col-span-2 flex flex-col">
          <StatsCards
            subProjects={subProjects}
            onUploadClick={() => setUploadOpen(true)}
          />
          <div className="my-8 w-full border-b" />
          <ProjectTabs subProjects={subProjects} />
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
        initialTitle={project.title}
        initialDescription={project.description}
      />

      <ProjectDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        projectTitle={project.title}
        onClickDelete={() => {
          setDeleteOpen(false);
          router.push('/main/projects');
        }}
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
  subProjects,
  onUploadClick,
}: {
  subProjects: SubProject[];
  onUploadClick: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <ProjectInfoCard
        icon={<ImageIcon className="h-5 w-5" />}
        iconBgColor="bg-sky-100"
        iconColor="text-sky-600"
        label="Slides"
        value={subProjects.length}
        progress={60}
        subText="60% processed • Last uploaded : 1h ago"
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
        label="Model Training & Inference"
        value="92.5%"
        progress={60}
        subText="Epoch 15/20 • Est. completion: 2024-04-03 03:30 PM"
        rightElement={<StatusBadge status="progress" />}
      />
    </div>
  );
}

function ProjectTabs({ subProjects }: { subProjects: SubProject[] }) {
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
        <SubProjectTable subProjects={subProjects} />
      </TabsContent>
      <TabsContent value="analytics">
        <ModelTrainingMetricsChart
          data={dummyMetrics}
          f1Score={dummyMetrics.at(-1)?.f1 ?? 0}
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
  project: Project;
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
        <h3 className="text-lg font-bold">Label</h3>
        <div className="my-4 border-b" />

        <div
          ref={scrollRef}
          className={`scroll-hide-track flex max-h-52 flex-col gap-2 overflow-y-auto ${
            hasScroll ? 'pr-1' : ''
          }`}
        >
          {dummyLabels.map((label) => (
            <div
              key={label.name}
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
          ))}
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
            value={
              <Badge variant="secondary">{project.modelNameList[0]}</Badge>
            }
          />
          <DetailItem
            label="Created At"
            value={
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                {formatDateTime(project.createdAt).full}
              </span>
            }
          />
          <DetailItem
            label="Updated At"
            value={
              <span className="flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                {formatDateTime(project.updatedAt).full}
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

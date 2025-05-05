'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  PenTool,
  Share2,
  Trash2,
  Image,
  Bot,
  ChartLine,
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

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);

  useEffect(() => {
    if (!id) return;
    const p = dummyProjects.find((d) => d.id === Number(id)) ?? null;
    setProject(p);
    setSubProjects(dummySubProject.filter((sp) => sp.projectId === id));
  }, [id]);

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
      />
      <StatsCards subProjects={subProjects} />
      <div className="my-8 border-b" />
      <div className="grid grid-cols-3 gap-6">
        <ProjectTabs subProjects={subProjects} />
        <ProjectSidebar project={project} />
      </div>
    </div>
  );
}

function Header({
  title,
  description,
  onBack,
  onAnnotate,
}: {
  title: string;
  description: string;
  onBack: () => void;
  onAnnotate: () => void;
}) {
  return (
    <div className="grid grid-cols-3 items-start justify-between gap-6">
      {/* 좌측: 타이틀 + 설명 */}
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

      {/* 우측: 버튼들 가로 정렬 */}
      <div className="col-span-1 flex w-full justify-end">
        <div className="flex w-full flex-row gap-2">
          <Button onClick={onAnnotate} className="flex-1">
            <PenTool className="mr-1 h-4 w-4" />
            Annotation
          </Button>
          <Button className="flex-1">
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
          <Button variant="destructive" className="flex-1">
            <Trash2 className="mr-1 h-4 w-4 -translate-y-[1px]" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatsCards({ subProjects }: { subProjects: SubProject[] }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-6">
      <ProjectInfoCard
        icon={<Image className="h-5 w-5" />}
        iconBgColor="bg-sky-100"
        iconColor="text-sky-600"
        label="Slides"
        value={subProjects.length}
        progress={60}
        subText="60% processed • Last uploaded : 1h ago"
        rightElement={<Button variant="outline">Upload</Button>}
      />
      <ProjectInfoCard
        icon={<PenTool className="h-5 w-5" />}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        label="Annotations"
        value={120}
        progress={60}
        subText="820 verified • 300 remaining"
        rightElement={
          <div className="text-muted-foreground text-sm font-semibold">
            76% Complete
          </div>
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
      <TabsContent value="analytics">분석자료</TabsContent>
    </Tabs>
  );
}

function ProjectSidebar({ project }: { project: Project }) {
  return (
    <div className="col-span-1 flex flex-col gap-6">
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
        <Button className="w-full">
          <Pencil className="h-3 w-3" /> Edit Project
        </Button>
      </div>

      <div className="rounded-md border p-6">
        <h3 className="text-lg font-bold">Recent Activity</h3>
        <div className="my-4 border-b" />
        {/* TODO: Activity list */}
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

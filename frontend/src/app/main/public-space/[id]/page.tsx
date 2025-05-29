'use client';

import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { dummyProjectDetail } from '@/data/dummy';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import PageTitle from '@/components/common/page-title';
import TabMenu from '@/components/common/tab-menu';
import CommentBox from '@/components/public-space/comment-box';
import Description from '@/components/public-space/project-tap-menu/description';
import Dataset from '@/components/public-space/project-tap-menu/dataset';
import ProjectDownloadModal from '@/components/public-space/project-download-modal';
import { toast, Toaster } from 'sonner';
import {
  GetProjectDetailResponseDto,
  GetSharedProjectCommentsResponseDto,
  GetSharedProjectDetailResponseDto,
  ProjectAPIApi,
  PublicSpaceAPIApi,
} from '@/generated-api';
import { formatDateExceptTime } from '@/utils/date-utils';
import ModelTrainingMetricsChart from '@/components/projects/model-training-metrics-chart';

export default function PublicSpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const PublicSpaceApi = useMemo(() => new PublicSpaceAPIApi(), []);
  const projectApi = useMemo(() => new ProjectAPIApi(), []);

  // 상세 정보
  const [project, setProject] =
    useState<GetSharedProjectDetailResponseDto>(dummyProjectDetail);
  const [ready, setReady] = useState(false);

  // 프로젝트 정보(모델 성능을 받아오기 위함)
  const [projectForAnalytics, setProjectForAnalytics] =
    useState<GetProjectDetailResponseDto>();

  // 다운로드 모달
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // 댓글
  const [comments, setComments] =
    useState<GetSharedProjectCommentsResponseDto | null>(null);

  // 댓글 다시 불러오는 함수 (refetch 역할)
  const refetchComments = async () => {
    if (!id) return;
    const projectId = Number(id);
    try {
      const commentsRes = await PublicSpaceApi.getComments({
        sharedProjectId: projectId,
      });
      setComments(commentsRes);
      console.log('comments: ', commentsRes);
    } catch (error) {
      console.error('댓글 불러오기 실패:', error);
    }
  };

  // 모델 성능을 받아오기 위한 프로젝트 데이터 받아오기
  const fetchProject = useCallback(async () => {
    if (!project.projectId) return;
    try {
      const detail = await projectApi.getProjectDetail({
        projectId: project.projectId,
      });
      setProjectForAnalytics(detail);
    } catch (error) {
      toast.error('Failed to load project details for model info.');
    }
  }, [id, projectApi]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // 탭 메뉴
  const tabs = [
    {
      value: 'description',
      label: 'Description',
      content: <Description content={project.description ?? ''} />,
    },
    {
      value: 'performance',
      label: 'Performance',
      content: (
        <ModelTrainingMetricsChart
          data={projectForAnalytics?.analytics || {}}
          f1Score={projectForAnalytics?.analytics?.f1Score ?? 0}
        />
      ),
    },
    {
      value: 'dataSet',
      label: 'DataSet',
      content: (
        <Dataset
          originalImage={project.originalImagePaths ?? []}
          annotatedImage={project.resultImagePaths ?? []}
        />
      ),
    },
  ];

  // 상세 정보 및 댓글 불러오기
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const projectId = Number(id);
        const projectRes = await PublicSpaceApi.getSharedProject({
          sharedProjectId: projectId,
        });
        setProject(projectRes);
        console.log('project: ', projectRes);

        await refetchComments();
      } catch (error) {
        console.error('프로젝트 정보를 불러오는 중 오류 발생:', error);
      } finally {
        setReady(true);
      }
    };

    fetchData();
  }, [id]);

  // 모델 다운로드 + 모달창 닫기
  const handleDownloadAndCloseModal = async () => {
    try {
      if (project?.sharedProjectId && project?.model?.modelId) {
        await PublicSpaceApi.downloadModel({
          sharedProjectId: project.sharedProjectId,
          modelId: project.model.modelId,
        });
        toast.success('Model download has started.');
      } else {
        console.warn('Missing project ID or model ID.');
      }
    } catch (e) {
      console.error('An error occurred while requesting model download:', e);
      toast.error('Failed to download the model. Please try again later.');
    } finally {
      setShowDownloadModal(false);
    }
  };

  return (
    <div>
      <div className="relative h-72 w-full">
        <Image
          fill
          src={dummyProjectDetail.coverImage}
          alt={project.title ?? ''}
          className="object-cover"
        />
        <div className="bg-black/35 absolute inset-0" />
      </div>

      <Toaster position="bottom-right" />

      <div className="space-y-10 px-16 py-9">
        <div className="space-y-3">
          <PageTitle
            title={project.title ?? ''}
            icon={<Download />}
            buttonName="Download"
            buttonSize="129px"
            onButtonClick={() => setShowDownloadModal(true)}
            showDivider={false}
          />
          <div className="text-muted-foreground text-sm">
            {project.authorName} |{' '}
            {formatDateExceptTime(project.createdAt?.toISOString() ?? '')}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {project.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="w-full">
          <TabMenu tabs={tabs} bgColor="white" />
        </div>

        {comments && (
          <CommentBox
            comments={comments}
            sharedProjectId={project.sharedProjectId ?? -1}
            refetchComments={refetchComments}
          />
        )}
      </div>

      {showDownloadModal && (
        <ProjectDownloadModal
          open={showDownloadModal}
          onClose={handleDownloadAndCloseModal}
          title={project.title ?? ''}
        />
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PageTitle from '@/components/common/page-title';
import ProjectCard from '@/components/projects/project-card';
import SearchBar from '@/components/common/search-bar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import ProjectCreateModal from '@/components/projects/project-create-modal';
import ImageUploadModal from '@/components/projects/image-upload-modal';
import {
  ProjectAPIApi,
  GetProjectsResponseDetailDto,
  GetProjectsResponseModelsDto,
  CreateProjectRequestDto,
} from '@/generated-api';
import { toast } from 'sonner';
import ProjectCardSkeleton from '@/components/projects/project-card-skeleton';

const sortOptions = [
  { value: 'Edited (desc)', label: 'Edited (desc)' },
  { value: 'Edited (asc)', label: 'Edited (asc)' },
  { value: 'Created (desc)', label: 'Created (desc)' },
  { value: 'Created (asc)', label: 'Created (asc)' },
];

export default function ProjectsPage() {
  const projectApi = useMemo(() => new ProjectAPIApi(), []);

  const [projects, setProjects] = useState<GetProjectsResponseDetailDto[]>([]);
  const [models, setModels] = useState<GetProjectsResponseModelsDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('Edited (desc)');
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newProjectInfo, setNewProjectInfo] =
    useState<CreateProjectRequestDto | null>(null);

  const estimatedItemCount = projects.length || 6;

  const fetchProjects = useCallback(
    async (options?: { search?: string; sort?: string; page?: number }) => {
      let showSkeletonTimer: NodeJS.Timeout | null = null;

      // 300ms 후에 스켈레톤 표시 (느린 요청일 경우에만)
      showSkeletonTimer = setTimeout(() => setIsLoading(true), 500);

      const {
        search = searchTerm,
        sort: sortOption = sort,
        page = currentPage,
      } = options || {};

      try {
        const response = await projectApi.getProjects({
          search,
          sort: sortOption,
          page: page,
        });
        setProjects(response.project?.content || []);
        setModels(response.models || []);
        setTotalPages(response.project?.totalPages || 1);
      } catch (error) {
        toast.error('Failed to load project list. Please try again.');
      } finally {
        if (showSkeletonTimer) {
          clearTimeout(showSkeletonTimer);
        }
        setIsLoading(false);
      }
    },
    [searchTerm, sort, currentPage, projectApi],
  );

  const handleCreateProject = async (files: File[]) => {
    if (!newProjectInfo) {
      toast.error('Project information is missing.');
      return;
    }

    const title = newProjectInfo.title;
    const toastId = toast.loading(`Uploading '${title}'... Please wait.`);

    try {
      await projectApi.createProject({
        requestDto: {
          title: newProjectInfo.title,
          description: newProjectInfo.description,
          modelId: newProjectInfo.modelId || undefined,
        },
        files: files,
      });

      toast.success(
        `'${title}' has been created successfully. Processing may take up to 30 minutes.`,
        { id: toastId },
      );

      setIsUploadOpen(false);
      await fetchProjects();
      setCurrentPage(1);
    } catch (error) {
      toast.error(`Failed to create '${title}'. Please try again.`, {
        id: toastId,
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, sort, searchTerm, currentPage]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term && !recentKeywords.includes(term)) {
      setRecentKeywords((prev) => [...prev, term]);
    }

    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleRemoveKeyword = (keyword: string) => {
    setRecentKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  return (
    <div className="space-y-4">
      <PageTitle
        title="Projects"
        icon={<Sparkles />}
        buttonName="New Project"
        onButtonClick={() => setIsCreateOpen(true)}
      />

      <SearchBar
        sort={sort}
        sortOptions={sortOptions}
        onSortChange={(value) => {
          setSort(value);
          setCurrentPage(1);
        }}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        recentKeywords={recentKeywords}
        onRemoveKeyword={handleRemoveKeyword}
      />

      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: estimatedItemCount }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              refetchProjects={fetchProjects}
            />
          ))
        ) : (
          <p>There are no projects yet.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="my-10 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      variant={currentPage === page ? 'outline' : 'ghost'}
                      size="icon"
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <ProjectCreateModal
        models={models}
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onNext={(info) => {
          setNewProjectInfo(info);
          setIsCreateOpen(false);
          setIsUploadOpen(true);
        }}
      />

      <ImageUploadModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        mode="create"
        onPrevious={() => {
          setIsUploadOpen(false);
          setIsCreateOpen(true);
        }}
        onCreateSubmit={handleCreateProject}
      />
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/public-space/sub-title';
import ProjectCard from '../../../../components/public-space/project-card';
import BestProjectBox from '../../../../components/public-space/best-project-box';
import SearchBar from '@/components/common/search-bar';
import { Button } from '@/components/ui/button';
import { Plus, Award, Clock } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  GetSharedProjectsResponseDto,
  PublicSpaceAPIApi,
} from '@/generated-api';

export default function PublicSpaceCommunityPage() {
  const router = useRouter();
  const PublicSpaceApi = useMemo(() => new PublicSpaceAPIApi(), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [projects, setProjects] = useState<GetSharedProjectsResponseDto>();
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async (search: string, page: number) => {
    try {
      setIsLoading(true);
      const projectRes =
        await PublicSpaceApi.getSharedProjectsResponseDtoResponseEntity({
          search,
          page,
        });
      setProjects(projectRes);
      setTotalPages(projectRes.sharedProject?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(searchTerm, currentPage);
  }, [searchTerm, currentPage]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term && !recentKeywords.includes(term)) {
      setRecentKeywords((prev) => [...prev, term]);
    }

    setCurrentPage(1);
  };

  const handleRemoveKeyword = (keyword: string) => {
    setRecentKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title="Public Space"
        icon={<Plus />}
        buttonName="Share My Project"
        buttonSize="154px"
        onButtonClick={() =>
          router.push('/main/public-space/shared-model/upload')
        }
        showDivider={false}
      />

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        recentKeywords={recentKeywords}
        onRemoveKeyword={handleRemoveKeyword}
        showSort={false}
      />

      {!searchTerm && (
        <>
          <div className="border-b" />
          <SubTitle title="Best Project" icon={<Award />} />
          <BestProjectBox projects={projects?.bestProjects ?? []} />

          <SubTitle title="Recent Projects" icon={<Clock />} />
        </>
      )}

      {isLoading ? (
        <div className="py-20 text-center">Loading...</div>
      ) : projects?.sharedProject?.content?.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg font-semibold">No projects found.</p>
          {/*<Button*/}
          {/*  variant="outline"*/}
          {/*  onClick={() => {*/}
          {/*    setSearchTerm('');*/}
          {/*    setRecentKeywords([]);*/}
          {/*    setCurrentPage(1);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Back to Community*/}
          {/*</Button>*/}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-6">
            {projects?.sharedProject?.content?.map((project) => (
              <ProjectCard
                key={project.sharedProjectId}
                project={{
                  ...project,
                }}
                onClick={() =>
                  router.push(`/main/public-space/${project.sharedProjectId}`)
                }
              />
            )) ?? null}
          </div>

          <Pagination className="pt-5">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
}

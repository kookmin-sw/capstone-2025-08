'use client';

import { useState } from 'react';
import { dummyProjects, dummySubProject } from '@/data/dummy';
import { Project } from '@/types/project-schema';
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

const sortOptions = [
  { value: 'created-desc', label: 'Created (desc)' },
  { value: 'created-asc', label: 'Created (asc)' },
  { value: 'updated-desc', label: 'Edited (desc)' },
  { value: 'updated-asc', label: 'Edited (asc)' },
];

export default function ProjectsPage() {
  // TODO: 페이지네이션, 정렬 옵션, 검색 백엔드 연동 / 프로젝트 생성 (모달) Api 연동

  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('created-desc');
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const itemsPerPage = 9;

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

  const sortedProjects = [...dummyProjects].sort((a, b) => {
    if (sort === 'created-desc')
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === 'created-asc')
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === 'updated-desc')
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sort === 'updated-asc')
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return 0;
  });

  const filteredProjects = sortedProjects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / itemsPerPage),
  );
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
          setCurrentPage(1); // 정렬 변경 시도 첫 페이지로
        }}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        recentKeywords={recentKeywords}
        onRemoveKeyword={handleRemoveKeyword}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paginatedProjects.map((project: Project) => (
          <ProjectCard
            key={project.id}
            project={project}
            subProjects={dummySubProject}
          />
        ))}
      </div>

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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <ProjectCreateModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onNext={() => {
          setIsCreateOpen(false);
          setIsUploadOpen(true);
        }}
      />

      <ImageUploadModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        mode="create"
        onUpload={(files) => {
          console.log('업로드된 파일 목록:', files);
        }}
        onPrevious={() => {
          setIsUploadOpen(false);
          setIsCreateOpen(true);
        }}
      />
    </div>
  );
}

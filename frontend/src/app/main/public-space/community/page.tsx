'use client';

import { Plus, Award, Clock } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/public-space/sub-title';
import ProjectCard from '../../../../components/public-space/project-card';
import BestProjectBox from '../../../../components/public-space/best-project-box';
import SearchBar from '@/components/common/search-bar';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 12; // 3줄 x 4칸

const dummyProjects = Array.from({ length: 30 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Project ${i + 1}`,
  author: 'Hyeonjin Hwang',
  tags: ['Cell', 'DataSet', 'Comment'],
  thumbnail: '/images/test-public-space-image.png',
  downloadCount: '10M',
}));

const dummyBestProjects = Array.from({ length: 3 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Project ${i + 1}`,
  author: 'Hyeonjin',
  profileImage: '/images/test-profile-image.png',
  downloadCount: '10M',
}));

export default function PublicSpaceCommunityPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 필터된 프로젝트 리스트 (title, tag로 필터링)
  const filteredProjects = dummyProjects.filter((project) => {
    const titleMatch = project.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const tagMatch = project.tags.some((tag) =>
      tag.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return titleMatch || tagMatch;
  });

  // pagination 적용
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProjects = filteredProjects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

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
        onButtonClick={() => router.push('/main/public-space/upload')}
        showDivider={false}
      />

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        recentKeywords={recentKeywords}
        onRemoveKeyword={handleRemoveKeyword}
        showSort={false}
      />

      {/* 검색할 때 best project는 보이지 않도록 */}
      {!searchTerm && (
        <>
          <div className="border-b" />
          <SubTitle title="Best Project" icon={<Award />} />
          <BestProjectBox projects={dummyBestProjects} />

          <SubTitle title="Recent Projects" icon={<Clock />} />
        </>
      )}

      {currentProjects.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg font-semibold">No projects found.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setRecentKeywords([]);
              setCurrentPage(1);
              router.push('/main/public-space/community');
            }}
          >
            Back to Community
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-6">
            {currentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => router.push(`/main/public-space/${project.id}`)}
              />
            ))}
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

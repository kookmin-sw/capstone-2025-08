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
import ProjectItem from '@/components/public-space/project-item';
import BestProject from '@/components/public-space/best-project';
import SearchBar from '@/components/common/search-bar';

const ITEMS_PER_PAGE = 12; // 3줄 x 4칸

export const dummyProjects = Array.from({ length: 30 }, (_, i) => ({
  id: `project-${i + 1}`,
  title: `Project ${i + 1}`,
  author: 'Hyeonjin Hwang',
  tags: ['Cell', 'DataSet', 'Comment'],
  thumbnail: '/images/test-public-space-image.png',
  downloadCount: `${(Math.random() * 10 + 1).toFixed(1)}M`,
}));

export const dummyBestProjects = Array.from({ length: 3 }, (_, i) => ({
  id: `project-${i + 1}`,
  title: `Project ${i + 1}`,
  author: 'Hyeonjin',
  profileImage: '/images/test-profile-image.png',
  downloadCount: `${(Math.random() * 10 + 1).toFixed(0)}M`,
}));

export default function PublicSpaceCommunityPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(dummyProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProjects = dummyProjects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-4">
      <PageTitle
        title="Public Space"
        icon={<Plus />}
        buttonName="Share My Project"
        buttonSize="154px"
        onButtonClick={() => router.push('/main/public-space/upload')}
        showDivider={false}
      />

      <div className="my-8 border-b" />

      <SubTitle title="Best Project" icon={<Award />} />
      <BestProject projects={dummyBestProjects} />

      <SubTitle title="Recent Projects" icon={<Clock />} />
      <div className="grid grid-cols-4 gap-6">
        {currentProjects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </div>

      <Pagination className="pt-5">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
    </div>
  );
}

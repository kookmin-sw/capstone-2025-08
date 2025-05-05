'use client';

import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { SubProject } from '@/types/project-schema';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SubProjectDeleteModal from '@/components/projects/subproject-delete-modal';

export default function SubProjectTable({
  subProjects,
}: {
  subProjects: SubProject[];
}) {
  // TODO: 서브 프로젝트 삭제 (모달) Api 연동, 서브 프로젝트 페이지네이션 추가

  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubProject | null>(null);

  const visibleCount = isExpanded ? subProjects.length : 10;
  const visibleProjects = subProjects.slice(0, visibleCount);
  const showToggle = subProjects.length > 10;

  const handleDelete = (sp: SubProject) => setDeleteTarget(sp);

  return (
    <div className="rounded-sm border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px] text-center">Thumbnail</TableHead>
            <TableHead className="w-[400px]">Name</TableHead>
            <TableHead className="w-[100px] text-center">Size</TableHead>
            <TableHead className="w-[150px] text-center">Uploaded On</TableHead>
            <TableHead className="w-[80px] text-center"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleProjects.map((sp) => (
            <TableRow key={sp.id}>
              <TableCell className="flex items-center justify-center">
                <Image
                  src={sp.thumbnail}
                  alt={sp.thumbnail}
                  width={50}
                  height={50}
                  className="rounded-md object-cover"
                />
              </TableCell>
              <TableCell className="truncate">{sp.svsPath}</TableCell>
              <TableCell className="text-center">{sp.size}MB</TableCell>
              <TableCell className="text-center">
                {format(new Date(sp.uploadedOn), 'yyyy-MM-dd')}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(sp)}
                >
                  삭제
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {showToggle && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                <Button
                  variant="ghost"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="hover:bg-transparent"
                >
                  {isExpanded ? '- show less' : '+ show more'}
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {deleteTarget && (
        <SubProjectDeleteModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          subProjectFileName={deleteTarget.svsPath}
          onClickDelete={() => {
            console.log(`Deleted: ${deleteTarget.id}`);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

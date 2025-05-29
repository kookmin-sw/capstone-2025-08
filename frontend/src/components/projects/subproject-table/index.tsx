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
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SubProjectDeleteModal from '@/components/projects/subproject-delete-modal';
import type { SlideDto } from '@/generated-api';
import { Trash } from 'lucide-react';

export default function SubProjectTable({
  subProjects,
}: {
  subProjects: SlideDto[];
}) {
  // TODO: 서브 프로젝트 삭제

  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SlideDto | null>(null);

  const visibleCount = isExpanded ? subProjects.length : 10;
  const visibleProjects = subProjects.slice(0, visibleCount);
  const showToggle = subProjects.length > 10;

  const handleDelete = (sp: SlideDto) => setDeleteTarget(sp);

  if (visibleProjects.length === 0) {
    return (
      <div className="text-muted-foreground py-10 text-center text-sm">
        No slides available.
      </div>
    );
  }

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
            <TableRow key={sp.subProjectId}>
              <TableCell className="flex items-center justify-center">
                <Image
                  src={sp.thumbnailUrl || ''}
                  alt={sp.name || 'Slide thumbnail'}
                  width={50}
                  height={50}
                  className="rounded-md object-cover"
                />
              </TableCell>
              <TableCell className="truncate">{sp.name}</TableCell>
              <TableCell className="text-center">{sp.size}</TableCell>
              <TableCell className="text-center">{sp.uploadedOn}</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(sp)}
                >
                  <Trash />
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
          subProjectFileName={deleteTarget.name || ''}
          onClickDelete={() => {
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

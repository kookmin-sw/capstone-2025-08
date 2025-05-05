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
import { SubProject } from '@/types/project-schema';
import { Button } from '@/components/ui/button';

export default function SubProjectTable({
  subProjects,
}: {
  subProjects: SubProject[];
}) {
  return (
    <div className="rounded-sm border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Thumbnail</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subProjects.map((sp) => (
            <TableRow key={sp.id}>
              <TableCell>
                <Image
                  src={sp.thumbnail}
                  alt={sp.thumbnail}
                  width={64}
                  height={64}
                  className="rounded-md object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{sp.svsPath}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

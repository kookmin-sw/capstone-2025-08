'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Columns,
} from 'lucide-react';
import PageTitle from '@/components/common/page-title';
import DeleteModal from '@/components/common/delete-modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Toaster } from 'sonner';
import { SharedModelItem } from '@/types/shared-model';

export default function SharedModelPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'multi'>('multi');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [sharedModelList, setSharedModelList] = useState<SharedModelItem[]>([
    {
      id: 1,
      title: 'project 1',
      model: 'cell detection model',
      tag: ['Cell', 'Comment', 'DataSet'],
      uploadedDate: '2025-03-19 06:05',
    },
    {
      id: 2,
      title: 'project 2',
      model: 'cell detection model',
      tag: ['Cell', 'Comment'],
      uploadedDate: '2025-03-20 06:05',
    },
    {
      id: 3,
      title: 'project 3',
      model: 'cell detection model',
      tag: ['Cell', 'DataSet'],
      uploadedDate: '2025-03-21 06:05',
    },
    {
      id: 4,
      title: 'project 4',
      model: 'cell detection model',
      tag: ['Cell', 'Comment', 'DataSet'],
      uploadedDate: '2025-03-22 06:05',
    },
    {
      id: 5,
      title: 'project 5',
      model: 'cell detection model',
      tag: ['Cell'],
      uploadedDate: '2025-03-18 06:05',
    },
  ]);

  const triggerDeleteModal = (mode: 'single' | 'multi', targetId?: number) => {
    setDeleteMode(mode);
    setDeleteTargetId(targetId ?? null);
    setShowDeleteModal(true);
  };

  // 단일 항목 삭제
  const handleDeleteRow = (id: number) => {
    setSharedModelList((prev) => prev.filter((item) => item.id !== id));
  };

  // 여러 항목 삭제
  const handleDeleteSelected = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id);

    setSharedModelList((prev) =>
      prev.filter((item) => !selectedIds.includes(item.id)),
    );

    table.resetRowSelection();
  };

  const handleConfirmDelete = () => {
    if (deleteMode === 'multi') {
      handleDeleteSelected(); // 기존의 다중 삭제 함수
    } else if (deleteMode === 'single' && deleteTargetId !== null) {
      handleDeleteRow(deleteTargetId); // 기존의 단일 삭제 함수
    }
    setShowDeleteModal(false);
  };

  const columns: ColumnDef<SharedModelItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: () => <div className="text-muted-foreground">Title</div>,
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('title')}</div>;
      },
    },
    {
      accessorKey: 'model',
      header: () => <div className="text-muted-foreground">Model</div>,
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('model')}</div>;
      },
    },
    {
      accessorKey: 'tag',
      header: () => <div className="text-muted-foreground">Tag</div>,
      cell: ({ row }) => {
        const tags: string[] = row.getValue('tag');
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'uploadedDate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-muted-foreground"
          >
            Uploaded Date
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="pl-3 lowercase">{row.getValue('uploadedDate')}</div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/main/public-space/shared-model/${row.original.id}`,
                    )
                  }
                >
                  <Pencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/main/public-space/${row.original.id}`)
                  }
                >
                  <ExternalLink />
                  Go to Page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => triggerDeleteModal('single', row.original.id)}
                  variant="destructive"
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: sharedModelList,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div>
      <PageTitle
        title="Public Space > Shared Model"
        icon={<Plus />}
        buttonName="Share My Project"
        buttonSize="154px"
        onButtonClick={() =>
          router.push('/main/public-space/shared-model/upload')
        }
      />

      <Toaster position="bottom-right" />

      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Filter Titles..."
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('title')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />

          <div className="flex items-center gap-4">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button
                variant="destructive"
                className="ml-auto"
                onClick={() => triggerDeleteModal('multi')}
              >
                Delete
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <Columns />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* data table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // 아이템이 없을 경우
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* data table 하단 조작 도구 */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-muted-foreground flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}

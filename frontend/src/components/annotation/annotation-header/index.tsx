'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { dummyProjects } from '@/data/dummy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/utils';

export default function AnnotationHeader() {
  const router = useRouter();
  const { id } = useParams(); // 현재 프로젝트 ID 가져오기

  if (!id) return null;

  const project = dummyProjects.find((proj) => proj.id === Number(id));

  // 가장 최근 버전 기록 찾기 (startedAt 기준 내림차순 정렬 후 첫 번째)
  const latestHistory = project?.history
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )[0];

  return (
    <div className="bg-primary fixed right-0 top-0 flex w-full flex-row items-center justify-between p-4 text-white">
      {/* 왼쪽: 뒤로가기 + 프로젝트 제목 */}
      <div className="flex flex-row items-center gap-4">
        <button onClick={() => router.push('/main/projects')}>
          <ArrowLeft className="text-white" />
        </button>
        <h3 className="text-lg font-semibold">
          {project ? project.title : 'Project Title'}
        </h3>
      </div>

      {/* 오른쪽: 모델 정보 */}
      <div className="flex flex-row items-center gap-4">
        {/* 모델 버전 기록 (가장 최근 히스토리) */}
        <Select value={latestHistory?.id.toString()} onValueChange={() => {}}>
          <SelectTrigger>
            <SelectValue>
              {latestHistory
                ? (() => {
                    const { full, time } = formatDateTime(
                      latestHistory.startedAt,
                    );
                    return (
                      <div className="flex flex-row items-center gap-2">
                        <span>Version {latestHistory.id}</span>
                        <span className="text-muted-foreground text-xs">
                          {full} {time}
                        </span>
                      </div>
                    );
                  })()
                : 'Version Select'}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {project?.history
              ?.slice() // 원본 보호
              .sort(
                (a, b) =>
                  new Date(b.startedAt).getTime() -
                  new Date(a.startedAt).getTime(),
              )
              .map((h) => {
                const { full, time } = formatDateTime(h.startedAt);
                return (
                  <SelectItem key={h.id} value={h.id.toString()}>
                    <div className="flex flex-col">
                      <span>Version {h.id}</span>
                      <span className="text-muted-foreground text-xs">
                        {full} {time}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>

        {/* 모델 타입 */}
        <Select
          value={project?.modelType.toLowerCase()}
          onValueChange={() => {}}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="모델 타입 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cell">Cell</SelectItem>
            <SelectItem value="tissue">Tissue</SelectItem>
            <SelectItem value="multi">Multi</SelectItem>
          </SelectContent>
        </Select>

        {/* 모델 이름 */}
        <Input
          className="w-32 text-lg font-medium"
          value={project?.modelName ?? ''}
          placeholder="모델 이름을 입력하세요"
          readOnly
        />

        {/* 버튼 */}
        <Button variant="secondary">Train</Button>
        <Button variant="secondary">Run</Button>
        <Button variant="secondary">Save</Button>
      </div>
    </div>
  );
}

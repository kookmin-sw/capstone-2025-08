'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CommentDto } from '@/generated-api';
import ReplyInput from '@/components/public-space/comment-box/reply-input';
import { formatDateToSimple } from '@/utils/date-utils';

interface CommentItemProps {
  comment: CommentDto;
  currentUser: string;
  onReply: (commentId: number, text: string, replyTo: string) => void;
  onEdit: (
    id: number,
    content: string,
    isReply: boolean,
    parentId?: number,
  ) => void;
  onDelete: (id: number, isReply: boolean, parentId?: number) => void;
  onRequestReply: (commentId: number | null) => void;
  replyToId: number | null;
  depth?: number;
  parentId?: number;
}

export default function CommentItem({
  comment,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onRequestReply,
  replyToId,
  depth = 0,
  parentId,
}: CommentItemProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // 태그별 뱃지 색상 변경
  const variantMap = {
    FIX: 'destructive',
    QUESTION: 'outline',
    COMMENT: 'secondary',
  } as const;

  const handleEdit = (id: number, content: string) => {
    setEditingId(id);
    setEditingText(content);
  };

  const handleSaveEdit = (id: number, isReply: boolean, parentId?: number) => {
    onEdit(id, editingText, isReply, parentId);
    setEditingId(null);
    setEditingText('');
  };

  const isReply = parentId !== undefined;

  return (
    <div className="mt-4" style={{ marginLeft: `${depth * 16}px` }}>
      <div className="flex items-start gap-3">
        <Image
          src={comment.profileImageUrl ?? '/images/default-profile-image.png'}
          alt={comment.authorName ?? 'profile image'}
          width={40}
          height={40}
          className="rounded-full"
          unoptimized
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{comment.authorName}</span>
            <Badge
              variant={variantMap[comment.commentTag ?? 'COMMENT']}
              className="text-[10px]"
            >
              {comment.commentTag}
            </Badge>
            {comment.authorName === currentUser && (
              <Badge className="text-[10px]">AUTHOR</Badge>
            )}
          </div>

          {editingId === comment.commentId ? (
            <>
              <Textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    handleSaveEdit(comment.commentId!, isReply, parentId)
                  }
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <p
              className="mt-1 text-sm"
              style={{ color: comment.isDeleted ? 'gray' : '' }}
            >
              {comment.content}
            </p>
          )}

          <div className="text-muted-foreground mt-2 flex gap-2 text-xs">
            <Button
              variant="link"
              size="sm"
              onClick={() => onRequestReply(comment.commentId ?? -1)}
            >
              Reply
            </Button>
            {/* 이름이 같을 경우, 본인 작성이므로 수정/삭제 버튼 보여주기 (추후에 유저 id, 이메일처럼 겹치지 않는 값으로 수정해야할 거 같습니다.)  */}
            {comment.authorName === currentUser && (
              <>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() =>
                    handleEdit(comment.commentId!, comment.content!)
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() =>
                    onDelete(comment.commentId!, isReply, parentId)
                  }
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="text-muted-foreground text-sm">
          {formatDateToSimple(comment.createdAt?.toISOString() ?? '')}
        </div>
      </div>

      {replyToId === comment.commentId && (
        <div className="ml-12 mt-2">
          <ReplyInput
            onCancel={() => onRequestReply(null)}
            onPost={(text) =>
              onReply(comment.commentId!, text, comment.authorName!)
            }
          />
        </div>
      )}

      {/* 재귀 렌더링 */}
      {comment.replies?.map((child) => (
        <CommentItem
          key={child.commentId}
          comment={child}
          currentUser={currentUser}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onRequestReply={onRequestReply}
          replyToId={replyToId}
          depth={depth + 1}
          parentId={comment.commentId}
        />
      ))}
    </div>
  );
}

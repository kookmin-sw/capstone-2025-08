'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentType } from '@/types/comment';
import ReplyInput from '@/components/public-space/comment-box/reply-input';
import { Badge } from '@/components/ui/badge';

interface CommentItemProps {
  comment: CommentType;
  currentUserId: number;
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
}

export default function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onRequestReply,
  replyToId,
}: CommentItemProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleEdit = (id: number, content: string) => {
    setEditingId(id);
    setEditingText(content);
  };

  const handleSaveEdit = (id: number, isReply: boolean, parentId?: number) => {
    onEdit(id, editingText, isReply, parentId);
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div className="border-b py-4">
      <div className="flex items-start gap-3">
        <Image
          src={comment.avatar}
          alt={comment.name}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{comment.name}</span>
            <Badge className="bg-destructive">{comment.tag}</Badge>
          </div>

          {/* 댓글 수정할 때 */}
          {editingId === comment.id ? (
            <>
              <Textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSaveEdit(comment.id, false)}
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
            <p className="text-muted-foreground mt-1 text-sm">
              {comment.content}
            </p>
          )}

          <div className="text-muted-foreground mt-2 flex gap-2 text-xs">
            <Button
              variant="link"
              size="sm"
              onClick={() => onRequestReply(comment.id)}
            >
              Reply
            </Button>
            {comment.userId === currentUserId && (
              <>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleEdit(comment.id, comment.content)}
                >
                  Edit
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onDelete(comment.id, false)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="text-muted-foreground text-sm">{comment.date}</div>
      </div>

      {comment.replies.map((reply) => (
        <div key={reply.id} className="ml-12 mt-4 flex items-start gap-3">
          <Image
            src={reply.avatar}
            alt={reply.name}
            width={36}
            height={36}
            className="rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{reply.name}</span>
              <Badge>{reply.tag}</Badge>
            </div>
            {editingId === reply.id ? (
              <>
                <Textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(reply.id, true, comment.id)}
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
              <p className="text-muted-foreground mt-1 text-sm">
                {reply.replyTo && (
                  <span
                    className="text-primary mr-1 cursor-pointer font-semibold"
                    onClick={() => onRequestReply(comment.id)}
                  >
                    @{reply.replyTo}
                  </span>
                )}
                {reply.content}
              </p>
            )}

            <div className="text-muted-foreground mt-2 flex gap-2 text-xs">
              <Button
                variant="link"
                size="sm"
                onClick={() => onRequestReply(comment.id)}
              >
                Reply
              </Button>
              {reply.userId === currentUserId && (
                <>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => handleEdit(reply.id, reply.content)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => onDelete(reply.id, true, comment.id)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="text-muted-foreground text-sm">{reply.date}</div>
        </div>
      ))}

      {replyToId === comment.id && (
        <div className="ml-12 mt-2">
          <ReplyInput
            onCancel={() => onRequestReply(null)}
            onPost={(text) => onReply(comment.id, text, comment.name)}
          />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import CommentItem from './comment-item';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  CommentDto,
  CreateCommentRequestDtoCommentTagEnum,
  GetSharedProjectCommentsResponseDto,
  PublicSpaceAPIApi,
} from '@/generated-api';
import { useUserStore } from '@/stores/use-user-store';

interface CommentBoxProps {
  comments: GetSharedProjectCommentsResponseDto;
  sharedProjectId: number;
  refetchComments: () => void; // 부모에서 댓글 다시 불러오는 함수
}

export default function CommentBox({
  comments,
  sharedProjectId,
  refetchComments,
}: CommentBoxProps) {
  const PublicSpaceApi = useMemo(() => new PublicSpaceAPIApi(), []);

  // 댓글
  const [newComment, setNewComment] = useState('');

  // 태그
  const [tag, setTag] = useState<CreateCommentRequestDtoCommentTagEnum | null>(
    null,
  );
  const [tagError, setTagError] = useState(false);

  const [replyTo, setReplyTo] = useState<number | null>(null);

  // 유저
  const user = useUserStore((state) => state.user);
  const currentUser = user?.name ?? 'anonymous';

  // 댓글 등록
  const handlePost = async () => {
    if (!tag) {
      setTagError(true);
      return;
    }

    try {
      await PublicSpaceApi.createComment({
        sharedProjectId,
        createCommentRequestDto: {
          content: newComment,
          commentTag: tag,
        },
      });
      toast.success('Your comment has been posted.');
      setNewComment('');
      setTag(null);
      setTagError(false);
      refetchComments(); // 새로고침
    } catch (e) {
      toast.error('Failed to post comment.');
      console.error(e);
    }
  };

  // 대댓글 등록
  const handlePostReply = async (
    commentId: number,
    replyText: string,
    replyToName: string,
  ) => {
    try {
      await PublicSpaceApi.createComment({
        sharedProjectId,
        createCommentRequestDto: {
          content: replyText,
          commentTag: CreateCommentRequestDtoCommentTagEnum.Comment,
          parentId: commentId,
          // replyToName,
        },
      });
      toast.success('Your reply has been posted.');
      setReplyTo(null);
      refetchComments();
    } catch (e) {
      toast.error('Failed to post reply.');
      console.error(e);
    }
  };

  // 댓글 수정
  const handleEdit = async (
    id: number,
    text: string,
    isReply: boolean,
    parentId?: number,
  ) => {
    try {
      await PublicSpaceApi.updateComment({
        sharedProjectId,
        commentId: id,
        updateCommentRequestDto: {
          content: text,
        },
      });
      toast.success('Your comment has been updated.');
      refetchComments();
    } catch (e) {
      toast.error('Failed to update comment.');
      console.error(e);
    }
  };

  // 댓글 삭제
  const handleDelete = async (
    id: number,
    isReply: boolean,
    parentId?: number,
  ) => {
    try {
      await PublicSpaceApi.deleteComment({
        sharedProjectId,
        commentId: id,
      });
      toast.success('Your comment has been deleted.');
      refetchComments();
    } catch (e) {
      toast.error('Failed to delete comment.');
      console.error(e);
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold">Comments</h2>

      {comments?.comments?.map((comment: CommentDto) => (
        <CommentItem
          key={comment.commentId}
          comment={comment}
          currentUser={currentUser}
          onReply={handlePostReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRequestReply={setReplyTo}
          replyToId={replyTo}
        />
      ))}

      <div className="mt-6 space-y-3">
        <Select
          onValueChange={(value) =>
            setTag(value as CreateCommentRequestDtoCommentTagEnum)
          }
        >
          <SelectTrigger className={`w-40 ${tagError ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select Tag" />
          </SelectTrigger>
          <SelectContent>
            {/* TODO: 현진 / 백엔드랑 이야기해서 태그 고치기 */}
            {/*<SelectItem value={CreateCommentRequestDtoCommentTagEnum.Fix}>*/}
            {/*  Fix*/}
            {/*</SelectItem>*/}
            {/*<SelectItem value={CreateCommentRequestDtoCommentTagEnum.Question}>*/}
            {/*  Question*/}
            {/*</SelectItem>*/}
            <SelectItem value={CreateCommentRequestDtoCommentTagEnum.Comment}>
              Comment
            </SelectItem>
          </SelectContent>
        </Select>
        {tagError && (
          <p className="text-sm text-red-500">
            Please select a tag before posting.
          </p>
        )}

        <Textarea
          placeholder="Type your comment here"
          className="min-h-[120px]"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />

        <div className="flex justify-end">
          <Button className="w-24" onClick={handlePost}>
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}

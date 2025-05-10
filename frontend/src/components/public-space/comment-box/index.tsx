'use client';

import { useState } from 'react';
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
import { formatDateToSimple } from '@/utils/date-utils';
import { CommentType } from '@/types/public-space-comment';

const dummyComments: CommentType[] = [
  {
    id: 1,
    userId: 2,
    name: 'Yeonjin Wang',
    avatar: '/images/test-profile-image.png',
    tag: 'Fix',
    content:
      'Wow, this is the model I really needed, thank you. However, I found one error.',
    date: '2025.03.10 02:51',
    replies: [],
  },
];

export default function CommentBox() {
  const [comments, setComments] = useState<CommentType[]>(dummyComments);
  const [tag, setTag] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [tagError, setTagError] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const currentUserId = 1;
  const currentUser = 'Hyeonjin Hwang';

  // 댓글 달기
  const handlePost = () => {
    if (!tag) {
      setTagError(true);
      return;
    }

    const comment: CommentType = {
      id: Date.now(),
      userId: currentUserId,
      name: currentUser,
      avatar: '/images/test-profile-image.png',
      tag,
      content: newComment,
      date: formatDateToSimple(new Date().toISOString()),
      replies: [],
    };
    setComments([...comments, comment]);
    setNewComment('');
    setTag(null);
    setTagError(false);
  };

  // 답글 달기
  const handlePostReply = (
    commentId: number,
    replyText: string,
    replyToName: string,
  ) => {
    const newReply = {
      id: Date.now(),
      userId: currentUserId,
      name: currentUser,
      avatar: '/images/test-profile-image.png',
      tag: 'Author',
      content: replyText,
      date: formatDateToSimple(new Date().toISOString()),
      replyTo: replyToName,
    };
    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c,
      ),
    );
    setReplyTo(null);
  };

  // 댓글 수정
  const handleEdit = (
    id: number,
    text: string,
    isReply: boolean,
    parentId?: number,
  ) => {
    if (isReply && parentId) {
      setComments(
        comments.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === id ? { ...r, content: text } : r,
                ),
              }
            : c,
        ),
      );
    } else {
      setComments(
        comments.map((c) => (c.id === id ? { ...c, content: text } : c)),
      );
    }
  };

  // 댓글 삭제
  const handleDelete = (id: number, isReply: boolean, parentId?: number) => {
    if (isReply && parentId) {
      setComments(
        comments.map((c) =>
          c.id === parentId
            ? { ...c, replies: c.replies.filter((r) => r.id !== id) }
            : c,
        ),
      );
    } else {
      setComments(comments.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold">Comments</h2>

      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onReply={handlePostReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRequestReply={setReplyTo}
          replyToId={replyTo}
        />
      ))}

      <div className="mt-6 space-y-3">
        <Select onValueChange={(value) => setTag(value)}>
          <SelectTrigger className={`w-40 ${tagError ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fix">Fix</SelectItem>
            <SelectItem value="Question">Question</SelectItem>
            <SelectItem value="Comment">Comment</SelectItem>
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

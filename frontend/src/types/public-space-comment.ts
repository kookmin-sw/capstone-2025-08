export interface Reply {
  id: number;
  userId: number;
  name: string;
  avatar: string;
  tag: string;
  content: string;
  date: string;
  replyTo?: string;
}

export interface CommentType extends Reply {
  replies: Reply[];
}

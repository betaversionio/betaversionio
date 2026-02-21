export interface PostData {
  id: string;
  type: string;
  content: string;
  title: string | null;
  hashtags: string[];
  author: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
  reactions: Array<{ type: string; count: number; hasReacted: boolean }>;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

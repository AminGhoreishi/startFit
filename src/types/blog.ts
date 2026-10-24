import type mongoose from "mongoose";
import type { Document } from "mongoose";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  category: string;
  status: "published" | "draft" | "scheduled";
  publishDate?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  authorId: string;
  views: number;
  viewedUsers?: string[];
  likes?: number;
  likedUsers?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IBlog
  extends Omit<
      Blog,
      | "_id"
      | "authorId"
      | "viewedUsers"
      | "likedUsers"
      | "publishDate"
      | "createdAt"
      | "updatedAt"
    >,
    Document {
  authorId: mongoose.Types.ObjectId;
  viewedUsers?: mongoose.Types.ObjectId[];
  likedUsers?: mongoose.Types.ObjectId[];
  publishDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category: string;
  status: "published" | "draft" | "scheduled";
  publishDate?: string | null;
  authorId?: {
    _id: string;
    username: string;
    fullName?: string;
  } | null;
  views: number;
  createdAt: string;
}

export interface AdminBlogStats {
  totalViews: number;
  publishedCount: number;
  draftCount: number;
}

export interface ArticleStatsProps {
  stats: AdminBlogStats;
  totalCount: number;
}

export interface ArticleListProps {
  onStatsChange?: (stats: AdminBlogStats, totalCount: number) => void;
}

export interface AdminArticlesProps {
  stats: AdminBlogStats;
  totalCount: number;
}

export interface ArticleDetailAuthor {
  _id: string;
  username: string;
  fullName?: string;
  role?: string;
}

export interface ArticleDetailData extends Omit<Blog, "authorId"> {
  authorId?: ArticleDetailAuthor | null;
}

export interface ArticleCurrentUser {
  id: string;
  username: string;
  fullName?: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface ArticleDetailProps {
  article: ArticleDetailData;
  relatedArticles?: ArticleDetailData[];
  userId?: string | null;
  currentUser?: ArticleCurrentUser | null;
  isWished?: boolean;
  isLiked?: boolean;
  totalComments?: number;
}

export interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export interface CreateArticleFormInputs {
  title: string;
  category: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "scheduled";
  publishDate: string;
  seoTitle: string;
  seoDescription: string;
}

export interface ArticleAuthorInfo {
  fullName?: string;
  username?: string;
  role?: string;
}

export interface CKEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
}

export type ArticleSubmitStatus = "draft" | "published";

export interface UserProfileResponse {
  user?: ArticleAuthorInfo;
}

export interface CreateArticleProps {
  initialAuthor?: ArticleAuthorInfo | null;
}

export interface EditArticleProps {
  articleId?: string;
}

export type EditArticleFormInputs = CreateArticleFormInputs;

export interface PublicArticleItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  category: string;
  status: string;
  publishDate?: string | null;
  createdAt?: string;
  authorId?: {
    username?: string;
    fullName?: string;
  } | null;
}

export interface PublicArticlesProps {
  initialArticles?: PublicArticleItem[];
  initialTotal?: number;
  initialTotalPages?: number;
}

export interface ArticleCommentItem {
  _id?: string;
  name: string;
  text: string;
  avatar?: string;
  time?: string;
  createdAt?: string;
  likes?: number;
}

export interface ArticleCommentsApiResponse {
  success?: boolean;
  comments?: ArticleCommentItem[];
  totalCount?: number;
  message?: string;
}

export interface RelatedArticlesProps {
  relatedArticles: ArticleDetailData[];
}

export interface ArticleTagsProps {
  tags?: string[];
}

export interface ArticleAuthorCardProps {
  authorAvatar: string;
  authorName: string;
  authorRole: string;
}

export interface ArticleMainContentProps {
  authorAvatar: string;
  authorName: string;
  authorRole: string;
  publishDate?: string | Date;
  content: string;
  viewCount: number;
}

export interface ArticleActionsBarProps {
  articleId: string;
  articleTitle: string;
  userId?: string | null;
  initialLikeCount?: number;
  totalComments: number;
  isLiked?: boolean;
  isWished?: boolean;
}

export interface ArticleCommentsProps {
  articleId: string;
  userId?: string | null;
  initialTotalComments?: number;
  onCommentsCountChange?: (count: number) => void;
}

export interface OptimisticLikeState {
  liked: boolean;
  likeCount: number;
}




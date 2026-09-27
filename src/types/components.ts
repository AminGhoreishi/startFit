export interface BreadcrumbProps {
  packageName: string;
}

export interface FeatureItem {
  name: string;
  description?: string;
  included: boolean;
}

export interface PackageFeaturesProps {
  features: FeatureItem[];
}

export interface PricePriceObj {
  monthly: number;
}

export interface PriceCardProps {
  price: PricePriceObj;
  originalPrice?: number;
  discountPercent?: number;
  hasDiscount?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export interface HomeStats {
  todayUsersCount: string;
  trendText: string;
}

export interface HomeArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  readingTime: string;
  authorName: string;
  authorInitial: string;
  publishDate: string;
}

export interface LatestArticlesListProps {
  articles: HomeArticleItem[];
}

export interface HomeWorkoutPlanItem {
  id: string;
  slug?: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  icon: string;
  features: string[];
}

export interface WorkoutPlansProps {
  plans?: HomeWorkoutPlanItem[];
}

export interface HomeTemplateProps {
  articles: HomeArticleItem[];
  stats: HomeStats;
  plans?: HomeWorkoutPlanItem[];
}

export interface HeaderSessionUser {
  id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface HeaderSession {
  user: HeaderSessionUser;
}

export interface HeaderProps {
  user?: HeaderSessionUser | null;
  authSlot?: React.ReactNode;
  mobileAuthSlot?: React.ReactNode;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  role?: string;
  username?: string;
  email?: string;
  avatar?: string;
  mobileAuthSlot?: React.ReactNode;
  getLinkClass?: (href: string) => string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface UserDropdownProps {
  username?: string;
  avatar?: string;
  email?: string;
  role?: string;
}

export interface WhyChooseUsItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  badge: string;
  rating: number;
  comment: string;
  achievement: string;
}

export interface TestimonialCategoryOption {
  key: string;
  label: string;
}

export interface TestimonialStatItem {
  value: string;
  label: string;
  description: string;
}

export interface TestimonialsProps {
  testimonials?: TestimonialItem[];
}

export interface TestimonialsListProps {
  testimonials: TestimonialItem[];
}
export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive" | null;
  align?: "start" | "end";
}

export type BubbleContentProps = React.HTMLAttributes<HTMLDivElement>;
export type BubbleGroupProps = React.HTMLAttributes<HTMLDivElement>;
export type BubbleReactionsProps = React.HTMLAttributes<HTMLDivElement>;

export interface ShadcnPaginationProps extends React.ComponentProps<"nav"> {}
export interface ShadcnPaginationContentProps extends React.ComponentProps<"ul"> {}
export interface ShadcnPaginationItemProps extends React.ComponentProps<"li"> {}
export interface ShadcnPaginationLinkProps extends React.ComponentProps<"button"> {
  isActive?: boolean;
}
export interface ShadcnPaginationPreviousProps extends React.ComponentProps<"button"> {
  isActive?: boolean;
}
export interface ShadcnPaginationNextProps extends React.ComponentProps<"button"> {
  isActive?: boolean;
}
export interface ShadcnPaginationEllipsisProps extends React.ComponentProps<"span"> {}

export interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'author' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  token: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  postCount?: number;
}

// Post types
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt?: string;
  scheduledAt?: string;
  authorId: number;
  categoryId?: number;
  tags: string[];
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  readTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  allowComments: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  author: User;
  category?: Category;
}

export interface PostFormData {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: number;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  allowComments: boolean;
  isFeatured?: boolean;
}

// Comment types
export interface Comment {
  id: number;
  content: string;
  postId: number;
  authorId?: number;
  parentId?: number;
  guestName?: string;
  guestEmail?: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  ipAddress?: string;
  userAgent?: string;
  likesCount: number;
  dislikesCount: number;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  replies?: Comment[];
}

export interface CommentFormData {
  content: string;
  parentId?: number;
  guestName?: string;
  guestEmail?: string;
}

// Like types
export interface Like {
  id: number;
  userId: number;
  postId?: number;
  commentId?: number;
  type: 'like' | 'dislike';
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// SEO types
export interface SEOData {
  metaTags: {
    title: string;
    description?: string;
    keywords?: string;
    'og:title'?: string;
    'og:description'?: string;
    'og:type'?: string;
    'og:url'?: string;
    'og:image'?: string;
    'og:site_name'?: string;
    'twitter:card'?: string;
    'twitter:title'?: string;
    'twitter:description'?: string;
    'twitter:image'?: string;
    'article:author'?: string;
    'article:published_time'?: string;
    'article:modified_time'?: string;
    'article:section'?: string;
    'article:tag'?: string;
    canonical?: string;
    robots?: string;
  };
  schema?: any;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
}

export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Search and filter types
export interface SearchFilters {
  search?: string;
  category?: string;
  tag?: string;
  author?: string;
  status?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

// Admin dashboard types
export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalPosts: number;
    publishedPosts: number;
    totalComments: number;
    pendingComments: number;
    totalCategories: number;
    activeSessions: number;
  };
  recentActivity: {
    posts: number;
    comments: number;
    users: number;
  };
  growth: {
    users: number;
    posts: number;
    comments: number;
  };
  topAuthors: Array<User & { postCount: number }>;
  popularPosts: Array<Post & { viewCount: number }>;
  recentPosts: Post[];
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data?: T;
  loading: boolean;
  error?: string;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  children?: NavItem[];
  requireAuth?: boolean;
  roles?: User['role'][];
}

// Theme types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    sans: string;
    serif: string;
    mono: string;
  };
}
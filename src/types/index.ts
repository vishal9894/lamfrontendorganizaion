// TypeScript type definitions for zero runtime errors

// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// User types
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profile?: UserProfile;
  permissions?: Permission[];
}

export type UserRole = 'admin' | 'teacher' | 'student' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserProfile {
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// Course types
export interface Course extends BaseEntity {
  title: string;
  description: string;
  type: CourseType;
  status: CourseStatus;
  price: number;
  currency: string;
  duration: number; // in minutes
  level: CourseLevel;
  prerequisites?: string[];
  instructor?: User;
  thumbnail?: string;
  tags: string[];
  category: string;
  subcategory?: string;
  language: string;
  rating?: number;
  enrollmentCount: number;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
}

export type CourseType = 'regular_course' | 'ebook' | 'free_video_course' | 'free_pdf_course' | 'free_test_series';
export type CourseStatus = 'draft' | 'published' | 'archived' | 'deleted';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';

// Quiz types
export interface Quiz extends BaseEntity {
  title: string;
  description?: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: boolean;
  negativeMarks?: number;
  showSolution: boolean;
  randomizeQuestions: boolean;
  allowRetake: boolean;
  maxAttempts?: number;
  status: QuizStatus;
  questions: Question[];
  category?: string;
  difficulty: QuizDifficulty;
}

export type QuizStatus = 'draft' | 'published' | 'archived';
export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export interface Question extends BaseEntity {
  text: string;
  type: QuestionType;
  options?: Option[];
  correctAnswer: string | string[];
  explanation?: string;
  marks: number;
  category?: string;
  difficulty: QuizDifficulty;
  tags?: string[];
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

// Stream types
export interface Stream extends BaseEntity {
  title: string;
  description?: string;
  url: string;
  type: StreamType;
  status: StreamStatus;
  scheduledAt?: string;
  duration?: number;
  instructor?: User;
  maxParticipants?: number;
  currentParticipants: number;
  isRecorded: boolean;
  recordingUrl?: string;
  thumbnail?: string;
  tags: string[];
}

export type StreamType = 'live' | 'recorded' | 'upcoming';
export type StreamStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

// Event types
export interface Event extends BaseEntity {
  name: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  maxAttendees?: number;
  currentAttendees: number;
  price?: number;
  currency?: string;
  isFree: boolean;
  image?: string;
  tags: string[];
  organizer?: User;
  course?: Course;
}

export type EventType = 'webinar' | 'workshop' | 'conference' | 'meetup' | 'other';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// Enrollment types
export interface Enrollment extends BaseEntity {
  user: User;
  course: Course;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
  progress: number; // 0-100
  lastAccessedAt?: string;
  certificate?: Certificate;
  payment?: Payment;
}

export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'suspended' | 'refunded';

export interface Certificate extends BaseEntity {
  title: string;
  description?: string;
  issuedAt: string;
  expiresAt?: string;
  certificateUrl: string;
  verificationCode: string;
  grade?: string;
  score?: number;
}

// Payment types
export interface Payment extends BaseEntity {
  user: User;
  course?: Course;
  event?: Event;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  gateway?: PaymentGateway;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'wallet';
export type PaymentGateway = 'stripe' | 'paypal' | 'razorpay' | 'payu' | 'custom';

// Wallet types
export interface Wallet extends BaseEntity {
  user: User;
  balance: number;
  currency: string;
  lastTransactionAt?: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction extends BaseEntity {
  wallet: Wallet;
  type: TransactionType;
  amount: number;
  description?: string;
  reference?: string;
  status: TransactionStatus;
  metadata?: Record<string, any>;
}

export type TransactionType = 'credit' | 'debit' | 'refund' | 'bonus' | 'penalty';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

// Notification types
export interface Notification extends BaseEntity {
  user: User;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// File/Content types
export interface FileUpload extends BaseEntity {
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  uploadedBy: User;
  isPublic: boolean;
  metadata?: Record<string, any>;
}

export interface Content extends BaseEntity {
  title: string;
  type: ContentType;
  content: string;
  order: number;
  course: Course;
  parent?: Content;
  children?: Content[];
  isPublished: boolean;
  duration?: number;
  files?: FileUpload[];
  metadata?: Record<string, any>;
}

export type ContentType = 'lesson' | 'video' | 'text' | 'quiz' | 'assignment' | 'resource';

// Form types
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: FormOption[];
  validation?: ValidationRule[];
  defaultValue?: any;
  disabled?: boolean;
  readOnly?: boolean;
}

export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'file' | 'date' | 'time' | 'datetime' | 'range';

export interface FormOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

export type ValidationType = 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';

// Component props types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  validation?: ValidationRule[];
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: TablePagination;
  sorting?: TableSorting;
  filtering?: TableFiltering;
  selection?: TableSelection;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  onSortChange?: (sorting: TableSorting) => void;
  onFilterChange?: (filtering: TableFiltering) => void;
  onPageChange?: (page: number) => void;
  className?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TablePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TableSorting {
  key: keyof any;
  direction: 'asc' | 'desc';
}

export interface TableFiltering {
  filters: Record<string, any>;
  globalFilter?: string;
}

export interface TableSelection {
  selectedRows: any[];
  mode: 'single' | 'multiple';
}

// Hook return types
export interface UseApiResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  mutate: (variables: any) => Promise<T>;
  reset: () => void;
}

export interface UsePaginationResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

// Context types
export interface AppContextType {
  user: User | null;
  theme: 'light' | 'dark';
  language: string;
  notifications: Notification[];
  loading: boolean;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Event types
export interface CustomEventMap {
  'user:login': { user: User };
  'user:logout': {};
  'notification:new': { notification: Notification };
  'theme:change': { theme: 'light' | 'dark' };
  'error:occurred': { error: Error; context?: any };
  'course:enrolled': { enrollment: Enrollment };
  'quiz:completed': { quiz: Quiz; score: number };
}

// Export all types
export type {
  // Re-export commonly used types
  BaseEntity,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  User,
  Course,
  Quiz,
  Stream,
  Event,
  Enrollment,
  Payment,
  Wallet,
  Notification,
  Content,
  ButtonProps,
  InputProps,
  ModalProps,
  TableProps,
  UseApiResult,
  UsePaginationResult,
  AppContextType,
};

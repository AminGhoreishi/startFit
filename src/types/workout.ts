import type mongoose from "mongoose";
import type { Document } from "mongoose";

export interface UserInfo {
  _id: string;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface PackageInfo {
  _id: string;
  name: string;
  slug: string;
  colorClass: string;
  price?: {
    monthly: number;
  };
}

export interface PackageCardProps {
  pkg: PackageInfo;
  isSelected: boolean;
  onSelect: (pkg: PackageInfo) => void;
}

export interface DeletePlanButtonProps {
  planId: string;
  setSelectedProgramDay: (day: null) => void;
  mutatePlan: () => void;
  mutateProgram: () => void;
}

export interface SelectedPackageHeaderProps {
  selectedPackage: PackageInfo;
  subscriptionCount: number;
  setSelectedUser: (user: UserInfo | null) => void;
  workoutPlan: WorkoutPlan | null;
  setSelectedProgramDay: (day: null) => void;
  mutatePlan: () => void;
  mutateProgram: () => void;
}

export interface SubscriptionItem {
  _id: string;
  userId: UserInfo | null;
  packageId: PackageInfo | null;
  status: "trial" | "active" | "expired" | "cancelled";
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface SubscriptionsApiResponse {
  subscriptions: SubscriptionItem[];
  total: number;
  totalPages: number;
  stats?: {
    total: number;
    active: number;
    trial: number;
    expired: number;
  };
}

export interface IWeeklyAdvice {
  title?: string;
  description?: string;
  tips?: string[];
}

export interface WorkoutPlan {
  _id: string;
  packageId: string;
  userId?: string;
  subscriptionId?: string;
  title: string;
  description?: string;
  weeklyAdvice?: IWeeklyAdvice;
  isActive: boolean;
  programm?:
    | {
        _id?: string;
        planId: string;
        programs: ProgramDayItem[];
      }
    | {
        _id?: string;
        planId: string;
        programs: ProgramDayItem[];
      }[];
}

export interface WorkoutDay {
  _id: string;
  planId: string;
  userId?: string;
  dayName: string;
  muscleGroup: string;
  sortOrder: number;
}

export interface VideoInfo {
  _id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  level?: string;
  durationSec?: number;
  tags?: string[];
  createdAt?: string;
}

export interface ExerciseItem {
  _id: string;
  name: string;
  description?: string;
  sets: number;
  reps: string;
  weight?: number | string;
  restSec: number;
  videoId?: VideoInfo | null;
  videoId2?: VideoInfo | null;
  isComplete?: boolean;
}

export interface DayItem {
  _id: string;
  dayName: string;
  muscleGroup: string;
  exercises: ExerciseItem[];
}

export interface WorkoutPlanProps {
  plan: {
    _id: string;
    title: string;
    description?: string;
  } | null;
  days: DayItem[];
}

export interface IWorkoutPlan extends Document {
  packageId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  weeklyAdvice?: IWeeklyAdvice;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgramExercise {
  name: string;
  description?: string;
  videoId?: mongoose.Types.ObjectId | null;
  videoId2?: mongoose.Types.ObjectId | null;
  sets: number;
  reps?: string;
  weight?: number | string;
  restSec?: number;
  isComplete?: boolean;
}

export interface ProgramExerciseItem {
  _id?: string;
  name: string;
  description?: string;
  videoId?: string | null;
  videoId2?: string | null;
  sets: number;
  reps?: string;
  weight?: number | string;
  restSec?: number;
  isComplete?: boolean;
}

export interface ProgramExerciseCardProps {
  exercise: ProgramExerciseItem;
  index: number;
  videos: VideoInfo[];
  setWatchingVideo: (video: VideoInfo | null) => void;
}

export interface ProgramDayExercisesDetailProps {
  activeProgramDay: ProgramDayItem;
  onEditDay: (day: ProgramDayItem) => void;
  videos: VideoInfo[];
  setWatchingVideo: (video: VideoInfo | null) => void;
}

export interface IProgramDay {
  _id?: unknown;
  day: string;
  muscleGroup: string;
  exercises: IProgramExercise[];
}

export interface ProgramDayItem {
  _id?: string;
  day: string;
  muscleGroup: string;
  exercises: ProgramExerciseItem[];
}

export interface WorkoutProgramFormInputs {
  day: string;
  muscleGroup: string;
  exerciseInput?: string;
}

export interface WorkoutProgramFormProps {
  workoutPlanId: string;
  userId?: string;
  editingProgramDay?: ProgramDayItem | null;
  videos?: VideoInfo[];
  onSuccess: () => void;
  onCancel: () => void;
}

export interface ProgramDaysListProps {
  planId: string;
  programDays: ProgramDayItem[];
  selectedProgramDay: ProgramDayItem | null;
  onSelectProgramDay: (day: ProgramDayItem | null) => void;
  onEditProgramDay: (day: ProgramDayItem) => void;
  mutateProgram: () => void;
}

export interface IWorkoutProgram extends Document {
  planId: mongoose.Types.ObjectId;
  programs: IProgramDay[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkoutDay extends Document {
  planId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  dayName: string;
  muscleGroup: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutPlanFormInputs {
  title: string;
  description: string;
}

export interface WorkoutDayFormInputs {
  dayName: string;
  muscleGroup: string;
  sortOrder: number;
}

export interface EditSubscriptionFormInputs {
  status: SubscriptionItem["status"];
  endsAt: string;
}

export interface EditSubscriptionModalProps {
  selectedSubscription: SubscriptionItem;
  onClose: () => void;
  onSuccess: () => void;
}

export interface VideoPlayerModalProps {
  video: VideoInfo;
  onClose: () => void;
}

export interface WorkoutDayFormProps {
  editingDay: WorkoutDay | null;
  workoutPlanId: string;
  userId?: string;
  onSuccess: (updatedDay?: WorkoutDay) => void;
  onCancel: () => void;
  defaultSortOrder: number;
}

export interface SubscriptionsTableRef {
  refresh: () => void;
}

export interface SubscriptionsTableProps {
  onOpenPlanModal?: (pkg: PackageInfo) => void;
  onOpenMealPlanModal?: (pkg: PackageInfo) => void;
  onEdit: (sub: SubscriptionItem) => void;
  onStatsUpdate?: (stats: { total: number; active: number; trial: number; expired: number }) => void;
}

export interface UserFitnessProfileModalProps {
  userId: string;
  userName?: string;
  onClose: () => void;
}

export interface ExercisesListProps {
  exercises: ExerciseItem[];
  muscleGroup: string;
  userId?: string;
  dayId?: string;
}

export interface UserWorkoutDataResult {
  plan: WorkoutPlan | null;
  workoutDays: DayItem[];
}

export interface WorkoutViewProps {
  subscription?: {
    packageId?: {
      _id: string;
      name?: string;
      tagline?: string;
    };
  } | null;
  userId?: string;
  hasFitnessProfile?: boolean;
  initialPlan?: WorkoutPlan | null;
  initialWorkoutDays?: DayItem[];
}

export interface NoWorkoutPlanProps {
  hasFitnessProfile?: boolean;
}

export interface WorkoutHeaderProps {
  workoutPlan: WorkoutPlan;
  workoutDays: DayItem[];
  overallProgressPercent: number;
}

export interface WorkoutSummaryProps {
  totalExercises: number;
}

export interface SimpleWeek {
  _id?: string;
  id?: string;
  title: string;
  days: DayItem[];
}

export interface VideosManagementRef {
  fetchVideos: () => Promise<void>;
}

export interface VideosManagementProps {
  setShowUploadVideoModal?: (show: boolean) => void;
  setWatchingVideo: (video: VideoInfo | null) => void;
  onVideosUpdate?: (videos: VideoInfo[]) => void;
}

export interface CreateSubscriptionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  packages?: PackageInfo[];
  initialUser?: UserInfo | null;
}

export interface UploadVideoModalProps {
  onClose: () => void;
  onUploadSuccess: () => void;
}

export interface WorkoutErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export interface CreatePlanFormProps {
  selectedPackage: PackageInfo;
  selectedUser?: UserInfo | null;
  onSuccess: (plan: WorkoutPlan) => void;
}

export interface EditPlanInfoFormProps {
  workoutPlan: WorkoutPlan;
  onSuccess: (updatedPlan: WorkoutPlan) => void;
  onCancel: () => void;
}


export interface WorkoutDaysListProps {
  workoutDays: WorkoutDay[];
  selectedDay: WorkoutDay | null;
  onSelectDay: (day: WorkoutDay | null) => void;
  onEditDay: (day: WorkoutDay) => void;
  onDayDeleted?: () => void;
  onDeleteDay?: (id: string) => void;
}

export interface UserSearchInputProps {
  setSelectedUser: (user: UserInfo | null) => void;
  placeholder?: string;
}

export interface AddWorkoutDropdownProps {
  packageId?: string;
  workoutPlanId?: string;
  userId?: string;
  onAddNewDay: () => void;
}

export interface UserWorkoutDaysGridProps {
  workoutDays: DayItem[];
  activeDayId: string;
  onSelectDayId: (dayId: string) => void;
}

export interface WorkoutDayHeaderProps {
  dayName: string;
  muscleGroup: string;
  totalExercises: number;
}

export interface WeeklyAdviceProps {
  advice?: IWeeklyAdvice;
}


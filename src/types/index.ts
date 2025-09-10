// 基本的な型定義
export interface Exercise {
  id: string;
  name: string;
  caloriesPerRep: number;
  muscleGroup: string;
  category: string;
  isCustom?: boolean;
  description?: string;
}

export interface WorkoutExercise extends Exercise {
  sets: number;
  reps: number;
  weight: number;
  calories: number;
  restTime?: number; // 秒
  notes?: string;
}

export interface Workout {
  id: string;
  date: string;
  exercises: WorkoutExercise[];
  totalCalories: number;
  duration?: number; // 分
  notes?: string;
}

// ユーザープロフィール
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: string[];
  createdAt: string;
  updatedAt: string;
}

// 基礎代謝計算結果
export interface BMRResult {
  bmr: number; // 基礎代謝量
  tdee: number; // 総消費エネルギー量
  bmi: number; // BMI
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
}

// 設定
export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'ja' | 'en';
  units: {
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
  };
  notifications: {
    workoutReminder: boolean;
    goalAchievement: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
  };
}

// データベース操作の型
export interface DatabaseOperations {
  // ワークアウト
  createWorkout: (workout: Omit<Workout, 'id'>) => Promise<Workout>;
  getWorkouts: (limit?: number, offset?: number) => Promise<Workout[]>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<Workout>;
  deleteWorkout: (id: string) => Promise<void>;

  // エクササイズ
  createExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>;
  getExercises: () => Promise<Exercise[]>;
  updateExercise: (id: string, exercise: Partial<Exercise>) => Promise<Exercise>;
  deleteExercise: (id: string) => Promise<void>;

  // ユーザープロフィール
  createProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UserProfile>;
  getProfile: () => Promise<UserProfile | null>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<UserProfile>;

  // 設定
  getSettings: () => Promise<AppSettings>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
}

// Zustand状態管理の型
export interface WorkoutStore {
  // 状態
  workouts: Workout[];
  currentWorkout: Partial<Workout>;
  exercises: Exercise[];
  profile: UserProfile | null;
  settings: AppSettings;
  
  // アクション
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  setCurrentWorkout: (workout: Partial<Workout>) => void;
  
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  
  setProfile: (profile: UserProfile) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // 計算メソッド
  calculateBMR: (profile: UserProfile) => BMRResult;
  getRecommendations: () => string[];
  getWorkoutStats: () => {
    totalWorkouts: number;
    totalCalories: number;
    avgCaloriesPerWorkout: number;
    weeklyStats: { week: string; workouts: number; calories: number }[];
  };
}

// API レスポンスの型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// フォームの型
export interface WorkoutForm {
  date: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
    restTime?: number;
    notes?: string;
  }[];
  duration?: number;
  notes?: string;
}

export interface ExerciseForm {
  name: string;
  muscleGroup: string;
  category: string;
  caloriesPerRep: number;
  description?: string;
}

export interface ProfileForm {
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: string[];
}

// コンポーネントのProps型
export interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;
}

export interface WorkoutCardProps {
  workout: Workout;
  onEdit?: (workout: Workout) => void;
  onDelete?: (workoutId: string) => void;
  onView?: (workout: Workout) => void;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// ユーティリティ型
export type ViewMode = 'home' | 'workout' | 'history' | 'exercises' | 'profile' | 'settings';

export type MuscleGroup = '胸' | '背中' | '脚' | '腕' | '肩' | '腹筋' | '有酸素';

export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'sports' | 'custom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutStore, Workout, Exercise, UserProfile, AppSettings, BMRResult } from '../types';

// デフォルトエクササイズデータ
const defaultExercises: Exercise[] = [
  // 胸
  { id: '1', name: 'ベンチプレス', caloriesPerRep: 0.8, muscleGroup: '胸', category: 'strength' },
  { id: '2', name: 'プッシュアップ', caloriesPerRep: 0.5, muscleGroup: '胸', category: 'strength' },
  { id: '3', name: 'ダンベルフライ', caloriesPerRep: 0.6, muscleGroup: '胸', category: 'strength' },
  { id: '4', name: 'インクラインプレス', caloriesPerRep: 0.7, muscleGroup: '胸', category: 'strength' },
  
  // 背中
  { id: '5', name: 'デッドリフト', caloriesPerRep: 1.0, muscleGroup: '背中', category: 'strength' },
  { id: '6', name: 'プルアップ', caloriesPerRep: 0.7, muscleGroup: '背中', category: 'strength' },
  { id: '7', name: 'ベントオーバーロー', caloriesPerRep: 0.8, muscleGroup: '背中', category: 'strength' },
  { id: '8', name: 'ラットプルダウン', caloriesPerRep: 0.6, muscleGroup: '背中', category: 'strength' },
  
  // 脚
  { id: '9', name: 'スクワット', caloriesPerRep: 0.9, muscleGroup: '脚', category: 'strength' },
  { id: '10', name: 'レッグプレス', caloriesPerRep: 0.7, muscleGroup: '脚', category: 'strength' },
  { id: '11', name: 'ランジ', caloriesPerRep: 0.6, muscleGroup: '脚', category: 'strength' },
  { id: '12', name: 'カーフレイズ', caloriesPerRep: 0.3, muscleGroup: '脚', category: 'strength' },
  
  // 腕
  { id: '13', name: 'バーベルカール', caloriesPerRep: 0.4, muscleGroup: '腕', category: 'strength' },
  { id: '14', name: 'トライセップスプレス', caloriesPerRep: 0.5, muscleGroup: '腕', category: 'strength' },
  { id: '15', name: 'ハンマーカール', caloriesPerRep: 0.4, muscleGroup: '腕', category: 'strength' },
  { id: '16', name: 'ディップス', caloriesPerRep: 0.6, muscleGroup: '腕', category: 'strength' },
  
  // 肩
  { id: '17', name: 'ショルダープレス', caloriesPerRep: 0.6, muscleGroup: '肩', category: 'strength' },
  { id: '18', name: 'サイドレイズ', caloriesPerRep: 0.3, muscleGroup: '肩', category: 'strength' },
  { id: '19', name: 'リアデルトフライ', caloriesPerRep: 0.4, muscleGroup: '肩', category: 'strength' },
  { id: '20', name: 'アップライトロー', caloriesPerRep: 0.5, muscleGroup: '肩', category: 'strength' },
  
  // 腹筋
  { id: '21', name: 'クランチ', caloriesPerRep: 0.2, muscleGroup: '腹筋', category: 'strength' },
  { id: '22', name: 'プランク', caloriesPerRep: 0.3, muscleGroup: '腹筋', category: 'strength' },
  { id: '23', name: 'レッグレイズ', caloriesPerRep: 0.25, muscleGroup: '腹筋', category: 'strength' },
  
  // 有酸素
  { id: '24', name: 'ランニング', caloriesPerRep: 8.0, muscleGroup: '有酸素', category: 'cardio' },
  { id: '25', name: 'サイクリング', caloriesPerRep: 6.0, muscleGroup: '有酸素', category: 'cardio' },
  { id: '26', name: 'ウォーキング', caloriesPerRep: 4.0, muscleGroup: '有酸素', category: 'cardio' },
];

// デフォルト設定
const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'ja',
  units: {
    weight: 'kg',
    height: 'cm',
  },
  notifications: {
    workoutReminder: true,
    goalAchievement: true,
  },
  privacy: {
    dataSharing: false,
    analytics: true,
  },
};

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      workouts: [],
      currentWorkout: {},
      exercises: defaultExercises,
      profile: null,
      settings: defaultSettings,

      // ワークアウト関連のアクション
      addWorkout: (workout) => {
        const newWorkout: Workout = {
          ...workout,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          workouts: [...state.workouts, newWorkout],
          currentWorkout: {},
        }));
      },

      updateWorkout: (id, updatedWorkout) => {
        set((state) => ({
          workouts: state.workouts.map((workout) =>
            workout.id === id ? { ...workout, ...updatedWorkout } : workout
          ),
        }));
      },

      deleteWorkout: (id) => {
        set((state) => ({
          workouts: state.workouts.filter((workout) => workout.id !== id),
        }));
      },

      setCurrentWorkout: (workout) => {
        set({ currentWorkout: workout });
      },

      // エクササイズ関連のアクション
      addExercise: (exercise) => {
        const newExercise: Exercise = {
          ...exercise,
          id: crypto.randomUUID(),
          isCustom: true,
        };
        set((state) => ({
          exercises: [...state.exercises, newExercise],
        }));
      },

      updateExercise: (id, updatedExercise) => {
        set((state) => ({
          exercises: state.exercises.map((exercise) =>
            exercise.id === id ? { ...exercise, ...updatedExercise } : exercise
          ),
        }));
      },

      deleteExercise: (id) => {
        set((state) => ({
          exercises: state.exercises.filter((exercise) => exercise.id !== id),
        }));
      },

      // プロフィール関連のアクション
      setProfile: (profile) => {
        set({ profile });
      },

      updateProfile: (updatedProfile) => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...updatedProfile, updatedAt: new Date().toISOString() }
            : null,
        }));
      },

      // 設定関連のアクション
      updateSettings: (updatedSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...updatedSettings },
        }));
      },

      // 計算メソッド
      calculateBMR: (profile: UserProfile): BMRResult => {
        // Harris-Benedict式を使用
        let bmr: number;
        if (profile.gender === 'male') {
          bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
        } else {
          bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
        }

        // 活動レベルによる調整
        const activityMultipliers = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          very_active: 1.9,
        };

        const tdee = bmr * activityMultipliers[profile.activityLevel];

        // BMI計算
        const heightInM = profile.height / 100;
        const bmi = profile.weight / (heightInM * heightInM);

        // BMIカテゴリー判定
        let bmiCategory: BMRResult['bmiCategory'];
        if (bmi < 18.5) bmiCategory = 'underweight';
        else if (bmi < 25) bmiCategory = 'normal';
        else if (bmi < 30) bmiCategory = 'overweight';
        else bmiCategory = 'obese';

        return {
          bmr: Math.round(bmr),
          tdee: Math.round(tdee),
          bmi: Math.round(bmi * 10) / 10,
          bmiCategory,
        };
      },

      getRecommendations: () => {
        const { workouts } = get();
        if (workouts.length === 0) return ['胸', '背中', '脚'];

        // 過去30日のデータを分析
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentWorkouts = workouts.filter(workout =>
          new Date(workout.date) >= thirtyDaysAgo
        );

        // 部位別の頻度を計算
        const muscleGroupFreq: Record<string, number> = {};
        recentWorkouts.forEach(workout => {
          workout.exercises.forEach(exercise => {
            muscleGroupFreq[exercise.muscleGroup] =
              (muscleGroupFreq[exercise.muscleGroup] || 0) + 1;
          });
        });

        // 最も頻度の低い部位を推奨
        const sortedGroups = Object.entries(muscleGroupFreq)
          .sort(([, a], [, b]) => a - b);

        if (sortedGroups.length === 0) {
          return ['胸', '背中', '脚'];
        }

        return sortedGroups.slice(0, 3).map(([group]) => group);
      },

      getWorkoutStats: () => {
        const { workouts } = get();
        const totalCalories = workouts.reduce((sum, workout) => sum + workout.totalCalories, 0);
        const totalWorkouts = workouts.length;
        const avgCaloriesPerWorkout = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

        // 週別統計を計算
        const weeklyStats: { week: string; workouts: number; calories: number }[] = [];
        const last8Weeks = Array.from({ length: 8 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (i * 7));
          return date;
        }).reverse();

        last8Weeks.forEach(weekStart => {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          const weekWorkouts = workouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= weekStart && workoutDate <= weekEnd;
          });

          weeklyStats.push({
            week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
            workouts: weekWorkouts.length,
            calories: weekWorkouts.reduce((sum, w) => sum + w.totalCalories, 0),
          });
        });

        return {
          totalWorkouts,
          totalCalories,
          avgCaloriesPerWorkout,
          weeklyStats,
        };
      },
    }),
    {
      name: 'workout-storage',
      partialize: (state) => ({
        workouts: state.workouts,
        exercises: state.exercises,
        profile: state.profile,
        settings: state.settings,
      }),
    }
  )
);
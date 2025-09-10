import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  Plus, 
  Save, 
  Target, 
  User,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Weight,
  Activity,
  BarChart3,
  Edit3,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useWorkoutStore } from './store/useWorkoutStore';
import { ViewMode, Exercise, WorkoutExercise, UserProfile } from './types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const WorkoutApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const {
    workouts,
    currentWorkout,
    exercises,
    profile,
    settings,
    addWorkout,
    setCurrentWorkout,
    addExercise,
    updateExercise,
    deleteExercise,
    setProfile,
    updateProfile,
    updateSettings,
    calculateBMR,
    getRecommendations,
    getWorkoutStats,
  } = useWorkoutStore();

  // ダークモード設定の初期化
  useEffect(() => {
    setIsDarkMode(settings.theme === 'dark');
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // ダークモード切り替え
  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    updateSettings({ theme: newTheme });
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  // カロリー計算
  const calculateCalories = (exercise: Exercise, sets: number, reps: number, weight: number): number => {
    const baseCalories = exercise.caloriesPerRep * sets * reps;
    const weightMultiplier = Math.max(1, weight / 20);
    return Math.round(baseCalories * weightMultiplier);
  };

  // ワークアウト保存
  const saveWorkout = () => {
    if (!currentWorkout.exercises || currentWorkout.exercises.length === 0) {
      alert('エクササイズを追加してください');
      return;
    }

    const totalCalories = currentWorkout.exercises.reduce((sum, ex) => sum + ex.calories, 0);
    
    addWorkout({
      date: currentWorkout.date || selectedDate,
      exercises: currentWorkout.exercises,
      totalCalories,
      duration: currentWorkout.duration,
      notes: currentWorkout.notes,
    });

    alert('ワークアウトを保存しました！');
    setCurrentWorkout({});
  };

  // エクササイズをワークアウトに追加
  const addExerciseToWorkout = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      ...exercise,
      sets: 1,
      reps: 10,
      weight: 20,
      calories: calculateCalories(exercise, 1, 10, 20),
    };
    
    setCurrentWorkout({
      ...currentWorkout,
      date: selectedDate,
      exercises: [...(currentWorkout.exercises || []), newExercise],
    });
  };

  // エクササイズデータ更新
  const updateWorkoutExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    if (!currentWorkout.exercises) return;

    const updatedExercises = [...currentWorkout.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    
    // セット数、回数、重量が変更された場合はカロリーを再計算
    if (['sets', 'reps', 'weight'].includes(field)) {
      const exercise = updatedExercises[index];
      updatedExercises[index].calories = calculateCalories(
        exercise, 
        exercise.sets, 
        exercise.reps, 
        exercise.weight
      );
    }
    
    setCurrentWorkout({
      ...currentWorkout,
      exercises: updatedExercises,
    });
  };

  // 統計データを取得
  const stats = getWorkoutStats();
  const recommendations = getRecommendations();
  const bmrData = profile ? calculateBMR(profile) : null;

  // ホーム画面コンポーネント
  const HomeView: React.FC = () => (
    <div className="space-y-6">
      {/* ウェルカムセクション */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">
          {profile ? `${profile.name}さん、今日も頑張りましょう！` : '今日も頑張りましょう！'}
        </h2>
        <p className="opacity-90">あなたの筋トレをサポートします</p>
        {!profile && (
          <button
            onClick={() => setCurrentView('profile')}
            className="mt-3 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
          >
            プロフィールを設定する
          </button>
        )}
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">総ワークアウト数</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalWorkouts}</p>
            </div>
            <Dumbbell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">総消費カロリー</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalCalories}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">平均カロリー/回</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgCaloriesPerWorkout}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        {bmrData && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">基礎代謝</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{bmrData.bmr}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">kcal/日</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        )}
      </div>

      {/* BMI情報 */}
      {bmrData && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
          <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">健康指標</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">BMI</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{bmrData.bmi}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {bmrData.bmiCategory === 'normal' && '標準'}
                {bmrData.bmiCategory === 'underweight' && '低体重'}
                {bmrData.bmiCategory === 'overweight' && '過体重'}
                {bmrData.bmiCategory === 'obese' && '肥満'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">基礎代謝</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{bmrData.bmr}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">kcal/日</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">総消費カロリー</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{bmrData.tdee}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">kcal/日</p>
            </div>
          </div>
        </div>
      )}

      {/* 推奨部位 */}
      {recommendations.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🎯 今日の推奨部位</h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            最近の記録から、<strong>{recommendations.join('、')}</strong>のトレーニングがおすすめです！
          </p>
        </div>
      )}
    </div>
  );

  // 残りのコンポーネントは次のコメントで続きます...
  
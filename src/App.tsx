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
import { ViewMode, Exercise, WorkoutExercise, UserProfile, ProfileForm, ExerciseForm } from './types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const WorkoutApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

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

  // プロフィール画面コンポーネント
  const ProfileView: React.FC = () => {
    const [profileForm, setProfileForm] = useState<ProfileForm>({
      name: profile?.name || '',
      age: profile?.age || 30,
      gender: profile?.gender || 'male',
      height: profile?.height || 170,
      weight: profile?.weight || 70,
      activityLevel: profile?.activityLevel || 'moderate',
      goals: profile?.goals || [],
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (profile) {
        updateProfile(profileForm);
      } else {
        const newProfile: UserProfile = {
          ...profileForm,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProfile(newProfile);
      }
      setIsEditingProfile(false);
      alert('プロフィールを保存しました！');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">プロフィール</h2>
          {profile && !isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              編集
            </button>
          )}
        </div>

        {!profile || isEditingProfile ? (
          <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  名前
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  年齢
                </label>
                <input
                  type="number"
                  value={profileForm.age}
                  onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  性別
                </label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value as 'male' | 'female' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  身長 (cm)
                </label>
                <input
                  type="number"
                  value={profileForm.height}
                  onChange={(e) => setProfileForm({ ...profileForm, height: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="100"
                  max="250"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  体重 (kg)
                </label>
                <input
                  type="number"
                  value={profileForm.weight}
                  onChange={(e) => setProfileForm({ ...profileForm, weight: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="30"
                  max="300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  活動レベル
                </label>
                <select
                  value={profileForm.activityLevel}
                  onChange={(e) => setProfileForm({ ...profileForm, activityLevel: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="sedentary">座りがち</option>
                  <option value="light">軽い活動</option>
                  <option value="moderate">適度な活動</option>
                  <option value="active">活発</option>
                  <option value="very_active">非常に活発</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                保存
              </button>
              {isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">基本情報</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">名前: </span>
                    <span className="text-gray-800 dark:text-gray-200">{profile.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">年齢: </span>
                    <span className="text-gray-800 dark:text-gray-200">{profile.age}歳</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">性別: </span>
                    <span className="text-gray-800 dark:text-gray-200">{profile.gender === 'male' ? '男性' : '女性'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">身長: </span>
                    <span className="text-gray-800 dark:text-gray-200">{profile.height}cm</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">体重: </span>
                    <span className="text-gray-800 dark:text-gray-200">{profile.weight}kg</span>
                  </div>
                </div>
              </div>

              {bmrData && (
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">健康指標</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">BMI: </span>
                      <span className="text-gray-800 dark:text-gray-200">{bmrData.bmi}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({bmrData.bmiCategory === 'normal' && '標準'}
                        {bmrData.bmiCategory === 'underweight' && '低体重'}
                        {bmrData.bmiCategory === 'overweight' && '過体重'}
                        {bmrData.bmiCategory === 'obese' && '肥満'})
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">基礎代謝量: </span>
                      <span className="text-gray-800 dark:text-gray-200">{bmrData.bmr} kcal/日</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">総消費カロリー: </span>
                      <span className="text-gray-800 dark:text-gray-200">{bmrData.tdee} kcal/日</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // エクササイズ管理画面コンポーネント
  const ExerciseView: React.FC = () => {
    const [exerciseForm, setExerciseForm] = useState<ExerciseForm>({
      name: '',
      muscleGroup: '胸',
      category: 'strength',
      caloriesPerRep: 0.5,
      description: '',
    });

    const handleExerciseSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingExercise) {
        updateExercise(editingExercise.id, exerciseForm);
        setEditingExercise(null);
      } else {
        addExercise(exerciseForm);
      }
      setExerciseForm({
        name: '',
        muscleGroup: '胸',
        category: 'strength',
        caloriesPerRep: 0.5,
        description: '',
      });
      setShowExerciseForm(false);
      alert('エクササイズを保存しました！');
    };

    const handleEditExercise = (exercise: Exercise) => {
      setExerciseForm({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        category: exercise.category,
        caloriesPerRep: exercise.caloriesPerRep,
        description: exercise.description || '',
      });
      setEditingExercise(exercise);
      setShowExerciseForm(true);
    };

    const handleDeleteExercise = (exerciseId: string) => {
      if (confirm('このエクササイズを削除しますか？')) {
        deleteExercise(exerciseId);
      }
    };

    // 部位別にエクササイズをグループ化
    const exercisesByMuscleGroup = exercises.reduce((acc, exercise) => {
      if (!acc[exercise.muscleGroup]) {
        acc[exercise.muscleGroup] = [];
      }
      acc[exercise.muscleGroup].push(exercise);
      return acc;
    }, {} as Record<string, Exercise[]>);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">エクササイズ管理</h2>
          <button
            onClick={() => setShowExerciseForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            新しいエクササイズ
          </button>
        </div>

        {/* エクササイズ追加/編集フォーム */}
        {showExerciseForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {editingExercise ? 'エクササイズを編集' : '新しいエクササイズを追加'}
            </h3>
            <form onSubmit={handleExerciseSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    エクササイズ名
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.name}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    部位
                  </label>
                  <select
                    value={exerciseForm.muscleGroup}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, muscleGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="胸">胸</option>
                    <option value="背中">背中</option>
                    <option value="脚">脚</option>
                    <option value="腕">腕</option>
                    <option value="肩">肩</option>
                    <option value="腹筋">腹筋</option>
                    <option value="有酸素">有酸素</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    カテゴリー
                  </label>
                  <select
                    value={exerciseForm.category}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="strength">筋力トレーニング</option>
                    <option value="cardio">有酸素運動</option>
                    <option value="flexibility">柔軟性</option>
                    <option value="sports">スポーツ</option>
                    <option value="custom">カスタム</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    1回あたりの消費カロリー
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={exerciseForm.caloriesPerRep}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, caloriesPerRep: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    min="0"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    説明（任意）
                  </label>
                  <textarea
                    value={exerciseForm.description}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExerciseForm(false);
                    setEditingExercise(null);
                    setExerciseForm({
                      name: '',
                      muscleGroup: '胸',
                      category: 'strength',
                      caloriesPerRep: 0.5,
                      description: '',
                    });
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* エクササイズ一覧 */}
        <div className="space-y-4">
          {Object.entries(exercisesByMuscleGroup).map(([muscleGroup, exerciseList]) => (
            <div key={muscleGroup} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">{muscleGroup}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {exerciseList.map((exercise) => (
                  <div key={exercise.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{exercise.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {exercise.caloriesPerRep} kcal/rep
                        </p>
                        {exercise.isCustom && (
                          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded mt-1">
                            カスタム
                          </span>
                        )}
                      </div>
                      {exercise.isCustom && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditExercise(exercise)}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 rounded"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExercise(exercise.id)}
                            className="p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 残りのコンポーネント（ワークアウト画面、履歴画面、設定画面）と
  // メインのレンダリング部分は次のファイルで続きます...

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        {/* ヘッダー */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">💪 筋トレ記録アプリ</h1>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* ナビゲーション */}
          <div className="flex space-x-1 mb-6 bg-white dark:bg-gray-800 p-1 rounded-lg shadow overflow-x-auto">
            {[
              { id: 'home', label: 'ホーム', icon: TrendingUp },
              { id: 'workout', label: 'ワークアウト', icon: Dumbbell },
              { id: 'history', label: '履歴', icon: Calendar },
              { id: 'exercises', label: 'エクササイズ', icon: BarChart3 },
              { id: 'profile', label: 'プロフィール', icon: User },
              { id: 'settings', label: '設定', icon: SettingsIcon },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as ViewMode)}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded transition-colors whitespace-nowrap ${
                  currentView === id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>

          {/* メインコンテンツ */}
          {currentView === 'home' && <HomeView />}
          {currentView === 'profile' && <ProfileView />}
          {currentView === 'exercises' && <ExerciseView />}
          {/* 他の画面は次のファイルで実装予定 */}
        </div>
      </div>
    </div>
  );
};

export default WorkoutApp;
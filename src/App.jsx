import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, TrendingUp, Plus, Save, Target } from 'lucide-react';

const WorkoutApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [workoutData, setWorkoutData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWorkout, setCurrentWorkout] = useState({
    date: selectedDate,
    exercises: []
  });

  // トレーニングメニューデータ
  const exerciseDatabase = {
    chest: [
      { name: 'ベンチプレス', caloriesPerRep: 0.8, muscleGroup: '胸' },
      { name: 'プッシュアップ', caloriesPerRep: 0.5, muscleGroup: '胸' },
      { name: 'ダンベルフライ', caloriesPerRep: 0.6, muscleGroup: '胸' },
      { name: 'インクラインプレス', caloriesPerRep: 0.7, muscleGroup: '胸' }
    ],
    back: [
      { name: 'デッドリフト', caloriesPerRep: 1.0, muscleGroup: '背中' },
      { name: 'プルアップ', caloriesPerRep: 0.7, muscleGroup: '背中' },
      { name: 'ベントオーバーロー', caloriesPerRep: 0.8, muscleGroup: '背中' },
      { name: 'ラットプルダウン', caloriesPerRep: 0.6, muscleGroup: '背中' }
    ],
    legs: [
      { name: 'スクワット', caloriesPerRep: 0.9, muscleGroup: '脚' },
      { name: 'レッグプレス', caloriesPerRep: 0.7, muscleGroup: '脚' },
      { name: 'ランジ', caloriesPerRep: 0.6, muscleGroup: '脚' },
      { name: 'カーフレイズ', caloriesPerRep: 0.3, muscleGroup: '脚' }
    ],
    arms: [
      { name: 'バーベルカール', caloriesPerRep: 0.4, muscleGroup: '腕' },
      { name: 'トライセップスプレス', caloriesPerRep: 0.5, muscleGroup: '腕' },
      { name: 'ハンマーカール', caloriesPerRep: 0.4, muscleGroup: '腕' },
      { name: 'ディップス', caloriesPerRep: 0.6, muscleGroup: '腕' }
    ],
    shoulders: [
      { name: 'ショルダープレス', caloriesPerRep: 0.6, muscleGroup: '肩' },
      { name: 'サイドレイズ', caloriesPerRep: 0.3, muscleGroup: '肩' },
      { name: 'リアデルトフライ', caloriesPerRep: 0.4, muscleGroup: '肩' },
      { name: 'アップライトロー', caloriesPerRep: 0.5, muscleGroup: '肩' }
    ]
  };

  // ローカルストレージからデータを読み込み
  useEffect(() => {
    const savedData = localStorage.getItem('workoutData');
    if (savedData) {
      setWorkoutData(JSON.parse(savedData));
    }
  }, []);

  // データをローカルストレージに保存
  const saveWorkoutData = (data) => {
    localStorage.setItem('workoutData', JSON.stringify(data));
    setWorkoutData(data);
  };

  // カロリー計算
  const calculateCalories = (exercise, sets, reps, weight) => {
    const baseCalories = exercise.caloriesPerRep * sets * reps;
    const weightMultiplier = Math.max(1, weight / 20); // 20kgを基準とした重量補正
    return Math.round(baseCalories * weightMultiplier);
  };

  // ワークアウト保存
  const saveWorkout = () => {
    if (currentWorkout.exercises.length === 0) {
      alert('エクササイズを追加してください');
      return;
    }

    const newData = [...workoutData];
    const existingIndex = newData.findIndex(w => w.date === currentWorkout.date);
    
    if (existingIndex >= 0) {
      newData[existingIndex] = currentWorkout;
    } else {
      newData.push(currentWorkout);
    }
    
    saveWorkoutData(newData);
    alert('ワークアウトを保存しました！');
    setCurrentWorkout({ date: selectedDate, exercises: [] });
  };

  // エクササイズ追加
  const addExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      sets: 1,
      reps: 10,
      weight: 20,
      calories: calculateCalories(exercise, 1, 10, 20)
    };
    
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  // エクササイズ更新
  const updateExercise = (index, field, value) => {
    const updatedExercises = [...currentWorkout.exercises];
    updatedExercises[index][field] = parseInt(value) || 0;
    
    // カロリー再計算
    const exercise = updatedExercises[index];
    updatedExercises[index].calories = calculateCalories(
      exercise, 
      exercise.sets, 
      exercise.reps, 
      exercise.weight
    );
    
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: updatedExercises
    }));
  };

  // 自動提案機能
  const getRecommendations = () => {
    if (workoutData.length === 0) return [];
    
    // 過去30日のデータを分析
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentWorkouts = workoutData.filter(workout => 
      new Date(workout.date) >= thirtyDaysAgo
    );
    
    // 部位別の頻度を計算
    const muscleGroupFreq = {};
    recentWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        muscleGroupFreq[exercise.muscleGroup] = 
          (muscleGroupFreq[exercise.muscleGroup] || 0) + 1;
      });
    });
    
    // 最も頻度の低い部位を推奨
    const sortedGroups = Object.entries(muscleGroupFreq)
      .sort(([,a], [,b]) => a - b);
    
    if (sortedGroups.length === 0) {
      return ['胸', '背中', '脚']; // デフォルト推奨
    }
    
    return sortedGroups.slice(0, 3).map(([group]) => group);
  };

  // 統計計算
  const getStats = () => {
    const totalCalories = workoutData.reduce((sum, workout) => 
      sum + workout.exercises.reduce((exSum, ex) => exSum + ex.calories, 0), 0
    );
    
    const totalWorkouts = workoutData.length;
    const avgCaloriesPerWorkout = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;
    
    return { totalCalories, totalWorkouts, avgCaloriesPerWorkout };
  };

  const stats = getStats();
  const recommendations = getRecommendations();

  // ホーム画面
  const HomeView = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">今日も頑張りましょう！</h2>
        <p className="opacity-90">あなたの筋トレをサポートします</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総ワークアウト数</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalWorkouts}</p>
            </div>
            <Dumbbell className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総消費カロリー</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalCalories}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均カロリー/回</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgCaloriesPerWorkout}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🎯 今日の推奨部位</h3>
          <p className="text-yellow-700">
            最近の記録から、<strong>{recommendations.join('、')}</strong>のトレーニングがおすすめです！
          </p>
        </div>
      )}
    </div>
  );

  // ワークアウト記録画面
  const WorkoutView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">ワークアウト記録</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setCurrentWorkout(prev => ({ ...prev, date: e.target.value }));
          }}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      {/* 部位選択 */}
      <div className="space-y-4">
        {Object.entries(exerciseDatabase).map(([category, exercises]) => (
          <div key={category} className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold mb-3 capitalize">
              {category === 'chest' && '胸'}
              {category === 'back' && '背中'}
              {category === 'legs' && '脚'}
              {category === 'arms' && '腕'}
              {category === 'shoulders' && '肩'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {exercises.map((exercise, idx) => (
                <button
                  key={idx}
                  onClick={() => addExercise(exercise)}
                  className="flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {exercise.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 現在のワークアウト */}
      {currentWorkout.exercises.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">今日のワークアウト</h3>
          <div className="space-y-3">
            {currentWorkout.exercises.map((exercise, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-sm text-gray-600">{exercise.calories} kcal</p>
                </div>
                <div className="flex space-x-2">
                  <div>
                    <label className="block text-xs text-gray-600">セット</label>
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(idx, 'sets', e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">回数</label>
                    <input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(idx, 'reps', e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">重量(kg)</label>
                    <input
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(idx, 'weight', e.target.value)}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-lg font-semibold">
              総消費カロリー: {currentWorkout.exercises.reduce((sum, ex) => sum + ex.calories, 0)} kcal
            </div>
            <button
              onClick={saveWorkout}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 履歴画面
  const HistoryView = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">ワークアウト履歴</h2>
      {workoutData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">まだワークアウトの記録がありません</p>
      ) : (
        <div className="space-y-3">
          {workoutData.sort((a, b) => new Date(b.date) - new Date(a.date)).map((workout, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold">{new Date(workout.date).toLocaleDateString('ja-JP')}</h3>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {workout.exercises.reduce((sum, ex) => sum + ex.calories, 0)} kcal
                </span>
              </div>
              <div className="space-y-2">
                {workout.exercises.map((exercise, exIdx) => (
                  <div key={exIdx} className="flex justify-between text-sm">
                    <span>{exercise.name}</span>
                    <span>{exercise.sets}セット × {exercise.reps}回 ({exercise.weight}kg)</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">💪 筋トレ記録アプリ</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ナビゲーション */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow">
          {[
            { id: 'home', label: 'ホーム', icon: TrendingUp },
            { id: 'workout', label: 'ワークアウト', icon: Dumbbell },
            { id: 'history', label: '履歴', icon: Calendar }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded transition-colors ${
                currentView === id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* メインコンテンツ */}
        {currentView === 'home' && <HomeView />}
        {currentView === 'workout' && <WorkoutView />}
        {currentView === 'history' && <HistoryView />}
      </div>
    </div>
  );
};

export default WorkoutApp;
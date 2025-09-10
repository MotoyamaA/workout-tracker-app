import React, { useState } from 'react';
import { Plus, Save, Trash2, Clock } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { Exercise, WorkoutExercise } from '../types';

export const WorkoutView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const {
    exercises,
    currentWorkout,
    setCurrentWorkout,
    addWorkout,
  } = useWorkoutStore();

  // カロリー計算
  const calculateCalories = (exercise: Exercise, sets: number, reps: number, weight: number): number => {
    const baseCalories = exercise.caloriesPerRep * sets * reps;
    const weightMultiplier = Math.max(1, weight / 20);
    return Math.round(baseCalories * weightMultiplier);
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

  // エクササイズを削除
  const removeExerciseFromWorkout = (index: number) => {
    if (!currentWorkout.exercises) return;
    
    const updatedExercises = currentWorkout.exercises.filter((_, i) => i !== index);
    setCurrentWorkout({
      ...currentWorkout,
      exercises: updatedExercises,
    });
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
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">ワークアウト記録</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setCurrentWorkout(prev => ({ ...prev, date: e.target.value }));
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* 部位選択 */}
      <div className="space-y-4">
        {Object.entries(exercisesByMuscleGroup).map(([muscleGroup, exerciseList]) => (
          <div key={muscleGroup} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">{muscleGroup}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {exerciseList.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => addExerciseToWorkout(exercise)}
                  className="flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-700 transition-colors text-sm"
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
      {currentWorkout.exercises && currentWorkout.exercises.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
          <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">今日のワークアウト</h3>
          
          {/* 追加情報入力 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                時間（分）
              </label>
              <input
                type="number"
                value={currentWorkout.duration || ''}
                onChange={(e) => setCurrentWorkout({ ...currentWorkout, duration: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="トレーニング時間"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                メモ
              </label>
              <input
                type="text"
                value={currentWorkout.notes || ''}
                onChange={(e) => setCurrentWorkout({ ...currentWorkout, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="今日の調子など..."
              />
            </div>
          </div>

          <div className="space-y-3">
            {currentWorkout.exercises.map((exercise, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">{exercise.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{exercise.calories} kcal</p>
                </div>
                <div className="flex space-x-2">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">セット</label>
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateWorkoutExercise(idx, 'sets', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">回数</label>
                    <input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => updateWorkoutExercise(idx, 'reps', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">重量(kg)</label>
                    <input
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => updateWorkoutExercise(idx, 'weight', parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">休憩(秒)</label>
                    <input
                      type="number"
                      value={exercise.restTime || ''}
                      onChange={(e) => updateWorkoutExercise(idx, 'restTime', parseInt(e.target.value) || undefined)}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                      min="0"
                    />
                  </div>
                  <button
                    onClick={() => removeExerciseFromWorkout(idx)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              総消費カロリー: {currentWorkout.exercises.reduce((sum, ex) => sum + ex.calories, 0)} kcal
              {currentWorkout.duration && (
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {currentWorkout.duration}分
                </span>
              )}
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
};
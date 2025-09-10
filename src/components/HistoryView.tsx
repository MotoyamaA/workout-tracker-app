import React, { useState } from 'react';
import { Calendar, Clock, TrendingUp, Trash2, Eye, Filter } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { Workout } from '../types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const HistoryView: React.FC = () => {
  const { workouts, deleteWorkout } = useWorkoutStore();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [filterMuscleGroup, setFilterMuscleGroup] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'calories' | 'duration'>('date');

  // フィルタリングとソート
  const filteredAndSortedWorkouts = workouts
    .filter(workout => {
      if (!filterMuscleGroup) return true;
      return workout.exercises.some(exercise => exercise.muscleGroup === filterMuscleGroup);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'calories':
          return b.totalCalories - a.totalCalories;
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        default:
          return 0;
      }
    });

  // ワークアウト削除
  const handleDeleteWorkout = (workoutId: string) => {
    if (confirm('このワークアウトを削除しますか？')) {
      deleteWorkout(workoutId);
      if (selectedWorkout?.id === workoutId) {
        setSelectedWorkout(null);
      }
    }
  };

  // 部位の一覧を取得
  const muscleGroups = Array.from(
    new Set(workouts.flatMap(workout => workout.exercises.map(ex => ex.muscleGroup)))
  );

  // 週間統計の計算
  const getWeeklyStats = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayWorkouts = workouts.filter(w => w.date === date);
      return {
        date,
        workouts: dayWorkouts.length,
        calories: dayWorkouts.reduce((sum, w) => sum + w.totalCalories, 0),
      };
    });
  };

  const weeklyStats = getWeeklyStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">ワークアウト履歴</h2>
        <div className="flex items-center space-x-3">
          {/* フィルター */}
          <select
            value={filterMuscleGroup}
            onChange={(e) => setFilterMuscleGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">全ての部位</option>
            {muscleGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>

          {/* ソート */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="date">日付順</option>
            <option value="calories">カロリー順</option>
            <option value="duration">時間順</option>
          </select>
        </div>
      </div>

      {/* 週間統計 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">週間アクティビティ</h3>
        <div className="grid grid-cols-7 gap-2">
          {weeklyStats.map((day, index) => {
            const date = new Date(day.date);
            const isToday = day.date === new Date().toISOString().split('T')[0];
            
            return (
              <div key={day.date} className="text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {format(date, 'E', { locale: ja })}
                </div>
                <div 
                  className={`h-12 rounded flex items-end justify-center text-xs font-medium ${
                    day.workouts > 0 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {day.workouts > 0 && (
                    <div className="text-center">
                      <div>{day.workouts}</div>
                      <div className="text-xs opacity-75">{Math.round(day.calories / 100) * 100}</div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {format(date, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredAndSortedWorkouts.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {filterMuscleGroup ? 
              `${filterMuscleGroup}のワークアウト記録がありません` : 
              'まだワークアウトの記録がありません'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ワークアウト一覧 */}
          <div className="space-y-3">
            {filteredAndSortedWorkouts.map((workout) => (
              <div 
                key={workout.id} 
                className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 cursor-pointer transition-all ${
                  selectedWorkout?.id === workout.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedWorkout(workout)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      {format(new Date(workout.date), 'yyyy年MM月dd日(E)', { locale: ja })}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {workout.totalCalories} kcal
                      </span>
                      {workout.duration && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {workout.duration}分
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkout(workout);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 rounded"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkout(workout.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* エクササイズ概要 */}
                <div className="space-y-1">
                  {workout.exercises.slice(0, 3).map((exercise, exIdx) => (
                    <div key={exIdx} className="text-sm text-gray-600 dark:text-gray-400">
                      {exercise.name} - {exercise.sets}セット × {exercise.reps}回 ({exercise.weight}kg)
                    </div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      他 {workout.exercises.length - 3} 種目
                    </div>
                  )}
                </div>

                {workout.notes && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                    "{workout.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ワークアウト詳細 */}
          <div className="lg:sticky lg:top-6">
            {selectedWorkout ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {format(new Date(selectedWorkout.date), 'yyyy年MM月dd日(E)', { locale: ja })} の詳細
                </h3>

                {/* 概要統計 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedWorkout.totalCalories}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">kcal</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedWorkout.exercises.length}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">種目</div>
                  </div>
                </div>

                {selectedWorkout.duration && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center">
                      <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        トレーニング時間: {selectedWorkout.duration}分
                      </span>
                    </div>
                  </div>
                )}

                {/* エクササイズ詳細 */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">実施エクササイズ</h4>
                  {selectedWorkout.exercises.map((exercise, exIdx) => (
                    <div key={exIdx} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200">{exercise.name}</h5>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{exercise.muscleGroup}</span>
                        </div>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {exercise.calories} kcal
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="font-medium text-gray-800 dark:text-gray-200">{exercise.sets}</div>
                          <div className="text-gray-600 dark:text-gray-400">セット</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="font-medium text-gray-800 dark:text-gray-200">{exercise.reps}</div>
                          <div className="text-gray-600 dark:text-gray-400">回数</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="font-medium text-gray-800 dark:text-gray-200">{exercise.weight}</div>
                          <div className="text-gray-600 dark:text-gray-400">kg</div>
                        </div>
                      </div>

                      {exercise.restTime && (
                        <div className="mt-2 text-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            休憩: {exercise.restTime}秒
                          </span>
                        </div>
                      )}

                      {exercise.notes && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                          "{exercise.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedWorkout.notes && (
                  <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">メモ</h5>
                    <p className="text-yellow-700 dark:text-yellow-300">{selectedWorkout.notes}</p>
                  </div>
                )}

                {/* 部位別カロリー分析 */}
                <div className="mt-6">
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">部位別カロリー消費</h5>
                  <div className="space-y-2">
                    {Object.entries(
                      selectedWorkout.exercises.reduce((acc, exercise) => {
                        acc[exercise.muscleGroup] = (acc[exercise.muscleGroup] || 0) + exercise.calories;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([muscleGroup, calories]) => (
                      <div key={muscleGroup} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{muscleGroup}</span>
                        <div className="flex items-center">
                          <div 
                            className="bg-blue-500 h-2 rounded mr-2"
                            style={{ 
                              width: `${(calories / selectedWorkout.totalCalories) * 60}px`,
                              minWidth: '4px'
                            }}
                          ></div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {calories} kcal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700 text-center">
                <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  ワークアウトを選択して詳細を表示
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
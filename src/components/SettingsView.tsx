import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Download, 
  Upload, 
  Trash2,
  Save,
  Globe,
  Scale
} from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { exportData, importData } from '../utils/database';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, workouts, exercises } = useWorkoutStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // データエクスポート
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('データをエクスポートしました！');
    } catch (error) {
      console.error('Export failed:', error);
      alert('エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  // データインポート
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        await importData(jsonData);
        alert('データをインポートしました！ページを再読み込みしてください。');
        window.location.reload();
      } catch (error) {
        console.error('Import failed:', error);
        alert('インポートに失敗しました。ファイル形式を確認してください。');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // 全データ削除
  const handleClearAllData = () => {
    if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
      if (confirm('本当にすべてのデータを削除しますか？')) {
        localStorage.clear();
        indexedDB.deleteDatabase('WorkoutTrackerDB');
        alert('すべてのデータを削除しました。ページを再読み込みします。');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">設定</h2>

      {/* テーマ設定 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <h3 className="flex items-center font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {settings.theme === 'dark' ? <Moon className="h-5 w-5 mr-2" /> : <Sun className="h-5 w-5 mr-2" />}
          表示設定
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              テーマ
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Sun className="h-4 w-4 mr-2" />
                ライト
              </button>
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Moon className="h-4 w-4 mr-2" />
                ダーク
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              言語
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as 'ja' | 'en' })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* 単位設定 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <h3 className="flex items-center font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <Scale className="h-5 w-5 mr-2" />
          単位設定
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              重量
            </label>
            <select
              value={settings.units.weight}
              onChange={(e) => updateSettings({ 
                units: { ...settings.units, weight: e.target.value as 'kg' | 'lbs' }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="kg">キログラム (kg)</option>
              <option value="lbs">ポンド (lbs)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              身長
            </label>
            <select
              value={settings.units.height}
              onChange={(e) => updateSettings({ 
                units: { ...settings.units, height: e.target.value as 'cm' | 'ft' }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="cm">センチメートル (cm)</option>
              <option value="ft">フィート (ft)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 通知設定 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <h3 className="flex items-center font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <Bell className="h-5 w-5 mr-2" />
          通知設定
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ワークアウトリマインダー
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                定期的なトレーニングの通知を受け取る
              </p>
            </div>
            <button
              onClick={() => updateSettings({ 
                notifications: { 
                  ...settings.notifications, 
                  workoutReminder: !settings.notifications.workoutReminder 
                }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.workoutReminder ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.workoutReminder ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                目標達成通知
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                目標達成時の通知を受け取る
              </p>
            </div>
            <button
              onClick={() => updateSettings({ 
                notifications: { 
                  ...settings.notifications, 
                  goalAchievement: !settings.notifications.goalAchievement 
                }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.goalAchievement ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.goalAchievement ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* プライバシー設定 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <h3 className="flex items-center font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <Shield className="h-5 w-5 mr-2" />
          プライバシー設定
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                データ共有
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                匿名化されたデータをサービス改善のために共有する
              </p>
            </div>
            <button
              onClick={() => updateSettings({ 
                privacy: { 
                  ...settings.privacy, 
                  dataSharing: !settings.privacy.dataSharing 
                }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.privacy.dataSharing ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                アナリティクス
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                アプリの使用状況データを収集する
              </p>
            </div>
            <button
              onClick={() => updateSettings({ 
                privacy: { 
                  ...settings.privacy, 
                  analytics: !settings.privacy.analytics 
                }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.privacy.analytics ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.privacy.analytics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* データ管理 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <h3 className="flex items-center font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <Download className="h-5 w-5 mr-2" />
          データ管理
        </h3>
        
        <div className="space-y-4">
          {/* データ統計 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{workouts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">ワークアウト</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {exercises.filter(e => e.isCustom).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">カスタムエクササイズ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((JSON.stringify({ workouts, exercises }).length / 1024) * 10) / 10}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">KB</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'エクスポート中...' : 'データをエクスポート'}
            </button>

            <label className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'インポート中...' : 'データをインポート'}
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                disabled={isImporting}
                className="hidden"
              />
            </label>

            <button
              onClick={handleClearAllData}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              全データ削除
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>• エクスポートしたデータは他のデバイスでインポートできます</p>
            <p>• データはブラウザのローカルストレージに保存されます</p>
            <p>• ブラウザのデータを削除するとワークアウトデータも削除されます</p>
          </div>
        </div>
      </div>

      {/* アプリ情報 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        <h3 className="flex items-center font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <Settings className="h-5 w-5 mr-2" />
          アプリ情報
        </h3>
        
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>バージョン</span>
            <span>2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>最終更新</span>
            <span>2025年9月</span>
          </div>
          <div className="flex justify-between">
            <span>開発者</span>
            <span>MotoyamaA</span>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
            <p>TypeScript版では以下の機能が追加されました：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>プロフィール管理と基礎代謝計算</li>
              <li>カスタムエクササイズ作成</li>
              <li>ダークモード切り替え</li>
              <li>データベース連携（IndexedDB）</li>
              <li>詳細な統計分析</li>
              <li>データインポート・エクスポート</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
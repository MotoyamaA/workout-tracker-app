import { DatabaseOperations, Workout, Exercise, UserProfile, AppSettings } from '../types';

// IndexedDBを使用したローカルデータベース
class LocalDatabase implements DatabaseOperations {
  private dbName = 'WorkoutTrackerDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // ワークアウトストア
        if (!db.objectStoreNames.contains('workouts')) {
          const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
          workoutStore.createIndex('date', 'date', { unique: false });
        }

        // エクササイズストア
        if (!db.objectStoreNames.contains('exercises')) {
          const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' });
          exerciseStore.createIndex('muscleGroup', 'muscleGroup', { unique: false });
          exerciseStore.createIndex('category', 'category', { unique: false });
        }

        // プロフィールストア
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }

        // 設定ストア
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // ワークアウト操作
  async createWorkout(workout: Omit<Workout, 'id'>): Promise<Workout> {
    const db = await this.ensureDB();
    const newWorkout: Workout = {
      ...workout,
      id: crypto.randomUUID(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['workouts'], 'readwrite');
      const store = transaction.objectStore('workouts');
      const request = store.add(newWorkout);

      request.onsuccess = () => resolve(newWorkout);
      request.onerror = () => reject(request.error);
    });
  }

  async getWorkouts(limit?: number, offset?: number): Promise<Workout[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['workouts'], 'readonly');
      const store = transaction.objectStore('workouts');
      const index = store.index('date');
      const request = index.openCursor(null, 'prev'); // 日付の降順

      const workouts: Workout[] = [];
      let count = 0;
      const skipCount = offset || 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (count >= skipCount) {
            workouts.push(cursor.value);
            if (limit && workouts.length >= limit) {
              resolve(workouts);
              return;
            }
          }
          count++;
          cursor.continue();
        } else {
          resolve(workouts);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async updateWorkout(id: string, workout: Partial<Workout>): Promise<Workout> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['workouts'], 'readwrite');
      const store = transaction.objectStore('workouts');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingWorkout = getRequest.result;
        if (!existingWorkout) {
          reject(new Error('Workout not found'));
          return;
        }

        const updatedWorkout = { ...existingWorkout, ...workout };
        const putRequest = store.put(updatedWorkout);
        
        putRequest.onsuccess = () => resolve(updatedWorkout);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteWorkout(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['workouts'], 'readwrite');
      const store = transaction.objectStore('workouts');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // エクササイズ操作
  async createExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    const db = await this.ensureDB();
    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID(),
      isCustom: true,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['exercises'], 'readwrite');
      const store = transaction.objectStore('exercises');
      const request = store.add(newExercise);

      request.onsuccess = () => resolve(newExercise);
      request.onerror = () => reject(request.error);
    });
  }

  async getExercises(): Promise<Exercise[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['exercises'], 'readonly');
      const store = transaction.objectStore('exercises');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['exercises'], 'readwrite');
      const store = transaction.objectStore('exercises');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingExercise = getRequest.result;
        if (!existingExercise) {
          reject(new Error('Exercise not found'));
          return;
        }

        const updatedExercise = { ...existingExercise, ...exercise };
        const putRequest = store.put(updatedExercise);
        
        putRequest.onsuccess = () => resolve(updatedExercise);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteExercise(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['exercises'], 'readwrite');
      const store = transaction.objectStore('exercises');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // プロフィール操作
  async createProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const db = await this.ensureDB();
    const newProfile: UserProfile = {
      ...profile,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['profile'], 'readwrite');
      const store = transaction.objectStore('profile');
      const request = store.put(newProfile);

      request.onsuccess = () => resolve(newProfile);
      request.onerror = () => reject(request.error);
    });
  }

  async getProfile(): Promise<UserProfile | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['profile'], 'readonly');
      const store = transaction.objectStore('profile');
      const request = store.getAll();

      request.onsuccess = () => {
        const profiles = request.result;
        resolve(profiles.length > 0 ? profiles[0] : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const db = await this.ensureDB();
    const currentProfile = await this.getProfile();

    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['profile'], 'readwrite');
      const store = transaction.objectStore('profile');
      const request = store.put(updatedProfile);

      request.onsuccess = () => resolve(updatedProfile);
      request.onerror = () => reject(request.error);
    });
  }

  // 設定操作
  async getSettings(): Promise<AppSettings> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('app-settings');

      request.onsuccess = () => {
        const settings = request.result;
        resolve(settings || {
          theme: 'light',
          language: 'ja',
          units: { weight: 'kg', height: 'cm' },
          notifications: { workoutReminder: true, goalAchievement: true },
          privacy: { dataSharing: false, analytics: true },
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const db = await this.ensureDB();
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ id: 'app-settings', ...updatedSettings });

      request.onsuccess = () => resolve(updatedSettings);
      request.onerror = () => reject(request.error);
    });
  }
}

// データベースインスタンスをエクスポート
export const database = new LocalDatabase();

// データベース初期化関数
export const initializeDatabase = async (): Promise<void> => {
  try {
    await database.init();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // フォールバックとしてlocalStorageを使用することもできる
  }
};

// ユーティリティ関数
export const exportData = async (): Promise<string> => {
  const workouts = await database.getWorkouts();
  const exercises = await database.getExercises();
  const profile = await database.getProfile();
  const settings = await database.getSettings();

  const exportData = {
    workouts,
    exercises,
    profile,
    settings,
    exportDate: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
};

export const importData = async (jsonData: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonData);
    
    // データの妥当性を検証
    if (!data.workouts || !Array.isArray(data.workouts)) {
      throw new Error('Invalid data format');
    }

    // 既存データをバックアップ（オプション）
    const backup = await exportData();
    localStorage.setItem('backup-' + Date.now(), backup);

    // データをインポート
    if (data.profile) {
      await database.updateProfile(data.profile);
    }

    if (data.settings) {
      await database.updateSettings(data.settings);
    }

    // ワークアウトとエクササイズは個別に追加
    for (const workout of data.workouts) {
      await database.createWorkout(workout);
    }

    if (data.exercises) {
      for (const exercise of data.exercises) {
        if (exercise.isCustom) {
          await database.createExercise(exercise);
        }
      }
    }

    console.log('Data imported successfully');
  } catch (error) {
    console.error('Failed to import data:', error);
    throw error;
  }
};
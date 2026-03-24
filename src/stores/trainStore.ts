import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TrainingSession,
  TrainingStats,
  ExerciseRecord,
  Exercise,
  ReportConfig,
  ReportData,
  ExerciseStats,
  SetData,
  ExerciseCategory,
} from '../types';
import {STORAGE_KEYS, DEFAULT_QUICK_ACTIONS} from '../constants';
import {
  formatDate,
  calculateVolume,
  calculateStreak,
  calculateWeeklyFrequency,
  calculateE1RM,
  getExerciseStats as getExerciseStatsUtil,
} from '../utils';

/**
 * 训练草稿状态 - 用于自动保存当前进行中的训练
 * 用户可以随时切换动作，数据不会丢失
 */
export interface TrainingDraft {
  id: string;
  startedAt: number;
  exercises: ExerciseRecord[];
  currentExercise: {
    exerciseId: string;
    exerciseName: string;
    category: ExerciseCategory;
    sets: SetData[];
  } | null;
}

interface TrainStore {
  // ========== 核心数据 ==========
  sessions: TrainingSession[];
  exercises: Exercise[];
  quickActions: string[];

  // ========== 草稿状态 ==========
  draft: TrainingDraft | null;

  // ========== Session 操作 ==========
  addSession: (session: TrainingSession) => void;
  updateSession: (id: string, updates: Partial<TrainingSession>) => void;
  deleteSession: (id: string) => void;
  getSessionById: (id: string) => TrainingSession | undefined;
  getSessionByDate: (date: string) => TrainingSession | undefined;
  getSessionsByDateRange: (startDate: string, endDate: string) => TrainingSession[];
  getRecentSessions: (limit?: number) => TrainingSession[];

  // ========== Exercise 操作 ==========
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;

  // ========== 快捷方式 ==========
  updateQuickActions: (exerciseIds: string[]) => void;

  // ========== 草稿操作 ==========
  startDraft: () => void;
  addExerciseToDraft: (record: ExerciseRecord) => void;
  updateDraftCurrentExercise: (exercise: TrainingDraft['currentExercise']) => void;
  addSetToDraftCurrentExercise: (set: SetData) => void;
  clearDraft: () => void;
  getDraft: () => TrainingDraft | null;

  // ========== 统计 ==========
  getStats: () => TrainingStats;
  getExerciseStats: (exerciseId: string) => ExerciseStats | null;
  getReportData: (config: ReportConfig) => ReportData;
}

export const useTrainStore = create<TrainStore>()(
  persist(
    (set, get) => ({
      // ========== 初始状态 ==========
      sessions: [],
      exercises: [],
      quickActions: DEFAULT_QUICK_ACTIONS,
      draft: null,

      // ========== Session 操作 ==========
      addSession: (session: TrainingSession) => {
        set(state => ({
          sessions: [session, ...state.sessions],
        }));
      },

      updateSession: (id: string, updates: Partial<TrainingSession>) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === id ? {...s, ...updates, updatedAt: Date.now()} : s,
          ),
        }));
      },

      deleteSession: (id: string) => {
        set(state => ({
          sessions: state.sessions.filter(s => s.id !== id),
        }));
      },

      getSessionById: (id: string) => {
        return get().sessions.find(s => s.id === id);
      },

      getSessionByDate: (date: string) => {
        return get().sessions.find(s => s.date === date);
      },

      getSessionsByDateRange: (startDate: string, endDate: string) => {
        return get().sessions.filter(s => s.date >= startDate && s.date <= endDate);
      },

      getRecentSessions: (limit: number = 10) => {
        return get().sessions.slice(0, limit);
      },

      // ========== Exercise 操作 ==========
      addExercise: (exercise: Exercise) => {
        set(state => ({
          exercises: [...state.exercises, {...exercise, isCustom: true}],
        }));
      },

      updateExercise: (id: string, updates: Partial<Exercise>) => {
        set(state => ({
          exercises: state.exercises.map(e =>
            e.id === id ? {...e, ...updates} : e,
          ),
        }));
      },

      deleteExercise: (id: string) => {
        set(state => ({
          exercises: state.exercises.filter(e => e.id !== id),
        }));
      },

      getExerciseById: (id: string) => {
        return get().exercises.find(e => e.id === id);
      },

      // ========== 快捷方式 ==========
      updateQuickActions: (exerciseIds: string[]) => {
        set({quickActions: exerciseIds});
      },

      // ========== 草稿操作 ==========
      startDraft: () => {
        const now = Date.now();
        set({
          draft: {
            id: `draft_${now}`,
            startedAt: now,
            exercises: [],
            currentExercise: null,
          },
        });
      },

      addExerciseToDraft: (record: ExerciseRecord) => {
        set(state => {
          if (!state.draft) return state;
          return {
            draft: {
              ...state.draft,
              exercises: [...state.draft.exercises, record],
              currentExercise: null,
            },
          };
        });
      },

      updateDraftCurrentExercise: (exercise: TrainingDraft['currentExercise']) => {
        set(state => {
          if (!state.draft) return state;
          return {
            draft: {
              ...state.draft,
              currentExercise: exercise,
            },
          };
        });
      },

      addSetToDraftCurrentExercise: (set: SetData) => {
        set(state => {
          if (!state.draft || !state.draft.currentExercise) return state;
          return {
            draft: {
              ...state.draft,
              currentExercise: {
                ...state.draft.currentExercise,
                sets: [...state.draft.currentExercise.sets, set],
              },
            },
          };
        });
      },

      clearDraft: () => {
        set({draft: null});
      },

      getDraft: () => {
        return get().draft;
      },

      // ========== 统计 ==========
      getStats: () => {
        const sessions = get().sessions;
        const totalSessions = sessions.length;
        const totalExercises = sessions.reduce(
          (sum, session) => sum + session.exercises.length,
          0,
        );
        const totalSets = sessions.reduce(
          (sum, session) =>
            sum +
            session.exercises.reduce(
              (eSum, ex) => eSum + ex.sets.length,
              0,
            ),
          0,
        );
        const totalVolume = sessions.reduce(
          (sum, session) =>
            sum +
            session.exercises.reduce(
              (eSum, ex) => eSum + calculateVolume(ex.sets),
              0,
            ),
          0,
        );

        const exerciseCount: Record<string, number> = {};
        sessions.forEach(session => {
          session.exercises.forEach((ex: ExerciseRecord) => {
            exerciseCount[ex.exerciseName] =
              (exerciseCount[ex.exerciseName] || 0) + 1;
          });
        });

        const favoriteExercise =
          Object.keys(exerciseCount).length > 0
            ? Object.entries(exerciseCount).sort((a, b) => b[1] - a[1])[0][0]
            : null;

        const lastTrainingDate =
          sessions.length > 0
            ? formatDate(sessions[0].createdAt)
            : null;

        return {
          totalSessions,
          totalExercises,
          totalSets,
          totalVolume,
          favoriteExercise,
          lastTrainingDate,
          currentStreak: calculateStreak(sessions),
          weeklyFrequency: calculateWeeklyFrequency(sessions),
        };
      },

      getExerciseStats: (exerciseId: string) => {
        return getExerciseStatsUtil(exerciseId, get().sessions);
      },

      getReportData: (config: ReportConfig) => {
        const sessions = get().getSessionsByDateRange(config.startDate, config.endDate);
        const stats = get().getStats();

        const exerciseProgress = sessions
          .flatMap(s => s.exercises)
          .reduce((acc, ex) => {
            const existing = acc.find(e => e.name === ex.exerciseName);
            const bestE1RM = Math.max(
              ...ex.sets.map(set => calculateE1RM(set.weight, set.reps)),
            );
            if (!existing || bestE1RM > existing.e1rm) {
              if (existing) {
                existing.e1rm = bestE1RM;
              } else {
                acc.push({name: ex.exerciseName, e1rm: bestE1RM, progress: 0});
              }
            }
            return acc;
          }, [] as {name: string; e1rm: number; progress: number}[]);

        const muscleDistribution = sessions
          .flatMap(s => s.exercises)
          .flatMap(ex => {
            const exercise = get().exercises.find(e => e.id === ex.exerciseId);
            return exercise?.muscleGroups || [];
          })
          .reduce((acc, mg) => {
            acc[mg.name] = (acc[mg.name] || 0) + mg.percentage;
            return acc;
          }, {} as Record<string, number>);

        const totalMuscle = Object.values(muscleDistribution).reduce((a, b) => a + b, 0);
        const muscleDistributionList = Object.entries(muscleDistribution).map(
          ([name, value]) => ({
            name,
            percentage: Math.round((value / totalMuscle) * 100),
          }),
        );

        const personalRecords = sessions
          .flatMap(s =>
            s.exercises.map(ex => ({
              exerciseName: ex.exerciseName,
              weight: Math.max(...ex.sets.map(set => set.weight)),
              reps: ex.sets.find(set => set.weight === Math.max(...ex.sets.map(s => s.weight)))?.reps || 0,
              date: s.date,
            })),
          )
          .filter(pr => pr.weight > 0);

        return {
          period: `${config.startDate} - ${config.endDate}`,
          stats: {
            totalSessions: sessions.length,
            totalSets: sessions.reduce(
              (sum, s) => sum + s.exercises.reduce((eSum, ex) => eSum + ex.sets.length, 0),
              0,
            ),
            totalVolume: sessions.reduce(
              (sum, s) =>
                sum + s.exercises.reduce((eSum, ex) => eSum + calculateVolume(ex.sets), 0),
              0,
            ),
            avgDuration: sessions.length > 0
              ? Math.round(
                  sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length,
                )
              : 0,
          },
          exerciseProgress,
          muscleDistribution: muscleDistributionList,
          personalRecords,
        };
      },
    }),
    {
      name: STORAGE_KEYS.SESSIONS,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

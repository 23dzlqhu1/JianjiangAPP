# StrengthInsight 状态管理文档

## 版本信息
- **版本**: v2.0.0
- **更新日期**: 2026-03-24
- **状态管理库**: Zustand + persist中间件

---

## 1. 架构概述

### 1.1 为什么选择 Zustand？

| 特性 | Zustand | Redux | Context API |
|------|---------|-------|-------------|
| 学习成本 | 低 | 高 | 中 |
| 样板代码 | 极少 | 多 | 少 |
| TypeScript支持 | 优秀 | 良好 | 良好 |
| 持久化 | 内置中间件 | 需额外配置 | 需额外配置 |
| 性能 | 优秀 | 良好 | 需优化 |

### 1.2 数据流

```
┌─────────────────────────────────────────────────────────────┐
│                        用户操作                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    UI Components                            │
│  TrainingScreen / ExerciseLibraryScreen / StatsScreen      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Zustand Store                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   State     │  │   Actions   │  │   Getters   │         │
│  │  (sessions) │  │ (addSession)│  │  (getStats) │         │
│  │ (exercises) │  │(addExercise)│  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   persist Middleware                        │
│              自动同步到 AsyncStorage                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Store 结构

### 2.1 TrainStore

**文件**: `src/stores/trainStore.ts`

```typescript
interface TrainStore {
  // ==================== State ====================
  sessions: TrainingSession[];     // 所有训练记录
  exercises: Exercise[];           // 用户创建的动作（初始为空数组）
  quickActions: string[];          // 快捷动作ID列表

  // ==================== 会话操作 ====================
  addSession: (session: TrainingSession) => void;
  updateSession: (id: string, updates: Partial<TrainingSession>) => void;
  deleteSession: (id: string) => void;
  getSessionById: (id: string) => TrainingSession | undefined;
  getSessionByDate: (date: string) => TrainingSession | undefined;
  getSessionsByDateRange: (startDate: string, endDate: string) => TrainingSession[];
  getRecentSessions: (limit?: number) => TrainingSession[];

  // ==================== 动作操作 ====================
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;

  // ==================== 快捷方式 ====================
  updateQuickActions: (exerciseIds: string[]) => void;

  // ==================== 统计计算 ====================
  getStats: () => TrainingStats;
  getExerciseStats: (exerciseId: string) => ExerciseStats | null;
  getReportData: (config: ReportConfig) => ReportData;
}
```

### 2.2 状态初始值

```typescript
{
  sessions: [],           // 空数组，等待用户创建
  exercises: [],          // 关键变化：不再预置动作，初始为空
  quickActions: [],       // 默认空数组
}
```

**重要变更**: v2.0 之前 `exercises` 初始化为 `EXERCISES`（28个预设动作），现在改为空数组，用户通过模板系统创建动作。

---

## 3. 核心操作详解

### 3.1 添加训练会话

```typescript
addSession: (session) =>
  set((state) => ({
    sessions: [...state.sessions, session],
  })),
```

**使用场景**: 完成训练后保存记录

```typescript
const session: TrainingSession = {
  id: generateId(),
  date: formatDate(new Date()),
  exercises: exerciseRecords,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

addSession(session);
```

### 3.2 添加动作（基于模板）

```typescript
addExercise: (exercise) =>
  set((state) => ({
    exercises: [...state.exercises, exercise],
  })),
```

**使用场景**: 用户从模板创建新动作

```typescript
// 基于卧推类模板创建"杠铃卧推"
const newExercise: Exercise = {
  id: generateId(),
  name: '杠铃卧推',
  category: 'chest',
  templateType: 'bench_press',  // 关联模板
  isCustom: false,              // 基于模板创建
  muscleGroups: [               // 可选：覆盖默认占比
    { name: '胸大肌', percentage: 60 },
    { name: '三角肌前束', percentage: 25 },
    { name: '肱三头肌', percentage: 15 },
  ],
  createdAt: Date.now(),
};

addExercise(newExercise);
```

### 3.3 更新快捷方式

```typescript
updateQuickActions: (exerciseIds) =>
  set(() => ({
    quickActions: exerciseIds,
  })),
```

**使用场景**: 用户设置首页快捷入口

---

## 4. 计算属性（Getters）

### 4.1 获取统计数据

```typescript
getStats: () => {
  const { sessions } = get();

  return {
    totalSessions: sessions.length,
    totalSets: sessions.reduce(
      (sum, s) => sum + s.exercises.reduce(
        (eSum, ex) => eSum + ex.sets.length, 0
      ), 0
    ),
    totalVolume: sessions.reduce(
      (sum, s) => sum + s.exercises.reduce(
        (eSum, ex) => eSum + calculateVolume(ex.sets), 0
      ), 0
    ),
    currentStreak: calculateStreak(sessions),
    longestStreak: calculateLongestStreak(sessions),
    weeklyFrequency: calculateWeeklyFrequency(sessions),
  };
},
```

### 4.2 获取动作统计

```typescript
getExerciseStats: (exerciseId) => {
  const { sessions, exercises } = get();

  const exerciseRecords = sessions.flatMap(s =>
    s.exercises.filter(e => e.exerciseId === exerciseId)
  );

  if (exerciseRecords.length === 0) return null;

  const allSets = exerciseRecords.flatMap(e => e.sets);

  return {
    totalSets: allSets.length,
    maxWeight: Math.max(...allSets.map(s => s.weight)),
    bestE1RM: Math.max(...allSets.map(s =>
      calculateE1RM(s.weight, s.reps)
    )),
    history: exerciseRecords.map(r => ({
      date: r.date,
      maxWeight: Math.max(...r.sets.map(s => s.weight)),
      totalVolume: calculateVolume(r.sets),
    })),
  };
},
```

### 4.3 获取报告数据

```typescript
getReportData: (config) => {
  const { sessions, exercises } = get();

  // 筛选日期范围内的会话
  const filteredSessions = sessions.filter(s =>
    s.date >= config.startDate && s.date <= config.endDate
  );

  // 计算肌肉分布（基于模板）
  const muscleDistribution = filteredSessions
    .flatMap(s => s.exercises)
    .flatMap(ex => {
      const exercise = exercises.find(e => e.id === ex.exerciseId);
      if (!exercise) return [];

      // 获取模板默认肌肉占比
      const template = getTemplateByType(exercise.templateType);
      return template?.muscleGroups || [];
    })
    .reduce((acc, mg) => {
      acc[mg.name] = (acc[mg.name] || 0) + mg.percentage;
      return acc;
    }, {} as Record<string, number>);

  return {
    period: `${config.startDate} - ${config.endDate}`,
    stats: { /* ... */ },
    muscleDistribution,
    personalRecords: [ /* ... */ ],
  };
},
```

---

## 5. 持久化配置

### 5.1 存储键名

```typescript
// src/constants/index.ts
export const STORAGE_KEYS = {
  TRAIN_STORE: 'strength_insight_train_store',
  SESSIONS: 'strength_insight_sessions',
  REPORT_CONFIG: 'strength_insight_report_config',
  USER_PREFERENCES: 'strength_insight_user_preferences',
};
```

### 5.2 Persist 配置

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTrainStore = create<TrainStore>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: STORAGE_KEYS.TRAIN_STORE,
      storage: createJSONStorage(() => AsyncStorage),
      // 可选：只持久化特定字段
      // partialize: (state) => ({
      //   sessions: state.sessions,
      //   exercises: state.exercises,
      //   quickActions: state.quickActions,
      // }),
    }
  )
);
```

### 5.3 数据迁移策略

**v1.x → v2.0 迁移**:

```typescript
// 如果检测到旧格式数据，进行迁移
const migrateData = (oldData: any): TrainStore => {
  // 旧数据有预设动作，新数据初始为空
  // 保留用户的训练记录，但动作需要重新创建
  return {
    sessions: oldData.sessions || [],
    exercises: [], // 重置为空，让用户通过模板创建
    quickActions: [],
    // ... 其他字段
  };
};
```

---

## 6. 使用示例

### 6.1 在组件中使用

```typescript
import { useTrainStore } from '../stores/trainStore';

export const TrainingScreen: React.FC = () => {
  // 选择特定状态（推荐）
  const { addSession, exercises } = useTrainStore();

  // 或订阅整个 store（不推荐，会导致不必要的重渲染）
  // const store = useTrainStore();

  // 使用计算属性
  const stats = useTrainStore(state => state.getStats());

  return (
    <View>
      <Text>总训练次数: {stats.totalSessions}</Text>
      <Text>我的动作: {exercises.length}个</Text>
    </View>
  );
};
```

### 6.2 在 Hook 中使用

```typescript
export const useExerciseStats = (exerciseId: string) => {
  return useTrainStore(
    useCallback(
      state => state.getExerciseStats(exerciseId),
      [exerciseId]
    )
  );
};
```

---

## 7. 最佳实践

### 7.1 状态选择

```typescript
// ✅ 好的做法：只选择需要的字段
const sessions = useTrainStore(state => state.sessions);
const addSession = useTrainStore(state => state.addSession);

// ❌ 避免：订阅整个 store
const store = useTrainStore();
```

### 7.2 异步操作

```typescript
// 在组件中处理异步逻辑
const handleAddExercise = async (template: ExerciseTemplate) => {
  const newExercise: Exercise = {
    // ... 创建逻辑
  };

  addExercise(newExercise);

  // 可选：显示提示
  Alert.alert('成功', '动作已创建');
};
```

### 7.3 状态派生

```typescript
// ✅ 使用 useMemo 缓存派生状态
const categoryExercises = useMemo(() => {
  return exercises.filter(e => e.category === selectedCategory);
}, [exercises, selectedCategory]);

// ✅ 使用 store 的 getter 方法
const stats = useTrainStore(state => state.getStats());
```

---

## 8. 调试

### 8.1 启用 Redux DevTools

```typescript
import { devtools } from 'zustand/middleware';

export const useTrainStore = create<TrainStore>()(
  devtools(
    persist(
      (set, get) => ({ /* ... */ }),
      { name: STORAGE_KEYS.TRAIN_STORE }
    ),
    { name: 'TrainStore' }
  )
);
```

### 8.2 日志中间件

```typescript
const logMiddleware = (config) => (set, get, api) =>
  config(
    (args) => {
      console.log('Applying:', args);
      set(args);
      console.log('New state:', get());
    },
    get,
    api
  );

export const useTrainStore = create<TrainStore>()(
  logMiddleware(
    persist(/* ... */)
  )
);
```

---

## 9. 常见问题

### Q: 为什么 exercises 初始为空？
**A**: v2.0 采用模板系统，用户基于模板创建自己的动作，不再提供预设动作列表。

### Q: 如何获取模板的肌肉占比？
**A**: 通过 `templateType` 关联模板：
```typescript
const template = getTemplateByType(exercise.templateType);
const muscleGroups = template?.muscleGroups || [];
```

### Q: 数据存储在哪里？
**A**: 使用 AsyncStorage 持久化，键名为 `strength_insight_train_store`。

### Q: 如何清空所有数据？
**A**: 
```typescript
// 重置 store
useTrainStore.setState({
  sessions: [],
  exercises: [],
  quickActions: [],
});

// 清除存储
AsyncStorage.removeItem(STORAGE_KEYS.TRAIN_STORE);
```

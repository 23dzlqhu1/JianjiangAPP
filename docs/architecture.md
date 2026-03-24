# StrengthInsight 技术架构文档

## 版本信息
- **版本**: v2.0.0
- **更新日期**: 2026-03-24
- **架构**: 模板化动作系统

---

## 1. 核心架构设计

### 1.1 模板化动作系统 (Template-Based Exercise System)

我们采用"模板 + 用户动作"的双层架构：

```
┌─────────────────────────────────────────────────────────────┐
│                      模板层 (Template)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  卧推类      │  │  深蹲类      │  │  划船类      │         │
│  │  bench_press │  │    squat    │  │     row     │         │
│  │             │  │             │  │             │         │
│  │ 胸大肌 60%  │  │ 股四头肌 70%│  │ 背阔肌 60%  │         │
│  │ 三角肌 25%  │  │ 臀大肌 20%  │  │ 斜方肌 20%  │         │
│  │ 肱三 15%   │  │ 腘绳肌 10%  │  │ 二头肌 15%  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     用户动作层 (Exercise)                     │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   杠铃卧推       │  │   哑铃卧推       │                   │
│  │  基于卧推类模板  │  │  基于卧推类模板  │                   │
│  │  继承肌肉占比    │  │  继承肌肉占比    │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

**设计优势**:
1. **灵活性**: 用户可基于模板创建任意变式（如"上斜哑铃卧推"）
2. **一致性**: 同类型动作自动继承科学的肌肉发力占比
3. **简洁性**: 无需维护庞大的预设动作库

---

## 2. 类型系统

### 2.1 核心类型定义

```typescript
// 动作模板类型 - 24种标准模板
export type ExerciseTemplateType =
  // 胸部
  | 'bench_press'        // 卧推类
  | 'incline_press'      // 上斜推类
  | 'fly'                // 飞鸟类
  | 'cable_crossover'    // 绳索夹胸类
  // 背部
  | 'pull_up'            // 引体向上类
  | 'lat_pulldown'       // 下拉类
  | 'row'                // 划船类
  | 'deadlift'           // 硬拉类
  // 腿部
  | 'squat'              // 深蹲类
  | 'leg_press'          // 腿举类
  | 'lunge'              // 弓步类
  | 'leg_curl'           // 腿弯举类
  | 'leg_extension'      // 腿屈伸类
  | 'calf_raise'         // 提踵类
  | 'hip_thrust'         // 臀推类
  // 肩部
  | 'overhead_press'     // 推举类
  | 'lateral_raise'      // 侧平举类
  | 'face_pull'          // 面拉类
  | 'rear_delt_fly'      // 后束飞鸟类
  // 手臂
  | 'bicep_curl'         // 二头弯举类
  | 'tricep_extension'   // 三头伸展类
  | 'tricep_pushdown'    // 三头下压类
  // 核心
  | 'plank'              // 平板支撑类
  | 'crunch'             // 卷腹类
  | 'leg_raise'          // 举腿类
  | 'russian_twist';     // 俄罗斯转体类

// 动作模板定义
export interface ExerciseTemplate {
  type: ExerciseTemplateType;
  name: string;                    // 模板名称（如：卧推类）
  category: ExerciseCategory;
  description: string;             // 动作描述
  muscleGroups: MuscleGroup[];     // 默认肌肉发力占比
  variations: string[];            // 常见变式示例
}

// 用户创建的具体动作
export interface Exercise {
  id: string;
  name: string;                    // 动作名称（用户自定义）
  category: ExerciseCategory;
  templateType: ExerciseTemplateType; // 基于哪个模板
  isCustom: boolean;               // 是否完全自定义
  isFavorite?: boolean;
  muscleGroups?: MuscleGroup[];    // 自定义肌肉占比（可选）
  notes?: string;                  // 用户备注
  createdAt: number;
}
```

---

## 3. 数据流

### 3.1 创建动作流程

```
用户选择训练部位（如：胸部）
         ↓
显示该部位的模板列表（卧推类、飞鸟类...）
         ↓
用户点击模板（如：卧推类）
         ↓
弹出创建弹窗，显示：
   - 模板名称：卧推类
   - 参考变式：杠铃卧推、哑铃卧推...
   - 默认肌肉占比
         ↓
用户输入动作名称或选择变式
         ↓
创建 Exercise 对象，关联 templateType
         ↓
保存到 store，进入组数录入
```

### 3.2 肌肉统计计算

```typescript
// 从训练记录计算肌肉分布
const muscleDistribution = sessions
  .flatMap(s => s.exercises)
  .flatMap(ex => {
    const exercise = getExerciseById(ex.exerciseId);
    const template = getTemplateByType(exercise.templateType);
    // 使用模板的肌肉占比
    return template?.muscleGroups || [];
  })
  .reduce((acc, mg) => {
    acc[mg.name] = (acc[mg.name] || 0) + mg.percentage;
    return acc;
  }, {});
```

---

## 4. 目录结构

```
src/
├── components/          # 可复用组件
│   ├── Card.tsx
│   ├── SetInput.tsx
│   ├── QuickActions.tsx
│   └── ...
├── constants/           # 常量和配置
│   └── index.ts         # 模板定义、颜色、间距等
├── screens/             # 页面组件
│   ├── TrainingScreen.tsx      # 训练记录（模板选择）
│   ├── ExerciseLibraryScreen.tsx # 动作库
│   ├── ExerciseDetailScreen.tsx  # 动作详情
│   ├── StatsScreen.tsx          # 统计
│   └── ReportScreen.tsx         # 报告
├── stores/              # 状态管理
│   └── trainStore.ts    # Zustand store
├── types/               # TypeScript 类型
│   └── index.ts         # 核心类型定义
├── utils/               # 工具函数
│   ├── helpers.ts       # 辅助函数
│   ├── storage.ts       # 存储操作
│   └── calculations.ts  # 计算函数
└── navigation/          # 导航配置
    └── AppNavigator.tsx
```

---

## 5. 状态管理

### 5.1 TrainStore 结构

```typescript
interface TrainStore {
  // 数据
  sessions: TrainingSession[];     // 训练记录
  exercises: Exercise[];           // 用户创建的动作（初始为空）
  quickActions: string[];          // 快捷动作ID列表

  // 会话操作
  addSession: (session: TrainingSession) => void;
  updateSession: (id: string, updates: Partial<TrainingSession>) => void;
  deleteSession: (id: string) => void;

  // 动作操作
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;

  // 快捷方式
  updateQuickActions: (exerciseIds: string[]) => void;

  // 统计
  getStats: () => TrainingStats;
  getExerciseStats: (exerciseId: string) => ExerciseStats | null;
  getReportData: (config: ReportConfig) => ReportData;
}
```

### 5.2 持久化

使用 Zustand + AsyncStorage 实现数据持久化：

```typescript
export const useTrainStore = create<TrainStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      exercises: [],  // 初始为空，用户通过模板创建
      quickActions: DEFAULT_QUICK_ACTIONS,
      // ... methods
    }),
    {
      name: STORAGE_KEYS.TRAIN_STORE,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 6. 关键设计决策

### 6.1 为什么移除预设动作？

**旧方案问题**:
- 28个预设动作 + 英文别名，列表冗长
- 用户找不到想要的变式（如"上斜哑铃卧推"）
- 别名系统混乱（"bench"、"press"等英文术语）

**新方案优势**:
- 24个模板覆盖所有训练需求
- 用户自由创建变式
- 肌肉占比由模板保证科学性

### 6.2 模板 vs 预设

| 特性 | 预设动作（旧） | 模板系统（新） |
|------|---------------|---------------|
| 数量 | 28个固定动作 | 24个模板 + 无限用户动作 |
| 扩展性 | 需修改代码添加 | 用户自由创建 |
| 肌肉占比 | 硬编码在每个动作 | 模板统一提供 |
| 别名 | 需要维护别名列表 | 无需别名 |
| 灵活性 | 低 | 高 |

---

## 7. 扩展指南

### 7.1 添加新模板

在 `src/constants/index.ts` 中添加：

```typescript
{
  type: 'new_exercise_type',
  name: '新动作类',
  category: 'chest', // 或其他部位
  description: '动作描述',
  muscleGroups: [
    { name: '目标肌肉', percentage: 70 },
    { name: '辅助肌肉', percentage: 30 },
  ],
  variations: ['变式1', '变式2', '变式3'],
}
```

然后在 `src/types/index.ts` 的 `ExerciseTemplateType` 中添加类型。

### 7.2 自定义肌肉占比

用户可在创建动作时覆盖默认占比：

```typescript
const newExercise: Exercise = {
  // ...其他字段
  muscleGroups: [
    { name: '胸大肌', percentage: 50 },  // 覆盖默认60%
    { name: '三角肌前束', percentage: 30 }, // 覆盖默认25%
    { name: '肱三头肌', percentage: 20 }, // 覆盖默认15%
  ],
};
```

---

## 8. 性能考虑

1. **模板数据**: 24个模板常驻内存，无性能问题
2. **用户动作**: 懒加载，按分类筛选显示
3. **统计计算**: 使用 useMemo 缓存计算结果
4. **存储优化**: 只存储用户创建的动作，模板从代码读取

---

## 9. 未来扩展

- [ ] 用户自定义模板
- [ ] 模板肌肉占比微调
- [ ] 动作图片/视频关联
- [ ] 社区共享动作模板

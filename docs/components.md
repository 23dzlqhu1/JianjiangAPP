# StrengthInsight 组件文档

## 版本信息
- **版本**: v2.0.0
- **更新日期**: 2026-03-24

---

## 1. 组件架构

### 1.1 组件分层

```
┌─────────────────────────────────────────────────────────────┐
│                      Screen 层                               │
│  TrainingScreen / ExerciseLibraryScreen / StatsScreen      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Composite 层                              │
│  QuickActions / ExerciseList / SetRecorder                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Basic 层                                 │
│  Card / Button / Input / Modal / MuscleMap                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Screen 组件

### 2.1 TrainingScreen（训练记录页）

**文件**: `src/screens/TrainingScreen.tsx`

**功能**: 核心训练记录界面，采用模板系统创建动作

**界面布局**:
```
┌─────────────────────────────────────────────────────────────┐
│  训练记录                                    [完成训练]      │
├─────────────────────────────────────────────────────────────┤
│  [快捷方式: 卧推] [深蹲] [划船] [面拉]     [配置]           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌─────────────────────────────────────────┐ │
│  │ 训练部位  │  │ 选择动作模板                             │ │
│  │          │  │                                         │ │
│  │ • 胸部   │  │ ┌──────────┐ ┌──────────┐              │ │
│  │ • 背部   │  │ │ 卧推类    │ │ 飞鸟类    │              │ │
│  │ • 腿部   │  │ │ 水平推胸  │ │ 胸肌孤立  │              │ │
│  │ • 肩部   │  │ │ [变式...] │ │ [变式...] │              │ │
│  │ • 手臂   │  │ └──────────┘ └──────────┘              │ │
│  │ • 核心   │  │                                         │ │
│  │          │  │ 我的动作 (3个)                          │ │
│  └──────────┘  │ • 杠铃卧推          >                   │ │
│                │ • 哑铃卧推          >                   │ │
│                │ • 上斜哑铃卧推      >                   │ │
│                └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**核心逻辑**:

```typescript
// 基于模板创建动作
const handleCreateFromTemplate = (template: ExerciseTemplate) => {
  setSelectedTemplate(template);
  setCustomExerciseName(template.variations[0]);
  setShowTemplateModal(true);
};

// 确认创建
const confirmCreateExercise = () => {
  const newExercise: Exercise = {
    id: generateId(),
    name: customExerciseName,
    category: selectedTemplate.category,
    templateType: selectedTemplate.type,  // 关联模板
    isCustom: false,
    muscleGroups: selectedTemplate.muscleGroups,
    createdAt: Date.now(),
  };

  addExercise(newExercise);
  // 自动进入组数录入
  setSelectedExercise(newExercise);
  setShowExerciseList(false);
  setShowSetInput(true);
};
```

**关键 State**:
- `selectedCategory`: 当前选中的训练部位
- `categoryTemplates`: 当前部位的模板列表（useMemo 缓存）
- `categoryExercises`: 当前部位的用户动作列表
- `selectedTemplate`: 选中的模板（用于创建弹窗）
- `showTemplateModal`: 是否显示创建弹窗

---

### 2.2 ExerciseLibraryScreen（动作库）

**文件**: `src/screens/ExerciseLibraryScreen.tsx`

**功能**: 管理用户创建的所有动作

**界面布局**:
```
┌─────────────────────────────────────────────────────────────┐
│  动作库                                        [添加动作]    │
├─────────────────────────────────────────────────────────────┤
│  [🔍 搜索动作...]                                           │
│  [全部] [胸部] [背部] [腿部] [肩部] [手臂] [核心]           │
├─────────────────────────────────────────────────────────────┤
│  预设动作 (0个)                    ← v2.0 后为空            │
├─────────────────────────────────────────────────────────────┤
│  我的动作 (12个)                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🏋️ 杠铃卧推                    胸部  >               │ │
│  │    基于：卧推类                                        │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ 🏋️ 哑铃卧推                    胸部  >               │ │
│  │    基于：卧推类                                        │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ 🏋️ 深蹲                        腿部  >               │ │
│  │    基于：深蹲类                                        │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**核心逻辑**:

```typescript
// 筛选动作
const filteredExercises = exercises.filter(exercise => {
  const matchesSearch =
    searchQuery === '' ||
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.notes?.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory =
    selectedCategory === 'all' || exercise.category === selectedCategory;
  return matchesSearch && matchesCategory;
});

// v2.0 后预设动作为空
const presetExercises = filteredExercises.filter(e => !e.isCustom); // []
const customExercises = filteredExercises.filter(e => e.isCustom);  // 所有动作
```

---

### 2.3 ExerciseDetailScreen（动作详情）

**文件**: `src/screens/ExerciseDetailScreen.tsx`

**功能**: 展示动作的详细信息和历史记录

**界面布局**:
```
┌─────────────────────────────────────────────────────────────┐
│  <  动作详情                                                │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    [胸部]                             │ │
│  │                   杠铃卧推                             │ │
│  │                   基于：卧推类                         │ │
│  │              备注：主项动作，每周一练                   │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  [肌肉分布图]                                               │
│  胸大肌 ████████████████████████████████ 60%               │
│  三角肌前束 ████████████████ 25%                           │
│  肱三头肌 ██████████████ 15%                               │
├─────────────────────────────────────────────────────────────┤
│  📊 统计数据                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   128    │ │  45,600  │ │   100    │ │   115    │      │
│  │  总组数   │ │ 总容量kg │ │ 最大重量 │ │ 最高E1RM │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────┤
│  📈 历史记录                                                 │
│  2026-03-20  100kg × 5次 × 5组  容量2500kg                 │
│  2026-03-17   95kg × 6次 × 5组  容量2850kg                 │
│  2026-03-13   95kg × 5次 × 5组  容量2375kg                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Composite 组件

### 3.1 QuickActions（快捷方式）

**文件**: `src/components/QuickActions.tsx`

**功能**: 首页快速访问常用动作

```typescript
interface QuickActionsProps {
  exercises: Exercise[];           // 快捷动作列表
  onSelectExercise: (exercise: Exercise) => void;
  onConfigure: () => void;         // 配置快捷方式
}
```

**使用**:
```typescript
<QuickActions
  exercises={quickActionExercises}
  onSelectExercise={handleExerciseSelect}
  onConfigure={() => navigation.navigate('QuickActionSettings')}
/>
```

---

### 3.2 SetInput（组数录入）

**文件**: `src/components/SetInput.tsx`

**功能**: 录入每组训练的重量和次数

```typescript
interface SetInputProps {
  visible: boolean;
  exerciseName: string;
  setNumber: number;
  defaultWeight?: number;
  defaultReps?: number;
  defaultNote?: string;
  onConfirm: (set: SetData) => void;
  onCancel: () => void;
}
```

**界面**:
```
┌─────────────────────────────────────────────────────────────┐
│  杠铃卧推 - 第3组                                [取消]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  重量 (kg)                                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    100                                │ │
│  └───────────────────────────────────────────────────────┘ │
│  [-] [+]                                                    │
│                                                             │
│  次数                                                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                     5                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│  [-] [+]                                                    │
│                                                             │
│  备注（可选）                                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  感觉不错，下次可以加...                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│           ┌─────────────────────────────────────┐          │
│           │         确认录入 (E1RM: 115kg)       │          │
│           └─────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.3 ExerciseFilter（动作筛选）

**文件**: `src/components/ExerciseFilter.tsx`

**功能**: 按分类筛选动作

```typescript
interface ExerciseFilterProps {
  selectedCategory: ExerciseCategory | 'all';
  onSelectCategory: (category: ExerciseCategory | 'all') => void;
}
```

---

## 4. Basic 组件

### 4.1 Card（卡片容器）

**文件**: `src/components/Card.tsx`

```typescript
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

// 使用
<Card style={{ backgroundColor: '#E3F2FD' }}>
  <Text>内容</Text>
</Card>
```

**样式**:
- 圆角: 12px
- 阴影: 轻微阴影效果
- 背景: 白色（默认）
- 内边距: 16px

---

### 4.2 MuscleMap（肌肉分布图）

**文件**: `src/components/MuscleMap.tsx`

**功能**: 可视化展示肌肉发力占比

```typescript
interface MuscleMapProps {
  muscleGroups: MuscleGroup[];
  showPercentages?: boolean;
}

// 数据格式
const muscleGroups = [
  { name: '胸大肌', percentage: 60 },
  { name: '三角肌前束', percentage: 25 },
  { name: '肱三头肌', percentage: 15 },
];
```

**界面**:
```
┌─────────────────────────────────────────────────────────────┐
│  肌肉发力分布                                               │
├─────────────────────────────────────────────────────────────┤
│  胸大肌     ████████████████████████████████  60%        │
│  三角肌前束 ████████████████████              25%        │
│  肱三头肌   ████████████                      15%        │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.3 Button（按钮）

**文件**: `src/components/Button.tsx`

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}
```

**变体**:
- `primary`: 主色调填充按钮
- `secondary`: 次要填充按钮
- `outline`: 边框按钮
- `danger`: 红色危险操作按钮

---

### 4.4 Input（输入框）

**文件**: `src/components/Input.tsx`

```typescript
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
}
```

---

## 5. 新增/修改组件（v2.0）

### 5.1 TemplateCard（模板卡片）★ 新增

**用途**: 在 TrainingScreen 展示动作模板

```typescript
interface TemplateCardProps {
  template: ExerciseTemplate;
  onPress: (template: ExerciseTemplate) => void;
}
```

**界面**:
```
┌─────────────────────────────┐
│ 卧推类                       │
│ 水平推胸动作，包括杠铃...     │
│ ┌────────┐ ┌────────┐       │
│ │杠铃卧推│ │哑铃卧推│       │
│ └────────┘ └────────┘       │
└─────────────────────────────┘
```

**实现位置**: `TrainingScreen.tsx` 内联样式（styles.templateItem）

---

### 5.2 CreateExerciseModal（创建动作弹窗）★ 新增

**用途**: 基于模板创建新动作

**界面元素**:
- 模板名称显示
- 动作名称输入框
- 变式快捷选择标签
- 默认肌肉占比展示
- 确认/取消按钮

**实现位置**: `TrainingScreen.tsx` renderTemplateModal()

---

## 6. 组件使用规范

### 6.1 Props 命名规范

```typescript
// ✅ 好的命名
interface Props {
  exerciseName: string;      // 名词
  onExerciseSelect: () => void;  // on + 动词
  isLoading: boolean;        // is + 状态
  hasError: boolean;         // has + 状态
}

// ❌ 避免
interface Props {
  name: string;              // 太笼统
  handleClick: () => void;   // 用 on 前缀
  loading: boolean;          // 用 is 前缀
}
```

### 6.2 样式规范

```typescript
// ✅ 使用常量
import { COLORS, SPACING, FONTS } from '../constants';

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
  },
});

// ❌ 避免硬编码
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
});
```

### 6.3 性能优化

```typescript
// ✅ 使用 useMemo 缓存计算
const categoryExercises = useMemo(() => {
  return exercises.filter(e => e.category === selectedCategory);
}, [exercises, selectedCategory]);

// ✅ 使用 useCallback 缓存回调
const handleSelect = useCallback((exercise: Exercise) => {
  onSelectExercise(exercise);
}, [onSelectExercise]);

// ✅ 列表使用 key
<FlatList
  data={exercises}
  keyExtractor={item => item.id}
  renderItem={renderItem}
/>
```

---

## 7. 主题配置

### 7.1 颜色系统

```typescript
// src/constants/index.ts
export const COLORS = {
  // 主色调
  primary: '#2196F3',
  primaryLight: '#64B5F6',
  primaryDark: '#1976D2',

  // 背景色
  background: '#F5F5F5',
  surface: '#FFFFFF',

  // 文字色
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',

  // 状态色
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  // 边框
  border: '#E0E0E0',
  divider: '#EEEEEE',
};
```

### 7.2 间距系统

```typescript
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### 7.3 字体系统

```typescript
export const FONTS = {
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  weight: {
    normal: '400',
    medium: '500',
    bold: '700',
  },
};
```

---

## 8. 组件目录结构

```
src/components/
├── index.ts                    # 统一导出
├── Card.tsx                    # 卡片容器
├── Button.tsx                  # 按钮
├── Input.tsx                   # 输入框
├── Modal.tsx                   # 弹窗
├── SetInput.tsx               # 组数录入
├── QuickActions.tsx           # 快捷方式
├── ExerciseItem.tsx           # 动作列表项
├── ExerciseFilter.tsx         # 动作筛选
├── MuscleMap.tsx              # 肌肉分布图
├── DatePicker.tsx             # 日期选择器
├── Chart.tsx                  # 图表组件
└── EmptyState.tsx             # 空状态
```

**统一导出** (`index.ts`):
```typescript
export { Card } from './Card';
export { Button } from './Button';
export { Input } from './Input';
export { SetInput } from './SetInput';
export { QuickActions } from './QuickActions';
export { ExerciseItem } from './ExerciseItem';
export { ExerciseFilter } from './ExerciseFilter';
export { MuscleMap } from './MuscleMap';
// ...
```

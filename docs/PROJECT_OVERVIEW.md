# StrengthInsight 项目完整文档

## 项目信息
- **项目名称**: StrengthInsight（力量洞察）
- **版本**: v2.0.0
- **架构**: 模板化动作系统
- **技术栈**: React Native + TypeScript + Zustand
- **创建日期**: 2026-03-24
- **最后更新**: 2026-03-24

---

## 目录
1. [项目概述](#1-项目概述)
2. [功能清单](#2-功能清单)
3. [文件树](#3-文件树)
4. [核心架构](#4-核心架构)
5. [数据模型](#5-数据模型)
6. [界面说明](#6-界面说明)
7. [开发命令](#7-开发命令)
8. [依赖列表](#8-依赖列表)

---

## 1. 项目概述

### 1.1 项目简介
StrengthInsight 是一款专为力量训练爱好者设计的移动端应用，帮助用户：
- 记录每次训练的详细数据（动作、组数、重量、次数）
- 追踪肌肉群训练分布
- 分析训练进度和力量增长
- 生成训练报告

### 1.2 核心创新：模板化动作系统

传统健身应用提供固定动作列表，用户选择使用。StrengthInsight v2.0 采用全新架构：

```
模板层 (24个标准模板)
    ↓ 用户基于模板创建
用户动作层 (无限自定义)
    ↓ 自动继承
肌肉发力占比
```

**优势**:
- ✅ 不再受限于预设动作列表
- ✅ 科学的发力占比由模板保证
- ✅ 支持任意变式（如"上斜哑铃卧推"）
- ✅ 无需维护英文别名

---

## 2. 功能清单

### 2.1 核心功能

| 功能模块 | 功能描述 | 状态 |
|---------|---------|------|
| **训练记录** | 记录每次训练的动作、组数、重量、次数 | ✅ 已完成 |
| **模板系统** | 24个动作模板，支持创建自定义动作 | ✅ 已完成 |
| **肌肉分布** | 自动计算各肌肉群训练占比 | ✅ 已完成 |
| **数据统计** | 总训练次数、总容量、最大重量等 | ✅ 已完成 |
| **历史记录** | 查看过往所有训练记录 | ✅ 已完成 |
| **动作库** | 管理用户创建的所有动作 | ✅ 已完成 |
| **快捷方式** | 首页快速访问常用动作 | ✅ 已完成 |
| **日历视图** | 以日历形式查看训练记录 | ✅ 已完成 |

### 2.2 统计功能

| 统计项 | 说明 |
|--------|------|
| 总训练次数 | 累计完成的训练会话数 |
| 总组数 | 累计完成的组数 |
| 总容量 | 累计举起的总重量 (kg) |
| 最大重量 | 单个动作的最大重量 |
| 最高 E1RM | 估算单次最大重量 |
| 肌肉分布 | 各肌肉群训练占比图表 |
| 训练频率 | 每周训练次数统计 |
| 连续训练天数 | 当前和最长连续训练记录 |

### 2.3 报告功能

| 报告类型 | 说明 |
|---------|------|
| 周期报告 | 自定义时间段的训练统计 |
| 肌肉分布报告 | 各部位训练占比可视化 |
| 个人记录 | 各动作的历史最高记录 |
| 进度趋势 | 重量和容量变化趋势 |

### 2.4 计划功能

| 功能 | 状态 |
|------|------|
| 训练计划制定 | 📋 计划中 |
| 计划执行跟踪 | 📋 计划中 |
| 智能训练建议 | 📋 计划中 |

---

## 3. 文件树

```
StrengthInsight/
├── 📁 android/                          # Android 原生代码
│   ├── app/
│   ├── gradle/
│   └── build.gradle
│
├── 📁 ios/                              # iOS 原生代码
│   └── StrengthInsight/
│       └── Images.xcassets/
│
├── 📁 docs/                             # 项目文档
│   ├── PROJECT_OVERVIEW.md              # 本文档 - 项目完整概览
│   ├── architecture.md                  # 架构设计文档
│   ├── state-management.md              # 状态管理文档
│   ├── components.md                    # 组件文档
│   └── development-plan.md              # 开发计划
│
├── 📁 src/                              # 源代码
│   ├── 📁 components/                   # 可复用组件
│   │   ├── index.ts                     # 组件统一导出
│   │   ├── Button.tsx                   # 按钮组件
│   │   ├── Card.tsx                     # 卡片容器
│   │   ├── Input.tsx                    # 输入框
│   │   ├── SetInput.tsx                 # 组数录入弹窗
│   │   ├── SetItem.tsx                  # 组数列表项
│   │   ├── QuickActions.tsx             # 快捷方式
│   │   ├── ExerciseItem.tsx             # 动作列表项
│   │   ├── ExerciseFilter.tsx           # 动作筛选
│   │   ├── ExerciseSession.tsx          # 训练会话组件
│   │   ├── MuscleMap.tsx                # 肌肉分布图
│   │   ├── Calendar.tsx                 # 日历组件
│   │   ├── CalendarDay.tsx              # 日历日期项
│   │   ├── StatCard.tsx                 # 统计卡片
│   │   ├── ProgressChart.tsx            # 进度图表
│   │   ├── ReportCard.tsx               # 报告卡片
│   │   ├── PersonalRecord.tsx           # 个人记录展示
│   │   └── ErrorBoundary.tsx            # 错误边界
│   │
│   ├── 📁 screens/                      # 页面组件
│   │   ├── index.ts                     # 页面统一导出
│   │   ├── HomeScreen.tsx               # 首页
│   │   ├── TrainingScreen.tsx           # 训练记录（核心页面）⭐
│   │   ├── TrainingRecordScreen.tsx     # 训练记录详情
│   │   ├── ExerciseLibraryScreen.tsx    # 动作库
│   │   ├── ExerciseDetailScreen.tsx     # 动作详情
│   │   ├── StatsScreen.tsx              # 统计页面
│   │   ├── HistoryScreen.tsx            # 历史记录
│   │   ├── CalendarScreen.tsx           # 日历视图
│   │   └── ReportScreen.tsx             # 报告页面
│   │
│   ├── 📁 navigation/                   # 导航配置
│   │   ├── index.ts
│   │   └── AppNavigator.tsx             # 应用导航器
│   │
│   ├── 📁 stores/                       # 状态管理
│   │   └── trainStore.ts                # 训练数据 Store ⭐
│   │
│   ├── 📁 types/                        # TypeScript 类型
│   │   └── index.ts                     # 核心类型定义 ⭐
│   │
│   ├── 📁 constants/                    # 常量和配置
│   │   └── index.ts                     # 模板定义、颜色、间距等 ⭐
│   │
│   └── 📁 utils/                        # 工具函数
│       ├── index.ts
│       ├── storage.ts                   # 存储操作
│       ├── logger.ts                    # 日志工具
│       └── performance.ts               # 性能监控
│
├── 📁 __tests__/                        # 测试文件
│   └── App.test.tsx
│
├── App.tsx                              # 应用入口
├── app.json                             # 应用配置
├── package.json                         # 依赖配置
├── tsconfig.json                        # TypeScript 配置
├── README.md                            # 项目说明
└── .eslintrc.js                         # ESLint 配置
```

**关键文件标记** ⭐

---

## 4. 核心架构

### 4.1 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | React Native | 0.76.9 |
| 语言 | TypeScript | 5.0.4 |
| 状态管理 | Zustand | 5.0.12 |
| 导航 | React Navigation | 7.x |
| UI 库 | React Native Paper | 5.15.0 |
| 存储 | AsyncStorage | 2.2.0 |
| 图表 | React Native SVG | 15.15.4 |

### 4.2 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        UI 层                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Screens    │ │  Components  │ │  Navigation  │        │
│  │  (10 pages)  │ │  (16 comps)  │ │ (AppNavigator)│        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      状态管理层                              │
│                    Zustand Store                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  TrainStore                                          │ │
│  │  - sessions: TrainingSession[]                       │ │
│  │  - exercises: Exercise[] (用户创建)                   │ │
│  │  - quickActions: string[]                            │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据持久化层                            │
│                   AsyncStorage                               │
│  - strength_insight_train_store                              │
│  - strength_insight_report_config                            │
│  - strength_insight_user_preferences                         │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 模板系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    模板定义 (代码层)                          │
│              EXERCISE_TEMPLATES (24个模板)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 卧推类    │ │ 深蹲类    │ │ 划船类    │ │ 飞鸟类    │       │
│  │bench_press│ │  squat   │ │   row    │ │   fly    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│       ↓            ↓            ↓            ↓              │
│  肌肉占比:      肌肉占比:      肌肉占比:      肌肉占比:       │
│  胸大肌 60%    股四头肌 70%   背阔肌 60%   胸大肌 70%       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    用户创建的动作                             │
│                   (存储在 AsyncStorage)                       │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   杠铃卧推       │  │   哑铃卧推       │                   │
│  │ templateType:   │  │ templateType:   │                   │
│  │  'bench_press'  │  │  'bench_press'  │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 数据模型

### 5.1 核心类型

```typescript
// 动作模板类型 - 24种
export type ExerciseTemplateType =
  // 胸部
  | 'bench_press' | 'incline_press' | 'fly' | 'cable_crossover'
  // 背部
  | 'pull_up' | 'lat_pulldown' | 'row' | 'deadlift'
  // 腿部
  | 'squat' | 'leg_press' | 'lunge' | 'leg_curl' | 'leg_extension' | 'calf_raise' | 'hip_thrust'
  // 肩部
  | 'overhead_press' | 'lateral_raise' | 'face_pull' | 'rear_delt_fly'
  // 手臂
  | 'bicep_curl' | 'tricep_extension' | 'tricep_pushdown'
  // 核心
  | 'plank' | 'crunch' | 'leg_raise' | 'russian_twist';

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

// 训练会话
export interface TrainingSession {
  id: string;
  date: string;                    // YYYY-MM-DD
  exercises: ExerciseRecord[];
  duration?: number;               // 训练时长（分钟）
  createdAt: number;
  updatedAt: number;
}

// 动作记录（在训练会话中）
export interface ExerciseRecord {
  exerciseId: string;
  exerciseName: string;
  sets: SetData[];
}

// 单组数据
export interface SetData {
  weight: number;                  // 重量 (kg)
  reps: number;                    // 次数
  note?: string;                   // 备注
}

// 肌肉群
export interface MuscleGroup {
  name: string;
  percentage: number;              // 发力占比 (0-100)
}

// 训练部位
export type ExerciseCategory =
  | 'chest'      // 胸部
  | 'back'       // 背部
  | 'legs'       // 腿部
  | 'shoulders'  // 肩部
  | 'arms'       // 手臂
  | 'core';      // 核心
```

### 5.2 模板列表明细

| 部位 | 模板名称 | 模板类型 | 主要肌肉 | 变式示例 |
|------|---------|---------|---------|---------|
| **胸部** | 卧推类 | bench_press | 胸大肌 60% | 杠铃卧推、哑铃卧推、史密斯卧推 |
| | 上斜推类 | incline_press | 胸大肌上部 55% | 上斜杠铃卧推、上斜哑铃卧推 |
| | 飞鸟类 | fly | 胸大肌 70% | 哑铃飞鸟、绳索飞鸟、器械飞鸟 |
| | 绳索夹胸类 | cable_crossover | 胸大肌 65% | 高位夹胸、低位夹胸 |
| **背部** | 引体向上类 | pull_up | 背阔肌 50% | 正握引体、反握引体、对握引体 |
| | 下拉类 | lat_pulldown | 背阔肌 55% | 高位下拉、V把下拉、直臂下拉 |
| | 划船类 | row | 背阔肌 50% | 杠铃划船、T杠划船、单臂哑铃划船 |
| | 硬拉类 | deadlift | 腘绳肌 35% | 传统硬拉、相扑硬拉、罗马尼亚硬拉 |
| **腿部** | 深蹲类 | squat | 股四头肌 70% | 杠铃深蹲、高杠深蹲、低杠深蹲 |
| | 腿举类 | leg_press | 股四头肌 65% | 45度腿举、倒蹬、水平腿举 |
| | 弓步类 | lunge | 股四头肌 60% | 哑铃弓步、杠铃弓步、行走弓步 |
| | 腿弯举类 | leg_curl | 腘绳肌 80% | 俯卧腿弯举、坐姿腿弯举 |
| | 腿屈伸类 | leg_extension | 股四头肌 85% | 坐姿腿屈伸 |
| | 提踵类 | calf_raise | 小腿肌群 90% | 站姿提踵、坐姿提踵 |
| | 臀推类 | hip_thrust | 臀大肌 70% | 杠铃臀推、单腿臀推 |
| **肩部** | 推举类 | overhead_press | 三角肌前束 40% | 杠铃推举、哑铃推举、阿诺德推举 |
| | 侧平举类 | lateral_raise | 三角肌中束 80% | 哑铃侧平举、绳索侧平举 |
| | 面拉类 | face_pull | 三角肌后束 40% | 绳索面拉 |
| | 后束飞鸟类 | rear_delt_fly | 三角肌后束 70% | 俯身飞鸟、反向飞鸟 |
| **手臂** | 二头弯举类 | bicep_curl | 肱二头肌 80% | 杠铃弯举、哑铃弯举、锤式弯举 |
| | 三头伸展类 | tricep_extension | 肱三头肌 75% | 哑铃颈后臂屈伸、绳索臂屈伸 |
| | 三头下压类 | tricep_pushdown | 肱三头肌 80% | 直杆下压、绳索下压、V把下压 |
| **核心** | 平板支撑类 | plank | 腹直肌 60% | 标准平板、侧平板、单臂平板 |
| | 卷腹类 | crunch | 腹直肌 80% | 标准卷腹、反向卷腹、自行车卷腹 |
| | 举腿类 | leg_raise | 腹直肌下部 70% | 悬垂举腿、仰卧举腿 |
| | 俄罗斯转体类 | russian_twist | 腹斜肌 70% | 哑铃转体、药球转体 |

---

## 6. 界面说明

### 6.1 页面清单

| 页面 | 路径 | 功能描述 |
|------|------|---------|
| 首页 | HomeScreen | 快捷入口、今日训练、最近记录 |
| 训练记录 | TrainingScreen | ⭐核心页面，模板选择、组数录入 |
| 训练详情 | TrainingRecordScreen | 单次训练详情展示 |
| 动作库 | ExerciseLibraryScreen | 查看所有创建的动作 |
| 动作详情 | ExerciseDetailScreen | 动作统计、历史记录 |
| 统计 | StatsScreen | 训练数据统计图表 |
| 历史 | HistoryScreen | 训练历史列表 |
| 日历 | CalendarScreen | 日历视图查看训练 |
| 报告 | ReportScreen | 生成训练报告 |

### 6.2 核心页面：TrainingScreen 布局

```
┌─────────────────────────────────────────────────────────────┐
│  训练记录                                    [完成训练]      │
├─────────────────────────────────────────────────────────────┤
│  [快捷: 卧推] [深蹲] [划船] [面拉]           [配置]         │
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

### 6.3 创建动作弹窗

```
┌─────────────────────────────────────────────────────────────┐
│  创建动作                                        [关闭]      │
├─────────────────────────────────────────────────────────────┤
│  基于：卧推类                                                │
├─────────────────────────────────────────────────────────────┤
│  动作名称                                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 杠铃卧推                                               │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  参考变式：                                                  │
│  [杠铃卧推] [哑铃卧推] [史密斯卧推] [器械卧推]              │
├─────────────────────────────────────────────────────────────┤
│  默认肌肉发力：                                              │
│  [胸大肌 60%] [三角肌前束 25%] [肱三头肌 15%]               │
├─────────────────────────────────────────────────────────────┤
│              [取消]          [创建]                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 开发命令

### 7.1 启动命令

```bash
# 启动 Metro 服务
npm start

# 运行 Android（需要 Metro 在运行）
npm run android

# 运行 iOS（需要 Metro 在运行）
npm run ios
```

### 7.2 代码质量

```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit
```

### 7.3 测试

```bash
# 运行单元测试
npm test

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

### 7.4 构建

```bash
# Android Release
npm run build:android

# iOS Release
npm run build:ios
```

### 7.5 调试命令

```bash
# 查看连接的设备
adb devices

# 查看日志
adb logcat

# 进入 shell
adb shell

# 安装 APK
adb install app-debug.apk
```

---

## 8. 依赖列表

### 8.1 生产依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| react | 18.3.1 | React 核心 |
| react-native | 0.76.9 | React Native 框架 |
| zustand | 5.0.12 | 状态管理 |
| @react-navigation/native | 7.1.34 | 导航核心 |
| @react-navigation/bottom-tabs | 7.15.6 | 底部导航 |
| @react-navigation/stack | 7.2.10 | 堆栈导航 |
| @react-native-async-storage/async-storage | 2.2.0 | 本地存储 |
| react-native-paper | 5.15.0 | UI 组件库 |
| react-native-gesture-handler | 2.14.0 | 手势处理 |
| react-native-safe-area-context | 5.7.0 | 安全区域 |
| react-native-screens | 4.0.0 | 屏幕优化 |
| react-native-svg | 15.15.4 | SVG 图表 |

### 8.2 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| typescript | 5.0.4 | TypeScript 编译器 |
| @types/react | 18.2.6 | React 类型定义 |
| eslint | 8.19.0 | 代码检查 |
| prettier | 2.8.8 | 代码格式化 |
| jest | 29.6.3 | 测试框架 |
| @babel/core | 7.25.2 | Babel 编译器 |

---

## 9. 版本历史

### v2.0.0 (2026-03-24) - 模板化重构
- ✅ 移除 28 个预设动作和英文别名
- ✅ 引入 24 个动作模板
- ✅ 用户基于模板自由创建动作
- ✅ 重构 TrainingScreen 为左右布局
- ✅ 更新类型定义和状态管理
- ✅ 创建完整技术文档

### v1.x (早期版本)
- 28 个预设动作
- 英文别名系统
- 基础训练记录功能

---

## 10. 待办事项

### 高优先级
- [ ] 添加动作模板预览图
- [ ] 实现快捷方式配置功能
- [ ] 添加单元测试
- [ ] 数据导入/导出功能

### 中优先级
- [ ] 训练计划制定
- [ ] 肌肉群训练热力图
- [ ] 云端数据同步
- [ ] 社区模板市场

### 低优先级
- [ ] 训练提醒功能
- [ ] 社交分享
- [ ] 多语言支持

---

## 11. 参考资料

- [React Native 官方文档](https://reactnative.dev/)
- [React Navigation 文档](https://reactnavigation.org/)
- [Zustand 文档](https://docs.pmnd.rs/zustand)
- [React Native Paper 文档](https://callstack.github.io/react-native-paper/)

---

**文档维护**: 随代码更新同步更新
**最后更新**: 2026-03-24

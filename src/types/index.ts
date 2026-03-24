/**
 * 组数据
 */
export interface SetData {
  weight: number;
  reps: number;
  rpe?: number;
  note?: string;
}

/**
 * 动作分类
 */
export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core';

/**
 * 动作模板类型 - 用于定义一类动作的肌肉发力占比
 */
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

/**
 * 动作模板定义
 */
export interface ExerciseTemplate {
  type: ExerciseTemplateType;
  name: string;                    // 模板名称（如：卧推类）
  category: ExerciseCategory;
  description: string;             // 动作描述
  muscleGroups: MuscleGroup[];     // 默认肌肉发力占比
  variations: string[];            // 常见变式示例
}

/**
 * 动作定义 - 用户创建的具体动作
 */
export interface Exercise {
  id: string;
  name: string;                    // 动作名称（用户自定义）
  category: ExerciseCategory;
  templateType: ExerciseTemplateType; // 基于哪个模板
  isCustom: boolean;               // 是否完全自定义
  isFavorite?: boolean;
  muscleGroups?: MuscleGroup[];    // 自定义肌肉占比（可选，默认使用模板）
  notes?: string;                  // 用户备注
  createdAt: number;
}

/**
 * 肌肉群及发力比例
 */
export interface MuscleGroup {
  name: string;
  percentage: number;
}

/**
 * 动作记录（某次训练中的某个动作）
 */
export interface ExerciseRecord {
  exerciseId: string;
  exerciseName: string;
  sets: SetData[];
}

/**
 * 训练记录（某一天的完整训练）
 */
export interface TrainingSession {
  id: string;
  date: string;
  exercises: ExerciseRecord[];
  notes?: string;
  duration?: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * 训练统计
 */
export interface TrainingStats {
  totalSessions: number;
  totalExercises: number;
  totalSets: number;
  totalVolume: number;
  favoriteExercise: string | null;
  lastTrainingDate: string | null;
  currentStreak: number;
  weeklyFrequency: number;
}

/**
 * 动作统计数据
 */
export interface ExerciseStats {
  exerciseId: string;
  exerciseName: string;
  totalSets: number;
  totalVolume: number;
  maxWeight: number;
  bestE1RM: number;
  lastUsed: number;
  useCount: number;
}

/**
 * 报告数据维度
 */
export interface ReportDataDimension {
  id: string;
  name: string;
  category: 'basic' | 'strength' | 'distribution' | 'analysis' | 'special';
  selected: boolean;
}

/**
 * 报告配置
 */
export interface ReportConfig {
  startDate: string;
  endDate: string;
  dimensions: string[];
  style: 'simple' | 'detailed' | 'chart';
}

/**
 * 报告数据
 */
export interface ReportData {
  period: string;
  stats: {
    totalSessions: number;
    totalSets: number;
    totalVolume: number;
    avgDuration: number;
  };
  exerciseProgress: {
    name: string;
    e1rm: number;
    progress: number;
  }[];
  muscleDistribution: {
    name: string;
    percentage: number;
  }[];
  personalRecords: {
    exerciseName: string;
    weight: number;
    reps: number;
    date: string;
  }[];
}

/**
 * Store状态
 */
export interface StoreState {
  sessions: TrainingSession[];
  exercises: Exercise[];
  quickActions: string[];

  addSession: (session: TrainingSession) => void;
  updateSession: (id: string, updates: Partial<TrainingSession>) => void;
  deleteSession: (id: string) => void;
  getSessionByDate: (date: string) => TrainingSession | undefined;
  getSessionsByDateRange: (startDate: string, endDate: string) => TrainingSession[];

  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;

  updateQuickActions: (exerciseIds: string[]) => void;

  getStats: () => TrainingStats;
  getExerciseStats: (exerciseId: string) => ExerciseStats | null;
  getReportData: (config: ReportConfig) => ReportData;
}

import {
  Exercise,
  ExerciseCategory,
  ExerciseTemplate,
  ExerciseTemplateType,
  ReportDataDimension,
} from '../types';

/**
 * 动作分类名称映射
 */
export const CATEGORY_NAMES: Record<ExerciseCategory, string> = {
  chest: '胸部',
  back: '背部',
  legs: '腿部',
  shoulders: '肩部',
  arms: '手臂',
  core: '核心',
};

/**
 * 动作分类顺序
 */
export const CATEGORY_ORDER: ExerciseCategory[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
];

/**
 * 动作模板列表 - 用户基于模板创建自己的动作
 */
export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  // 胸部
  {
    type: 'bench_press',
    name: '卧推类',
    category: 'chest',
    description: '水平推胸动作，包括杠铃卧推、哑铃卧推等',
    muscleGroups: [
      { name: '胸大肌', percentage: 60 },
      { name: '三角肌前束', percentage: 25 },
      { name: '肱三头肌', percentage: 15 },
    ],
    variations: ['杠铃卧推', '哑铃卧推', '史密斯卧推', '器械卧推'],
  },
  {
    type: 'incline_press',
    name: '上斜推类',
    category: 'chest',
    description: '上斜角度推胸，侧重胸肌上部',
    muscleGroups: [
      { name: '胸大肌上部', percentage: 55 },
      { name: '三角肌前束', percentage: 30 },
      { name: '肱三头肌', percentage: 15 },
    ],
    variations: ['上斜杠铃卧推', '上斜哑铃卧推', '上斜器械推胸'],
  },
  {
    type: 'fly',
    name: '飞鸟类',
    category: 'chest',
    description: '夹胸动作，孤立刺激胸肌',
    muscleGroups: [
      { name: '胸大肌', percentage: 70 },
      { name: '三角肌前束', percentage: 20 },
      { name: '肱二头肌', percentage: 10 },
    ],
    variations: ['哑铃飞鸟', '绳索飞鸟', '器械飞鸟', '上斜飞鸟'],
  },
  {
    type: 'cable_crossover',
    name: '绳索夹胸类',
    category: 'chest',
    description: '绳索夹胸，全程张力',
    muscleGroups: [
      { name: '胸大肌', percentage: 75 },
      { name: '三角肌前束', percentage: 15 },
      { name: '肱二头肌', percentage: 10 },
    ],
    variations: ['高位夹胸', '低位夹胸', '水平夹胸'],
  },

  // 背部
  {
    type: 'pull_up',
    name: '引体向上类',
    category: 'back',
    description: '自重拉背动作，背部训练之王',
    muscleGroups: [
      { name: '背阔肌', percentage: 45 },
      { name: '肱二头肌', percentage: 25 },
      { name: '大圆肌', percentage: 20 },
      { name: '小圆肌', percentage: 10 },
    ],
    variations: ['正手引体', '反手引体', '宽握引体', '窄握引体', '辅助引体'],
  },
  {
    type: 'lat_pulldown',
    name: '下拉类',
    category: 'back',
    description: '器械下拉，模拟引体向上',
    muscleGroups: [
      { name: '背阔肌', percentage: 50 },
      { name: '肱二头肌', percentage: 25 },
      { name: '大圆肌', percentage: 15 },
      { name: '小圆肌', percentage: 10 },
    ],
    variations: ['宽握下拉', '窄握下拉', '反手下拉', 'V把下拉'],
  },
  {
    type: 'row',
    name: '划船类',
    category: 'back',
    description: '水平拉背动作，增厚背部',
    muscleGroups: [
      { name: '背阔肌', percentage: 40 },
      { name: '斜方肌', percentage: 25 },
      { name: '肱二头肌', percentage: 20 },
      { name: '菱形肌', percentage: 15 },
    ],
    variations: ['杠铃划船', '哑铃划船', '坐姿划船', '器械划船', 'T杠划船'],
  },
  {
    type: 'deadlift',
    name: '硬拉类',
    category: 'back',
    description: '全身性拉动作，后侧链训练',
    muscleGroups: [
      { name: '腘绳肌', percentage: 35 },
      { name: '臀大肌', percentage: 30 },
      { name: '下背部', percentage: 20 },
      { name: '斜方肌', percentage: 10 },
      { name: '前臂', percentage: 5 },
    ],
    variations: ['传统硬拉', '相扑硬拉', '罗马尼亚硬拉', '直腿硬拉'],
  },

  // 腿部
  {
    type: 'squat',
    name: '深蹲类',
    category: 'legs',
    description: '下肢训练之王，全面发展腿部',
    muscleGroups: [
      { name: '股四头肌', percentage: 50 },
      { name: '臀大肌', percentage: 30 },
      { name: '腘绳肌', percentage: 15 },
      { name: '小腿肌群', percentage: 5 },
    ],
    variations: ['杠铃深蹲', '前蹲', '高杠深蹲', '低杠深蹲', '箱式深蹲'],
  },
  {
    type: 'leg_press',
    name: '腿举类',
    category: 'legs',
    description: '器械腿举，安全高效',
    muscleGroups: [
      { name: '股四头肌', percentage: 55 },
      { name: '臀大肌', percentage: 30 },
      { name: '腘绳肌', percentage: 15 },
    ],
    variations: ['倒蹬', '水平腿举', '45度腿举'],
  },
  {
    type: 'lunge',
    name: '弓步类',
    category: 'legs',
    description: '单腿训练动作，提升稳定性',
    muscleGroups: [
      { name: '股四头肌', percentage: 50 },
      { name: '臀大肌', percentage: 30 },
      { name: '腘绳肌', percentage: 15 },
      { name: '小腿肌群', percentage: 5 },
    ],
    variations: ['箭步蹲', '保加利亚分腿蹲', '行走箭步蹲', '侧箭步蹲'],
  },
  {
    type: 'leg_curl',
    name: '腿弯举类',
    category: 'legs',
    description: '孤立训练腘绳肌',
    muscleGroups: [
      { name: '腘绳肌', percentage: 80 },
      { name: '小腿肌群', percentage: 20 },
    ],
    variations: ['俯卧腿弯举', '坐姿腿弯举', '站姿腿弯举'],
  },
  {
    type: 'leg_extension',
    name: '腿屈伸类',
    category: 'legs',
    description: '孤立训练股四头肌',
    muscleGroups: [
      { name: '股四头肌', percentage: 85 },
      { name: '小腿肌群', percentage: 15 },
    ],
    variations: ['坐姿腿屈伸', '单腿屈伸'],
  },
  {
    type: 'calf_raise',
    name: '提踵类',
    category: 'legs',
    description: '小腿训练',
    muscleGroups: [
      { name: '腓肠肌', percentage: 70 },
      { name: '比目鱼肌', percentage: 30 },
    ],
    variations: ['站姿提踵', '坐姿提踵', '器械提踵', '单腿提踵'],
  },
  {
    type: 'hip_thrust',
    name: '臀推类',
    category: 'legs',
    description: '臀部孤立训练',
    muscleGroups: [
      { name: '臀大肌', percentage: 70 },
      { name: '腘绳肌', percentage: 20 },
      { name: '下背部', percentage: 10 },
    ],
    variations: ['杠铃臀推', '单腿臀推', '器械臀推', '臀桥'],
  },

  // 肩部
  {
    type: 'overhead_press',
    name: '推举类',
    category: 'shoulders',
    description: '垂直推肩动作',
    muscleGroups: [
      { name: '三角肌前束', percentage: 45 },
      { name: '三角肌中束', percentage: 35 },
      { name: '肱三头肌', percentage: 15 },
      { name: '核心肌群', percentage: 5 },
    ],
    variations: ['站姿推举', '坐姿推举', '哑铃推举', '阿诺德推举'],
  },
  {
    type: 'lateral_raise',
    name: '侧平举类',
    category: 'shoulders',
    description: '孤立训练中束，打造宽肩',
    muscleGroups: [
      { name: '三角肌中束', percentage: 80 },
      { name: '三角肌前束', percentage: 15 },
      { name: '斜方肌', percentage: 5 },
    ],
    variations: ['哑铃侧平举', '绳索侧平举', '器械侧平举', '倾斜侧平举'],
  },
  {
    type: 'face_pull',
    name: '面拉类',
    category: 'shoulders',
    description: '后束训练，改善圆肩',
    muscleGroups: [
      { name: '三角肌后束', percentage: 40 },
      { name: '菱形肌', percentage: 30 },
      { name: '斜方肌', percentage: 20 },
      { name: '肩袖肌群', percentage: 10 },
    ],
    variations: ['绳索面拉', '高位面拉', '低位面拉'],
  },
  {
    type: 'rear_delt_fly',
    name: '后束飞鸟类',
    category: 'shoulders',
    description: '孤立训练三角肌后束',
    muscleGroups: [
      { name: '三角肌后束', percentage: 60 },
      { name: '菱形肌', percentage: 25 },
      { name: '斜方肌', percentage: 15 },
    ],
    variations: ['俯身飞鸟', '器械反向飞鸟', '绳索后束飞鸟'],
  },

  // 手臂
  {
    type: 'bicep_curl',
    name: '二头弯举类',
    category: 'arms',
    description: '肱二头肌训练',
    muscleGroups: [
      { name: '肱二头肌', percentage: 70 },
      { name: '肱肌', percentage: 20 },
      { name: '前臂肌群', percentage: 10 },
    ],
    variations: ['哑铃弯举', '杠铃弯举', '锤式弯举', '集中弯举', '牧师凳弯举'],
  },
  {
    type: 'tricep_extension',
    name: '三头伸展类',
    category: 'arms',
    description: '过头臂屈伸类动作',
    muscleGroups: [
      { name: '肱三头肌', percentage: 85 },
      { name: '前臂肌群', percentage: 15 },
    ],
    variations: ['仰卧臂屈伸', '坐姿臂屈伸', '单臂屈伸', '绳索过头伸展'],
  },
  {
    type: 'tricep_pushdown',
    name: '三头下压类',
    category: 'arms',
    description: '绳索或器械下压',
    muscleGroups: [
      { name: '肱三头肌', percentage: 80 },
      { name: '前臂肌群', percentage: 20 },
    ],
    variations: ['直杆下压', '绳索下压', 'V把下压', '单臂下压'],
  },

  // 核心
  {
    type: 'plank',
    name: '平板支撑类',
    category: 'core',
    description: '等长收缩核心训练',
    muscleGroups: [
      { name: '腹直肌', percentage: 40 },
      { name: '腹横肌', percentage: 30 },
      { name: '竖脊肌', percentage: 20 },
      { name: '臀大肌', percentage: 10 },
    ],
    variations: ['标准平板', '侧平板', '反向平板', '平板支撑转体'],
  },
  {
    type: 'crunch',
    name: '卷腹类',
    category: 'core',
    description: '动态腹肌训练',
    muscleGroups: [
      { name: '腹直肌', percentage: 70 },
      { name: '腹外斜肌', percentage: 20 },
      { name: '腹内斜肌', percentage: 10 },
    ],
    variations: ['标准卷腹', '绳索卷腹', '器械卷腹', '反向卷腹'],
  },
  {
    type: 'leg_raise',
    name: '举腿类',
    category: 'core',
    description: '下腹训练',
    muscleGroups: [
      { name: '腹直肌下部', percentage: 50 },
      { name: '髂腰肌', percentage: 30 },
      { name: '腹直肌上部', percentage: 15 },
      { name: '前臂肌群', percentage: 5 },
    ],
    variations: ['悬垂举腿', '仰卧举腿', '支撑举腿', '斜板举腿'],
  },
  {
    type: 'russian_twist',
    name: '转体类',
    category: 'core',
    description: '腹斜肌训练',
    muscleGroups: [
      { name: '腹外斜肌', percentage: 45 },
      { name: '腹内斜肌', percentage: 45 },
      { name: '腹直肌', percentage: 10 },
    ],
    variations: ['俄罗斯转体', '药球转体', '绳索转体', '侧卷腹'],
  },
];

/**
 * 根据模板类型获取模板
 */
export const getTemplateByType = (
  type: ExerciseTemplateType
): ExerciseTemplate | undefined => {
  return EXERCISE_TEMPLATES.find(t => t.type === type);
};

/**
 * 根据分类获取模板列表
 */
export const getTemplatesByCategory = (
  category: ExerciseCategory
): ExerciseTemplate[] => {
  return EXERCISE_TEMPLATES.filter(t => t.category === category);
};

/**
 * 预设报告数据维度（9个）
 */
export const REPORT_DIMENSIONS: ReportDataDimension[] = [
  // 基础数据
  {
    id: 'total_sessions',
    name: '训练次数',
    category: 'basic',
    selected: true,
  },
  {
    id: 'total_volume',
    name: '总容量',
    category: 'basic',
    selected: true,
  },
  {
    id: 'total_sets',
    name: '总组数',
    category: 'basic',
    selected: true,
  },

  // 力量数据
  {
    id: 'e1rm',
    name: '极限重量 (E1RM)',
    category: 'strength',
    selected: true,
  },
  {
    id: 'hypertrophy_weight',
    name: '最佳增肌重量 (75% E1RM)',
    category: 'strength',
    selected: true,
  },
  {
    id: 'strength_weight',
    name: '最佳力量重量 (85% E1RM)',
    category: 'strength',
    selected: false,
  },

  // 分布数据
  {
    id: 'muscle_distribution',
    name: '肌群分布',
    category: 'distribution',
    selected: true,
  },
  {
    id: 'category_distribution',
    name: '部位分布',
    category: 'distribution',
    selected: false,
  },

  // 分析数据
  {
    id: 'progress_rate',
    name: '进步速度',
    category: 'analysis',
    selected: false,
  },
  {
    id: 'frequency_analysis',
    name: '训练频率',
    category: 'analysis',
    selected: false,
  },
];

/**
 * 应用主题色
 */
export const COLORS = {
  primary: '#2196F3',
  primaryLight: '#64B5F6',
  primaryDark: '#1976D2',
  secondary: '#FF9800',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  disabled: '#BDBDBD',
};

/**
 * 间距规范
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * 字体规范
 */
export const FONTS = {
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
};

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  TRAIN_STORE: 'strength_insight_train_store',
  SESSIONS: 'strength_insight_sessions',
  REPORT_CONFIG: 'strength_insight_report_config',
  USER_PREFERENCES: 'strength_insight_user_preferences',
};

/**
 * 默认快捷动作（首次使用时的推荐）
 */
export const DEFAULT_QUICK_ACTIONS: string[] = [];

/**
 * 训练强度颜色
 */
export const INTENSITY_COLORS = {
  high: '#4CAF50',    // 高强度 - 绿色
  medium: '#FFC107',  // 中强度 - 黄色
  low: '#FF9800',     // 低强度 - 橙色
  rest: '#E0E0E0',    // 休息日 - 灰色
  selected: '#2196F3', // 选中 - 蓝色
};

/**
 * 训练强度阈值（kg）
 */
export const INTENSITY_THRESHOLDS = {
  high: 5000,   // > 5000kg 为高强度
  medium: 2000, // 2000-5000kg 为中强度
  low: 0,       // < 2000kg 为低强度
};

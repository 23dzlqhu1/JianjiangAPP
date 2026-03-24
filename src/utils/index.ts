import { SetData, Exercise, TrainingSession, ExerciseStats } from '../types';

/**
 * 计算E1RM（预估1RM）
 * 使用Epley公式: 重量 × (1 + 次数/30)
 */
export const calculateE1RM = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

/**
 * 计算最佳增肌重量 (75% E1RM, 8-12次)
 */
export const calculateHypertrophyWeight = (e1rm: number): number => {
  return Math.round(e1rm * 0.75);
};

/**
 * 计算最佳力量重量 (85% E1RM, 3-5次)
 */
export const calculateStrengthWeight = (e1rm: number): number => {
  return Math.round(e1rm * 0.85);
};

/**
 * 计算最佳耐力重量 (65% E1RM, 15-20次)
 */
export const calculateEnduranceWeight = (e1rm: number): number => {
  return Math.round(e1rm * 0.65);
};

/**
 * 计算强度系数 (实际重量 / E1RM)
 */
export const calculateIntensity = (weight: number, e1rm: number): number => {
  if (e1rm === 0) return 0;
  return Math.round((weight / e1rm) * 100);
};

/**
 * 计算训练容量 (重量 × 次数 × 组数)
 */
export const calculateVolume = (sets: SetData[]): number => {
  return sets.reduce((total, set) => total + set.weight * set.reps, 0);
};

/**
 * 计算进步速度
 */
export const calculateProgressRate = (
  currentE1RM: number,
  previousE1RM: number,
): number => {
  if (previousE1RM === 0) return 0;
  return Math.round(((currentE1RM - previousE1RM) / previousE1RM) * 100);
};

/**
 * 格式化日期 (YYYY-MM-DD)
 */
export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 格式化日期时间 (MM月DD日 HH:mm)
 */
export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
};

/**
 * 格式化日期显示 (MM月DD日 周X)
 */
export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 周${weekday}`;
};

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 获取组数
 */
export const getTotalSets = (sets: SetData[]): number => {
  return sets.length;
};

/**
 * 获取最大重量
 */
export const getMaxWeight = (sets: SetData[]): number => {
  if (sets.length === 0) return 0;
  return Math.max(...sets.map(set => set.weight));
};

/**
 * 获取最佳E1RM
 */
export const getBestE1RM = (sets: SetData[]): number => {
  if (sets.length === 0) return 0;
  return Math.max(...sets.map(set => calculateE1RM(set.weight, set.reps)));
};

/**
 * 计算连续训练天数
 */
export const calculateStreak = (sessions: TrainingSession[]): number => {
  if (sessions.length === 0) return 0;

  const sortedDates = sessions
    .map(s => s.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  // 检查今天或昨天是否有训练
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      streak = 1;
      continue;
    }

    const currentDate = new Date(sortedDates[i - 1]);
    const prevDate = new Date(sortedDates[i]);
    const diffDays = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * 计算周训练频率
 */
export const calculateWeeklyFrequency = (sessions: TrainingSession[]): number => {
  if (sessions.length === 0) return 0;

  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  const recentSessions = sessions.filter(
    s => new Date(s.date) >= fourWeeksAgo,
  );

  return Math.round((recentSessions.length / 4) * 10) / 10;
};

/**
 * 获取动作统计数据
 */
export const getExerciseStats = (
  exerciseId: string,
  sessions: TrainingSession[],
): ExerciseStats | null => {
  const exerciseSessions = sessions.filter(session =>
    session.exercises.some(e => e.exerciseId === exerciseId),
  );

  if (exerciseSessions.length === 0) return null;

  let totalSets = 0;
  let totalVolume = 0;
  let maxWeight = 0;
  let bestE1RM = 0;
  let lastUsed = 0;

  exerciseSessions.forEach(session => {
    const exercise = session.exercises.find(e => e.exerciseId === exerciseId);
    if (exercise) {
      totalSets += exercise.sets.length;
      totalVolume += calculateVolume(exercise.sets);
      maxWeight = Math.max(maxWeight, getMaxWeight(exercise.sets));
      bestE1RM = Math.max(bestE1RM, getBestE1RM(exercise.sets));
      lastUsed = Math.max(lastUsed, new Date(session.date).getTime());
    }
  });

  const exerciseName =
    exerciseSessions[0].exercises.find(e => e.exerciseId === exerciseId)
      ?.exerciseName || '';

  return {
    exerciseId,
    exerciseName,
    totalSets,
    totalVolume,
    maxWeight,
    bestE1RM,
    lastUsed,
    useCount: exerciseSessions.length,
  };
};

/**
 * 获取日期范围内的所有日期
 */
export const getDatesInRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDate(new Date(d)));
  }

  return dates;
};

/**
 * 获取月份第一天
 */
export const getFirstDayOfMonth = (year: number, month: number): string => {
  return formatDate(new Date(year, month - 1, 1));
};

/**
 * 获取月份最后一天
 */
export const getLastDayOfMonth = (year: number, month: number): string => {
  return formatDate(new Date(year, month, 0));
};

/**
 * 判断是否为同一天
 */
export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

/**
 * 获取相对日期描述
 */
export const getRelativeDateDesc = (dateString: string): string => {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  if (dateString === today) return '今天';
  if (dateString === yesterday) return '昨天';

  return formatDateDisplay(dateString);
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 将中文转换为拼音（简单实现，用于搜索）
 */
export const toPinyin = (str: string): string => {
  // 简化的拼音映射，实际项目中可以使用 pinyin 库
  const pinyinMap: { [key: string]: string } = {
    卧: 'wo',
    推: 'tui',
    杠: 'gang',
    铃: 'ling',
    深: 'shen',
    蹲: 'dun',
    硬: 'ying',
    拉: 'la',
    引: 'yin',
    体: 'ti',
    向: 'xiang',
    上: 'shang',
    下: 'xia',
    高: 'gao',
    位: 'wei',
    哑: 'ya',
    肩: 'jian',
    举: 'ju',
    弯: 'wan',
    臂: 'bi',
    屈: 'qu',
    伸: 'shen',
    腿: 'tui',
    卷: 'juan',
    腹: 'fu',
    平: 'ping',
    板: 'ban',
    支: 'zhi',
    撑: 'cheng',
  };

  return str
    .split('')
    .map(char => pinyinMap[char] || char)
    .join('');
};

/**
 * 搜索匹配
 */
export const searchMatch = (text: string, query: string): boolean => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const pinyinText = toPinyin(text).toLowerCase();

  return lowerText.includes(lowerQuery) || pinyinText.includes(lowerQuery);
};

// 导出存储工具
export { StorageUtils, debugStorage } from './storage';

// 导出日志工具
export { Logger, logger, LogLevel } from './logger';

// 导出性能工具
export {
  PerformanceMonitor,
  useMemoizedCalculation,
  useMemoizedCallback,
  useRenderPerformance,
  useDebouncedValue,
  useThrottledCallback,
  useVirtualList,
  PerformanceTips,
} from './performance';

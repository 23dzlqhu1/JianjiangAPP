import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTrainStore } from '../stores/trainStore';
import { Card, ReportCard, PersonalRecord } from '../components';
import { COLORS, SPACING, FONTS } from '../constants';
import { calculateE1RM, formatDate } from '../utils';

const { width: screenWidth } = Dimensions.get('window');

type TimeRange = 'week' | 'month' | '3months' | 'year' | 'all';

const TIME_RANGE_OPTIONS: { key: TimeRange; label: string }[] = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: '3months', label: '3个月' },
  { key: 'year', label: '本年' },
  { key: 'all', label: '全部' },
];

export const StatsScreen: React.FC = () => {
  const { sessions, exercises, getStats } = useTrainStore();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');

  // 根据时间范围筛选训练
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const ranges: Record<TimeRange, number> = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      '3months': 90 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };

    const cutoffDate = new Date(now.getTime() - ranges[selectedRange]);
    return sessions.filter(s => new Date(s.date) >= cutoffDate);
  }, [sessions, selectedRange]);

  // 计算统计数据
  const stats = useMemo(() => {
    const totalSessions = filteredSessions.length;
    const totalSets = filteredSessions.reduce(
      (sum, s) => sum + s.exercises.reduce((es, ex) => es + ex.sets.length, 0),
      0
    );
    const totalVolume = filteredSessions.reduce(
      (sum, s) =>
        sum + s.exercises.reduce((es, ex) => es + ex.sets.reduce((sv, set) => sv + set.weight * set.reps, 0), 0),
      0
    );

    // 计算训练频率（每周）
    const uniqueWeeks = new Set(
      filteredSessions.map(s => {
        const date = new Date(s.date);
        return `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      })
    ).size;
    const frequency = uniqueWeeks > 0 ? (totalSessions / uniqueWeeks).toFixed(1) : '0';

    // 计算连续训练天数
    const sortedDates = [...new Set(filteredSessions.map(s => s.date))].sort();
    let maxStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    return {
      totalSessions,
      totalSets,
      totalVolume,
      frequency,
      maxStreak,
    };
  }, [filteredSessions]);

  // 计算个人记录
  const personalRecords = useMemo(() => {
    const records: Record<
      string,
      { weight: number; reps: number; date: string; e1rm: number }
    > = {};

    filteredSessions.forEach(session => {
      session.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          const e1rm = calculateE1RM(set.weight, set.reps);
          const currentRecord = records[exercise.exerciseName];
          if (!currentRecord || e1rm > currentRecord.e1rm) {
            records[exercise.exerciseName] = {
              weight: set.weight,
              reps: set.reps,
              date: session.date,
              e1rm,
            };
          }
        });
      });
    });

    return Object.entries(records)
      .map(([name, record]) => ({ name, ...record }))
      .sort((a, b) => b.e1rm - a.e1rm)
      .slice(0, 5);
  }, [filteredSessions]);

  // 计算动作分布
  const exerciseDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    filteredSessions.forEach(session => {
      session.exercises.forEach(exercise => {
        distribution[exercise.exerciseName] =
          (distribution[exercise.exerciseName] || 0) + exercise.sets.length;
      });
    });

    return Object.entries(distribution)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredSessions]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>数据统计</Text>
      </View>

      {/* 时间范围选择 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.rangeSelector}
        contentContainerStyle={styles.rangeSelectorContent}>
        {TIME_RANGE_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.rangeButton,
              selectedRange === option.key && styles.rangeButtonActive,
            ]}
            onPress={() => setSelectedRange(option.key)}>
            <Text
              style={[
                styles.rangeButtonText,
                selectedRange === option.key && styles.rangeButtonTextActive,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {/* 核心统计 */}
        <View style={styles.statsGrid}>
          <ReportCard
            title="训练次数"
            value={stats.totalSessions}
            subtitle="次"
          />
          <ReportCard
            title="完成组数"
            value={stats.totalSets}
            subtitle="组"
          />
          <ReportCard
            title="总容量"
            value={stats.totalVolume.toLocaleString()}
            subtitle="kg"
          />
          <ReportCard
            title="训练频率"
            value={stats.frequency}
            subtitle="次/周"
          />
        </View>

        {/* 连续训练天数 */}
        <Card style={styles.streakCard}>
          <Text style={styles.streakLabel}>最长连续训练</Text>
          <Text style={styles.streakValue}>{stats.maxStreak} 天</Text>
        </Card>

        {/* 个人记录 */}
        {personalRecords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 个人记录 (E1RM)</Text>
            {personalRecords.map((record, index) => (
              <PersonalRecord
                key={index}
                exerciseName={record.name}
                weight={record.weight}
                reps={record.reps}
                date={record.date}
                e1rm={record.e1rm}
              />
            ))}
          </View>
        )}

        {/* 动作分布 */}
        {exerciseDistribution.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 最常训练动作</Text>
            <Card>
              {exerciseDistribution.map((item, index) => (
                <View key={index} style={styles.distributionItem}>
                  <View style={styles.distributionHeader}>
                    <Text style={styles.distributionName}>{item.name}</Text>
                    <Text style={styles.distributionCount}>{item.count}组</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(item.count / exerciseDistribution[0].count) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* 空状态 */}
        {filteredSessions.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              该时间段内暂无训练记录
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
  },
  rangeSelector: {
    maxHeight: 60,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rangeSelectorContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  rangeButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  rangeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  rangeButtonText: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  rangeButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  streakCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  streakLabel: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
  },
  streakValue: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  distributionItem: {
    marginBottom: SPACING.md,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  distributionName: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  distributionCount: {
    fontSize: FONTS.size.md,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
  },
});

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTrainStore } from '../stores/trainStore';
import { Card, MuscleMap, ProgressChart, PersonalRecord } from '../components';
import { COLORS, SPACING, FONTS, CATEGORY_NAMES } from '../constants';
import { calculateE1RM } from '../utils';

export const ExerciseDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const exerciseId = route.params?.exerciseId ?? '';
  if (!exerciseId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 返回</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未指定动作</Text>
        </View>
      </SafeAreaView>
    );
  }
  const { exercises, sessions, getExerciseStats } = useTrainStore();

  // 获取动作信息
  const exercise = exercises.find(e => e.id === exerciseId);

  // 获取动作统计
  const stats = useMemo(() => {
    return getExerciseStats(exerciseId);
  }, [exerciseId, getExerciseStats]);

  // 获取历史记录
  const history = useMemo(() => {
    const records: {
      date: string;
      weight: number;
      reps: number;
      e1rm: number;
    }[] = [];

    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.exerciseId === exerciseId) {
          ex.sets.forEach(set => {
            records.push({
              date: session.date,
              weight: set.weight,
              reps: set.reps,
              e1rm: calculateE1RM(set.weight, set.reps),
            });
          });
        }
      });
    });

    return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exerciseId, sessions]);

  // 个人记录
  const personalRecord = useMemo(() => {
    if (history.length === 0) return null;
    return history.reduce((max, record) => (record.e1rm > max.e1rm ? record : max));
  }, [history]);

  // 趋势数据
  const trendData = useMemo(() => {
    return history.map(record => ({
      date: record.date.slice(5), // 显示 MM-DD
      value: record.e1rm,
    }));
  }, [history]);

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 返回</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未找到动作信息</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* 基本信息 */}
        <Card style={styles.infoCard}>
          <Text style={styles.categoryLabel}>
            {CATEGORY_NAMES[exercise.category]}
          </Text>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          {exercise.notes && (
            <Text style={styles.notes}>
              备注: {exercise.notes}
            </Text>
          )}
        </Card>

        {/* 肌肉群分布 */}
        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
          <MuscleMap muscleGroups={exercise.muscleGroups} />
        )}

        {/* 统计数据 */}
        {stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>📊 统计数据</Text>
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalSets}</Text>
                <Text style={styles.statLabel}>总组数</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalVolume.toLocaleString()}</Text>
                <Text style={styles.statLabel}>总容量(kg)</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.maxWeight}</Text>
                <Text style={styles.statLabel}>最大重量(kg)</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.bestE1RM}</Text>
                <Text style={styles.statLabel}>最高E1RM(kg)</Text>
              </Card>
            </View>
          </View>
        )}

        {/* 个人记录 */}
        {personalRecord && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 个人记录</Text>
            <PersonalRecord
              exerciseName="最高E1RM"
              weight={personalRecord.weight}
              reps={personalRecord.reps}
              date={personalRecord.date}
              e1rm={personalRecord.e1rm}
            />
          </View>
        )}

        {/* 趋势图 */}
        {trendData.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 E1RM趋势</Text>
            <ProgressChart
              data={trendData}
              title="力量增长趋势"
              unit="kg"
            />
          </View>
        )}

        {/* 历史记录 */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 历史记录</Text>
            <Card>
              {history.slice(-10).reverse().map((record, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyDate}>{record.date}</Text>
                  <Text style={styles.historyData}>
                    {record.weight}kg × {record.reps}次
                  </Text>
                  <Text style={styles.historyE1RM}>
                    E1RM: {record.e1rm}kg
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* 空状态 */}
        {history.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              还没有这个动作的训练记录
            </Text>
            <Text style={styles.emptySubtext}>
              开始训练并记录吧！
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: FONTS.size.md,
    color: COLORS.primary,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  infoCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  categoryLabel: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  exerciseName: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  notes: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
  statsSection: {
    marginBottom: SPACING.lg,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
  },
  statValue: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyDate: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  historyData: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  historyE1RM: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    flex: 1,
    textAlign: 'right',
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

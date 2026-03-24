import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTrainStore } from '../stores/trainStore';
import { Calendar, Card, Button } from '../components';
import { COLORS, SPACING, FONTS } from '../constants';
import { formatDate, calculateVolume } from '../utils';
import { TrainingSession } from '../types';

interface CalendarScreenProps {
  navigation: any;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { sessions, getSessionByDate } = useTrainStore();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  // 计算训练强度数据
  const trainingDates = useMemo(() => {
    return sessions.map(session => {
      const totalVolume = session.exercises.reduce(
        (sum, ex) => sum + calculateVolume(ex.sets),
        0
      );
      let intensity: 'low' | 'medium' | 'high' = 'low';
      if (totalVolume > 10000) {
        intensity = 'high';
      } else if (totalVolume > 5000) {
        intensity = 'medium';
      }
      return {
        date: session.date,
        intensity,
      };
    });
  }, [sessions]);

  // 获取选中日期的训练
  const selectedSession = useMemo(() => {
    return getSessionByDate(selectedDate);
  }, [selectedDate, getSessionByDate]);

  // 计算选中日期训练的统计
  const sessionStats = useMemo(() => {
    if (!selectedSession) return null;
    const exerciseCount = selectedSession.exercises.length;
    const setCount = selectedSession.exercises.reduce(
      (sum, ex) => sum + ex.sets.length,
      0
    );
    const totalVolume = selectedSession.exercises.reduce(
      (sum, ex) => sum + calculateVolume(ex.sets),
      0
    );
    return { exerciseCount, setCount, totalVolume };
  }, [selectedSession]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleAddTraining = () => {
    navigation.navigate('Training', { date: selectedDate });
  };

  const handleViewTraining = () => {
    navigation.navigate('TrainingRecord', { date: selectedDate });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>训练日历</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 日历组件 */}
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          trainingDates={trainingDates}
        />

        {/* 选中日期的训练信息 */}
        <View style={styles.sessionInfo}>
          <Text style={styles.dateTitle}>
            {selectedDate} 的训练
          </Text>

          {selectedSession ? (
            <Card style={styles.sessionCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {sessionStats?.exerciseCount}
                  </Text>
                  <Text style={styles.statLabel}>动作</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {sessionStats?.setCount}
                  </Text>
                  <Text style={styles.statLabel}>组数</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {sessionStats?.totalVolume.toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>容量(kg)</Text>
                </View>
              </View>

              <View style={styles.exerciseList}>
                {selectedSession.exercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>
                      {exercise.exerciseName}
                    </Text>
                    <Text style={styles.exerciseSets}>
                      {exercise.sets.length}组
                    </Text>
                  </View>
                ))}
              </View>

              <Button
                title="查看详情"
                onPress={handleViewTraining}
                variant="primary"
                style={styles.actionButton}
              />
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                这一天还没有训练记录
              </Text>
              <Button
                title="补录训练"
                onPress={handleAddTraining}
                variant="outline"
                style={styles.actionButton}
              />
            </Card>
          )}
        </View>
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
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  sessionInfo: {
    marginTop: SPACING.lg,
  },
  dateTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sessionCard: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  exerciseList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  exerciseName: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  exerciseSets: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    width: '100%',
  },
});

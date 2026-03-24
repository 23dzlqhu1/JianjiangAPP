import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTrainStore } from '../stores/trainStore';
import { ExerciseSession, SetInput, Button } from '../components';
import { COLORS, SPACING, FONTS } from '../constants';
import { SetData, ExerciseRecord } from '../types';
import { calculateVolume, calculateE1RM } from '../utils';

export const TrainingRecordScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const date = route.params?.date ?? '';
  if (!date) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未指定日期</Text>
          <Button title="返回" onPress={() => navigation.goBack()} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }
  const { sessions, updateSession, deleteSession } = useTrainStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showSetInput, setShowSetInput] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);

  // 获取当前日期的训练
  const session = sessions.find(s => s.date === date);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{date}</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>没有找到这一天的训练记录</Text>
          <Button
            title="返回日历"
            onPress={() => navigation.goBack()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  // 计算统计
  const totalExercises = session.exercises.length;
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalVolume = session.exercises.reduce(
    (sum, ex) => sum + calculateVolume(ex.sets),
    0
  );

  const handleAddSet = (exerciseIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);
    setEditingSetIndex(null);
    setShowSetInput(true);
  };

  const handleEditSet = (exerciseIndex: number, setIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);
    setEditingSetIndex(setIndex);
    setShowSetInput(true);
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    Alert.alert(
      '删除组数',
      '确定要删除这组记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            const newExercises = [...session.exercises];
            newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.filter(
              (_, i) => i !== setIndex
            );
            // 如果该动作没有组数了，删除该动作
            if (newExercises[exerciseIndex].sets.length === 0) {
              newExercises.splice(exerciseIndex, 1);
            }
            updateSession(session.id, { exercises: newExercises });
          },
        },
      ]
    );
  };

  const handleDeleteExercise = (exerciseIndex: number) => {
    Alert.alert(
      '删除动作',
      '确定要删除这个动作的所有记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            const newExercises = session.exercises.filter((_, i) => i !== exerciseIndex);
            updateSession(session.id, { exercises: newExercises });
          },
        },
      ]
    );
  };

  const handleSetConfirm = (set: SetData) => {
    if (currentExerciseIndex === null) return;

    const newExercises = [...session.exercises];
    if (editingSetIndex !== null) {
      // 编辑现有组数
      newExercises[currentExerciseIndex].sets[editingSetIndex] = set;
    } else {
      // 添加新组数
      newExercises[currentExerciseIndex].sets.push(set);
    }
    updateSession(session.id, { exercises: newExercises });
    setShowSetInput(false);
    setCurrentExerciseIndex(null);
    setEditingSetIndex(null);
  };

  const handleDeleteSession = () => {
    Alert.alert(
      '删除训练',
      '确定要删除这一天的所有训练记录吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            deleteSession(session.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{date}</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editButton}>
            {isEditing ? '完成' : '编辑'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 统计摘要 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalExercises}</Text>
            <Text style={styles.statLabel}>动作</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>组数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalVolume.toLocaleString()}</Text>
            <Text style={styles.statLabel}>容量(kg)</Text>
          </View>
        </View>

        {/* 备注 */}
        {session.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>训练备注</Text>
            <Text style={styles.notesText}>{session.notes}</Text>
          </View>
        )}

        {/* 动作列表 */}
        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>训练动作</Text>
          {session.exercises.map((exercise, index) => (
            <ExerciseSession
              key={index}
              record={exercise}
              onAddSet={() => handleAddSet(index)}
              onEditSet={(setIndex) => handleEditSet(index, setIndex)}
              onDeleteSet={(setIndex) => handleDeleteSet(index, setIndex)}
              onDeleteExercise={() => handleDeleteExercise(index)}
            />
          ))}
        </View>

        {/* 删除训练按钮 */}
        {isEditing && (
          <TouchableOpacity
            style={styles.deleteSessionButton}
            onPress={handleDeleteSession}>
            <Text style={styles.deleteSessionText}>删除本次训练</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* 组数录入弹窗 */}
      {currentExerciseIndex !== null && (
        <SetInput
          visible={showSetInput}
          exerciseName={session.exercises[currentExerciseIndex].exerciseName}
          setNumber={
            editingSetIndex !== null
              ? editingSetIndex + 1
              : session.exercises[currentExerciseIndex].sets.length + 1
          }
          defaultWeight={
            editingSetIndex !== null
              ? session.exercises[currentExerciseIndex].sets[editingSetIndex].weight
              : 0
          }
          defaultReps={
            editingSetIndex !== null
              ? session.exercises[currentExerciseIndex].sets[editingSetIndex].reps
              : 0
          }
          defaultNote={
            editingSetIndex !== null
              ? session.exercises[currentExerciseIndex].sets[editingSetIndex].note || ''
              : ''
          }
          onConfirm={handleSetConfirm}
          onCancel={() => {
            setShowSetInput(false);
            setCurrentExerciseIndex(null);
            setEditingSetIndex(null);
          }}
        />
      )}
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
  },
  editButton: {
    fontSize: FONTS.size.md,
    color: COLORS.primary,
    minWidth: 60,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
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
  notesContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  notesLabel: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  notesText: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  exercisesContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  deleteSessionButton: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  deleteSessionText: {
    fontSize: FONTS.size.md,
    color: '#FFFFFF',
    fontWeight: FONTS.weight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
});

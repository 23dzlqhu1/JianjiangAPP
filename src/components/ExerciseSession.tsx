import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { ExerciseRecord, SetData } from '../types';
import { calculateVolume, calculateE1RM } from '../utils';
import { COLORS, SPACING, FONTS } from '../constants';
import { SetItem } from './SetItem';
import { Button } from './Button';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ExerciseSessionProps {
  record: ExerciseRecord;
  onAddSet: () => void;
  onEditSet: (setIndex: number) => void;
  onDeleteSet: (setIndex: number) => void;
  onDeleteExercise: () => void;
}

export const ExerciseSession: React.FC<ExerciseSessionProps> = ({
  record,
  onAddSet,
  onEditSet,
  onDeleteSet,
  onDeleteExercise,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const volume = calculateVolume(record.sets);
  const maxE1RM = Math.max(
    ...record.sets.map(s => calculateE1RM(s.weight, s.reps))
  );

  return (
    <View style={styles.container}>
      {/* 动作标题栏 */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        onLongPress={() => setIsEditing(!isEditing)}>
        <View style={styles.headerLeft}>
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          <Text style={styles.exerciseName}>{record.exerciseName}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.setCount}>{record.sets.length}组</Text>
          {isEditing && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDeleteExercise}>
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* 组数列表 */}
      {isExpanded && (
        <View style={styles.content}>
          {record.sets.map((set, index) => (
            <View key={index} style={styles.setRow}>
              <SetItem
                setNumber={index + 1}
                set={set}
                onPress={() => onEditSet(index)}
                onLongPress={() => isEditing && onDeleteSet(index)}
              />
              {isEditing && (
                <TouchableOpacity
                  style={styles.deleteSetButton}
                  onPress={() => onDeleteSet(index)}>
                  <Text style={styles.deleteSetButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* 添加组按钮 */}
          <Button
            title="+ 添加组"
            variant="outline"
            size="small"
            onPress={onAddSet}
            style={styles.addSetButton}
          />

          {/* 统计信息 */}
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              容量: {volume}kg | 最高E1RM: {maxE1RM}kg
            </Text>
          </View>
        </View>
      )}

      {/* 编辑模式提示 */}
      {isEditing && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => setIsEditing(false)}>
          <Text style={styles.doneButtonText}>完成编辑</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  expandIcon: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
  exerciseName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  setCount: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  deleteButtonText: {
    fontSize: FONTS.size.md,
  },
  content: {
    padding: SPACING.md,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteSetButton: {
    marginLeft: SPACING.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteSetButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
  addSetButton: {
    marginTop: SPACING.sm,
  },
  stats: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statsText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
  },
});

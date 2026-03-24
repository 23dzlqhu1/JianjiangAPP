import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';
import { Exercise } from '../types';

interface QuickActionsProps {
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  onConfigure: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  exercises,
  onSelectExercise,
  onConfigure,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>快速添加</Text>
        <TouchableOpacity onPress={onConfigure}>
          <Text style={styles.configureText}>配置</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {exercises.map(exercise => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.actionButton}
            onPress={() => onSelectExercise(exercise)}
            activeOpacity={0.7}>
            <Text style={styles.actionName} numberOfLines={1}>
              {exercise.name}
            </Text>
            <View style={styles.addBadge}>
              <Text style={styles.addBadgeText}>+添加</Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.actionButton, styles.moreButton]}
          onPress={onConfigure}
          activeOpacity={0.7}>
          <Text style={styles.moreButtonText}>+</Text>
          <Text style={styles.moreButtonLabel}>更多</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
  },
  configureText: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
  },
  scrollContent: {
    gap: SPACING.md,
  },
  actionButton: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionName: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  addBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addBadgeText: {
    fontSize: FONTS.size.xs,
    color: '#FFFFFF',
    fontWeight: FONTS.weight.medium,
  },
  moreButton: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  moreButtonText: {
    fontSize: FONTS.size.xxl,
    color: COLORS.textSecondary,
    fontWeight: '200' as const,
  },
  moreButtonLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

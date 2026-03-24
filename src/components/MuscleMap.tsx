import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';
import { MuscleGroup } from '../types';

interface MuscleMapProps {
  muscleGroups: MuscleGroup[];
}

export const MuscleMap: React.FC<MuscleMapProps> = ({ muscleGroups }) => {
  const sortedMuscles = [...muscleGroups].sort((a, b) => b.percentage - a.percentage);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>肌肉发力分布</Text>
      <View style={styles.muscleList}>
        {sortedMuscles.map((muscle, index) => (
          <View key={index} style={styles.muscleItem}>
            <View style={styles.muscleInfo}>
              <Text style={styles.muscleName}>{muscle.name}</Text>
              <Text style={styles.musclePercentage}>{muscle.percentage}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${muscle.percentage}%` },
                  muscle.percentage >= 50 && styles.progressBarHigh,
                  muscle.percentage >= 30 && muscle.percentage < 50 && styles.progressBarMedium,
                  muscle.percentage < 30 && styles.progressBarLow,
                ]}
              />
            </View>
          </View>
        ))}
      </View>
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
  title: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  muscleList: {
    gap: SPACING.md,
  },
  muscleItem: {
    gap: SPACING.xs,
  },
  muscleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscleName: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
  },
  musclePercentage: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarHigh: {
    backgroundColor: COLORS.primary,
  },
  progressBarMedium: {
    backgroundColor: COLORS.primaryLight,
  },
  progressBarLow: {
    backgroundColor: '#BBDEFB',
  },
});

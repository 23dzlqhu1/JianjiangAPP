import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

interface PersonalRecordProps {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  e1rm: number;
}

export const PersonalRecord: React.FC<PersonalRecordProps> = ({
  exerciseName,
  weight,
  reps,
  date,
  e1rm,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🏆</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.exerciseName}>{exerciseName}</Text>
        <Text style={styles.record}>
          {weight}kg × {reps}次
        </Text>
        <Text style={styles.e1rm}>E1RM: {e1rm}kg</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  exerciseName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  record: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.secondary,
  },
  e1rm: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  date: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, FONTS, CATEGORY_NAMES } from '../constants';
import { Exercise } from '../types';

interface ExerciseItemProps {
  exercise: Exercise;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  onPress,
  onLongPress,
  isSelected = false,
  showFavorite = false,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selected,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{exercise.name}</Text>
          {showFavorite && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              style={styles.favoriteButton}>
              <Text style={[
                styles.favoriteIcon,
                isFavorite && styles.favoriteIconActive,
              ]}>
                {isFavorite ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.category}>
          {CATEGORY_NAMES[exercise.category]}
        </Text>
        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
          <View style={styles.muscleGroups}>
            {exercise.muscleGroups.slice(0, 3).map((mg, index) => (
              <View key={index} style={styles.muscleBadge}>
                <Text style={styles.muscleText}>
                  {mg.name} {mg.percentage}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    flex: 1,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  favoriteIcon: {
    fontSize: FONTS.size.lg,
    color: COLORS.textSecondary,
  },
  favoriteIconActive: {
    color: COLORS.secondary,
  },
  category: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  muscleBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  muscleText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
});

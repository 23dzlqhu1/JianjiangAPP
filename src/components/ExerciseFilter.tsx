import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, FONTS, CATEGORY_NAMES, CATEGORY_ORDER } from '../constants';
import { ExerciseCategory } from '../types';

interface ExerciseFilterProps {
  selectedCategory: ExerciseCategory | 'all';
  onSelectCategory: (category: ExerciseCategory | 'all') => void;
}

export const ExerciseFilter: React.FC<ExerciseFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedCategory === 'all' && styles.filterButtonActive,
        ]}
        onPress={() => onSelectCategory('all')}>
        <Text
          style={[
            styles.filterText,
            selectedCategory === 'all' && styles.filterTextActive,
          ]}>
          全部
        </Text>
      </TouchableOpacity>
      {CATEGORY_ORDER.map(category => (
        <TouchableOpacity
          key={category}
          style={[
            styles.filterButton,
            selectedCategory === category && styles.filterButtonActive,
          ]}
          onPress={() => onSelectCategory(category)}>
          <Text
            style={[
              styles.filterText,
              selectedCategory === category && styles.filterTextActive,
            ]}>
            {CATEGORY_NAMES[category]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    fontWeight: FONTS.weight.medium,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
});

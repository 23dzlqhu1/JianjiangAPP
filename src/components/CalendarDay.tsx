import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {COLORS, SPACING, FONTS} from '../constants';

interface CalendarDayProps {
  date: number;
  isToday: boolean;
  isSelected: boolean;
  hasTraining: boolean;
  intensity?: 'low' | 'medium' | 'high';
  onPress: () => void;
  disabled?: boolean;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isToday,
  isSelected,
  hasTraining,
  intensity,
  onPress,
  disabled,
}) => {
  const getIntensityColor = () => {
    switch (intensity) {
      case 'high':
        return COLORS.primary;
      case 'medium':
        return COLORS.primaryLight;
      case 'low':
        return '#BBDEFB';
      default:
        return 'transparent';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selected,
        isToday && !isSelected && styles.today,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <Text
        style={[
          styles.date,
          isSelected && styles.selectedText,
          isToday && !isSelected && styles.todayText,
          disabled && styles.disabledText,
        ]}>
        {date}
      </Text>
      {hasTraining && (
        <View
          style={[
            styles.dot,
            {backgroundColor: isSelected ? '#FFFFFF' : getIntensityColor()},
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  selected: {
    backgroundColor: COLORS.primary,
  },
  today: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.3,
  },
  date: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
    fontWeight: FONTS.weight.normal,
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: FONTS.weight.bold,
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
});

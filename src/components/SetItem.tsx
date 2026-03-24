import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SetData } from '../types';
import { calculateE1RM } from '../utils';
import { COLORS, SPACING, FONTS } from '../constants';

interface SetItemProps {
  setNumber: number;
  set: SetData;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const SetItem: React.FC<SetItemProps> = ({
  setNumber,
  set,
  onPress,
  onLongPress,
}) => {
  const e1rm = calculateE1RM(set.weight, set.reps);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}>
      <View style={styles.mainInfo}>
        <Text style={styles.setNumber}>第{setNumber}组</Text>
        <Text style={styles.weightReps}>
          {set.weight}kg × {set.reps}次
        </Text>
      </View>
      <View style={styles.secondaryInfo}>
        <Text style={styles.e1rm}>E1RM: {e1rm}kg</Text>
        {set.note && (
          <Text style={styles.noteIcon}>📝</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginVertical: SPACING.xs,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  setNumber: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    minWidth: 50,
  },
  weightReps: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
  },
  secondaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  e1rm: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
  },
  noteIcon: {
    fontSize: FONTS.size.sm,
  },
});

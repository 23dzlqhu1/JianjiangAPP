import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { SetData } from '../types';
import { calculateE1RM } from '../utils';
import { COLORS, SPACING, FONTS } from '../constants';
import { Button } from './Button';

interface SetInputProps {
  visible: boolean;
  exerciseName: string;
  setNumber: number;
  defaultWeight?: number;
  defaultReps?: number;
  defaultNote?: string;
  onConfirm: (set: SetData) => void;
  onCancel: () => void;
}

const QUICK_WEIGHTS = [20, 40, 60, 80, 100];
const QUICK_REPS = [5, 8, 10, 12, 15];

export const SetInput: React.FC<SetInputProps> = ({
  visible,
  exerciseName,
  setNumber,
  defaultWeight = 0,
  defaultReps = 0,
  defaultNote = '',
  onConfirm,
  onCancel,
}) => {
  const [weight, setWeight] = useState(defaultWeight.toString());
  const [reps, setReps] = useState(defaultReps.toString());
  const [note, setNote] = useState(defaultNote);

  useEffect(() => {
    if (visible) {
      setWeight(defaultWeight > 0 ? defaultWeight.toString() : '');
      setReps(defaultReps > 0 ? defaultReps.toString() : '');
      setNote(defaultNote);
    }
  }, [visible, defaultWeight, defaultReps, defaultNote]);

  const weightNum = parseFloat(weight) || 0;
  const repsNum = parseInt(reps, 10) || 0;
  const e1rm = calculateE1RM(weightNum, repsNum);

  const handleConfirm = () => {
    if (weightNum > 0 && repsNum > 0) {
      onConfirm({
        weight: weightNum,
        reps: repsNum,
        note: note.trim() || undefined,
      });
    }
  };

  const adjustWeight = (delta: number) => {
    const newWeight = Math.max(0, weightNum + delta);
    setWeight(newWeight.toString());
  };

  const adjustReps = (delta: number) => {
    const newReps = Math.max(0, repsNum + delta);
    setReps(newReps.toString());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {exerciseName} - 第{setNumber}组
            </Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* 重量输入 */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>重量 (kg)</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustWeight(-2.5)}>
                  <Text style={styles.adjustButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                />
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustWeight(2.5)}>
                  <Text style={styles.adjustButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.quickSelect}>
                {QUICK_WEIGHTS.map(w => (
                  <TouchableOpacity
                    key={w}
                    style={styles.quickButton}
                    onPress={() => setWeight(w.toString())}>
                    <Text style={styles.quickButtonText}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 次数输入 */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>次数</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustReps(-1)}>
                  <Text style={styles.adjustButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                />
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustReps(1)}>
                  <Text style={styles.adjustButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.quickSelect}>
                {QUICK_REPS.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={styles.quickButton}
                    onPress={() => setReps(r.toString())}>
                    <Text style={styles.quickButtonText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 备注输入 */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>备注（可选）</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="例如：左肩微疼..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* E1RM 显示 */}
            {e1rm > 0 && (
              <View style={styles.e1rmContainer}>
                <Text style={styles.e1rmLabel}>预计 E1RM</Text>
                <Text style={styles.e1rmValue}>{e1rm} kg</Text>
              </View>
            )}
          </ScrollView>

          {/* 确认按钮 */}
          <View style={styles.footer}>
            <Button
              title="确认添加"
              onPress={handleConfirm}
              disabled={weightNum <= 0 || repsNum <= 0}
              size="large"
              style={styles.confirmButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  closeButtonText: {
    fontSize: FONTS.size.xl,
    color: COLORS.textSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    fontSize: FONTS.size.xxl,
    textAlign: 'center',
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: FONTS.size.xxl,
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  quickSelect: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  quickButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    minWidth: 48,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  e1rmContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  e1rmLabel: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  e1rmValue: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmButton: {
    width: '100%',
  },
});

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { SetData } from '../types';
import { calculateE1RM } from '../utils';
import { COLORS, SPACING, FONTS } from '../constants';

/**
 * 行内组数编辑器 - 替代 Modal 弹窗
 * 支持：直接编辑、快速确认、继承上一组数据
 */

interface InlineSetInputProps {
  setNumber: number;
  initialWeight?: number;
  initialReps?: number;
  initialNote?: string;
  onConfirm: (set: SetData) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export const InlineSetInput: React.FC<InlineSetInputProps> = ({
  setNumber,
  initialWeight = 0,
  initialReps = 0,
  initialNote = '',
  onConfirm,
  onCancel,
  autoFocus = false,
}) => {
  const [weight, setWeight] = useState(initialWeight > 0 ? initialWeight.toString() : '');
  const [reps, setReps] = useState(initialReps > 0 ? initialReps.toString() : '');
  const [note, setNote] = useState(initialNote);
  const [editingField, setEditingField] = useState<'weight' | 'reps' | 'note' | null>(
    autoFocus ? 'weight' : null
  );

  const weightNum = parseFloat(weight) || 0;
  const repsNum = parseInt(reps, 10) || 0;
  const e1rm = calculateE1RM(weightNum, repsNum);
  const isValid = weightNum > 0 && repsNum > 0;

  const handleConfirm = useCallback(() => {
    if (isValid) {
      onConfirm({
        weight: weightNum,
        reps: repsNum,
        note: note.trim() || undefined,
      });
      Keyboard.dismiss();
    }
  }, [weightNum, repsNum, note, isValid, onConfirm]);

  const adjustValue = useCallback((
    current: string,
    delta: number,
    setter: (val: string) => void,
    isFloat = false
  ) => {
    const num = parseFloat(current) || 0;
    const newVal = Math.max(0, num + delta);
    setter(isFloat ? newVal.toFixed(1).replace(/\.0$/, '') : newVal.toString());
  }, []);

  const quickValues = {
    weight: [20, 40, 60, 80, 100, 120],
    reps: [3, 5, 8, 10, 12, 15],
  };

  return (
    <View style={styles.container}>
      {/* 主输入区 */}
      <View style={styles.mainRow}>
        <Text style={styles.setNumber}>第{setNumber}组</Text>

        {/* 重量输入 */}
        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={[styles.inputBox, editingField === 'weight' && styles.inputBoxActive]}
            onPress={() => setEditingField('weight')}
          >
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="--"
              placeholderTextColor={COLORS.textDisabled}
              onFocus={() => setEditingField('weight')}
              onBlur={() => setEditingField(null)}
              selectTextOnFocus
            />
            <Text style={styles.unit}>kg</Text>
          </TouchableOpacity>

          {/* 重量快速调节 */}
          {editingField === 'weight' && (
            <View style={styles.quickAdjust}>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => adjustValue(weight, -2.5, setWeight, true)}
              >
                <Text style={styles.adjustBtnText}>-2.5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => adjustValue(weight, 2.5, setWeight, true)}
              >
                <Text style={styles.adjustBtnText}>+2.5</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.separator}>×</Text>

        {/* 次数输入 */}
        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={[styles.inputBox, editingField === 'reps' && styles.inputBoxActive]}
            onPress={() => setEditingField('reps')}
          >
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              keyboardType="number-pad"
              placeholder="--"
              placeholderTextColor={COLORS.textDisabled}
              onFocus={() => setEditingField('reps')}
              onBlur={() => setEditingField(null)}
              selectTextOnFocus
            />
            <Text style={styles.unit}>次</Text>
          </TouchableOpacity>

          {/* 次数快速调节 */}
          {editingField === 'reps' && (
            <View style={styles.quickAdjust}>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => adjustValue(reps, -1, setReps)}
              >
                <Text style={styles.adjustBtnText}>-1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => adjustValue(reps, 1, setReps)}
              >
                <Text style={styles.adjustBtnText}>+1</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 确认按钮 */}
        <TouchableOpacity
          style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!isValid}
        >
          <Text style={styles.confirmBtnText}>✓</Text>
        </TouchableOpacity>
      </View>

      {/* E1RM 显示 */}
      {isValid && (
        <Text style={styles.e1rmText}>
          估算 1RM: {e1rm}kg
        </Text>
      )}

      {/* 快速选择区 */}
      {editingField === 'weight' && (
        <View style={styles.quickSelectRow}>
          {quickValues.weight.map((val) => (
            <TouchableOpacity
              key={val}
              style={styles.quickSelectBtn}
              onPress={() => setWeight(val.toString())}
            >
              <Text style={styles.quickSelectText}>{val}kg</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {editingField === 'reps' && (
        <View style={styles.quickSelectRow}>
          {quickValues.reps.map((val) => (
            <TouchableOpacity
              key={val}
              style={styles.quickSelectBtn}
              onPress={() => setReps(val.toString())}
            >
              <Text style={styles.quickSelectText}>{val}次</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 备注输入 */}
      <TouchableOpacity
        style={styles.noteRow}
        onPress={() => setEditingField('note')}
      >
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="添加备注（可选）"
          placeholderTextColor={COLORS.textDisabled}
          onFocus={() => setEditingField('note')}
          onBlur={() => setEditingField(null)}
        />
      </TouchableOpacity>
    </View>
  );
};

/**
 * 已完成的组数展示项
 */
interface CompletedSetItemProps {
  setNumber: number;
  set: SetData;
  onEdit: () => void;
  onDelete: () => void;
}

export const CompletedSetItem: React.FC<CompletedSetItemProps> = ({
  setNumber,
  set,
  onEdit,
  onDelete,
}) => {
  const e1rm = calculateE1RM(set.weight, set.reps);

  return (
    <View style={completedStyles.container}>
      <View style={completedStyles.mainRow}>
        <View style={completedStyles.numberBadge}>
          <Text style={completedStyles.numberText}>{setNumber}</Text>
        </View>

        <View style={completedStyles.dataRow}>
          <Text style={completedStyles.dataText}>
            {set.weight}<Text style={completedStyles.unit}>kg</Text>
            {' '}×{' '}
            {set.reps}<Text style={completedStyles.unit}>次</Text>
          </Text>
          <Text style={completedStyles.e1rmText}>E1RM {e1rm}kg</Text>
        </View>

        {set.note && (
          <Text style={completedStyles.noteText} numberOfLines={1}>
            {set.note}
          </Text>
        )}
      </View>

      <View style={completedStyles.actions}>
        <TouchableOpacity style={completedStyles.actionBtn} onPress={onEdit}>
          <Text style={completedStyles.actionText}>编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[completedStyles.actionBtn, completedStyles.deleteBtn]} onPress={onDelete}>
          <Text style={[completedStyles.actionText, completedStyles.deleteText]}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    // 使用阴影替代边框
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  setNumber: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textSecondary,
    width: 50,
  },
  inputGroup: {
    flex: 1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    // 激活状态使用主题色边框
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  input: {
    flex: 1,
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    textAlign: 'center',
    padding: 0,
  },
  unit: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  separator: {
    fontSize: FONTS.size.lg,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.bold,
  },
  confirmBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  confirmBtnText: {
    fontSize: FONTS.size.xl,
    color: '#fff',
    fontWeight: FONTS.weight.bold,
  },
  e1rmText: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    marginLeft: 50,
  },
  quickAdjust: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  adjustBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: 4,
  },
  adjustBtnText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    fontWeight: FONTS.weight.medium,
  },
  quickSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  quickSelectBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 16,
  },
  quickSelectText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
  },
  noteRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  noteInput: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    padding: 0,
  },
});

const completedStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    // 使用阴影替代边框
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  dataRow: {
    flex: 1,
  },
  dataText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
  },
  unit: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.normal,
  },
  e1rmText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  noteText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    maxWidth: 100,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  actionText: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
  },
  deleteBtn: {},
  deleteText: {
    color: COLORS.error,
  },
});

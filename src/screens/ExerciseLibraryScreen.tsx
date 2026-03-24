import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTrainStore } from '../stores/trainStore';
import { ExerciseItem, ExerciseFilter, Button, Input } from '../components';
import { COLORS, SPACING, FONTS, CATEGORY_NAMES } from '../constants';
import { Exercise, ExerciseCategory } from '../types';
import { generateId } from '../utils';

interface ExerciseLibraryScreenProps {
  navigation: any;
}

export const ExerciseLibraryScreen: React.FC<ExerciseLibraryScreenProps> = ({
  navigation,
}) => {
  const { exercises, addExercise, updateExercise, deleteExercise } = useTrainStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // 新动作表单
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState<ExerciseCategory>('chest');

  // 筛选动作
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch =
      searchQuery === '' ||
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 预设动作和自定义动作分组
  const presetExercises = filteredExercises.filter(e => !e.isCustom);
  const customExercises = filteredExercises.filter(e => e.isCustom);

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) {
      Alert.alert('提示', '请输入动作名称');
      return;
    }

    const newExercise: Exercise = {
      id: generateId(),
      name: newExerciseName.trim(),
      category: newExerciseCategory,
      templateType: 'bench_press', // 默认模板
      isCustom: true,
      muscleGroups: [],
      createdAt: Date.now(),
    };

    addExercise(newExercise);
    setNewExerciseName('');
    setShowAddForm(false);
    Alert.alert('成功', '动作已添加');
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    if (!exercise.isCustom) {
      Alert.alert('提示', '预设动作不能删除');
      return;
    }

    Alert.alert(
      '删除动作',
      `确定要删除「${exercise.name}」吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => deleteExercise(exercise.id),
        },
      ]
    );
  };

  const handleExercisePress = (exercise: Exercise) => {
    navigation.navigate('ExerciseDetail', { exerciseId: exercise.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>动作库</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}>
          <Text style={styles.addButtonText}>
            {showAddForm ? '取消' : '+ 新增'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 搜索框 */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索动作..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* 分类筛选 */}
        <ExerciseFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 添加新动作表单 */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>添加新动作</Text>
            <Input
              label="动作名称"
              placeholder="例如：宽握引体向上"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
            />
            <Text style={styles.categoryLabel}>选择分类</Text>
            <View style={styles.categoryGrid}>
              {(Object.keys(CATEGORY_NAMES) as ExerciseCategory[]).map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    newExerciseCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setNewExerciseCategory(category)}>
                  <Text
                    style={[
                      styles.categoryButtonText,
                      newExerciseCategory === category && styles.categoryButtonTextActive,
                    ]}>
                    {CATEGORY_NAMES[category]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title="添加动作"
              onPress={handleAddExercise}
              variant="primary"
              style={styles.submitButton}
            />
          </View>
        )}

        {/* 自定义动作 */}
        {customExercises.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>我的动作</Text>
            {customExercises.map(exercise => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                onPress={() => handleExercisePress(exercise)}
                onLongPress={() => handleDeleteExercise(exercise)}
              />
            ))}
          </View>
        )}

        {/* 预设动作 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>预设动作</Text>
          {presetExercises.length === 0 ? (
            <Text style={styles.emptyText}>没有找到匹配的动作</Text>
          ) : (
            presetExercises.map(exercise => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                onPress={() => handleExercisePress(exercise)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
  },
  addButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: FONTS.size.md,
    color: '#FFFFFF',
    fontWeight: FONTS.weight.medium,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addForm: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  formTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoryLabel: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.lg,
  },
});

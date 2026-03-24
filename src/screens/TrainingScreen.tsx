import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useTrainStore } from '../stores/trainStore';
import {
  Card,
  SetInput,
  QuickActions,
} from '../components';
import {
  EXERCISE_TEMPLATES,
  CATEGORY_NAMES,
  COLORS,
  SPACING,
  FONTS,
  getTemplatesByCategory,
} from '../constants';
import {
  Exercise,
  ExerciseTemplate,
  SetData,
  TrainingSession,
  ExerciseRecord,
  ExerciseCategory,
  MuscleGroup,
} from '../types';
import { generateId, calculateE1RM, formatDate } from '../utils';

export const TrainingScreen: React.FC = () => {
  const { addSession, exercises, quickActions, addExercise } = useTrainStore();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentSets, setCurrentSets] = useState<SetData[]>([]);
  const [showExerciseList, setShowExerciseList] = useState(true);
  const [currentSessionExercises, setCurrentSessionExercises] = useState<ExerciseRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('chest');
  const [showSetInput, setShowSetInput] = useState(false);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);

  // 模板选择相关状态
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExerciseTemplate | null>(null);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [showCustomMuscleModal, setShowCustomMuscleModal] = useState(false);
  const [customMuscleGroups, setCustomMuscleGroups] = useState<MuscleGroup[]>([]);

  // 获取当前分类的模板
  const categoryTemplates = useMemo(() => {
    return getTemplatesByCategory(selectedCategory);
  }, [selectedCategory]);

  // 获取当前分类的动作
  const categoryExercises = useMemo(() => {
    return exercises.filter(e => e.category === selectedCategory);
  }, [exercises, selectedCategory]);

  // 获取快捷动作
  const quickActionExercises = useMemo(() => {
    return quickActions
      .map(id => exercises.find(e => e.id === id))
      .filter((e): e is Exercise => e !== undefined)
      .slice(0, 4);
  }, [quickActions, exercises]);

  // 分类列表
  const categories: ExerciseCategory[] = [
    'chest', 'back', 'legs', 'shoulders', 'arms', 'core'
  ];

  // 基于模板创建动作
  const handleCreateFromTemplate = (template: ExerciseTemplate) => {
    setSelectedTemplate(template);
    setCustomExerciseName(template.variations[0] || template.name.replace('类', ''));
    setShowTemplateModal(true);
  };

  // 确认创建动作
  const confirmCreateExercise = () => {
    if (!selectedTemplate || !customExerciseName.trim()) return;

    const newExercise: Exercise = {
      id: generateId(),
      name: customExerciseName.trim(),
      category: selectedTemplate.category,
      templateType: selectedTemplate.type,
      isCustom: false,
      muscleGroups: customMuscleGroups.length > 0 ? customMuscleGroups : selectedTemplate.muscleGroups,
      createdAt: Date.now(),
    };

    addExercise(newExercise);
    setShowTemplateModal(false);
    setSelectedExercise(newExercise);
    setShowExerciseList(false);
    setShowSetInput(true);
    setCustomExerciseName('');
    setCustomMuscleGroups([]);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    if (currentSets.length > 0) {
      Alert.alert(
        '保存当前动作',
        '是否保存当前动作的记录？',
        [
          {
            text: '不保存',
            onPress: () => {
              setSelectedExercise(exercise);
              setCurrentSets([]);
              setShowExerciseList(false);
              setShowSetInput(true);
            },
          },
          {
            text: '保存',
            onPress: () => {
              handleAddExerciseToSession();
              setSelectedExercise(exercise);
              setCurrentSets([]);
              setShowExerciseList(false);
              setShowSetInput(true);
            },
          },
        ],
        { cancelable: true },
      );
    } else {
      setSelectedExercise(exercise);
      setShowExerciseList(false);
      setShowSetInput(true);
    }
  };

  const handleSetConfirm = (set: SetData) => {
    if (editingSetIndex !== null) {
      const newSets = [...currentSets];
      newSets[editingSetIndex] = set;
      setCurrentSets(newSets);
      setEditingSetIndex(null);
    } else {
      setCurrentSets([...currentSets, set]);
    }
    setShowSetInput(false);
  };

  const handleEditSet = (index: number) => {
    setEditingSetIndex(index);
    setShowSetInput(true);
  };

  const handleDeleteSet = (index: number) => {
    const newSets = currentSets.filter((_, i) => i !== index);
    setCurrentSets(newSets);
  };

  const handleAddExerciseToSession = () => {
    if (!selectedExercise || currentSets.length === 0) return;

    const exerciseRecord: ExerciseRecord = {
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      sets: currentSets,
    };

    setCurrentSessionExercises([...currentSessionExercises, exerciseRecord]);
    setSelectedExercise(null);
    setCurrentSets([]);
    setShowExerciseList(true);
  };

  const handleFinishTraining = () => {
    if (currentSessionExercises.length === 0) {
      Alert.alert('提示', '请至少添加一个训练动作');
      return;
    }

    const now = Date.now();
    const session: TrainingSession = {
      id: generateId(),
      date: formatDate(new Date()),
      exercises: currentSessionExercises,
      createdAt: now,
      updatedAt: now,
    };

    addSession(session);
    setCurrentSessionExercises([]);
    setSelectedExercise(null);
    setCurrentSets([]);
    setShowExerciseList(true);
    Alert.alert('成功', '训练记录已保存！');
  };

  // 渲染左右排布的动作选择界面
  const renderExerciseSelector = () => {
    return (
      <View style={styles.exerciseSelector}>
        {/* 左侧分类列表 */}
        <View style={styles.categorySidebar}>
          <Text style={styles.sidebarTitle}>训练部位</Text>
          <ScrollView style={styles.categoryList}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryItem,
                  selectedCategory === category && styles.categoryItemActive,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.categoryItemText,
                    selectedCategory === category && styles.categoryItemTextActive,
                  ]}>
                  {CATEGORY_NAMES[category]}
                </Text>
                <Text style={styles.categoryCount}>
                  {categoryExercises.filter(e => e.category === category).length}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 右侧内容区 */}
        <View style={styles.exerciseListContainer}>
          <ScrollView>
            {/* 模板区域 - 用于创建新动作 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>选择动作模板</Text>
              <Text style={styles.sectionSubtitle}>基于模板创建你的动作</Text>
              <View style={styles.templateList}>
                {categoryTemplates.map(template => (
                  <TouchableOpacity
                    key={template.type}
                    style={styles.templateItem}
                    onPress={() => handleCreateFromTemplate(template)}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDescription}>{template.description}</Text>
                    <View style={styles.variationsContainer}>
                      {template.variations.slice(0, 3).map((variation, idx) => (
                        <Text key={idx} style={styles.variationTag}>{variation}</Text>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 已有动作区域 */}
            {categoryExercises.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>我的动作</Text>
                <Text style={styles.sectionSubtitle}>已创建的 {categoryExercises.length} 个动作</Text>
                {categoryExercises.map(exercise => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseItem}
                    onPress={() => handleExerciseSelect(exercise)}>
                    <View style={styles.exerciseItemContent}>
                      <Text style={styles.exerciseItemName}>{exercise.name}</Text>
                      {exercise.notes && (
                        <Text style={styles.exerciseItemNotes}>{exercise.notes}</Text>
                      )}
                    </View>
                    <Text style={styles.exerciseItemArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderSetInput = () => {
    if (!selectedExercise) return null;

    return (
      <ScrollView style={styles.setContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentSets.length > 0) {
              Alert.alert(
                '返回',
                '是否保存当前动作的记录？',
                [
                  {
                    text: '不保存',
                    onPress: () => {
                      setSelectedExercise(null);
                      setCurrentSets([]);
                      setShowExerciseList(true);
                    },
                  },
                  {
                    text: '保存',
                    onPress: () => {
                      handleAddExerciseToSession();
                      setShowExerciseList(true);
                    },
                  },
                ],
                { cancelable: true },
              );
            } else {
              setSelectedExercise(null);
              setShowExerciseList(true);
            }
          }}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>

        <Text style={styles.exerciseTitle}>{selectedExercise.name}</Text>

        {/* 当前组数列表 */}
        {currentSets.map((set, index) => (
          <Card key={index} style={styles.setCard}>
            <View style={styles.setInfo}>
              <Text style={styles.setNumber}>第{index + 1}组</Text>
              <Text style={styles.setData}>
                {set.weight}kg × {set.reps}次
              </Text>
              <Text style={styles.e1rm}>
                E1RM: {calculateE1RM(set.weight, set.reps)}kg
              </Text>
            </View>
            <View style={styles.setActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditSet(index)}>
                <Text style={styles.editButtonText}>编辑</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSet(index)}>
                <Text style={styles.deleteButtonText}>删除</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {/* 添加组按钮 */}
        <TouchableOpacity
          style={styles.addSetButton}
          onPress={() => {
            setEditingSetIndex(null);
            setShowSetInput(true);
          }}>
          <Text style={styles.addSetButtonText}>+ 添加组</Text>
        </TouchableOpacity>

        {/* 保存动作按钮 */}
        {currentSets.length > 0 && (
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={handleAddExerciseToSession}>
            <Text style={styles.addExerciseButtonText}>
              + 添加此动作到训练
            </Text>
          </TouchableOpacity>
        )}

        {/* 组数录入弹窗 */}
        <SetInput
          visible={showSetInput}
          exerciseName={selectedExercise.name}
          setNumber={editingSetIndex !== null ? editingSetIndex + 1 : currentSets.length + 1}
          defaultWeight={editingSetIndex !== null ? currentSets[editingSetIndex].weight : 0}
          defaultReps={editingSetIndex !== null ? currentSets[editingSetIndex].reps : 0}
          defaultNote={editingSetIndex !== null ? currentSets[editingSetIndex].note : ''}
          onConfirm={handleSetConfirm}
          onCancel={() => {
            setShowSetInput(false);
            setEditingSetIndex(null);
          }}
        />
      </ScrollView>
    );
  };

  // 渲染模板选择弹窗
  const renderTemplateModal = () => {
    if (!selectedTemplate) return null;

    return (
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>创建动作</Text>
            <Text style={styles.modalSubtitle}>基于：{selectedTemplate.name}</Text>

            <Text style={styles.inputLabel}>动作名称</Text>
            <TextInput
              style={styles.textInput}
              value={customExerciseName}
              onChangeText={setCustomExerciseName}
              placeholder="例如：杠铃卧推"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.inputLabel}>参考变式</Text>
            <View style={styles.variationsContainer}>
              {selectedTemplate.variations.map((variation, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.variationTag}
                  onPress={() => setCustomExerciseName(variation)}>
                  <Text style={styles.variationTagText}>{variation}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>默认肌肉发力</Text>
            <View style={styles.muscleGroupsContainer}>
              {(customMuscleGroups.length > 0 ? customMuscleGroups : selectedTemplate.muscleGroups).map((mg, idx) => (
                <View key={idx} style={styles.muscleGroupTag}>
                  <Text style={styles.muscleGroupText}>
                    {mg.name} {mg.percentage}%
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowTemplateModal(false)}>
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmCreateExercise}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  创建
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>训练记录</Text>
        {currentSessionExercises.length > 0 && (
          <TouchableOpacity onPress={handleFinishTraining}>
            <Text style={styles.finishButton}>完成训练</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 快捷方式 */}
      {showExerciseList && quickActionExercises.length > 0 && (
        <QuickActions
          exercises={quickActionExercises}
          onSelectExercise={handleExerciseSelect}
          onConfigure={() => {
            Alert.alert('提示', '快捷方式配置功能开发中');
          }}
        />
      )}

      {/* 当前训练摘要 */}
      {currentSessionExercises.length > 0 && (
        <Card style={styles.sessionSummary}>
          <Text style={styles.summaryTitle}>本次训练</Text>
          {currentSessionExercises.map((ex, index) => (
            <View key={index} style={styles.sessionExercise}>
              <Text style={styles.sessionExerciseName}>{ex.exerciseName}</Text>
              <Text style={styles.sessionExerciseSets}>{ex.sets.length}组</Text>
            </View>
          ))}
        </Card>
      )}

      {/* 主要内容 */}
      {showExerciseList ? renderExerciseSelector() : renderSetInput()}

      {/* 模板选择弹窗 */}
      {renderTemplateModal()}
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
  finishButton: {
    fontSize: FONTS.size.md,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  sessionSummary: {
    margin: SPACING.md,
    backgroundColor: '#E3F2FD',
  },
  summaryTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sessionExercise: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  sessionExerciseName: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  sessionExerciseSets: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
  },
  // 左右排布的动作选择器
  exerciseSelector: {
    flex: 1,
    flexDirection: 'row',
  },
  // 左侧分类栏
  categorySidebar: {
    width: 100,
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  sidebarTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  categoryList: {
    flex: 1,
  },
  categoryItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryItemActive: {
    backgroundColor: '#E3F2FD',
    borderLeftColor: COLORS.primary,
  },
  categoryItemText: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  categoryItemTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  categoryCount: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  // 右侧内容区
  exerciseListContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  // 模板列表
  templateList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  templateItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  templateName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  templateDescription: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  variationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  variationTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  variationTagText: {
    fontSize: FONTS.size.xs,
    color: COLORS.primary,
  },
  // 已有动作列表
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exerciseItemContent: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
  },
  exerciseItemNotes: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  exerciseItemArrow: {
    fontSize: FONTS.size.xl,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  // 组数录入界面
  setContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
  exerciseTitle: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  setCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  setInfo: {
    flex: 1,
  },
  setNumber: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  setData: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
  },
  e1rm: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  setActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  editButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 4,
  },
  editButtonText: {
    fontSize: FONTS.size.sm,
    color: '#FFFFFF',
  },
  deleteButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: 4,
  },
  deleteButtonText: {
    fontSize: FONTS.size.sm,
    color: '#FFFFFF',
  },
  addSetButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  addSetButtonText: {
    fontSize: FONTS.size.md,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  addExerciseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  addExerciseButtonText: {
    fontSize: FONTS.size.md,
    color: '#FFFFFF',
    fontWeight: FONTS.weight.medium,
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  muscleGroupTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  muscleGroupText: {
    fontSize: FONTS.size.xs,
    color: COLORS.success,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  modalButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  modalButtonCancel: {
    backgroundColor: COLORS.background,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  modalButtonTextConfirm: {
    color: '#FFFFFF',
    fontWeight: FONTS.weight.medium,
  },
});

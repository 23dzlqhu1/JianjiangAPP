import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTrainStore } from '../stores/trainStore';
import { InlineSetInput, CompletedSetItem } from '../components';
import {
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
} from '../types';
import { generateId, formatDate } from '../utils';

/**
 * TrainingScreen - 训练记录页面 (UX重构版 Phase 3)
 * 
 * 核心改进:
 * 1. 顶部 Tab 导航替代左右分栏
 * 2. 行内编辑替代 Modal 弹窗
 * 3. ✅ Draft 状态自动保存，无感交互
 * 4. 阴影+留白替代边框线
 */

export const TrainingScreen: React.FC = () => {
  const {
    addSession,
    exercises,
    quickActions,
    addExercise,
    draft,
    startDraft,
    addExerciseToDraft,
    updateDraftCurrentExercise,
    clearDraft,
  } = useTrainStore();

  // ========== 本地状态（UI 状态） ==========
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('chest');
  const [showExerciseList, setShowExerciseList] = useState(true);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);

  // 模板选择弹窗
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExerciseTemplate | null>(null);
  const [customExerciseName, setCustomExerciseName] = useState('');

  // 分类列表
  const categories: ExerciseCategory[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

  // ========== 初始化 Draft ==========
  useEffect(() => {
    if (!draft) {
      startDraft();
    }
  }, []);

  // ========== 计算属性 ==========
  const categoryTemplates = useMemo(() => {
    return getTemplatesByCategory(selectedCategory);
  }, [selectedCategory]);

  const categoryExercises = useMemo(() => {
    return exercises.filter(e => e.category === selectedCategory);
  }, [exercises, selectedCategory]);

  const quickActionExercises = useMemo(() => {
    return quickActions
      .map(id => exercises.find(e => e.id === id))
      .filter((e): e is Exercise => e !== undefined)
      .slice(0, 4);
  }, [quickActions, exercises]);

  // 当前正在编辑的动作
  const currentExercise = draft?.currentExercise;

  // 当前动作的组数
  const currentSets = currentExercise?.sets || [];

  // 获取上一组数据（用于默认继承）
  const lastSet = useMemo(() => {
    if (currentSets.length === 0) return null;
    return currentSets[currentSets.length - 1];
  }, [currentSets]);

  // 本次训练已完成的动作
  const sessionExercises = draft?.exercises || [];

  // ========== 动作处理 ==========
  const handleCreateFromTemplate = useCallback((template: ExerciseTemplate) => {
    setSelectedTemplate(template);
    setCustomExerciseName(template.variations[0] || template.name.replace('类', ''));
    setShowTemplateModal(true);
  }, []);

  const confirmCreateExercise = useCallback(() => {
    if (!selectedTemplate || !customExerciseName.trim()) return;

    const newExercise: Exercise = {
      id: generateId(),
      name: customExerciseName.trim(),
      category: selectedTemplate.category,
      templateType: selectedTemplate.type,
      isCustom: false,
      muscleGroups: selectedTemplate.muscleGroups,
      createdAt: Date.now(),
    };

    addExercise(newExercise);
    setShowTemplateModal(false);
    
    // 自动开始编辑新创建的动作
    updateDraftCurrentExercise({
      exerciseId: newExercise.id,
      exerciseName: newExercise.name,
      category: newExercise.category,
      sets: [],
    });
    setShowExerciseList(false);
    setCustomExerciseName('');
  }, [selectedTemplate, customExerciseName, addExercise, updateDraftCurrentExercise]);

  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    updateDraftCurrentExercise({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      sets: [],
    });
    setShowExerciseList(false);
    setEditingSetIndex(null);
  }, [updateDraftCurrentExercise]);

  // ========== 组数处理 ==========
  const handleAddSet = useCallback((set: SetData) => {
    if (!currentExercise) return;

    const newSets = [...currentSets];
    if (editingSetIndex !== null) {
      // 编辑模式
      newSets[editingSetIndex] = set;
      setEditingSetIndex(null);
    } else {
      // 新增模式
      newSets.push(set);
    }

    updateDraftCurrentExercise({
      ...currentExercise,
      sets: newSets,
    });
  }, [currentExercise, currentSets, editingSetIndex, updateDraftCurrentExercise]);

  const handleEditSet = useCallback((index: number) => {
    setEditingSetIndex(index);
  }, []);

  const handleDeleteSet = useCallback((index: number) => {
    if (!currentExercise) return;

    const newSets = currentSets.filter((_, i) => i !== index);
    updateDraftCurrentExercise({
      ...currentExercise,
      sets: newSets,
    });

    if (editingSetIndex === index) {
      setEditingSetIndex(null);
    }
  }, [currentExercise, currentSets, editingSetIndex, updateDraftCurrentExercise]);

  const handleAddExerciseToSession = useCallback(() => {
    if (!currentExercise || currentSets.length === 0) return;

    const exerciseRecord: ExerciseRecord = {
      exerciseId: currentExercise.exerciseId,
      exerciseName: currentExercise.exerciseName,
      sets: [...currentSets],
    };

    addExerciseToDraft(exerciseRecord);
    setShowExerciseList(true);
    setEditingSetIndex(null);
  }, [currentExercise, currentSets, addExerciseToDraft]);

  const handleFinishTraining = useCallback(() => {
    if (sessionExercises.length === 0) return;

    const now = Date.now();
    const session: TrainingSession = {
      id: generateId(),
      date: formatDate(new Date()),
      exercises: sessionExercises,
      createdAt: now,
      updatedAt: now,
    };

    addSession(session);
    clearDraft();
    startDraft(); // 开始新的草稿
    setShowExerciseList(true);
  }, [sessionExercises, addSession, clearDraft, startDraft]);

  // ========== 渲染 ==========
  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>训练记录</Text>
        {sessionExercises.length > 0 && (
          <TouchableOpacity onPress={handleFinishTraining} style={styles.finishBtn}>
            <Text style={styles.finishBtnText}>完成训练</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 本次训练摘要 */}
      {sessionExercises.length > 0 && (
        <View style={styles.sessionSummary}>
          <Text style={styles.summaryTitle}>本次训练 · {sessionExercises.length} 个动作</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sessionExercises.map((ex, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text style={styles.summaryItemName}>{ex.exerciseName}</Text>
                <Text style={styles.summaryItemSets}>{ex.sets.length}组</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 主内容区 */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {showExerciseList ? (
          <ExerciseListView />
        ) : (
          <SetRecorderView />
        )}
      </KeyboardAvoidingView>

      {/* 模板选择弹窗 */}
      <TemplateModal />
    </SafeAreaView>
  );

  // ========== 子组件 ==========

  function ExerciseListView() {
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 快捷方式 */}
        {quickActionExercises.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>快捷方式</Text>
            <View style={styles.quickActionsRow}>
              {quickActionExercises.map(exercise => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.quickActionBtn}
                  onPress={() => handleExerciseSelect(exercise)}
                >
                  <Text style={styles.quickActionText}>{exercise.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 顶部分类 Tab */}
        <View style={styles.categoryTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  selectedCategory === category && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategory === category && styles.categoryTabTextActive,
                  ]}
                >
                  {CATEGORY_NAMES[category]}
                </Text>
                {categoryExercises.filter(e => e.category === category).length > 0 && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {categoryExercises.filter(e => e.category === category).length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 模板列表 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择模板创建动作</Text>
          <View style={styles.templatesGrid}>
            {categoryTemplates.map(template => (
              <TouchableOpacity
                key={template.type}
                style={styles.templateCard}
                onPress={() => handleCreateFromTemplate(template)}
              >
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDesc} numberOfLines={2}>
                  {template.description}
                </Text>
                <View style={styles.templateVariations}>
                  {template.variations.slice(0, 2).map((v, i) => (
                    <Text key={i} style={styles.templateVariationTag}>{v}</Text>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 我的动作 */}
        {categoryExercises.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>我的动作</Text>
            {categoryExercises.map(exercise => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => handleExerciseSelect(exercise)}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  {exercise.notes && (
                    <Text style={styles.exerciseNote} numberOfLines={1}>
                      {exercise.notes}
                    </Text>
                  )}
                </View>
                <Text style={styles.exerciseArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  }

  function SetRecorderView() {
    if (!currentExercise) return null;

    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 返回按钮和动作名称 */}
        <View style={styles.recorderHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              // ✅ 使用 Draft：自动保存当前进度，无需确认
              setShowExerciseList(true);
            }}
          >
            <Text style={styles.backBtnText}>‹ 返回</Text>
          </TouchableOpacity>
          <Text style={styles.exerciseTitle}>{currentExercise.exerciseName}</Text>
        </View>

        {/* 已完成的组数列表 */}
        {currentSets.map((set, index) => (
          editingSetIndex === index ? (
            <InlineSetInput
              key={index}
              setNumber={index + 1}
              initialWeight={set.weight}
              initialReps={set.reps}
              initialNote={set.note}
              onConfirm={handleAddSet}
              autoFocus
            />
          ) : (
            <CompletedSetItem
              key={index}
              setNumber={index + 1}
              set={set}
              onEdit={() => handleEditSet(index)}
              onDelete={() => handleDeleteSet(index)}
            />
          )
        ))}

        {/* 新增组输入 */}
        {editingSetIndex === null && (
          <InlineSetInput
            setNumber={currentSets.length + 1}
            initialWeight={lastSet?.weight}
            initialReps={lastSet?.reps}
            onConfirm={handleAddSet}
          />
        )}

        {/* 添加动作到训练 */}
        {currentSets.length > 0 && editingSetIndex === null && (
          <TouchableOpacity
            style={styles.addExerciseBtn}
            onPress={handleAddExerciseToSession}
          >
            <Text style={styles.addExerciseBtnText}>
              + 添加此动作到本次训练
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  function TemplateModal() {
    if (!selectedTemplate) return null;

    return (
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>创建动作</Text>
            <Text style={modalStyles.subtitle}>基于：{selectedTemplate.name}</Text>

            <Text style={modalStyles.label}>动作名称</Text>
            <TextInput
              style={modalStyles.input}
              value={customExerciseName}
              onChangeText={setCustomExerciseName}
              placeholder="例如：杠铃卧推"
              placeholderTextColor={COLORS.textDisabled}
              autoFocus
            />

            <Text style={modalStyles.label}>快速选择</Text>
            <View style={modalStyles.variations}>
              {selectedTemplate.variations.map((variation, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={modalStyles.variationBtn}
                  onPress={() => setCustomExerciseName(variation)}
                >
                  <Text style={modalStyles.variationText}>{variation}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={modalStyles.actions}>
              <TouchableOpacity
                style={[modalStyles.btn, modalStyles.btnCancel]}
                onPress={() => setShowTemplateModal(false)}
              >
                <Text style={modalStyles.btnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.btn, modalStyles.btnConfirm]}
                onPress={confirmCreateExercise}
              >
                <Text style={[modalStyles.btnText, modalStyles.btnTextConfirm]}>
                  创建
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
};

// ========== 样式 ==========

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
  },
  finishBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  finishBtnText: {
    color: '#fff',
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
  },
  sessionSummary: {
    backgroundColor: '#E3F2FD',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  summaryTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  summaryItem: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    marginRight: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryItemName: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    fontWeight: FONTS.weight.medium,
  },
  summaryItemSets: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickActionBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    fontWeight: FONTS.weight.medium,
  },
  categoryTabs: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  categoryTabTextActive: {
    color: '#fff',
    fontWeight: FONTS.weight.medium,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: SPACING.xs,
  },
  categoryBadgeText: {
    fontSize: FONTS.size.xs,
    color: COLORS.text,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  templateCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  templateName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  templateDesc: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  templateVariations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  templateVariationTag: {
    fontSize: FONTS.size.xs,
    color: COLORS.primary,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
  },
  exerciseNote: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  exerciseArrow: {
    fontSize: FONTS.size.xl,
    color: COLORS.textSecondary,
  },
  recorderHeader: {
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  backBtn: {
    marginBottom: SPACING.sm,
  },
  backBtnText: {
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
  exerciseTitle: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
  },
  addExerciseBtn: {
    backgroundColor: COLORS.primary,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addExerciseBtnText: {
    color: '#fff',
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  variations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  variationBtn: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  variationText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  btn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  btnCancel: {
    backgroundColor: COLORS.background,
  },
  btnConfirm: {
    backgroundColor: COLORS.primary,
  },
  btnText: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  btnTextConfirm: {
    color: '#fff',
    fontWeight: FONTS.weight.medium,
  },
});

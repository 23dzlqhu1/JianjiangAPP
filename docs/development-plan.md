# StrengthInsight 开发计划

## 版本信息
- **当前版本**: v2.0.0
- **更新日期**: 2026-03-24
- **架构**: 模板化动作系统

---

## 1. 版本历史

### v2.0.0 - 模板化重构 (2026-03-24)

**重大变更**:
- ✅ 移除 28 个预设动作和英文别名系统
- ✅ 引入 24 个动作模板
- ✅ 用户基于模板自由创建动作
- ✅ 肌肉发力占比由模板统一提供
- ✅ 重构 TrainingScreen 为左右布局

**技术改进**:
- ✅ 更新 TypeScript 类型定义
- ✅ 重构 TrainStore 初始化逻辑
- ✅ 更新 ExerciseLibraryScreen 筛选逻辑
- ✅ 修复类型错误

---

## 2. 当前架构 (v2.0)

### 2.1 核心设计理念

```
模板层 (24个)          用户动作层 (无限)
┌──────────┐           ┌──────────────┐
│ 卧推类    │ ────────→ │ 杠铃卧推      │
│ 深蹲类    │ ────────→ │ 哑铃深蹲      │
│ 划船类    │ ────────→ │ 杠铃划船      │
│ ...      │           │ ...          │
└──────────┘           └──────────────┘
    ↓                        ↓
默认肌肉占比              继承/自定义占比
```

### 2.2 模板列表

| 部位 | 模板 | 主要肌肉 | 变式示例 |
|------|------|----------|----------|
| 胸部 | 卧推类 | 胸大肌 60% | 杠铃卧推、哑铃卧推 |
| 胸部 | 上斜推类 | 胸大肌上部 55% | 上斜杠铃卧推 |
| 胸部 | 飞鸟类 | 胸大肌 70% | 哑铃飞鸟、绳索飞鸟 |
| 背部 | 引体向上类 | 背阔肌 50% | 正握/反握引体向上 |
| 背部 | 下拉类 | 背阔肌 55% | 高位下拉、V把下拉 |
| 背部 | 划船类 | 背阔肌 50% | 杠铃划船、T杠划船 |
| 腿部 | 深蹲类 | 股四头肌 70% | 杠铃深蹲、高杠/低杠 |
| 腿部 | 腿举类 | 股四头肌 65% | 45度腿举、倒蹬 |
| 肩部 | 推举类 | 三角肌前束 40% | 杠铃推举、哑铃推举 |
| ... | ... | ... | ... |

---

## 3. 开发路线图

### Phase 1: 核心功能完善 (已完成 ✅)

- [x] 模板系统设计与实现
- [x] TrainingScreen 重构
- [x] 类型系统更新
- [x] 状态管理适配
- [x] 基础文档编写

### Phase 2: 用户体验优化 (进行中 🚧)

- [ ] 添加动作模板预览图
- [ ] 优化模板选择交互
- [ ] 添加动作创建引导
- [ ] 实现快捷方式配置
- [ ] 添加训练提醒功能

### Phase 3: 数据分析增强 (计划中 📋)

- [ ] 肌肉群训练热力图
- [ ] 训练容量趋势分析
- [ ] 力量进步曲线
- [ ] 训练频率统计
- [ ] 个性化训练建议

### Phase 4: 社交与扩展 (未来 🎯)

- [ ] 训练记录分享
- [ ] 社区模板市场
- [ ] 用户自定义模板
- [ ] 训练计划导入/导出
- [ ] 云端数据同步

---

## 4. 技术债务

### 4.1 已解决

| 问题 | 解决方案 | 状态 |
|------|----------|------|
| 预设动作维护困难 | 改为模板系统 | ✅ 已解决 |
| 英文别名混乱 | 完全移除别名 | ✅ 已解决 |
| 动作扩展性差 | 用户自由创建 | ✅ 已解决 |

### 4.2 待解决

| 问题 | 优先级 | 计划解决版本 |
|------|--------|--------------|
| 缺乏动作演示图 | 高 | v2.1 |
| 模板肌肉占比不可调 | 中 | v2.2 |
| 无数据导入导出 | 中 | v2.2 |
| 缺少单元测试 | 高 | v2.1 |

---

## 5. 开发规范

### 5.1 代码规范

```typescript
// ✅ 推荐写法
// 1. 使用类型别名
const handleCreate = (template: ExerciseTemplate) => {
  const newExercise: Exercise = {
    id: generateId(),
    name: template.name,
    templateType: template.type,
    // ...
  };
  addExercise(newExercise);
};

// 2. 使用常量
const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
});

// 3. 组件拆分
export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={() => onPress(template)}>
      <Text>{template.name}</Text>
    </TouchableOpacity>
  );
};
```

### 5.2 Git 提交规范

```
feat: 添加新功能
core: 修改核心逻辑
fix: 修复问题
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建/工具调整
```

**示例**:
```bash
git commit -m "feat: 添加动作模板选择界面"
git commit -m "core: 重构 Exercise 类型，移除 aliases 字段"
git commit -m "docs: 更新架构文档，添加模板系统说明"
```

### 5.3 文件命名规范

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| 组件 | PascalCase | `TrainingScreen.tsx` |
| 工具函数 | camelCase | `calculateE1RM.ts` |
| 常量 | UPPER_SNAKE_CASE | `STORAGE_KEYS` |
| 类型 | PascalCase | `ExerciseTemplate` |
| Hook | camelCase + use前缀 | `useTrainStore.ts` |

---

## 6. 测试策略

### 6.1 测试金字塔

```
        /\
       /  \
      / E2E \          (Detox - 关键流程)
     /────────\        5%
    /          \
   / Integration \     (React Native Testing Library)
  /────────────────\   15%
 /                  \
/     Unit Tests     \ (Jest)
────────────────────── 80%
```

### 6.2 关键测试场景

```typescript
// 1. 模板创建动作测试
describe('Template System', () => {
  it('should create exercise from template', () => {
    const template = EXERCISE_TEMPLATES[0];
    const exercise = createExerciseFromTemplate(template, '杠铃卧推');

    expect(exercise.templateType).toBe(template.type);
    expect(exercise.muscleGroups).toEqual(template.muscleGroups);
  });
});

// 2. 肌肉统计计算测试
describe('Muscle Distribution', () => {
  it('should calculate muscle distribution from sessions', () => {
    const sessions = [/* 测试数据 */];
    const distribution = calculateMuscleDistribution(sessions);

    expect(distribution['胸大肌']).toBeGreaterThan(0);
  });
});

// 3. 存储持久化测试
describe('Persistence', () => {
  it('should persist and restore store', async () => {
    // 保存数据
    addExercise(mockExercise);

    // 模拟重新加载
    const restored = await restoreStore();

    expect(restored.exercises).toContainEqual(mockExercise);
  });
});
```

---

## 7. 发布检查清单

### 7.1 发布前检查

- [ ] 类型检查通过 (`npx tsc --noEmit`)
- [ ] 代码格式检查 (`npm run lint`)
- [ ] 单元测试通过 (`npm test`)
- [ ] 手动测试核心流程
- [ ] 更新版本号
- [ ] 更新 CHANGELOG

### 7.2 版本号规则

采用语义化版本 (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR**: 不兼容的 API 变更 (如 v1.x → v2.0)
- **MINOR**: 向后兼容的功能添加 (如 v2.0 → v2.1)
- **PATCH**: 向后兼容的问题修复 (如 v2.0.0 → v2.0.1)

---

## 8. 文档维护

### 8.1 文档清单

| 文档 | 路径 | 维护频率 |
|------|------|----------|
| 架构文档 | `docs/architecture.md` | 架构变更时 |
| 状态管理 | `docs/state-management.md` | Store 变更时 |
| 组件文档 | `docs/components.md` | 组件变更时 |
| 开发计划 | `docs/development-plan.md` | 每迭代更新 |
| API 文档 | `docs/api.md` | 接口变更时 |

### 8.2 文档模板

```markdown
# 文档标题

## 版本信息
- **版本**: vx.x.x
- **更新日期**: YYYY-MM-DD

## 1. 章节标题

内容...

## 2. 代码示例

\`\`\`typescript
// 代码
\`\`\`

## 3. 相关链接

- [相关文档](./other.md)
```

---

## 9. 贡献指南

### 9.1 开发流程

1. **创建分支**: `git checkout -b feature/template-system`
2. **开发功能**: 编写代码 + 测试
3. **提交代码**: 遵循提交规范
4. **创建 PR**: 描述变更内容
5. **代码审查**: 至少 1 人审查
6. **合并发布**: 合并到 main 分支

### 9.2 代码审查清单

- [ ] 代码符合规范
- [ ] 类型定义完整
- [ ] 有必要的注释
- [ ] 测试覆盖核心逻辑
- [ ] 无 console.log 调试代码
- [ ] 性能无明显问题

---

## 10. 联系方式

- **项目负责人**: [待填写]
- **技术负责人**: [待填写]
- **文档维护**: [待填写]

---

## 附录

### A. 模板类型完整列表

```typescript
// 胸部 (4)
'bench_press' | 'incline_press' | 'fly' | 'cable_crossover'

// 背部 (4)
'pull_up' | 'lat_pulldown' | 'row' | 'deadlift'

// 腿部 (7)
'squat' | 'leg_press' | 'lunge' | 'leg_curl' | 'leg_extension' | 'calf_raise' | 'hip_thrust'

// 肩部 (4)
'overhead_press' | 'lateral_raise' | 'face_pull' | 'rear_delt_fly'

// 手臂 (3)
'bicep_curl' | 'tricep_extension' | 'tricep_pushdown'

// 核心 (4)
'plank' | 'crunch' | 'leg_raise' | 'russian_twist'
```

### B. 快速命令

```bash
# 开发
npm start              # 启动 Metro
npm run android        # 运行 Android
npm run ios           # 运行 iOS

# 代码质量
npm run lint          # ESLint 检查
npm run lint:fix      # 自动修复
npx tsc --noEmit      # TypeScript 检查

# 测试
npm test              # 运行单元测试
npm run test:watch    # 监听模式
npm run test:coverage # 覆盖率报告

# 构建
npm run build:android # 构建 Android Release
npm run build:ios     # 构建 iOS Release
```

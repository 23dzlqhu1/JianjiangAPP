import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTrainStore } from '../stores/trainStore';
import { Card, Button, ReportCard } from '../components';
import { COLORS, SPACING, FONTS, REPORT_DIMENSIONS } from '../constants';
import { formatDate, calculateVolume, calculateE1RM } from '../utils';
import { ReportConfig, ReportDataDimension } from '../types';

export const ReportScreen: React.FC = () => {
  const { sessions, getReportData } = useTrainStore();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return formatDate(date);
  });
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(
    REPORT_DIMENSIONS.filter(d => d.selected).map(d => d.id)
  );
  const [reportStyle, setReportStyle] = useState<'simple' | 'detailed' | 'chart'>('detailed');
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  // 切换数据维度
  const toggleDimension = (dimensionId: string) => {
    setSelectedDimensions(prev =>
      prev.includes(dimensionId)
        ? prev.filter(id => id !== dimensionId)
        : [...prev, dimensionId]
    );
  };

  // 生成报告
  const handleGenerateReport = () => {
    if (selectedDimensions.length === 0) {
      Alert.alert('提示', '请至少选择一个数据维度');
      return;
    }

    const config: ReportConfig = {
      startDate,
      endDate,
      dimensions: selectedDimensions,
      style: reportStyle,
    };

    const report = getReportData(config);
    setGeneratedReport(report);
  };

  // 分享报告
  const handleShareReport = () => {
    Alert.alert(
      '分享报告',
      '报告已生成，请选择分享方式',
      [
        { text: '保存为图片', onPress: () => console.log('保存图片') },
        { text: '导出为PDF', onPress: () => console.log('导出PDF') },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  // 渲染报告内容
  const renderReportContent = () => {
    if (!generatedReport) return null;

    return (
      <View style={styles.reportContent}>
        <Text style={styles.reportTitle}>训练报告</Text>
        <Text style={styles.reportPeriod}>
          {generatedReport.period.start} 至 {generatedReport.period.end}
        </Text>

        {/* 基础数据 */}
        {selectedDimensions.includes('total_sessions') && (
          <ReportCard
            title="训练次数"
            value={generatedReport.summary.totalSessions}
            subtitle="次"
          />
        )}
        {selectedDimensions.includes('total_volume') && (
          <ReportCard
            title="总容量"
            value={generatedReport.summary.totalVolume.toLocaleString()}
            subtitle="kg"
          />
        )}
        {selectedDimensions.includes('total_sets') && (
          <ReportCard
            title="总组数"
            value={generatedReport.summary.totalSets}
            subtitle="组"
          />
        )}
        {selectedDimensions.includes('avg_volume') && (
          <ReportCard
            title="平均容量"
            value={Math.round(generatedReport.summary.avgVolume).toLocaleString()}
            subtitle="kg/次"
          />
        )}

        {/* 进阶数据 */}
        {selectedDimensions.includes('frequency') && (
          <ReportCard
            title="训练频率"
            value={generatedReport.summary.frequency}
            subtitle="次/周"
          />
        )}
        {selectedDimensions.includes('consistency') && (
          <ReportCard
            title="训练一致性"
            value={`${generatedReport.summary.consistency}%`}
            subtitle="目标达成率"
          />
        )}
        {selectedDimensions.includes('personal_records') && (
          <ReportCard
            title="个人记录"
            value={generatedReport.summary.personalRecords}
            subtitle="次突破"
          />
        )}

        {/* 动作分析 */}
        {selectedDimensions.includes('exercise_distribution') &&
          generatedReport.exerciseStats && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>动作分布</Text>
            {generatedReport.exerciseStats.map((stat: any, index: number) => (
              <View key={index} style={styles.exerciseStat}>
                <Text style={styles.exerciseName}>{stat.name}</Text>
                <Text style={styles.exerciseValue}>
                  {stat.sets}组 | {stat.volume.toLocaleString()}kg
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* 趋势分析 */}
        {selectedDimensions.includes('volume_trend') &&
          generatedReport.volumeTrend && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>容量趋势</Text>
            {generatedReport.volumeTrend.map((point: any, index: number) => (
              <View key={index} style={styles.trendPoint}>
                <Text style={styles.trendDate}>{point.date}</Text>
                <Text style={styles.trendValue}>
                  {point.volume.toLocaleString()}kg
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* 分享按钮 */}
        <Button
          title="分享报告"
          onPress={handleShareReport}
          variant="primary"
          size="large"
          style={styles.shareButton}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>生成报告</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 时间范围 */}
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>时间范围</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>开始日期</Text>
              <Text style={styles.dateValue}>{startDate}</Text>
            </View>
            <Text style={styles.dateSeparator}>至</Text>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>结束日期</Text>
              <Text style={styles.dateValue}>{endDate}</Text>
            </View>
          </View>
        </Card>

        {/* 报告样式 */}
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>报告样式</Text>
          <View style={styles.styleOptions}>
            {(['simple', 'detailed', 'chart'] as const).map(style => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleButton,
                  reportStyle === style && styles.styleButtonActive,
                ]}
                onPress={() => setReportStyle(style)}>
                <Text
                  style={[
                    styles.styleButtonText,
                    reportStyle === style && styles.styleButtonTextActive,
                  ]}>
                  {style === 'simple' ? '简洁' : style === 'detailed' ? '详细' : '图表'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* 数据维度 */}
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>数据维度</Text>
          <View style={styles.dimensionsList}>
            {REPORT_DIMENSIONS.map(dimension => (
              <TouchableOpacity
                key={dimension.id}
                style={styles.dimensionItem}
                onPress={() => toggleDimension(dimension.id)}>
                <View
                  style={[
                    styles.checkbox,
                    selectedDimensions.includes(dimension.id) &&
                      styles.checkboxChecked,
                  ]}>
                  {selectedDimensions.includes(dimension.id) && (
                    <Text style={styles.checkboxCheck}>✓</Text>
                  )}
                </View>
                <Text style={styles.dimensionName}>{dimension.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* 生成按钮 */}
        <Button
          title="生成报告"
          onPress={handleGenerateReport}
          variant="primary"
          size="large"
          style={styles.generateButton}
        />

        {/* 报告内容 */}
        {renderReportContent()}
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
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  dateValue: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  dateSeparator: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
  },
  styleOptions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  styleButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  styleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  styleButtonText: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  styleButtonTextActive: {
    color: '#FFFFFF',
  },
  dimensionsList: {
    gap: SPACING.sm,
  },
  dimensionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
  dimensionName: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  generateButton: {
    marginBottom: SPACING.lg,
  },
  reportContent: {
    marginTop: SPACING.lg,
  },
  reportTitle: {
    fontSize: FONTS.size.xxxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  reportPeriod: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  sectionCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  exerciseStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exerciseName: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  exerciseValue: {
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
  trendPoint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trendDate: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
  },
  trendValue: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
    fontWeight: FONTS.weight.medium,
  },
  shareButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

interface DataPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  title?: string;
  unit?: string;
  color?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title,
  unit = '',
  color = COLORS.primary,
}) => {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无数据</Text>
        </View>
      </View>
    );
  }

  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  const chartWidth = screenWidth - SPACING.lg * 4;
  const chartHeight = 150;
  const padding = 20;

  const getX = (index: number) => {
    return padding + (index / (data.length - 1 || 1)) * (chartWidth - padding * 2);
  };

  const getY = (value: number) => {
    return chartHeight - padding - ((value - minValue) / range) * (chartHeight - padding * 2);
  };

  // 生成路径
  const path = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartContainer}>
        {/* Y轴标签 */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{Math.round(maxValue)}{unit}</Text>
          <Text style={styles.axisLabel}>{Math.round((maxValue + minValue) / 2)}{unit}</Text>
          <Text style={styles.axisLabel}>{Math.round(minValue)}{unit}</Text>
        </View>

        {/* 图表区域 */}
        <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
          {/* 网格线 */}
          <View style={[styles.gridLine, { top: padding }]} />
          <View style={[styles.gridLine, { top: chartHeight / 2 }]} />
          <View style={[styles.gridLine, { bottom: padding }]} />

          {/* 折线 */}
          <svg
            width={chartWidth}
            height={chartHeight}
            style={{ position: 'absolute' }}
          >
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            {data.map((point, index) => (
              <circle
                key={index}
                cx={getX(index)}
                cy={getY(point.value)}
                r="4"
                fill={color}
              />
            ))}
          </svg>
        </View>
      </View>

      {/* X轴标签 */}
      <View style={styles.xAxis}>
        <Text style={styles.axisLabel}>{data[0].date}</Text>
        <Text style={styles.axisLabel}>{data[data.length - 1].date}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  title: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
  },
  yAxis: {
    justifyContent: 'space-between',
    height: 150,
    paddingRight: SPACING.sm,
  },
  axisLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
  },
  chartArea: {
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingLeft: 40,
  },
});

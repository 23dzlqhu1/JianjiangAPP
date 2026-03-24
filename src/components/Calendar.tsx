import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';
import { CalendarDay } from './CalendarDay';
import { formatDate, getFirstDayOfMonth, getLastDayOfMonth } from '../utils';

interface CalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  trainingDates: {
    date: string;
    intensity: 'low' | 'medium' | 'high';
  }[];
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onSelectDate,
  trainingDates,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { year, month, days } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay();

    const days: {
      date: number;
      fullDate: string;
      isCurrentMonth: boolean;
    }[] = [];

    // 上个月的日期
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      days.push({
        date,
        fullDate: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    // 当前月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: i,
        fullDate: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: true,
      });
    }

    // 下个月的日期
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      days.push({
        date: i,
        fullDate: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    return { year, month, days };
  }, [currentMonth]);

  const today = formatDate(new Date());

  const getTrainingInfo = (date: string) => {
    return trainingDates.find(t => t.date === date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <View style={styles.container}>
      {/* 月份导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {year}年{month}月
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* 星期标题 */}
      <View style={styles.weekdayHeader}>
        {WEEKDAYS.map(day => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* 日期网格 */}
      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          const training = getTrainingInfo(day.fullDate);
          return (
            <CalendarDay
              key={index}
              date={day.date}
              isToday={day.fullDate === today}
              isSelected={day.fullDate === selectedDate}
              hasTraining={!!training}
              intensity={training?.intensity}
              onPress={() => onSelectDate(day.fullDate)}
              disabled={!day.isCurrentMonth}
            />
          );
        })}
      </View>

      {/* 图例 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>高强度</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primaryLight }]} />
          <Text style={styles.legendText}>中强度</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#BBDEFB' }]} />
          <Text style={styles.legendText}>低强度</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  navButton: {
    padding: SPACING.sm,
    minWidth: 40,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: FONTS.size.xl,
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  monthTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  weekdayText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
});

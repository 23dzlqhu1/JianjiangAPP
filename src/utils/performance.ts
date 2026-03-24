import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 记录渲染时间
   */
  recordRenderTime(componentName: string, duration: number) {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }
    this.metrics.get(componentName)!.push(duration);

    // 只保留最近100次记录
    const times = this.metrics.get(componentName)!;
    if (times.length > 100) {
      times.shift();
    }
  }

  /**
   * 获取平均渲染时间
   */
  getAverageRenderTime(componentName: string): number {
    const times = this.metrics.get(componentName);
    if (!times || times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  /**
   * 获取性能报告
   */
  getReport() {
    const report: Record<string, { avg: number; count: number; max: number }> = {};
    this.metrics.forEach((times, name) => {
      report[name] = {
        avg: this.getAverageRenderTime(name),
        count: times.length,
        max: Math.max(...times),
      };
    });
    return report;
  }

  /**
   * 清除所有指标
   */
  clear() {
    this.metrics.clear();
  }
}

/**
 * 自定义 Hook: 使用 useMemo 缓存计算结果
 * 适用于昂贵的计算操作
 */
export function useMemoizedCalculation<T>(
  factory: () => T,
  deps: React.DependencyList,
): T {
  return useMemo(factory, deps);
}

/**
 * 自定义 Hook: 使用 useCallback 缓存回调函数
 * 适用于传递给子组件的回调函数
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
): T {
  return useCallback(callback, deps);
}

/**
 * 自定义 Hook: 测量组件渲染性能
 */
export function useRenderPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    const duration = performance.now() - renderStartTime.current;
    PerformanceMonitor.getInstance().recordRenderTime(componentName, duration);
  });

  renderStartTime.current = performance.now();
}

/**
 * 自定义 Hook: 防抖值
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 自定义 Hook: 节流函数
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
): T {
  const lastCall = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= limit) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, limit],
  ) as T;
}

/**
 * 虚拟列表计算
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5,
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const virtualItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%',
      },
    }));
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const totalHeight = items.length * itemHeight;

  return {
    virtualItems,
    totalHeight,
    onScroll: (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      setScrollTop(event.nativeEvent.contentOffset.y);
    },
  };
}

/**
 * 性能优化建议
 */
export const PerformanceTips = {
  /**
   * 避免不必要的重渲染
   */
  avoidRerender: [
    '使用 React.memo 包裹纯展示组件',
    '使用 useMemo 缓存计算结果',
    '使用 useCallback 缓存回调函数',
    '避免在 render 中创建新对象或数组',
  ],

  /**
   * 列表优化
   */
  listOptimization: [
    '使用 FlatList 代替 ScrollView 渲染长列表',
    '设置 getItemLayout 提高滚动性能',
    '使用 keyExtractor 确保列表项正确复用',
    '实现 shouldComponentUpdate 或 React.memo',
  ],

  /**
   * 图片优化
   */
  imageOptimization: [
    '使用适当尺寸的图片',
    '实现图片懒加载',
    '使用缓存策略',
    '压缩图片大小',
  ],

  /**
   * 状态管理优化
   */
  stateOptimization: [
    '避免不必要的状态提升',
    '使用选择器获取需要的子状态',
    '分割大型状态对象',
    '使用不可变数据',
  ],
};

// 导入 React 用于 useState
import React from 'react';

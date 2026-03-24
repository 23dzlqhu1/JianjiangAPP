import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

/**
 * 存储工具类 - 用于数据持久化验证和管理
 */
export class StorageUtils {
  /**
   * 检查存储是否可用
   */
  static async isStorageAvailable(): Promise<boolean> {
    try {
      await AsyncStorage.setItem('__test__', 'test');
      await AsyncStorage.removeItem('__test__');
      return true;
    } catch (error) {
      console.error('存储不可用:', error);
      return false;
    }
  }

  /**
   * 获取存储使用情况
   */
  static async getStorageInfo(): Promise<{
    totalSize: number;
    itemCount: number;
    keys: readonly string[];
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      let totalSize = 0;

      items.forEach(([key, value]) => {
        if (value) {
          totalSize += value.length * 2; // UTF-16 编码，每个字符2字节
        }
      });

      return {
        totalSize,
        itemCount: keys.length,
        keys,
      };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return { totalSize: 0, itemCount: 0, keys: [] };
    }
  }

  /**
   * 格式化存储大小
   */
  static formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 备份数据
   */
  static async backupData(): Promise<string | null> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const items = await AsyncStorage.multiGet(keys);
      const backup: Record<string, any> = {};

      items.forEach(([key, value]) => {
        if (value) {
          try {
            backup[key] = JSON.parse(value);
          } catch {
            backup[key] = value;
          }
        }
      });

      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('备份数据失败:', error);
      return null;
    }
  }

  /**
   * 恢复数据
   */
  static async restoreData(backupJson: string): Promise<boolean> {
    try {
      const backup = JSON.parse(backupJson);
      const entries = Object.entries(backup).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]);

      await AsyncStorage.multiSet(entries as [string, string][]);
      return true;
    } catch (error) {
      console.error('恢复数据失败:', error);
      return false;
    }
  }

  /**
   * 清除所有数据
   */
  static async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  }

  /**
   * 验证数据完整性
   */
  static async validateDataIntegrity(): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // 检查训练数据
      const sessionsData = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (sessionsData) {
        try {
          const sessions = JSON.parse(sessionsData);
          if (!Array.isArray(sessions.state?.sessions)) {
            errors.push('训练数据格式错误');
          }
        } catch {
          errors.push('训练数据解析失败');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push('验证过程出错: ' + (error as Error).message);
      return { valid: false, errors };
    }
  }
}

/**
 * 调试工具 - 仅在开发环境使用
 */
export const debugStorage = async () => {
  const info = await StorageUtils.getStorageInfo();
  console.log('=== 存储调试信息 ===');
  console.log('总大小:', StorageUtils.formatSize(info.totalSize));
  console.log('项目数:', info.itemCount);
  console.log('键列表:', info.keys);

  const integrity = await StorageUtils.validateDataIntegrity();
  console.log('数据完整性:', integrity.valid ? '通过' : '失败');
  if (!integrity.valid) {
    console.log('错误:', integrity.errors);
  }
};

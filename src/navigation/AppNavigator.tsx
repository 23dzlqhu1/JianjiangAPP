import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, StyleSheet } from 'react-native';
import {
  HomeScreen,
  TrainingScreen,
  TrainingRecordScreen,
  CalendarScreen,
  StatsScreen,
  ReportScreen,
  ExerciseLibraryScreen,
  ExerciseDetailScreen,
} from '../screens';
import { COLORS, FONTS, SPACING } from '../constants';

// Tab Navigator 参数类型
export type RootTabParamList = {
  Home: undefined;
  Training: undefined;
  Calendar: undefined;
  Stats: undefined;
  ExerciseLibrary: undefined;
};

// Stack Navigator 参数类型
export type RootStackParamList = {
  Main: undefined;
  TrainingRecord: { date: string };
  Report: undefined;
  ExerciseDetail: { exerciseId: string };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Tab 图标组件
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Home: '🏠',
    Training: '💪',
    Calendar: '📅',
    Stats: '📊',
    ExerciseLibrary: '📚',
  };

  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[name]}
    </Text>
  );
};

// Tab Navigator 组件
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '首页' }}
      />
      <Tab.Screen
        name="Training"
        component={TrainingScreen}
        options={{ tabBarLabel: '训练' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: '日历' }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ tabBarLabel: '统计' }}
      />
      <Tab.Screen
        name="ExerciseLibrary"
        component={ExerciseLibraryScreen}
        options={{ tabBarLabel: '动作库' }}
      />
    </Tab.Navigator>
  );
};

// 根导航器组件
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="TrainingRecord"
          component={TrainingRecordScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="Report"
          component={ReportScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="ExerciseDetail"
          component={ExerciseDetailScreen}
          options={{
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    height: 64,
  },
  tabBarLabel: {
    fontSize: FONTS.size.sm,
    marginTop: SPACING.xs,
  },
  icon: {
    fontSize: 24,
  },
  iconFocused: {
    transform: [{ scale: 1.1 }],
  },
});

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import {useTrainStore} from '../stores/trainStore';
import {Card} from '../components';
import {TrainingSession} from '../types';
import {formatDateTime, calculateVolume, calculateE1RM} from '../utils';

export const HistoryScreen: React.FC = () => {
  const {sessions, deleteSession} = useTrainStore();

  const handleDelete = (session: TrainingSession) => {
    Alert.alert('删除记录', '确定要删除这条训练记录吗？', [
      {text: '取消', style: 'cancel'},
      {
        text: '删除',
        style: 'destructive',
        onPress: () => deleteSession(session.id),
      },
    ]);
  };

  const renderSessionCard = (session: TrainingSession) => {
    const totalVolume = session.exercises.reduce(
      (sum, ex) => sum + calculateVolume(ex.sets),
      0,
    );

    return (
      <Card key={session.id}>
        <View style={styles.sessionHeader}>
          <View>
            <Text style={styles.sessionDate}>
              {formatDateTime(session.createdAt)}
            </Text>
            <Text style={styles.sessionSummary}>
              {session.exercises.length}个动作 · {session.exercises.reduce(
                (sum, ex) => sum + ex.sets.length,
                0,
              )}
              组 · 总容量 {totalVolume}kg
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(session)}>
            <Text style={styles.deleteButtonText}>删除</Text>
          </TouchableOpacity>
        </View>

        {session.exercises.map((exercise, index) => {
          const bestE1RM = Math.max(
            ...exercise.sets.map(set => calculateE1RM(set.weight, set.reps)),
          );

          return (
            <View key={index} style={styles.exerciseItem}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                <Text style={styles.exerciseSets}>{exercise.sets.length}组</Text>
              </View>
              <View style={styles.setsInfo}>
                {exercise.sets.map((set, setIndex) => (
                  <Text key={setIndex} style={styles.setText}>
                    {set.weight}kg × {set.reps}
                  </Text>
                ))}
              </View>
              <Text style={styles.bestE1RM}>最佳E1RM: {bestE1RM}kg</Text>
            </View>
          );
        })}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>训练历史</Text>
        <Text style={styles.headerCount}>{sessions.length}条记录</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>暂无训练记录</Text>
            <Text style={styles.emptyText}>
              开始你的第一次训练吧！
            </Text>
          </View>
        ) : (
          sessions.map(session => renderSessionCard(session))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerCount: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sessionDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  sessionSummary: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  exerciseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  exerciseSets: {
    fontSize: 14,
    color: '#666',
  },
  setsInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  setText: {
    fontSize: 14,
    color: '#333',
    marginRight: 12,
    marginBottom: 2,
  },
  bestE1RM: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
});

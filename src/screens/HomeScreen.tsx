import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useTrainStore} from '../stores/trainStore';
import {Card, StatCard} from '../components';
import {formatDateTime} from '../utils';

export const HomeScreen: React.FC = () => {
  const {getStats, getRecentSessions} = useTrainStore();
  const stats = getStats();
  const recentSessions = getRecentSessions(3);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>StrengthInsight</Text>
          <Text style={styles.subtitle}>健身训练追踪</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="训练次数"
            value={stats.totalSessions}
            subtitle="次"
          />
          <StatCard
            title="训练动作"
            value={stats.totalExercises}
            subtitle="个"
          />
          <StatCard
            title="完成组数"
            value={stats.totalSets}
            subtitle="组"
          />
        </View>

        {stats.favoriteExercise && (
          <Card>
            <Text style={styles.cardTitle}>最常训练</Text>
            <Text style={styles.favoriteExercise}>
              {stats.favoriteExercise}
            </Text>
          </Card>
        )}

        {stats.lastTrainingDate && (
          <Card>
            <Text style={styles.cardTitle}>上次训练</Text>
            <Text style={styles.lastTraining}>{stats.lastTrainingDate}</Text>
          </Card>
        )}

        <Card>
          <Text style={styles.cardTitle}>最近训练</Text>
          {recentSessions.length === 0 ? (
            <Text style={styles.emptyText}>还没有训练记录</Text>
          ) : (
            recentSessions.map(session => (
              <View key={session.id} style={styles.sessionItem}>
                <Text style={styles.sessionDate}>
                  {formatDateTime(session.createdAt)}
                </Text>
                <Text style={styles.sessionExercises}>
                  {session.exercises.map(e => e.exerciseName).join('、')}
                </Text>
              </View>
            ))
          )}
        </Card>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 提示</Text>
          <Text style={styles.tipText}>
            点击底部导航的「训练」开始记录你的训练吧！
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  favoriteExercise: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  lastTraining: {
    fontSize: 18,
    color: '#000',
  },
  sessionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  sessionExercises: {
    fontSize: 16,
    color: '#000',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  tipCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#000',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

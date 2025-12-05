// 📊 Analytics Dashboard - Real-time Analytics
// Создано: Analytics Engineer (Agile Team)
// Версия: 3.0.0

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Theme } from '../../styles/DesignSystem';
import { AnalyticsService } from '../../analytics/analyticsService';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsDashboardProps {
  visible: boolean;
  onClose: () => void;
}

interface DashboardData {
  sessionMetrics: {
    totalSessions: number;
    averageSessionDuration: number;
    activeUsers: number;
    retentionRate: number;
  };
  gameMetrics: {
    totalGames: number;
    averageGameLength: number;
    completionRate: number;
    difficultyDistribution: Record<string, number>;
  };
  characterMetrics: {
    totalCharacters: number;
    averageAge: number;
    deathCauses: Record<string, number>;
    popularCities: Record<string, number>;
  };
  performanceMetrics: {
    averageLoadTime: number;
    errorRate: number;
    crashRate: number;
    responseTime: number;
  };
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  visible,
  onClose,
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'games' | 'characters' | 'performance'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const analytics = AnalyticsService.getInstance();

  useEffect(() => {
    if (visible) {
      loadDashboardData();
    }
  }, [visible]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from analytics backend
      // For now, we'll use mock data
      const mockData: DashboardData = {
        sessionMetrics: {
          totalSessions: 1250,
          averageSessionDuration: 1800, // 30 minutes
          activeUsers: 450,
          retentionRate: 0.68,
        },
        gameMetrics: {
          totalGames: 890,
          averageGameLength: 2400, // 40 minutes
          completionRate: 0.45,
          difficultyDistribution: {
            easy: 350,
            normal: 400,
            hard: 120,
            extreme: 20,
          },
        },
        characterMetrics: {
          totalCharacters: 890,
          averageAge: 45,
          deathCauses: {
            'Old Age': 320,
            'Illness': 180,
            'Accident': 120,
            'Other': 270,
          },
          popularCities: {
            'Baku': 280,
            'Ganja': 150,
            'Sumgait': 120,
            'Lankaran': 90,
            'Other': 250,
          },
        },
        performanceMetrics: {
          averageLoadTime: 2.3,
          errorRate: 0.02,
          crashRate: 0.001,
          responseTime: 150,
        },
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderOverviewTab = () => {
    if (!dashboardData) return null;

    return (
      <ScrollView style={styles.tabContent}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricTitle}>Total Sessions</Text>
            <Text style={styles.metricValue}>{dashboardData.sessionMetrics.totalSessions.toLocaleString()}</Text>
            <Badge variant="success" size="sm">+12%</Badge>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricTitle}>Active Users</Text>
            <Text style={styles.metricValue}>{dashboardData.sessionMetrics.activeUsers.toLocaleString()}</Text>
            <Badge variant="success" size="sm">+8%</Badge>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricTitle}>Avg Session</Text>
            <Text style={styles.metricValue}>{Math.round(dashboardData.sessionMetrics.averageSessionDuration / 60)}m</Text>
            <Badge variant="warning" size="sm">-3%</Badge>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricTitle}>Retention</Text>
            <Text style={styles.metricValue}>{Math.round(dashboardData.sessionMetrics.retentionRate * 100)}%</Text>
            <Badge variant="success" size="sm">+5%</Badge>
          </Card>
        </View>

        {/* Session Duration Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Session Duration (Last 7 Days)</Text>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                data: [25, 28, 22, 35, 30, 40, 32],
                color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`,
                strokeWidth: 2,
              }],
            }}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: Theme.Colors.background.primary,
              backgroundGradientFrom: Theme.Colors.background.primary,
              backgroundGradientTo: Theme.Colors.background.secondary,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: Theme.Colors.primary.main,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card>

        {/* Performance Overview */}
        <Card style={styles.performanceCard}>
          <Text style={styles.chartTitle}>Performance Overview</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Load Time</Text>
              <Text style={styles.performanceValue}>{dashboardData.performanceMetrics.averageLoadTime}s</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Error Rate</Text>
              <Text style={styles.performanceValue}>{Math.round(dashboardData.performanceMetrics.errorRate * 100)}%</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Response Time</Text>
              <Text style={styles.performanceValue}>{dashboardData.performanceMetrics.responseTime}ms</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    );
  };

  const renderGamesTab = () => {
    if (!dashboardData) return null;

    const difficultyData = Object.entries(dashboardData.gameMetrics.difficultyDistribution).map(([name, value]) => ({
      name,
      value,
      color: name === 'easy' ? '#10b981' : name === 'normal' ? '#3b82f6' : name === 'hard' ? '#f59e0b' : '#ef4444',
    }));

    return (
      <ScrollView style={styles.tabContent}>
        {/* Game Statistics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricTitle}>Total Games</Text>
            <Text style={styles.metricValue}>{dashboardData.gameMetrics.totalGames.toLocaleString()}</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricTitle}>Completion Rate</Text>
            <Text style={styles.metricValue}>{Math.round(dashboardData.gameMetrics.completionRate * 100)}%</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricTitle}>Avg Game Length</Text>
            <Text style={styles.metricValue}>{Math.round(dashboardData.gameMetrics.averageGameLength / 60)}m</Text>
          </Card>
        </View>

        {/* Difficulty Distribution */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Difficulty Distribution</Text>
          <PieChart
            data={difficultyData}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
          <View style={styles.legendContainer}>
            {difficultyData.map((item) => (
              <View key={item.name} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name}: {item.value}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    );
  };

  const renderCharactersTab = () => {
    if (!dashboardData) return null;

    const deathCausesData = Object.entries(dashboardData.characterMetrics.deathCauses).map(([name, value]) => ({
      name,
      value,
    }));

    const citiesData = Object.entries(dashboardData.characterMetrics.popularCities).slice(0, 5).map(([name, value]) => ({
      name,
      value,
    }));

    return (
      <ScrollView style={styles.tabContent}>
        {/* Character Statistics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricTitle}>Total Characters</Text>
            <Text style={styles.metricValue}>{dashboardData.characterMetrics.totalCharacters.toLocaleString()}</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricTitle}>Average Age</Text>
            <Text style={styles.metricValue}>{dashboardData.characterMetrics.averageAge} years</Text>
          </Card>
        </View>

        {/* Death Causes */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Death Causes</Text>
          <BarChart
            data={{
              labels: deathCausesData.map(item => item.name),
              datasets: [{
                data: deathCausesData.map(item => item.value),
              }],
            }}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: Theme.Colors.background.primary,
              backgroundGradientFrom: Theme.Colors.background.primary,
              backgroundGradientTo: Theme.Colors.background.secondary,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card>

        {/* Popular Cities */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Popular Birth Cities</Text>
          {citiesData.map((city, index) => (
            <View key={city.name} style={styles.cityItem}>
              <Text style={styles.cityRank}>#{index + 1}</Text>
              <Text style={styles.cityName}>{city.name}</Text>
              <Text style={styles.cityCount}>{city.value}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    );
  };

  const renderPerformanceTab = () => {
    if (!dashboardData) return null;

    return (
      <ScrollView style={styles.tabContent}>
        {/* Performance Metrics */}
        <Card style={styles.performanceCard}>
          <Text style={styles.chartTitle}>Performance Metrics</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Average Load Time</Text>
              <Text style={[styles.performanceValue, {
                color: dashboardData.performanceMetrics.averageLoadTime < 3 ? Theme.Colors.success.main : Theme.Colors.warning.main,
              }]}>
                {dashboardData.performanceMetrics.averageLoadTime}s
              </Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Error Rate</Text>
              <Text style={[styles.performanceValue, {
                color: dashboardData.performanceMetrics.errorRate < 0.05 ? Theme.Colors.success.main : Theme.Colors.error.main,
              }]}>
                {Math.round(dashboardData.performanceMetrics.errorRate * 100)}%
              </Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Crash Rate</Text>
              <Text style={[styles.performanceValue, {
                color: dashboardData.performanceMetrics.crashRate < 0.01 ? Theme.Colors.success.main : Theme.Colors.error.main,
              }]}>
                {Math.round(dashboardData.performanceMetrics.crashRate * 1000)}‰
              </Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Response Time</Text>
              <Text style={[styles.performanceValue, {
                color: dashboardData.performanceMetrics.responseTime < 200 ? Theme.Colors.success.main : Theme.Colors.warning.main,
              }]}>
                {dashboardData.performanceMetrics.responseTime}ms
              </Text>
            </View>
          </View>
        </Card>

        {/* Performance Recommendations */}
        <Card style={styles.recommendationsCard}>
          <Text style={styles.chartTitle}>Performance Recommendations</Text>
          <View style={styles.recommendationsList}>
            <Text style={styles.recommendationItem}>
              • Load time is within acceptable range
            </Text>
            <Text style={styles.recommendationItem}>
              • Error rate is low, continue monitoring
            </Text>
            <Text style={styles.recommendationItem}>
              • Response time could be optimized
            </Text>
            <Text style={styles.recommendationItem}>
              • Consider implementing caching strategies
            </Text>
          </View>
        </Card>
      </ScrollView>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(['overview', 'games', 'characters', 'performance'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading analytics data...</Text>
          </View>
        ) : (
          <>
            {selectedTab === 'overview' && renderOverviewTab()}
            {selectedTab === 'games' && renderGamesTab()}
            {selectedTab === 'characters' && renderCharactersTab()}
            {selectedTab === 'performance' && renderPerformanceTab()}
          </>
        )}

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: screenWidth - 20,
    height: '90%',
    backgroundColor: Theme.Colors.background.primary,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.Colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: Theme.Colors.text.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Theme.Colors.primary.main,
  },
  tabText: {
    fontSize: 14,
    color: Theme.Colors.text.secondary,
  },
  activeTabText: {
    color: Theme.Colors.primary.main,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    marginBottom: 10,
    padding: 15,
  },
  metricTitle: {
    fontSize: 12,
    color: Theme.Colors.text.secondary,
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.Colors.text.primary,
  },
  chartCard: {
    marginBottom: 20,
    padding: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.Colors.text.primary,
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: Theme.Colors.text.secondary,
  },
  performanceCard: {
    marginBottom: 20,
    padding: 15,
  },
  performanceGrid: {
    marginTop: 10,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.Colors.background.secondary,
  },
  performanceLabel: {
    fontSize: 14,
    color: Theme.Colors.text.secondary,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  cityRank: {
    fontSize: 12,
    color: Theme.Colors.primary.main,
    fontWeight: 'bold',
    marginRight: 10,
    width: 30,
  },
  cityName: {
    flex: 1,
    fontSize: 14,
    color: Theme.Colors.text.primary,
  },
  cityCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.Colors.text.secondary,
  },
  recommendationsCard: {
    padding: 15,
  },
  recommendationsList: {
    marginTop: 10,
  },
  recommendationItem: {
    fontSize: 14,
    color: Theme.Colors.text.secondary,
    marginBottom: 8,
    paddingLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Theme.Colors.text.secondary,
  },
  refreshButton: {
    backgroundColor: Theme.Colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.Colors.text.primary,
  },
});

export default AnalyticsDashboard;

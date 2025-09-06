import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

// Burkina Faso Colors
const BURKINA_COLORS = {
  primary: '#009639',
  secondary: '#FCD116',
  accent: '#CE1126',
  dark: '#1a1a1a',
  light: '#f8f9fa',
  white: '#ffffff'
};

interface BreakingNewsItem {
  id: string;
  title: string;
  content: string;
  priority: 'urgent' | 'important' | 'normal';
  source: string;
  category: string;
  created_at: string;
  is_active: boolean;
}

export default function BreakingNewsScreen() {
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('all');
  
  const navigation = useNavigation();

  const priorities = [
    { key: 'all', label: 'Tout', icon: 'list-outline', color: BURKINA_COLORS.primary },
    { key: 'urgent', label: 'Urgent', icon: 'flash-outline', color: BURKINA_COLORS.accent },
    { key: 'important', label: 'Important', icon: 'warning-outline', color: '#f59e0b' },
    { key: 'normal', label: 'Normal', icon: 'information-circle-outline', color: BURKINA_COLORS.primary },
  ];

  useEffect(() => {
    loadBreakingNews();
  }, []);

  const loadBreakingNews = async () => {
    try {
      const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/breaking-news`);
      
      if (response.ok) {
        const data = await response.json();
        setBreakingNews(data);
      } else {
        // Fallback data
        setBreakingNews([
          {
            id: '1',
            title: '🔴 URGENT',
            content: 'Le Président du Faso annonce de nouvelles mesures économiques lors d\'une allocution télévisée',
            priority: 'urgent',
            source: 'LCA TV',
            category: 'politique',
            created_at: new Date().toISOString(),
            is_active: true
          },
          {
            id: '2',
            title: '⚠️ IMPORTANT',
            content: 'Grève générale annoncée dans le secteur de l\'éducation pour la semaine prochaine',
            priority: 'important',
            source: 'Rédaction LCA TV',
            category: 'social',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_active: true
          },
          {
            id: '3',
            title: '📺 LIVE NEWS',
            content: 'Suivez en direct la cérémonie d\'ouverture du Festival des Arts et de la Culture',
            priority: 'important',
            source: 'LCA TV',
            category: 'culture',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            is_active: true
          },
          {
            id: '4',
            title: 'ℹ️ INFO',
            content: 'Ouverture d\'une nouvelle université publique dans la région du Centre-Est',
            priority: 'normal',
            source: 'Correspondant LCA TV',
            category: 'education',
            created_at: new Date(Date.now() - 10800000).toISOString(),
            is_active: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading breaking news:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBreakingNews();
  };

  const handlePriorityPress = (priority: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPriority(priority);
  };

  const handleNewsPress = (news: BreakingNewsItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      news.title,
      news.content,
      [
        { text: 'Fermer', style: 'cancel' },
        { text: 'Partager', onPress: () => handleShare(news) }
      ]
    );
  };

  const handleShare = (news: BreakingNewsItem) => {
    Alert.alert('Partager', `Partagez cette actualité: ${news.title}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffMinutes / 1440)} jour(s)`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return BURKINA_COLORS.accent;
      case 'important': return '#f59e0b';
      case 'normal': return BURKINA_COLORS.primary;
      default: return BURKINA_COLORS.primary;
    }
  };

  const filteredNews = selectedPriority === 'all' 
    ? breakingNews 
    : breakingNews.filter(news => news.priority === selectedPriority);

  const renderPriorityFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.priorityContainer}
      contentContainerStyle={styles.priorityContent}
    >
      {priorities.map((priority) => (
        <TouchableOpacity
          key={priority.key}
          style={[
            styles.priorityButton,
            selectedPriority === priority.key && styles.priorityButtonActive,
            { borderColor: priority.color }
          ]}
          onPress={() => handlePriorityPress(priority.key)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={priority.icon as any}
            size={18}
            color={selectedPriority === priority.key ? 'white' : priority.color}
          />
          <Text style={[
            styles.priorityText,
            selectedPriority === priority.key && styles.priorityTextActive,
            { color: selectedPriority === priority.key ? 'white' : priority.color }
          ]}>
            {priority.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderNewsCard = (news: BreakingNewsItem) => (
    <TouchableOpacity
      key={news.id}
      style={styles.newsCard}
      onPress={() => handleNewsPress(news)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[`${getPriorityColor(news.priority)}20`, 'rgba(255, 255, 255, 0.9)']}
        style={styles.newsCardGradient}
      >
        <View style={styles.newsCardContent}>
          <View style={styles.newsHeader}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(news.priority) }]}>
              <Text style={styles.priorityBadgeText}>{news.priority.toUpperCase()}</Text>
            </View>
            <Text style={styles.newsTime}>{formatTime(news.created_at)}</Text>
          </View>
          
          <Text style={styles.newsTitle}>{news.title}</Text>
          <Text style={styles.newsContent}>{news.content}</Text>
          
          <View style={styles.newsFooter}>
            <View style={styles.newsSource}>
              <Ionicons name="radio-outline" size={14} color="#6b7280" />
              <Text style={styles.sourceText}>{news.source}</Text>
            </View>
            <View style={styles.newsActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(news)}>
                <Ionicons name="share-outline" size={16} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="bookmark-outline" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderLiveBanner = () => (
    <View style={styles.liveBanner}>
      <LinearGradient
        colors={[BURKINA_COLORS.accent, '#dc2626']}
        style={styles.liveBannerGradient}
      >
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN DIRECT</Text>
        </View>
        <Text style={styles.liveBannerText}>
          Actualités en temps réel depuis Ouagadougou
        </Text>
        <TouchableOpacity style={styles.liveButton}>
          <Ionicons name="play" size={16} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.accent} />
      
      {/* Header */}
      <LinearGradient
        colors={[BURKINA_COLORS.accent, '#dc2626']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Breaking News</Text>
            <Text style={styles.headerSubtitle}>Actualités en temps réel</Text>
          </View>
          <TouchableOpacity style={styles.alertsButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BURKINA_COLORS.accent]}
            tintColor={BURKINA_COLORS.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Live Banner */}
        {renderLiveBanner()}

        {/* Priority Filter */}
        {renderPriorityFilter()}

        {/* News Section */}
        <View style={styles.newsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedPriority === 'all' ? 'Toutes les Actualités' : 
               priorities.find(p => p.key === selectedPriority)?.label}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredNews.length} actualité{filteredNews.length > 1 ? 's' : ''}
            </Text>
          </View>

          {filteredNews.length > 0 ? (
            filteredNews.map(renderNewsCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>Aucune actualité</Text>
              <Text style={styles.emptyDescription}>
                Aucune actualité disponible pour cette priorité
              </Text>
            </View>
          )}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <BlurView intensity={20} style={styles.emergencyBlur}>
            <View style={styles.emergencyContent}>
              <Ionicons name="call" size={24} color={BURKINA_COLORS.accent} />
              <View style={styles.emergencyText}>
                <Text style={styles.emergencyTitle}>Actualité Urgente ?</Text>
                <Text style={styles.emergencyDescription}>
                  Contactez notre rédaction: +226 70 XX XX XX
                </Text>
              </View>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BURKINA_COLORS.light,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  alertsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  liveBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  liveBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveBannerText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  liveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityContainer: {
    paddingVertical: 16,
  },
  priorityContent: {
    paddingHorizontal: 16,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BURKINA_COLORS.white,
    marginRight: 12,
    borderWidth: 1,
  },
  priorityButtonActive: {
    backgroundColor: BURKINA_COLORS.accent,
  },
  priorityText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  priorityTextActive: {
    color: 'white',
  },
  newsSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  newsCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsCardGradient: {
    padding: 16,
  },
  newsCardContent: {
    backgroundColor: 'transparent',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newsTime: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 8,
  },
  newsContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  newsActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  emergencySection: {
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emergencyBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  emergencyText: {
    marginLeft: 12,
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
  },
  emergencyDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});
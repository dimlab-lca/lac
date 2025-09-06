import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  published_at: string;
  view_count: string;
  like_count: string;
  duration: string;
  category: string;
}

interface BreakingNews {
  id: string;
  title: string;
  content: string;
  priority: string;
  source: string;
  category: string;
  created_at: string;
}

// Burkina Faso Colors
const BURKINA_COLORS = {
  primary: '#009639', // Green from flag
  secondary: '#FCD116', // Yellow from flag
  accent: '#CE1126', // Red from flag
  dark: '#1a1a1a',
  light: '#f8f9fa',
  white: '#ffffff'
};

export default function LCATVApp() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [currentLive, setCurrentLive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showWelcome, setShowWelcome] = useState(true);
  
  const navigation = useNavigation();

  const categories = [
    { key: 'all', label: 'Tout', icon: 'grid-outline' },
    { key: 'actualites', label: 'Actualités', icon: 'newspaper-outline' },
    { key: 'live', label: 'Live', icon: 'radio-outline' },
    { key: 'debats', label: 'Débats', icon: 'chatbubbles-outline' },
    { key: 'sport', label: 'Sport', icon: 'football-outline' },
    { key: 'culture', label: 'Culture', icon: 'musical-notes-outline' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      
      // Load videos, breaking news, and live info in parallel
      const [videosRes, newsRes, liveRes] = await Promise.all([
        fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/videos/latest?limit=20`),
        fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/breaking-news`),
        fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/live/current`)
      ]);

      if (videosRes.ok) {
        const videosData = await videosRes.json();
        setVideos(videosData);
      }

      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setBreakingNews(newsData);
      }

      if (liveRes.ok) {
        const liveData = await liveRes.json();
        setCurrentLive(liveData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback data for demo
      setVideos([
        {
          id: 'ixQEmhTbvTI',
          title: 'LCA TV - Diffusion en Direct',
          description: 'Suivez LCA TV en direct 24h/24',
          thumbnail: 'https://i.ytimg.com/vi/ixQEmhTbvTI/hqdefault.jpg',
          published_at: '2024-12-15T08:00:00Z',
          view_count: '25420',
          like_count: '456',
          duration: 'LIVE',
          category: 'live'
        },
        {
          id: 'zjWu0nZyBCY',
          title: 'Journal LCA TV - Édition du Soir',
          description: 'L\'essentiel de l\'actualité nationale et internationale',
          thumbnail: 'https://i.ytimg.com/vi/zjWu0nZyBCY/hqdefault.jpg',
          published_at: '2024-12-14T19:00:00Z',
          view_count: '18750',
          like_count: '324',
          duration: '30:45',
          category: 'actualites'
        }
      ]);

      setBreakingNews([
        {
          id: '1',
          title: '🔴 URGENT',
          content: 'Suivez en direct l\'actualité sur LCA TV',
          priority: 'urgent',
          source: 'LCA TV',
          category: 'general',
          created_at: new Date().toISOString()
        }
      ]);

      setCurrentLive({
        video_id: 'ixQEmhTbvTI',
        title: 'LCA TV - Diffusion en Direct',
        is_live: true
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowWelcome(false);
  };

  const renderWelcomePage = () => (
    <SafeAreaView style={styles.welcomeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.primary} />
      
      <LinearGradient
        colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary, BURKINA_COLORS.accent]}
        locations={[0, 0.7, 1]}
        style={styles.welcomeGradient}
      >
        {/* Main Content */}
        <View style={styles.welcomeContent}>
          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <BlurView intensity={30} style={styles.logoBlur}>
              <Ionicons name="tv" size={80} color="white" />
            </BlurView>
            <Text style={styles.welcomeTitle}>LCA TV</Text>
            <Text style={styles.welcomeSubtitle}>Burkina Faso</Text>
            <View style={styles.taglineContainer}>
              <Text style={styles.tagline}>Votre chaîne de référence</Text>
              <Text style={styles.taglineSecondary}>Information • Culture • Divertissement</Text>
            </View>
          </View>

          {/* Features Highlight */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="radio-outline" size={24} color="white" />
              </View>
              <Text style={styles.featureText}>Live 24h/24</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="newspaper-outline" size={24} color="white" />
              </View>
              <Text style={styles.featureText}>Actualités</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="play-circle-outline" size={24} color="white" />
              </View>
              <Text style={styles.featureText}>Émissions</Text>
            </View>
          </View>

          {/* Welcome Message */}
          <View style={styles.welcomeMessageContainer}>
            <Text style={styles.welcomeMessage}>
              Découvrez l'actualité du Burkina Faso et de l'Afrique de l'Ouest en temps réel
            </Text>
          </View>
        </View>

        {/* Bottom Section with Watermark */}
        <View style={styles.bottomSection}>
          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <BlurView intensity={20} style={styles.getStartedBlur}>
              <Text style={styles.getStartedText}>Commencer</Text>
              <Ionicons name="arrow-forward-circle" size={24} color="white" style={styles.getStartedIcon} />
            </BlurView>
          </TouchableOpacity>

          {/* Curved Watermark */}
          <View style={styles.watermarkContainer}>
            <View style={styles.watermarkCurve}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.watermarkGradient}
              >
                <View style={styles.watermarkContent}>
                  <View style={styles.watermarkLeft}>
                    <Text style={styles.watermarkTitle}>LCA TV</Text>
                    <Text style={styles.watermarkSubtitle}>Excellence en Information</Text>
                  </View>
                  <View style={styles.watermarkRight}>
                    <View style={styles.watermarkIcon}>
                      <Ionicons name="shield-checkmark" size={20} color="white" />
                    </View>
                    <Text style={styles.watermarkLabel}>Officiel</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeElements}>
            <View style={[styles.decorativeCircle, styles.circle1]} />
            <View style={[styles.decorativeCircle, styles.circle2]} />
            <View style={[styles.decorativeCircle, styles.circle3]} />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );

  const handleVideoPress = (video: YouTubeVideo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would open the YouTube player
    Alert.alert(
      video.title,
      `Ouvrir cette vidéo dans YouTube?\n\nVues: ${video.view_count}\nDurée: ${video.duration}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Regarder', onPress: () => console.log('Open YouTube video:', video.id) }
      ]
    );
  };

  const handleCategoryPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const formatViewCount = (count: string) => {
    const num = parseInt(count);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return count;
  };

  const formatDuration = (duration: string) => {
    if (duration === 'LIVE') return '🔴 LIVE';
    return duration;
  };

  const renderBreakingNewsBar = () => {
    if (!breakingNews.length) return null;

    return (
      <View style={styles.breakingNewsContainer}>
        {/* Urgent News Bar */}
        <LinearGradient
          colors={[BURKINA_COLORS.accent, '#dc2626']}
          style={styles.urgentNewsBar}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.newsScroll}
          >
            {breakingNews
              .filter(news => news.priority === 'urgent')
              .map((news, index) => (
                <Text key={index} style={styles.urgentNewsText}>
                  {news.title} • {news.content} •{' '}
                </Text>
              ))}
          </ScrollView>
        </LinearGradient>

        {/* Live News Bar */}
        <LinearGradient
          colors={[BURKINA_COLORS.primary, '#16a34a']}
          style={styles.liveNewsBar}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.newsScroll}
          >
            {breakingNews
              .filter(news => news.priority === 'important')
              .map((news, index) => (
                <Text key={index} style={styles.liveNewsText}>
                  {news.title} • {news.content} •{' '}
                </Text>
              ))}
          </ScrollView>
        </LinearGradient>
      </View>
    );
  };

  const renderLivePlayer = () => {
    if (!currentLive) return null;

    return (
      <View style={styles.livePlayerContainer}>
        <View style={styles.livePlayerHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
          <TouchableOpacity 
            style={styles.fullscreenButton}
            onPress={() => Alert.alert('Plein écran', 'Fonctionnalité bientôt disponible')}
          >
            <Ionicons name="expand-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.videoPlayerPlaceholder}>
          <LinearGradient
            colors={[BURKINA_COLORS.dark, '#374151']}
            style={styles.playerGradient}
          >
            <Ionicons name="play-circle" size={60} color="white" />
            <Text style={styles.playerTitle}>{currentLive.title}</Text>
            <Text style={styles.playerSubtitle}>Touchez pour regarder</Text>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryButton,
            selectedCategory === category.key && styles.categoryButtonActive
          ]}
          onPress={() => handleCategoryPress(category.key)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={category.icon as any}
            size={18}
            color={selectedCategory === category.key ? 'white' : BURKINA_COLORS.primary}
          />
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.key && styles.categoryTextActive
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderVideoGrid = () => (
    <View style={styles.videosGrid}>
      {filteredVideos.map((video) => (
        <TouchableOpacity
          key={video.id}
          style={styles.videoCard}
          onPress={() => handleVideoPress(video)}
          activeOpacity={0.9}
        >
          <View style={styles.videoThumbnailContainer}>
            <View style={styles.thumbnailPlaceholder}>
              <LinearGradient
                colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
                style={styles.thumbnailGradient}
              >
                <Ionicons name="play" size={24} color="white" />
              </LinearGradient>
            </View>
            
            <View style={styles.videoDurationBadge}>
              <Text style={styles.videoDurationText}>
                {formatDuration(video.duration)}
              </Text>
            </View>
            
            {video.category === 'live' && (
              <View style={styles.liveBadge}>
                <View style={styles.liveBadgeDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            )}
          </View>

          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={styles.videoMeta}>
              {formatViewCount(video.view_count)} vues • {video.like_count} ❤️
            </Text>
            <View style={styles.videoCategoryBadge}>
              <Text style={styles.videoCategoryText}>
                {categories.find(c => c.key === video.category)?.label || 'Général'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (showWelcome) {
    return renderWelcomePage();
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <Ionicons name="tv" size={60} color="white" />
            <Text style={styles.loadingTitle}>LCA TV</Text>
            <Text style={styles.loadingSubtitle}>Burkina Faso</Text>
            <View style={styles.loadingIndicator}>
              <View style={styles.loadingDot} />
              <View style={styles.loadingDot} />
              <View style={styles.loadingDot} />
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="tv" size={28} color="white" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>LCA TV</Text>
              <Text style={styles.headerSubtitle}>Burkina Faso</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/auth/login')}
            >
              <Ionicons name="person-circle-outline" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BURKINA_COLORS.primary]}
            tintColor={BURKINA_COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Breaking News Bars */}
        {renderBreakingNewsBar()}

        {/* Live Player */}
        {renderLivePlayer()}

        {/* Category Filter */}
        {renderCategoryFilter()}

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'Dernières Vidéos' : categories.find(c => c.key === selectedCategory)?.label}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {filteredVideos.length} vidéo{filteredVideos.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Videos Grid */}
        {renderVideoGrid()}

        {/* Footer */}
        <View style={styles.footer}>
          <LinearGradient
            colors={[BURKINA_COLORS.primary, BURKINA_COLORS.dark]}
            style={styles.footerGradient}
          >
            <Text style={styles.footerTitle}>LCA TV Burkina Faso</Text>
            <Text style={styles.footerSubtitle}>
              Votre chaîne de référence pour l'actualité nationale et internationale
            </Text>
            <View style={styles.footerStats}>
              <View style={styles.footerStat}>
                <Text style={styles.footerStatNumber}>50K+</Text>
                <Text style={styles.footerStatLabel}>Abonnés</Text>
              </View>
              <View style={styles.footerStat}>
                <Text style={styles.footerStatNumber}>2M+</Text>
                <Text style={styles.footerStatLabel}>Vues/mois</Text>
              </View>
              <View style={styles.footerStat}>
                <Text style={styles.footerStatNumber}>24h/24</Text>
                <Text style={styles.footerStatLabel}>En direct</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Welcome Page Styles
  welcomeContainer: {
    flex: 1,
  },
  welcomeGradient: {
    flex: 1,
  },
  welcomeContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoBlur: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  taglineSecondary: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  welcomeMessageContainer: {
    marginTop: 20,
  },
  welcomeMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomSection: {
    position: 'relative',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  getStartedButton: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  getStartedBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginRight: 12,
  },
  getStartedIcon: {
    marginLeft: 4,
  },
  
  // Watermark Section
  watermarkContainer: {
    position: 'relative',
    height: 80,
    marginHorizontal: -32,
  },
  watermarkCurve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  watermarkGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  watermarkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  watermarkLeft: {
    flex: 1,
  },
  watermarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  watermarkSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  watermarkRight: {
    alignItems: 'center',
  },
  watermarkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  watermarkLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  
  // Decorative Elements
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 100,
    height: 100,
    top: -20,
    right: 20,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: 30,
    left: 30,
  },
  circle3: {
    width: 80,
    height: 80,
    top: 20,
    left: -10,
  },

  // Main App Styles
  container: {
    flex: 1,
    backgroundColor: BURKINA_COLORS.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 4,
    opacity: 0.7,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  breakingNewsContainer: {
    backgroundColor: BURKINA_COLORS.white,
  },
  urgentNewsBar: {
    height: 32,
    justifyContent: 'center',
  },
  liveNewsBar: {
    height: 32,
    justifyContent: 'center',
  },
  newsScroll: {
    flex: 1,
  },
  urgentNewsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
  liveNewsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  livePlayerContainer: {
    backgroundColor: BURKINA_COLORS.white,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  livePlayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BURKINA_COLORS.dark,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BURKINA_COLORS.accent,
    marginRight: 8,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fullscreenButton: {
    padding: 4,
  },
  videoPlayerPlaceholder: {
    height: 200,
    backgroundColor: BURKINA_COLORS.dark,
  },
  playerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  playerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  categoryContainer: {
    paddingVertical: 16,
  },
  categoryContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BURKINA_COLORS.white,
    marginRight: 12,
    borderWidth: 1,
    borderColor: BURKINA_COLORS.primary,
  },
  categoryButtonActive: {
    backgroundColor: BURKINA_COLORS.primary,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: BURKINA_COLORS.primary,
  },
  categoryTextActive: {
    color: 'white',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  videosGrid: {
    paddingHorizontal: 16,
  },
  videoCard: {
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  videoThumbnailContainer: {
    height: 180,
    position: 'relative',
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  thumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BURKINA_COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    lineHeight: 22,
    marginBottom: 8,
  },
  videoMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  videoCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: BURKINA_COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
  },
  footer: {
    marginTop: 32,
  },
  footerGradient: {
    padding: 32,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  footerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  footerStat: {
    alignItems: 'center',
  },
  footerStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.secondary,
  },
  footerStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
});
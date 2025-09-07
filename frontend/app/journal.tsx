import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Burkina Faso Colors
const BURKINA_COLORS = {
  primary: '#009639',
  secondary: '#FCD116', 
  accent: '#CE1126',
  dark: '#1a1a1a',
  light: '#f8f9fa',
  white: '#ffffff'
};

interface JournalVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  view_count: string;
  like_count: string;
  published_at: string;
  category: string;
}

export default function JournalScreen() {
  const [journalVideos, setJournalVideos] = useState<JournalVideo[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<JournalVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<JournalVideo | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
    loadJournalVideos();
  }, []);

  const loadJournalVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/journal/playlist?limit=30`);
      const videos: JournalVideo[] = await response.json();
      
      if (videos && videos.length > 0) {
        setFeaturedVideo(videos[0]); // Le dernier journal comme hero
        setJournalVideos(videos);
      }
      
    } catch (error) {
      console.error('Error loading journal videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJournalVideos();
    setRefreshing(false);
  };

  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (viewCount: string): string => {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatTimeAgo = (publishedAt: string): string => {
    const published = new Date(publishedAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
  };

  const handleVideoPress = (video: JournalVideo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };

  const renderHeroVideo = () => {
    if (!featuredVideo) return null;

    return (
      <View style={styles.heroContainer}>
        <TouchableOpacity 
          style={styles.heroTouchable}
          onPress={() => handleVideoPress(featuredVideo)}
          activeOpacity={0.9}
        >
          <Image 
            source={{ uri: featuredVideo.thumbnail }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          
          {/* Play Overlay */}
          <View style={styles.heroOverlay}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.heroGradient}
            />
            
            <View style={styles.heroPlayButton}>
              <Ionicons name="play" size={60} color="white" />
            </View>
            
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Ionicons name="radio" size={16} color="white" />
                <Text style={styles.heroBadgeText}>DERNIER JOURNAL</Text>
              </View>
              
              <Text style={styles.heroTitle} numberOfLines={2}>
                {featuredVideo.title}
              </Text>
              
              <View style={styles.heroMeta}>
                <Text style={styles.heroMetaText}>
                  {formatViewCount(featuredVideo.view_count)} vues • {formatTimeAgo(featuredVideo.published_at)}
                </Text>
                <Text style={styles.heroMetaText}>
                  ⏱️ {formatDuration(featuredVideo.duration)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReplayItem = ({ item }: { item: JournalVideo }) => (
    <TouchableOpacity 
      style={styles.replayCard}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.replayImageContainer}>
        <Image 
          source={{ uri: item.thumbnail }}
          style={styles.replayImage}
          resizeMode="cover"
        />
        <View style={styles.replayDuration}>
          <Text style={styles.replayDurationText}>{formatDuration(item.duration)}</Text>
        </View>
      </View>
      
      <View style={styles.replayInfo}>
        <Text style={styles.replayTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.replayMeta}>
          {formatViewCount(item.view_count)} vues
        </Text>
        <Text style={styles.replayTime}>
          {formatTimeAgo(item.published_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderVideoPlayer = () => {
    if (!showVideoPlayer || !selectedVideo) return null;

    return (
      <View style={styles.videoPlayerModal}>
        <View style={styles.videoPlayerContainer}>
          <View style={styles.videoPlayerHeader}>
            <Text style={styles.videoPlayerTitle} numberOfLines={2}>
              {selectedVideo.title}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowVideoPlayer(false);
                setSelectedVideo(null);
              }}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.videoPlayerContent}>
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1`}
              style={{
                width: '100%',
                height: 250,
                border: 'none',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={true}
            />
          </View>
          
          <View style={styles.videoPlayerInfo}>
            <Text style={styles.videoPlayerMeta}>
              {formatViewCount(selectedVideo.view_count)} vues • {selectedVideo.like_count} ❤️ • {formatTimeAgo(selectedVideo.published_at)}
            </Text>
            <Text style={styles.videoPlayerDescription} numberOfLines={5}>
              {selectedVideo.description}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
            style={styles.loadingGradient}
          >
            <Ionicons name="newspaper" size={60} color="white" />
            <Text style={styles.loadingText}>Chargement du journal...</Text>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.primary} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BURKINA_COLORS.primary}
            colors={[BURKINA_COLORS.primary]}
          />
        }
      >
        {/* Hero Section - Dernier Journal */}
        {renderHeroVideo()}

        {/* Replays Section */}
        <View style={styles.replaysSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="play-back" size={20} color={BURKINA_COLORS.primary} />
              <Text style={styles.sectionTitle}>Replay Journal</Text>
            </View>
            <Text style={styles.sectionSubtitle}>{journalVideos.length} épisodes</Text>
          </View>
          
          <FlatList
            data={journalVideos.slice(1)} // Exclure le premier qui est en hero
            renderItem={renderReplayItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.replaysList}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        </View>

        {/* Informations Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={BURKINA_COLORS.primary} />
            <Text style={styles.infoTitle}>À propos du Journal LCA TV</Text>
          </View>
          
          <View style={styles.infoContent}>
            <Text style={styles.infoDescription}>
              Le Journal de LCA TV vous présente l'actualité du Burkina Faso et de l'Afrique de l'Ouest. 
              Retrouvez chaque jour les informations essentielles avec nos journalistes professionnels.
            </Text>
            
            <View style={styles.infoStats}>
              <View style={styles.infoStat}>
                <Text style={styles.infoStatNumber}>{journalVideos.length}</Text>
                <Text style={styles.infoStatLabel}>Épisodes</Text>
              </View>
              <View style={styles.infoStat}>
                <Text style={styles.infoStatNumber}>Quotidien</Text>
                <Text style={styles.infoStatLabel}>Diffusion</Text>
              </View>
              <View style={styles.infoStat}>
                <Text style={styles.infoStatNumber}>20h00</Text>
                <Text style={styles.infoStatLabel}>Horaire</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.subscribeButton}>
              <Ionicons name="notifications" size={20} color="white" />
              <Text style={styles.subscribeText}>Être notifié des nouveaux journaux</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Video Player Modal */}
      {renderVideoPlayer()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BURKINA_COLORS.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    margin: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  // Hero Video Section
  heroContainer: {
    height: height * 0.35,
    marginBottom: 20,
  },
  heroTouchable: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroPlayButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BURKINA_COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  heroBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroMetaText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  // Replays Section
  replaysSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  replaysList: {
    paddingHorizontal: 20,
  },
  replayCard: {
    width: width * 0.7,
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  replayImageContainer: {
    position: 'relative',
  },
  replayImage: {
    width: '100%',
    height: 120,
  },
  replayDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  replayDurationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  replayInfo: {
    padding: 12,
  },
  replayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 6,
    lineHeight: 18,
  },
  replayMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  replayTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  // Info Section
  infoSection: {
    marginHorizontal: 20,
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginLeft: 12,
  },
  infoContent: {
    alignItems: 'stretch',
  },
  infoDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  infoStat: {
    alignItems: 'center',
  },
  infoStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.primary,
  },
  infoStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BURKINA_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  subscribeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Video Player Modal
  videoPlayerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  videoPlayerContainer: {
    width: width * 0.95,
    maxWidth: 500,
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: height * 0.8,
  },
  videoPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BURKINA_COLORS.primary,
    padding: 16,
  },
  videoPlayerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayerContent: {
    backgroundColor: '#000',
  },
  videoPlayerInfo: {
    padding: 16,
  },
  videoPlayerMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  videoPlayerDescription: {
    fontSize: 14,
    color: BURKINA_COLORS.dark,
    lineHeight: 20,
  },
});
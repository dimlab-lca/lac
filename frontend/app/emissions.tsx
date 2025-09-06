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

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  view_count: string;
  like_count: string;
  category: string;
  published_at: string;
}

interface VideoCategory {
  key: string;
  label: string;
  icon: string;
  color: string;
  videos: YouTubeVideo[];
}

export default function EmissionsScreen() {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<YouTubeVideo | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const navigation = useNavigation();

  useEffect(() => {
    loadVideosFromYouTube();
  }, []);

  const loadVideosFromYouTube = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/videos/latest?limit=50`);
      const videos: YouTubeVideo[] = await response.json();
      
      // Organiser les vidéos par catégories style Netflix
      const categorizedVideos = categorizeVideos(videos);
      setCategories(categorizedVideos);
      
      // Définir la vidéo en vedette (la plus récente)
      if (videos.length > 0) {
        setFeaturedVideo(videos[0]);
      }
      
    } catch (error) {
      console.error('Error loading YouTube videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorizeVideos = (videos: YouTubeVideo[]): VideoCategory[] => {
    // Créer des catégories basées sur les mots-clés dans les titres
    const categories: VideoCategory[] = [
      {
        key: 'recent',
        label: 'Nouvelles Émissions',
        icon: 'sparkles',
        color: BURKINA_COLORS.accent,
        videos: videos.slice(0, 10)
      },
      {
        key: 'actualites',
        label: 'Actualités & Journal',
        icon: 'newspaper',
        color: BURKINA_COLORS.primary,
        videos: videos.filter(v => 
          v.title.toLowerCase().includes('actualité') ||
          v.title.toLowerCase().includes('journal') ||
          v.title.toLowerCase().includes('news') ||
          v.title.toLowerCase().includes('info')
        )
      },
      {
        key: 'debats',
        label: 'Débats & Politique',
        icon: 'chatbubbles',
        color: BURKINA_COLORS.secondary,
        videos: videos.filter(v => 
          v.title.toLowerCase().includes('débat') ||
          v.title.toLowerCase().includes('politique') ||
          v.title.toLowerCase().includes('discussion')
        )
      },
      {
        key: 'culture',
        label: 'Culture & Société',
        icon: 'musical-notes',
        color: BURKINA_COLORS.accent,
        videos: videos.filter(v => 
          v.title.toLowerCase().includes('culture') ||
          v.title.toLowerCase().includes('tradition') ||
          v.title.toLowerCase().includes('société')
        )
      },
      {
        key: 'sport',
        label: 'Sport',
        icon: 'football',
        color: BURKINA_COLORS.primary,
        videos: videos.filter(v => 
          v.title.toLowerCase().includes('sport') ||
          v.title.toLowerCase().includes('football') ||
          v.title.toLowerCase().includes('étalons')
        )
      },
      {
        key: 'populaire',
        label: 'Le Plus Regardé',
        icon: 'trending-up',
        color: BURKINA_COLORS.secondary,
        videos: videos.sort((a, b) => parseInt(b.view_count) - parseInt(a.view_count)).slice(0, 10)
      },
      {
        key: 'education',
        label: 'Éducation & Jeunesse',
        icon: 'school',
        color: BURKINA_COLORS.primary,
        videos: videos.filter(v => 
          v.title.toLowerCase().includes('éducation') ||
          v.title.toLowerCase().includes('jeune') ||
          v.title.toLowerCase().includes('étudiant') ||
          v.title.toLowerCase().includes('formation')
        )
      }
    ];

    // Filtrer les catégories qui ont au moins 3 vidéos
    return categories.filter(cat => cat.videos.length >= 3);
  };

  const formatDuration = (duration: string): string => {
    // Convertir PT1H2M10S en format lisible
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}min`;
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

  const handleVideoPress = (video: YouTubeVideo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };

  const renderFeaturedVideo = () => {
    if (!featuredVideo) return null;

    return (
      <View style={styles.featuredContainer}>
        <View style={styles.featuredImageContainer}>
          <Image 
            source={{ uri: featuredVideo.thumbnail }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.featuredOverlay}
          />
        </View>
        
        <View style={styles.featuredContent}>
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.featuredBadgeText}>ÉMISSION VEDETTE</Text>
          </View>
          
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {featuredVideo.title}
          </Text>
          
          <Text style={styles.featuredDescription} numberOfLines={2}>
            {featuredVideo.description}
          </Text>
          
          <View style={styles.featuredMeta}>
            <Text style={styles.featuredMetaText}>
              {formatViewCount(featuredVideo.view_count)} vues • {formatDuration(featuredVideo.duration)}
            </Text>
          </View>
          
          <View style={styles.featuredButtons}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => handleVideoPress(featuredVideo)}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={20} color="black" />
              <Text style={styles.playButtonText}>Regarder</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.infoButton} activeOpacity={0.8}>
              <Ionicons name="information-circle-outline" size={20} color="white" />
              <Text style={styles.infoButtonText}>Plus d'infos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderVideoCard = ({ item }: { item: YouTubeVideo }) => (
    <TouchableOpacity 
      style={styles.videoCard}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.thumbnail }}
        style={styles.videoThumbnail}
        resizeMode="cover"
      />
      <View style={styles.videoDurationBadge}>
        <Text style={styles.videoDurationText}>{formatDuration(item.duration)}</Text>
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.videoOverlay}
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.videoMeta}>
          {formatViewCount(item.view_count)} vues
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategorySection = (category: VideoCategory) => (
    <View key={category.key} style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryTitleContainer}>
          <Ionicons 
            name={category.icon as any} 
            size={20} 
            color={category.color} 
          />
          <Text style={styles.categoryTitle}>{category.label}</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>Tout voir</Text>
          <Ionicons name="chevron-forward" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={category.videos}
        renderItem={renderVideoCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.videoList}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.dark} />
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
            style={styles.loadingGradient}
          >
            <Ionicons name="tv" size={60} color="white" />
            <Text style={styles.loadingText}>Chargement des émissions...</Text>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.dark} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Émissions</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured Video */}
        {renderFeaturedVideo()}

        {/* Categories */}
        {categories.map(renderCategorySection)}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
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
                  height: '100%',
                  border: 'none',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={true}
              />
            </View>
            
            <View style={styles.videoPlayerInfo}>
              <Text style={styles.videoPlayerMeta}>
                {formatViewCount(selectedVideo.view_count)} vues • {selectedVideo.like_count} ❤️
              </Text>
              <Text style={styles.videoPlayerDescription} numberOfLines={3}>
                {selectedVideo.description}
              </Text>
            </View>
          </View>
        </View>
      )}
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
  scheduleButton: {
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
  },
  categoryButtonActive: {
    backgroundColor: BURKINA_COLORS.primary,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  emissionsSection: {
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
  emissionCard: {
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emissionThumbnail: {
    height: 120,
    position: 'relative',
  },
  thumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BURKINA_COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emissionInfo: {
    padding: 16,
  },
  emissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 8,
  },
  emissionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  emissionMeta: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  emissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: BURKINA_COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BURKINA_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  watchButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  scheduleSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  scheduleScroll: {
    marginTop: 16,
  },
  scheduleContent: {
    paddingRight: 16,
  },
  dayCard: {
    width: 80,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dayBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.primary,
    marginBottom: 8,
  },
  dayPrograms: {
    alignItems: 'center',
  },
  programDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BURKINA_COLORS.accent,
    marginBottom: 4,
  },
  programCount: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
});
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
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

interface Comment {
  id: string;
  video_id: string;
  content: string;
  user_name: string;
  created_at: string;
  likes: number;
  time_ago: string;
}

export default function EmissionsScreen() {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<YouTubeVideo | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const navigation = useNavigation();

  useEffect(() => {
    loadVideosFromYouTube();
    
    // Auto-refresh toutes les 5 minutes pour détecter les nouvelles vidéos
    const interval = setInterval(() => {
      console.log('🔄 Vérification automatique de nouvelles vidéos...');
      loadVideosFromYouTube();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const loadVideosFromYouTube = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/videos/latest?limit=50`);
      const videos: YouTubeVideo[] = await response.json();
      
      // Vérifier s'il y a de nouvelles vidéos depuis la dernière mise à jour
      const previousVideoCount = categories.reduce((acc, cat) => acc + cat.videos.length, 0);
      const newVideoCount = videos.length;
      
      if (previousVideoCount > 0 && newVideoCount > previousVideoCount) {
        console.log(`🎉 ${newVideoCount - previousVideoCount} nouvelles vidéos détectées !`);
        // Ici on pourrait ajouter une notification ou un badge "NEW"
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Organiser les vidéos par rubriques réelles de LCA TV
      const categorizedVideos = categorizeVideos(videos);
      setCategories(categorizedVideos);
      
      // Définir la vidéo en vedette (la plus récente de "Check Point" ou la première)
      const checkPointVideos = videos.filter(v => 
        v.title.toLowerCase().includes('check point') || v.title.toLowerCase().includes('checkpoint')
      );
      const featuredVideo = checkPointVideos.length > 0 ? checkPointVideos[0] : videos[0];
      setFeaturedVideo(featuredVideo);
      
      setLastUpdate(new Date());
      console.log(`✅ ${categorizedVideos.length} rubriques chargées avec ${videos.length} vidéos`);
      
    } catch (error) {
      console.error('Error loading YouTube videos:', error);
      // En cas d'erreur, garder les données précédentes si elles existent
    } finally {
      setLoading(false);
    }
  };

  const categorizeVideos = (videos: YouTubeVideo[]): VideoCategory[] => {
    // Identifier automatiquement les rubriques basées sur les vrais titres des vidéos
    const rubriques: VideoCategory[] = [
      {
        key: 'recent',
        label: 'Dernières Émissions',
        icon: 'time',
        color: BURKINA_COLORS.accent,
        videos: videos.slice(0, 8)
      }
    ];

    // Détection automatique des rubriques principales de LCA TV
    const rubriquesMap = new Map<string, YouTubeVideo[]>();

    videos.forEach(video => {
      const title = video.title.toLowerCase();
      
      // Check Point de LCA
      if (title.includes('check point') || title.includes('checkpoint')) {
        if (!rubriquesMap.has('checkpoint')) rubriquesMap.set('checkpoint', []);
        rubriquesMap.get('checkpoint')!.push(video);
      }
      
      // Ça Plane Là (CPL)
      else if (title.includes('cpl ') || title.includes('ça plane là')) {
        if (!rubriquesMap.has('cpl')) rubriquesMap.set('cpl', []);
        rubriquesMap.get('cpl')!.push(video);
      }
      
      // Franc Parler
      else if (title.includes('franc parler') || title.includes('francparler')) {
        if (!rubriquesMap.has('francparler')) rubriquesMap.set('francparler', []);
        rubriquesMap.get('francparler')!.push(video);
      }
      
      // Journal / Actualités Burkina Faso
      else if (title.includes('burkina faso:') || title.includes('burkina faso ')) {
        if (!rubriquesMap.has('journal_bf')) rubriquesMap.set('journal_bf', []);
        rubriquesMap.get('journal_bf')!.push(video);
      }
      
      // Actualités Mali
      else if (title.includes('mali :') || title.includes('mali ')) {
        if (!rubriquesMap.has('mali')) rubriquesMap.set('mali', []);
        rubriquesMap.get('mali')!.push(video);
      }
      
      // Actualités Côte d'Ivoire
      else if (title.includes('côte d\'ivoire') || title.includes('cote d\'ivoire')) {
        if (!rubriquesMap.has('cote_ivoire')) rubriquesMap.set('cote_ivoire', []);
        rubriquesMap.get('cote_ivoire')!.push(video);
      }
      
      // Messages officiels / Présidence
      else if (title.includes('message de son excellence') || title.includes('président du faso') || title.includes('officiel :')) {
        if (!rubriquesMap.has('officiel')) rubriquesMap.set('officiel', []);
        rubriquesMap.get('officiel')!.push(video);
      }
      
      // Autres pays africains
      else if (title.includes('tunisie:') || title.includes('égypte :') || title.includes('soudan :') || title.includes('afrique du sud')) {
        if (!rubriquesMap.has('afrique')) rubriquesMap.set('afrique', []);
        rubriquesMap.get('afrique')!.push(video);
      }
      
      // Culture / Événements
      else if (title.includes('camp vacances') || title.includes('reconstitution') || title.includes('coopération')) {
        if (!rubriquesMap.has('culture')) rubriquesMap.set('culture', []);
        rubriquesMap.get('culture')!.push(video);
      }
    });

    // Convertir en catégories avec métadonnées
    const rubriqueDefinitions = [
      {
        key: 'checkpoint',
        label: 'Check Point de LCA',
        icon: 'radio',
        color: BURKINA_COLORS.primary,
        description: 'Émission phare avec interviews et débats'
      },
      {
        key: 'cpl',
        label: 'Ça Plane Là (CPL)',
        icon: 'chatbubbles',
        color: BURKINA_COLORS.secondary,
        description: 'Discussions et analyses avec experts'
      },
      {
        key: 'francparler',
        label: 'Franc Parler',
        icon: 'megaphone',
        color: BURKINA_COLORS.accent,
        description: 'Débats politiques et sociaux'
      },
      {
        key: 'journal_bf',
        label: 'Journal Burkina Faso',
        icon: 'newspaper',
        color: BURKINA_COLORS.primary,
        description: 'Actualités nationales du Burkina Faso'
      },
      {
        key: 'mali',
        label: 'Actualités Mali',
        icon: 'globe',
        color: BURKINA_COLORS.secondary,
        description: 'Informations du Mali voisin'
      },
      {
        key: 'cote_ivoire',
        label: 'Actualités Côte d\'Ivoire',
        icon: 'location',
        color: BURKINA_COLORS.accent,
        description: 'Nouvelles de Côte d\'Ivoire'
      },
      {
        key: 'officiel',
        label: 'Messages Officiels',
        icon: 'podium',
        color: BURKINA_COLORS.primary,
        description: 'Communications officielles et présidentielles'
      },
      {
        key: 'afrique',
        label: 'Afrique International',
        icon: 'earth',
        color: BURKINA_COLORS.secondary,
        description: 'Actualités du continent africain'
      },
      {
        key: 'culture',
        label: 'Culture & Société',
        icon: 'musical-notes',
        color: BURKINA_COLORS.accent,
        description: 'Événements culturels et sociaux'
      }
    ];

    // Ajouter les catégories qui ont des vidéos (minimum 2 vidéos par rubrique)
    rubriqueDefinitions.forEach(def => {
      const videos = rubriquesMap.get(def.key);
      if (videos && videos.length >= 2) {
        rubriques.push({
          key: def.key,
          label: def.label,
          icon: def.icon,
          color: def.color,
          videos: videos.slice(0, 12) // Maximum 12 vidéos par slider
        });
      }
    });

    // Ajouter "Plus Regardées" à la fin
    rubriques.push({
      key: 'populaire',
      label: 'Plus Regardées',
      icon: 'trending-up',
      color: BURKINA_COLORS.primary,
      videos: videos.sort((a, b) => parseInt(b.view_count) - parseInt(a.view_count)).slice(0, 10)
    });

    return rubriques;
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
    loadComments(video.id);
  };

  const loadComments = async (videoId: string) => {
    try {
      setLoadingComments(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/videos/${videoId}/comments`);
      const commentsData = await response.json();
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedVideo) return;

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/videos/${selectedVideo.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: selectedVideo.id,
          content: newComment.trim(),
          user_name: userName || 'Téléspectateur LCA TV',
          user_email: userEmail
        })
      });

      if (response.ok) {
        setNewComment('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Recharger les commentaires
        loadComments(selectedVideo.id);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const likeComment = async (commentId: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/comments/${commentId}/like`, {
        method: 'PUT',
      });

      if (response.ok) {
        const data = await response.json();
        // Mettre à jour le commentaire localement
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: data.likes }
            : comment
        ));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideosFromYouTube();
    setRefreshing(false);
  };

  const formatLastUpdate = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)} jour(s)`;
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
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.refreshText}>{formatLastUpdate(lastUpdate)}</Text>
        </TouchableOpacity>
      </View>

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
        {/* Featured Video */}
        {renderFeaturedVideo()}

        {/* Categories */}
        {categories.map(renderCategorySection)}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
        <KeyboardAvoidingView 
          style={styles.videoPlayerModal}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
                  setComments([]);
                  setNewComment('');
                }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.videoPlayerScrollView} showsVerticalScrollIndicator={false}>
              {/* Video Player */}
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
              
              {/* Video Info */}
              <View style={styles.videoPlayerInfo}>
                <Text style={styles.videoPlayerMeta}>
                  {formatViewCount(selectedVideo.view_count)} vues • {selectedVideo.like_count} ❤️
                </Text>
                <Text style={styles.videoPlayerDescription} numberOfLines={3}>
                  {selectedVideo.description}
                </Text>
              </View>

              {/* Comments Section */}
              <View style={styles.commentsSection}>
                <View style={styles.commentsSectionHeader}>
                  <Ionicons name="chatbubbles" size={20} color={BURKINA_COLORS.primary} />
                  <Text style={styles.commentsSectionTitle}>
                    Commentaires ({comments.length})
                  </Text>
                </View>

                {/* User Input Section */}
                <View style={styles.commentInputSection}>
                  <View style={styles.userInfoRow}>
                    <TextInput
                      style={styles.userNameInput}
                      placeholder="Votre nom (optionnel)"
                      value={userName}
                      onChangeText={setUserName}
                      maxLength={30}
                    />
                  </View>
                  
                  <View style={styles.commentInputRow}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Écrivez votre commentaire..."
                      value={newComment}
                      onChangeText={setNewComment}
                      multiline={true}
                      maxLength={500}
                      numberOfLines={3}
                    />
                    <TouchableOpacity 
                      style={[
                        styles.sendButton, 
                        !newComment.trim() && styles.sendButtonDisabled
                      ]}
                      onPress={addComment}
                      disabled={!newComment.trim()}
                    >
                      <Ionicons 
                        name="send" 
                        size={18} 
                        color={newComment.trim() ? 'white' : '#ccc'} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Comments List */}
                <View style={styles.commentsList}>
                  {loadingComments ? (
                    <View style={styles.commentsLoading}>
                      <Ionicons name="refresh" size={24} color={BURKINA_COLORS.primary} />
                      <Text style={styles.commentsLoadingText}>Chargement des commentaires...</Text>
                    </View>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => (
                      <View key={comment.id} style={styles.commentItem}>
                        <View style={styles.commentHeader}>
                          <View style={styles.commentUserInfo}>
                            <View style={styles.commentAvatar}>
                              <Ionicons name="person" size={16} color="white" />
                            </View>
                            <View style={styles.commentMeta}>
                              <Text style={styles.commentUserName}>{comment.user_name}</Text>
                              <Text style={styles.commentTime}>{comment.time_ago}</Text>
                            </View>
                          </View>
                          
                          <TouchableOpacity 
                            style={styles.likeButton}
                            onPress={() => likeComment(comment.id)}
                          >
                            <Ionicons name="heart-outline" size={16} color="#666" />
                            <Text style={styles.likeCount}>{comment.likes}</Text>
                          </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.commentContent}>{comment.content}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.noComments}>
                      <Ionicons name="chatbubble-outline" size={40} color="#ccc" />
                      <Text style={styles.noCommentsText}>Soyez le premier à commenter !</Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BURKINA_COLORS.dark,
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
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BURKINA_COLORS.dark,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  refreshText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  
  // Featured Video Styles
  featuredContainer: {
    height: height * 0.6,
    marginBottom: 24,
  },
  featuredImageContainer: {
    flex: 1,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BURKINA_COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  featuredTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
  featuredMeta: {
    marginBottom: 16,
  },
  featuredMetaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  featuredButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  playButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  infoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  // Category Section Styles
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#9ca3af',
    marginRight: 4,
  },
  
  // Video Card Styles
  videoList: {
    paddingLeft: 16,
  },
  videoCard: {
    width: 160,
    height: 240,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: 120,
  },
  videoDurationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    lineHeight: 16,
  },
  videoMeta: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  // Video Player Modal Styles
  videoPlayerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 1000,
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: BURKINA_COLORS.dark,
  },
  videoPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BURKINA_COLORS.primary,
  },
  videoPlayerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayerContent: {
    flex: 1,
    backgroundColor: BURKINA_COLORS.dark,
  },
  videoPlayerInfo: {
    padding: 16,
    backgroundColor: BURKINA_COLORS.white,
  },
  videoPlayerMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  videoPlayerDescription: {
    fontSize: 14,
    color: BURKINA_COLORS.dark,
    lineHeight: 20,
  },

  // Video Player Enhanced Styles
  videoPlayerScrollView: {
    flex: 1,
  },

  // Comments Section Styles
  commentsSection: {
    backgroundColor: BURKINA_COLORS.white,
    marginTop: 8,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginLeft: 8,
  },
  commentInputSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  userInfoRow: {
    marginBottom: 12,
  },
  userNameInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
    textAlignVertical: 'top',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: BURKINA_COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  commentsList: {
    maxHeight: 400,
  },
  commentsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  commentsLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  commentItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BURKINA_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  commentMeta: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
  },
  commentTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  commentContent: {
    fontSize: 14,
    color: BURKINA_COLORS.dark,
    lineHeight: 20,
    marginLeft: 40,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});
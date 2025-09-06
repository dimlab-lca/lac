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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';

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

export default function LiveScreen() {
  const [currentLive, setCurrentLive] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState('12.5K');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
    // Simulate live data
    setCurrentLive({
      video_id: 'ixQEmhTbvTI',
      title: 'LCA TV - Diffusion en Direct',
      description: 'Suivez LCA TV 24h/24 pour toute l\'actualité du Burkina Faso',
      is_live: true
    });
  }, []);

  const handleFullscreen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFullscreen(!isFullscreen);
  };

  const handlePlayPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlaying(true);
  };

  const renderLivePlayer = () => (
    <View style={styles.playerContainer}>
      <View style={styles.playerHeader}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN DIRECT</Text>
        </View>
        <View style={styles.playerControls}>
          <Text style={styles.viewerCount}>{viewerCount} spectateurs</Text>
          <TouchableOpacity style={styles.fullscreenButton} onPress={handleFullscreen}>
            <Ionicons name="expand-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.videoPlayer}>
        {isPlaying ? (
          <WebView
            source={{
              uri: `https://www.youtube.com/embed/${currentLive?.video_id || 'ixQEmhTbvTI'}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1`
            }}
            style={styles.webView}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingView}>
                <Ionicons name="tv" size={40} color="white" />
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            )}
          />
        ) : (
          <TouchableOpacity 
            style={styles.playerPlaceholder} 
            onPress={handlePlayPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[BURKINA_COLORS.dark, '#374151']}
              style={styles.playerGradient}
            >
              <Ionicons name="play-circle" size={80} color="white" />
              <Text style={styles.playerTitle}>LCA TV en Direct</Text>
              <Text style={styles.playerSubtitle}>Touchez pour regarder</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderLiveInfo = () => (
    <View style={styles.infoContainer}>
      <BlurView intensity={20} style={styles.infoBlur}>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>À l'antenne maintenant</Text>
          <Text style={styles.programTitle}>Journal de 20h</Text>
          <Text style={styles.programDescription}>
            L'essentiel de l'actualité nationale et internationale présenté par nos journalistes
          </Text>
          
          <View style={styles.programStats}>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={16} color={BURKINA_COLORS.primary} />
              <Text style={styles.statText}>{viewerCount} en direct</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color={BURKINA_COLORS.primary} />
              <Text style={styles.statText}>20:00 - 21:00</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color={BURKINA_COLORS.secondary} />
              <Text style={styles.statText}>4.8/5</Text>
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );

  const renderUpcomingPrograms = () => {
    const programs = [
      {
        time: '21:00',
        title: 'Débat Citoyen',
        description: 'Discussion sur l\'économie nationale',
        category: 'Débat'
      },
      {
        time: '22:00',
        title: 'Culture & Tradition',
        description: 'Les richesses culturelles du Burkina',
        category: 'Culture'
      },
      {
        time: '23:00',
        title: 'Sport Nacional',
        description: 'Le sport burkinabè à l\'honneur',
        category: 'Sport'
      }
    ];

    return (
      <View style={styles.upcomingContainer}>
        <Text style={styles.sectionTitle}>Programmes à Venir</Text>
        {programs.map((program, index) => (
          <TouchableOpacity key={index} style={styles.programCard} activeOpacity={0.8}>
            <View style={styles.programTime}>
              <Text style={styles.timeText}>{program.time}</Text>
            </View>
            <View style={styles.programInfo}>
              <Text style={styles.programCardTitle}>{program.title}</Text>
              <Text style={styles.programCardDescription}>{program.description}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{program.category}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.primary} />
      
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
            <Text style={styles.headerTitle}>Live TV</Text>
            <Text style={styles.headerSubtitle}>En direct de Ouagadougou</Text>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Live Player */}
        {renderLivePlayer()}

        {/* Live Info */}
        {renderLiveInfo()}

        {/* Upcoming Programs */}
        {renderUpcomingPrograms()}

        {/* Emergency Info */}
        <View style={styles.emergencyInfo}>
          <LinearGradient
            colors={[BURKINA_COLORS.secondary, '#f59e0b']}
            style={styles.emergencyGradient}
          >
            <Ionicons name="information-circle" size={24} color="white" />
            <View style={styles.emergencyText}>
              <Text style={styles.emergencyTitle}>Diffusion Continue</Text>
              <Text style={styles.emergencyDescription}>
                LCA TV diffuse 24h/24 depuis Ouagadougou
              </Text>
            </View>
          </LinearGradient>
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
  shareButton: {
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
  playerContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: BURKINA_COLORS.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerHeader: {
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
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewerCount: {
    color: 'white',
    fontSize: 12,
    marginRight: 12,
  },
  fullscreenButton: {
    padding: 4,
  },
  videoPlayer: {
    height: 200,
  },
  webView: {
    flex: 1,
  },
  loadingView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BURKINA_COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
  },
  playerPlaceholder: {
    flex: 1,
  },
  playerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  playerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  infoContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  infoContent: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 14,
    color: BURKINA_COLORS.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 8,
  },
  programDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  upcomingContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 16,
  },
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  programTime: {
    width: 60,
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BURKINA_COLORS.accent,
  },
  programInfo: {
    flex: 1,
  },
  programCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 4,
  },
  programCardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: BURKINA_COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
  },
  emergencyInfo: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emergencyGradient: {
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
    color: 'white',
  },
  emergencyDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
});
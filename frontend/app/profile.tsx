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
  TextInput,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

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

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  location: string;
  profile_picture: string;
  is_verified: boolean;
  subscription_type: string;
  preferences: {
    categories: string[];
    language: string;
    notifications: boolean;
  };
  created_at: string;
  last_login: string;
  stats: {
    comments_count: number;
    videos_watched: number;
    watch_time_minutes: number;
    favorite_shows: string[];
  };
}

interface UserComment {
  id: string;
  video_id: string;
  video_title: string;
  video_thumbnail: string;
  content: string;
  likes: number;
  created_at: string;
  time_ago: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    location: '',
  });
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'comments', 'stats', 'settings'
  
  const navigation = useNavigation();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Simuler des données utilisateur pour la démo
      const mockUser: UserProfile = {
        id: '1',
        email: 'utilisateur@lcatv.bf',
        full_name: 'Amadou Traoré',
        phone: '+226 70 12 34 56',
        date_of_birth: '1990-05-15',
        location: 'Ouagadougou, Burkina Faso',
        profile_picture: '',
        is_verified: true,
        subscription_type: 'premium',
        preferences: {
          categories: ['journal', 'culture', 'sport'],
          language: 'français',
          notifications: true,
        },
        created_at: '2024-01-15T10:00:00Z',
        last_login: new Date().toISOString(),
        stats: {
          comments_count: 24,
          videos_watched: 156,
          watch_time_minutes: 2340,
          favorite_shows: ['Journal LCA TV', 'Check Point', 'Franc Parler'],
        },
      };

      setUser(mockUser);
      setEditForm({
        full_name: mockUser.full_name,
        phone: mockUser.phone,
        location: mockUser.location,
      });

      // Charger les commentaires de l'utilisateur
      await loadUserComments();

    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserComments = async () => {
    try {
      if (!user?.email) return;

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${user.email}/comments`);
      const comments = await response.json();
      setUserComments(comments);
    } catch (error) {
      console.error('Error loading user comments:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    setEditing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveProfile = async () => {
    try {
      // Ici on enverrait les données au backend
      console.log('Saving profile:', editForm);
      
      if (user) {
        setUser({
          ...user,
          full_name: editForm.full_name,
          phone: editForm.phone,
          location: editForm.location,
        });
      }

      setEditing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('Succès', 'Profil mis à jour avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        full_name: user.full_name,
        phone: user.phone,
        location: user.location,
      });
    }
    setEditing(false);
  };

  const handleChangeProfilePicture = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        // Ici on uploadrait l'image au backend
        console.log('New profile picture:', result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de changer la photo de profil');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatWatchTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const renderProfileHeader = () => {
    if (!user) return null;

    return (
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
          style={styles.profileGradient}
        >
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={handleChangeProfilePicture}>
              {user.profile_picture ? (
                <Image source={{ uri: user.profile_picture }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={60} color="white" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{user.full_name}</Text>
              {user.is_verified && (
                <Ionicons name="checkmark-circle" size={20} color="#FFD700" style={styles.verifiedIcon} />
              )}
            </View>
            
            <Text style={styles.userEmail}>{user.email}</Text>
            
            <View style={styles.subscriptionBadge}>
              <Ionicons 
                name={user.subscription_type === 'premium' ? 'star' : 'person'} 
                size={16} 
                color="white" 
              />
              <Text style={styles.subscriptionText}>
                {user.subscription_type === 'premium' ? 'Premium' : 'Gratuit'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderTabBar = () => {
    const tabs = [
      { key: 'info', label: 'Infos', icon: 'person-outline' },
      { key: 'comments', label: 'Commentaires', icon: 'chatbubbles-outline' },
      { key: 'stats', label: 'Statistiques', icon: 'analytics-outline' },
      { key: 'settings', label: 'Paramètres', icon: 'settings-outline' },
    ];

    return (
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? BURKINA_COLORS.primary : '#6b7280'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
    );
  };

  const renderInfoTab = () => {
    if (!user) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={BURKINA_COLORS.primary} />
            <Text style={styles.sectionTitle}>Informations Personnelles</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={editing ? handleSaveProfile : handleEditProfile}
            >
              <Ionicons 
                name={editing ? 'checkmark' : 'pencil'} 
                size={16} 
                color={BURKINA_COLORS.primary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nom complet</Text>
              {editing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editForm.full_name}
                  onChangeText={(text) => setEditForm({ ...editForm, full_name: text })}
                  placeholder="Votre nom complet"
                />
              ) : (
                <Text style={styles.infoValue}>{user.full_name}</Text>
              )}
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              {editing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                  placeholder="Votre numéro de téléphone"
                />
              ) : (
                <Text style={styles.infoValue}>{user.phone}</Text>
              )}
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Localisation</Text>
              {editing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({ ...editForm, location: text })}
                  placeholder="Votre ville, pays"
                />
              ) : (
                <Text style={styles.infoValue}>{user.location}</Text>
              )}
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date de naissance</Text>
              <Text style={styles.infoValue}>{formatDate(user.date_of_birth)}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>{formatDate(user.created_at)}</Text>
            </View>
          </View>

          {editing && (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={20} color={BURKINA_COLORS.primary} />
            <Text style={styles.sectionTitle}>Émissions Favorites</Text>
          </View>
          
          <View style={styles.favoriteShows}>
            {user.stats.favorite_shows.map((show, index) => (
              <View key={index} style={styles.favoriteShow}>
                <Ionicons name="tv" size={16} color={BURKINA_COLORS.primary} />
                <Text style={styles.favoriteShowText}>{show}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderCommentsTab = () => {
    const renderComment = ({ item }: { item: UserComment }) => (
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <Image source={{ uri: item.video_thumbnail }} style={styles.commentVideoThumb} />
          <View style={styles.commentVideoInfo}>
            <Text style={styles.commentVideoTitle} numberOfLines={1}>
              {item.video_title}
            </Text>
            <Text style={styles.commentDate}>{item.time_ago}</Text>
          </View>
          <View style={styles.commentLikes}>
            <Ionicons name="heart-outline" size={16} color="#6b7280" />
            <Text style={styles.commentLikesText}>{item.likes}</Text>
          </View>
        </View>
        
        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    );

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={20} color={BURKINA_COLORS.primary} />
            <Text style={styles.sectionTitle}>Mes Commentaires ({userComments.length})</Text>
          </View>

          {userComments.length > 0 ? (
            <FlatList
              data={userComments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>Aucun commentaire pour le moment</Text>
              <Text style={styles.emptyStateSubtext}>Regardez des vidéos et partagez vos avis !</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderStatsTab = () => {
    if (!user) return null;

    const stats = [
      {
        icon: 'chatbubbles',
        label: 'Commentaires',
        value: user.stats.comments_count.toString(),
        color: BURKINA_COLORS.primary,
      },
      {
        icon: 'play-circle',
        label: 'Vidéos regardées',
        value: user.stats.videos_watched.toString(),
        color: BURKINA_COLORS.secondary,
      },
      {
        icon: 'time',
        label: 'Temps de visionnage',
        value: formatWatchTime(user.stats.watch_time_minutes),
        color: BURKINA_COLORS.accent,
      },
      {
        icon: 'heart',
        label: 'Émissions favorites',
        value: user.stats.favorite_shows.length.toString(),
        color: BURKINA_COLORS.primary,
      },
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={20} color={BURKINA_COLORS.primary} />
            <Text style={styles.sectionTitle}>Statistiques d'Utilisation</Text>
          </View>

          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <Ionicons name={stat.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color={BURKINA_COLORS.primary} />
            <Text style={styles.sectionTitle}>Activité Récente</Text>
          </View>

          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <Ionicons name="play-circle" size={20} color={BURKINA_COLORS.primary} />
              <Text style={styles.activityText}>Dernière vidéo regardée: Journal du 6 septembre</Text>
              <Text style={styles.activityTime}>Il y a 2h</Text>
            </View>
            
            <View style={styles.activityItem}>
              <Ionicons name="chatbubble" size={20} color={BURKINA_COLORS.secondary} />
              <Text style={styles.activityText}>Commentaire sur "Check Point de LCA"</Text>
              <Text style={styles.activityTime}>Il y a 1 jour</Text>
            </View>
            
            <View style={styles.activityItem}>
              <Ionicons name="heart" size={20} color={BURKINA_COLORS.accent} />
              <Text style={styles.activityText}>Ajouté "Franc Parler" aux favoris</Text>
              <Text style={styles.activityTime}>Il y a 3 jours</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSettingsTab = () => {
    if (!user) return null;

    const settings = [
      {
        icon: 'notifications-outline',
        title: 'Notifications',
        subtitle: 'Gérer les notifications push',
        action: () => console.log('Notifications settings'),
      },
      {
        icon: 'language-outline',
        title: 'Langue',
        subtitle: user.preferences.language,
        action: () => console.log('Language settings'),
      },
      {
        icon: 'shield-checkmark-outline',
        title: 'Confidentialité',
        subtitle: 'Paramètres de confidentialité',
        action: () => console.log('Privacy settings'),
      },
      {
        icon: 'download-outline',
        title: 'Téléchargements',
        subtitle: 'Gérer les téléchargements hors-ligne',
        action: () => console.log('Download settings'),
      },
      {
        icon: 'help-circle-outline',
        title: 'Aide et Support',
        subtitle: 'FAQ et contact support',
        action: () => console.log('Help and support'),
      },
      {
        icon: 'information-circle-outline',
        title: 'À propos',
        subtitle: 'Version de l\'application et crédits',
        action: () => console.log('About'),
      },
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={20} color={BURKINA_COLORS.primary} />
            <Text style={styles.sectionTitle}>Paramètres</Text>
          </View>

          <View style={styles.settingsList}>
            {settings.map((setting, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingItem}
                onPress={setting.action}
                activeOpacity={0.7}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name={setting.icon as any} size={24} color={BURKINA_COLORS.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={BURKINA_COLORS.accent} />
            <Text style={styles.logoutText}>Se Déconnecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return renderInfoTab();
      case 'comments':
        return renderCommentsTab();
      case 'stats':
        return renderStatsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderInfoTab();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.primary} />
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
            style={styles.loadingGradient}
          >
            <Ionicons name="person" size={60} color="white" />
            <Text style={styles.loadingText}>Chargement du profil...</Text>
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
        {renderProfileHeader()}
        {renderTabBar()}
        {renderTabContent()}
        
        <View style={{ height: 40 }} />
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
  editButton: {
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
  profileHeader: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: BURKINA_COLORS.primary,
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  optionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 4,
  },
  appInfoVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  appInfoCopyright: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
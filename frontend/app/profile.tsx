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
  scrollView: {
    flex: 1,
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
    fontWeight: '600',
    marginTop: 16,
  },
  
  // Profile Header
  profileHeader: {
    margin: 16,
    marginTop: 0,
  },
  profileGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: BURKINA_COLORS.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    textAlign: 'center',
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subscriptionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: BURKINA_COLORS.light,
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    color: BURKINA_COLORS.primary,
    fontWeight: '600',
  },

  // Tab Content
  tabContent: {
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginLeft: 8,
    flex: 1,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: BURKINA_COLORS.light,
  },

  // Info Tab
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: BURKINA_COLORS.dark,
    fontWeight: '600',
  },
  infoInput: {
    fontSize: 16,
    color: BURKINA_COLORS.dark,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: BURKINA_COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  favoriteShows: {
    gap: 8,
  },
  favoriteShow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: BURKINA_COLORS.light,
    borderRadius: 8,
  },
  favoriteShowText: {
    marginLeft: 8,
    fontSize: 14,
    color: BURKINA_COLORS.dark,
    fontWeight: '500',
  },

  // Comments Tab
  commentCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentVideoThumb: {
    width: 40,
    height: 30,
    borderRadius: 4,
    marginRight: 8,
  },
  commentVideoInfo: {
    flex: 1,
  },
  commentVideoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
  },
  commentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  commentLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentLikesText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  commentContent: {
    fontSize: 14,
    color: BURKINA_COLORS.dark,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },

  // Stats Tab
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: BURKINA_COLORS.dark,
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Settings Tab
  settingsList: {
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${BURKINA_COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.accent,
    marginLeft: 8,
  },
});
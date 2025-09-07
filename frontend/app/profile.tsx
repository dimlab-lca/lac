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

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: 'Utilisateur Demo',
    email: 'demo@lcatv.bf',
    phone: '+226 70 XX XX XX',
    location: 'Ouagadougou, Burkina Faso',
    memberSince: 'Décembre 2024',
    favoriteCategories: ['Actualités', 'Culture', 'Sport'],
    watchTime: '24h 35min',
    subscriptions: 3
  });
  
  const navigation = useNavigation();

  const profileOptions = [
    {
      title: 'Mes Informations',
      subtitle: 'Modifier mon profil',
      icon: 'person-outline',
      color: BURKINA_COLORS.primary,
      action: () => handleProfileEdit()
    },
    {
      title: 'Émissions Favorites',
      subtitle: `${user.favoriteCategories.length} catégories suivies`,
      icon: 'heart-outline',
      color: BURKINA_COLORS.accent,
      action: () => handleFavorites()
    },
    {
      title: 'Historique de Visionnage',
      subtitle: `${user.watchTime} regardées`,
      icon: 'time-outline',
      color: BURKINA_COLORS.secondary,
      action: () => handleHistory()
    },
    {
      title: 'Notifications',
      subtitle: 'Gérer les alertes',
      icon: 'notifications-outline',
      color: BURKINA_COLORS.primary,
      action: () => handleNotifications()
    },
    {
      title: 'Abonnements',
      subtitle: `${user.subscriptions} services actifs`,
      icon: 'card-outline',
      color: BURKINA_COLORS.accent,
      action: () => handleSubscriptions()
    },
    {
      title: 'Paramètres',
      subtitle: 'Configuration de l\'app',
      icon: 'settings-outline',
      color: BURKINA_COLORS.dark,
      action: () => navigation.navigate('settings' as never)
    }
  ];

  const stats = [
    {
      label: 'Temps de visionnage',
      value: user.watchTime,
      icon: 'play-circle',
      color: BURKINA_COLORS.primary
    },
    {
      label: 'Émissions suivies',
      value: user.favoriteCategories.length.toString(),
      icon: 'star',
      color: BURKINA_COLORS.secondary
    },
    {
      label: 'Abonnements',
      value: user.subscriptions.toString(),
      icon: 'card',
      color: BURKINA_COLORS.accent
    }
  ];

  const handleProfileEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Modification du profil', 'Fonctionnalité bientôt disponible');
  };

  const handleFavorites = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Émissions Favorites', 'Vos catégories préférées: ' + user.favoriteCategories.join(', '));
  };

  const handleHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Historique', `Vous avez regardé ${user.watchTime} de contenu LCA TV`);
  };

  const handleNotifications = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Notifications', 'Configuration des notifications');
  };

  const handleSubscriptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Abonnements', `Vous avez ${user.subscriptions} services actifs`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Déconnecté', 'Vous avez été déconnecté avec succès');
          }
        }
      ]
    );
  };

  const renderStatCard = (stat: any, index: number) => (
    <View key={index} style={styles.statCard}>
      <BlurView intensity={20} style={styles.statBlur}>
        <View style={styles.statContent}>
          <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
            <Ionicons name={stat.icon} size={20} color={stat.color} />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      </BlurView>
    </View>
  );

  const renderOptionCard = (option: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.optionCard}
      onPress={option.action}
      activeOpacity={0.8}
    >
      <View style={styles.optionContent}>
        <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
          <Ionicons name={option.icon} size={20} color={option.color} />
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
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
            <Text style={styles.headerTitle}>Mon Profil</Text>
            <Text style={styles.headerSubtitle}>Compte LCA TV</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleProfileEdit}>
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <BlurView intensity={20} style={styles.profileBlur}>
            <View style={styles.profileContent}>
              <View style={styles.avatar}>
                <LinearGradient
                  colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                </LinearGradient>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userLocation}>{user.location}</Text>
                <Text style={styles.memberSince}>Membre depuis {user.memberSince}</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            {stats.map(renderStatCard)}
          </View>
        </View>

        {/* Options Section */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Paramètres du Compte</Text>
          {profileOptions.map(renderOptionCard)}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <LinearGradient
              colors={[BURKINA_COLORS.secondary, '#f59e0b']}
              style={styles.actionGradient}
            >
              <Ionicons name="star" size={20} color="white" />
              <Text style={styles.actionText}>Évaluer LCA TV</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <LinearGradient
              colors={[BURKINA_COLORS.primary, '#16a34a']}
              style={styles.actionGradient}
            >
              <Ionicons name="share" size={20} color="white" />
              <Text style={styles.actionText}>Partager l'app</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <LinearGradient
              colors={[BURKINA_COLORS.accent, '#dc2626']}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutText}>Se Déconnecter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>LCA TV Burkina Faso</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoCopyright}>© 2024 LCA TV. Tous droits réservés.</Text>
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
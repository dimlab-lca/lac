import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
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

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    notifications: true,
    breakingNews: true,
    liveAlerts: false,
    autoplay: true,
    highQuality: false,
    darkMode: false,
    dataLimits: true,
    analytics: true
  });
  
  const navigation = useNavigation();

  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          key: 'notifications',
          label: 'Notifications générales',
          description: 'Recevoir les notifications de l\'app',
          type: 'switch',
          icon: 'notifications-outline',
          color: BURKINA_COLORS.primary
        },
        {
          key: 'breakingNews',
          label: 'Breaking News',
          description: 'Alertes pour les actualités urgentes',
          type: 'switch',
          icon: 'flash-outline',
          color: BURKINA_COLORS.accent
        },
        {
          key: 'liveAlerts',
          label: 'Alertes Live',
          description: 'Notifications lors des diffusions live',
          type: 'switch',
          icon: 'radio-outline',
          color: BURKINA_COLORS.secondary
        }
      ]
    },
    {
      title: 'Lecture Vidéo',
      items: [
        {
          key: 'autoplay',
          label: 'Lecture automatique',
          description: 'Lancer automatiquement les vidéos',
          type: 'switch',
          icon: 'play-outline',
          color: BURKINA_COLORS.primary
        },
        {
          key: 'highQuality',
          label: 'Haute qualité',
          description: 'Privilégier la qualité HD',
          type: 'switch',
          icon: 'videocam-outline',
          color: BURKINA_COLORS.accent
        }
      ]
    },
    {
      title: 'Application',
      items: [
        {
          key: 'darkMode',
          label: 'Mode sombre',
          description: 'Interface en mode sombre',
          type: 'switch',
          icon: 'moon-outline',
          color: BURKINA_COLORS.dark
        },
        {
          key: 'dataLimits',
          label: 'Économie de données',
          description: 'Réduire la consommation de données',
          type: 'switch',
          icon: 'cellular-outline',
          color: BURKINA_COLORS.primary
        },
        {
          key: 'analytics',
          label: 'Données d\'usage',
          description: 'Aider à améliorer l\'app',
          type: 'switch',
          icon: 'analytics-outline',
          color: BURKINA_COLORS.secondary
        }
      ]
    }
  ];

  const actionItems = [
    {
      label: 'Vider le cache',
      description: 'Libérer de l\'espace de stockage',
      icon: 'trash-outline',
      color: '#f59e0b',
      action: () => handleClearCache()
    },
    {
      label: 'Signaler un problème',
      description: 'Nous faire part d\'un bug',
      icon: 'bug-outline',
      color: BURKINA_COLORS.accent,
      action: () => handleReportBug()
    },
    {
      label: 'À propos',
      description: 'Informations sur l\'application',
      icon: 'information-circle-outline',
      color: BURKINA_COLORS.primary,
      action: () => handleAbout()
    }
  ];

  const handleSettingChange = (key: string, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleClearCache = () => {
    Alert.alert(
      'Vider le cache',
      'Cette action supprimera les données temporaires. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Vider', 
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Cache vidé', 'Les données temporaires ont été supprimées.');
          }
        }
      ]
    );
  };

  const handleReportBug = () => {
    Alert.alert(
      'Signaler un problème',
      'Décrivez le problème rencontré et nous vous recontacterons.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Envoyer', onPress: () => Alert.alert('Merci !', 'Votre rapport a été envoyé.') }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'LCA TV Burkina Faso',
      'Version 1.0.0\n\n© 2024 LCA TV. Tous droits réservés.\n\nApplication officielle de la chaîne de télévision LCA TV, votre référence pour l\'actualité burkinabè.',
      [{ text: 'Fermer' }]
    );
  };

  const renderSettingItem = (item: any, sectionIndex: number, itemIndex: number) => (
    <View key={`${sectionIndex}-${itemIndex}`} style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon} size={20} color={item.color} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>{item.label}</Text>
          <Text style={styles.settingDescription}>{item.description}</Text>
        </View>
        <Switch
          value={settings[item.key as keyof typeof settings]}
          onValueChange={(value) => handleSettingChange(item.key, value)}
          trackColor={{ false: '#e5e7eb', true: `${item.color}40` }}
          thumbColor={settings[item.key as keyof typeof settings] ? item.color : '#f4f3f4'}
        />
      </View>
    </View>
  );

  const renderActionItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.actionItem}
      onPress={item.action}
      activeOpacity={0.8}
    >
      <View style={styles.actionContent}>
        <View style={[styles.actionIcon, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon} size={20} color={item.color} />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionLabel}>{item.label}</Text>
          <Text style={styles.actionDescription}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.dark} />
      
      {/* Header */}
      <LinearGradient
        colors={[BURKINA_COLORS.dark, '#374151']}
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
            <Text style={styles.headerTitle}>Paramètres</Text>
            <Text style={styles.headerSubtitle}>Configuration de l'app</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => 
                renderSettingItem(item, sectionIndex, itemIndex)
              )}
            </View>
          </View>
        ))}

        {/* Action Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.sectionContent}>
            {actionItems.map(renderActionItem)}
          </View>
        </View>

        {/* Storage Info */}
        <View style={styles.storageSection}>
          <BlurView intensity={20} style={styles.storageBlur}>
            <View style={styles.storageContent}>
              <View style={styles.storageHeader}>
                <Ionicons name="server-outline" size={24} color={BURKINA_COLORS.primary} />
                <Text style={styles.storageTitle}>Stockage</Text>
              </View>
              <View style={styles.storageStats}>
                <View style={styles.storageStat}>
                  <Text style={styles.storageValue}>45.2 MB</Text>
                  <Text style={styles.storageLabel}>Cache vidéo</Text>
                </View>
                <View style={styles.storageStat}>
                  <Text style={styles.storageValue}>12.8 MB</Text>
                  <Text style={styles.storageLabel}>Données app</Text>
                </View>
                <View style={styles.storageStat}>
                  <Text style={styles.storageValue}>58.0 MB</Text>
                  <Text style={styles.storageLabel}>Total utilisé</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoTitle}>LCA TV Burkina Faso</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0 (Build 1)</Text>
          <Text style={styles.appInfoDescription}>
            Application officielle de LCA TV pour suivre l'actualité burkinabè en temps réel
          </Text>
          
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={20} color="#1877f2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-twitter" size={20} color="#1da1f2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-youtube" size={20} color="#ff0000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-instagram" size={20} color="#e4405f" />
            </TouchableOpacity>
          </View>
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
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  storageSection: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  storageBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  storageContent: {
    padding: 20,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginLeft: 12,
  },
  storageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  storageStat: {
    alignItems: 'center',
  },
  storageValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BURKINA_COLORS.primary,
    marginBottom: 4,
  },
  storageLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  appInfoSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  appInfoDescription: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BURKINA_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
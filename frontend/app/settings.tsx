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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

// LCA TV Colors (Updated with Blue Theme)
const BURKINA_COLORS = {
  primary: '#2563EB', // Modern Blue (was green)
  secondary: '#FCD116', // Yellow from flag
  accent: '#CE1126', // Red from flag
  dark: '#1a1a1a',
  light: '#f8f9fa',
  white: '#ffffff'
};

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [hdQuality, setHdQuality] = useState(true);
  const [dataReduction, setDataReduction] = useState(false);
  
  const navigation = useNavigation();

  const handleToggle = (value: boolean, setter: (val: boolean) => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(value);
  };

  const settingsGroups = [
    {
      title: 'Notifications',
      items: [
        {
          label: 'Notifications Push',
          description: 'Recevoir les notifications des nouvelles vidéos',
          value: notifications,
          onToggle: (value: boolean) => handleToggle(value, setNotifications),
          type: 'switch'
        }
      ]
    },
    {
      title: 'Lecture Vidéo',
      items: [
        {
          label: 'Lecture Automatique',
          description: 'Lancer automatiquement les vidéos suivantes',
          value: autoplay,
          onToggle: (value: boolean) => handleToggle(value, setAutoplay),
          type: 'switch'
        },
        {
          label: 'Qualité HD',
          description: 'Préférer la qualité HD quand disponible',
          value: hdQuality,
          onToggle: (value: boolean) => handleToggle(value, setHdQuality),
          type: 'switch'
        }
      ]
    },
    {
      title: 'Données & Stockage',
      items: [
        {
          label: 'Réduction des Données',
          description: 'Limiter l\'utilisation des données mobiles',
          value: dataReduction,
          onToggle: (value: boolean) => handleToggle(value, setDataReduction),
          type: 'switch'
        }
      ]
    },
    {
      title: 'Général',
      items: [
        {
          label: 'Langue',
          description: 'Français',
          type: 'link',
          onPress: () => console.log('Language settings')
        },
        {
          label: 'À propos',
          description: 'Version 1.0.0',
          type: 'link',
          onPress: () => console.log('About')
        }
      ]
    }
  ];

  const renderSettingItem = (item: any, index: number) => (
    <View key={index} style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{item.label}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#e5e7eb', true: BURKINA_COLORS.primary }}
          thumbColor={item.value ? '#ffffff' : '#f4f3f4'}
        />
      ) : (
        <TouchableOpacity onPress={item.onPress}>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupContent}>
              {group.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
            </View>
          </View>
        ))}
        
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  settingsGroup: {
    marginTop: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  groupContent: {
    backgroundColor: BURKINA_COLORS.white,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: BURKINA_COLORS.dark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});
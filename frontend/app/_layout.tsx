import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Burkina Faso Colors
const BURKINA_COLORS = {
  primary: '#009639', // Green from flag
  secondary: '#FCD116', // Yellow from flag
  accent: '#CE1126', // Red from flag
  dark: '#1a1a1a',
  light: '#f8f9fa',
  white: '#ffffff'
};

function CustomDrawerContent(props: any) {
  const menuItems = [
    {
      label: 'Accueil',
      icon: 'home-outline',
      route: '/',
      color: BURKINA_COLORS.primary
    },
    {
      label: 'Live TV',
      icon: 'radio-outline',
      route: '/live',
      color: BURKINA_COLORS.accent,
      badge: 'LIVE'
    },
    {
      label: 'Journal & Actualités',
      icon: 'newspaper-outline',
      route: '/journal',
      color: BURKINA_COLORS.primary
    },
    {
      label: 'Émissions',
      icon: 'tv-outline',
      route: '/emissions',
      color: BURKINA_COLORS.secondary
    },
    {
      label: 'Publicité',
      icon: 'megaphone-outline',
      route: '/advertising/create',
      color: BURKINA_COLORS.accent
    },
    {
      label: 'Breaking News',
      icon: 'flash-outline',
      route: '/breaking-news',
      color: BURKINA_COLORS.accent
    },
    {
      label: 'Contact',
      icon: 'mail-outline',
      route: '/contact',
      color: BURKINA_COLORS.dark
    }
  ];

  const userMenuItems = [
    {
      label: 'Mon Profil',
      icon: 'person-outline',
      route: '/profile',
      color: BURKINA_COLORS.primary
    },
    {
      label: 'Paramètres',
      icon: 'settings-outline',
      route: '/settings',
      color: BURKINA_COLORS.dark
    },
    {
      label: 'Connexion',
      icon: 'log-in-outline',
      route: '/auth/login',
      color: BURKINA_COLORS.accent
    }
  ];

  const handleMenuPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Header */}
      <LinearGradient
        colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
        style={styles.drawerHeader}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="tv" size={32} color="white" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>LCA TV</Text>
              <Text style={styles.headerSubtitle}>Burkina Faso</Text>
            </View>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Abonnés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24h/24</Text>
              <Text style={styles.statLabel}>En Direct</Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      {/* Menu Items */}
      <DrawerContentScrollView {...props} style={styles.menuContainer}>
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Compte</Text>
          {userMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appInfoItem}>
            <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
            <Text style={styles.appInfoText}>Version 1.0.0</Text>
          </View>
          <View style={styles.appInfoItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#6b7280" />
            <Text style={styles.appInfoText}>Application Officielle</Text>
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <LinearGradient
          colors={[BURKINA_COLORS.accent, '#dc2626']}
          style={styles.footerGradient}
        >
          <Text style={styles.footerText}>🇧🇫 Fier d'être Burkinabé</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: 'transparent',
          width: 300,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="live" />
      <Drawer.Screen name="journal" />
      <Drawer.Screen name="emissions" />
      <Drawer.Screen name="advertising/create" />
      <Drawer.Screen name="breaking-news" />
      <Drawer.Screen name="contact" />
      <Drawer.Screen name="profile" />
      <Drawer.Screen name="settings" />
      <Drawer.Screen name="auth/login" />
      <Drawer.Screen name="auth/register" />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: BURKINA_COLORS.white,
  },
  drawerHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
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
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: BURKINA_COLORS.dark,
  },
  badge: {
    backgroundColor: BURKINA_COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  chevron: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  appInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  appInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  drawerFooter: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  footerGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
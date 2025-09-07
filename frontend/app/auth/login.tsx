import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// LCA TV Colors with organic design inspiration
const COLORS = {
  primary: '#2563EB', // LCA Blue
  secondary: '#FCD116', // Burkina Yellow
  accent: '#CE1126', // Burkina Red
  dark: '#1E293B', // Modern dark blue
  light: '#F8FAFC',
  white: '#FFFFFF',
  organic1: '#3B82F6', // Bright blue
  organic2: '#06B6D4', // Cyan
};

// Organic Background Shapes Component
const OrganicBackground = () => (
  <Svg width={width} height={height} style={StyleSheet.absoluteFillObject} viewBox={`0 0 ${width} ${height}`}>
    <Defs>
      <SvgLinearGradient id="organicGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.8" />
        <Stop offset="100%" stopColor={COLORS.organic1} stopOpacity="0.9" />
      </SvgLinearGradient>
      <SvgLinearGradient id="organicGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={COLORS.organic2} stopOpacity="0.7" />
        <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.8" />
      </SvgLinearGradient>
    </Defs>
    
    {/* Large organic shape - top */}
    <Path
      d={`M0,0 L${width},0 L${width},${height * 0.4} 
          C${width * 0.8},${height * 0.45} ${width * 0.6},${height * 0.35} ${width * 0.4},${height * 0.4}
          C${width * 0.2},${height * 0.45} ${width * 0.1},${height * 0.35} 0,${height * 0.3} Z`}
      fill="url(#organicGradient1)"
    />
    
    {/* Medium organic shape - bottom right */}
    <Path
      d={`M${width * 0.6},${height * 0.7} 
          C${width * 0.8},${height * 0.65} ${width * 0.9},${height * 0.8} ${width},${height * 0.75}
          L${width},${height} L${width * 0.3},${height}
          C${width * 0.4},${height * 0.9} ${width * 0.5},${height * 0.8} ${width * 0.6},${height * 0.7} Z`}
      fill="url(#organicGradient2)"
    />
    
    {/* Small organic accent shape */}
    <Path
      d={`M${width * 0.1},${height * 0.6} 
          C${width * 0.2},${height * 0.55} ${width * 0.3},${height * 0.65} ${width * 0.25},${height * 0.75}
          C${width * 0.15},${height * 0.8} ${width * 0.05},${height * 0.7} ${width * 0.1},${height * 0.6} Z`}
      fill={COLORS.white}
      opacity="0.1"
    />
  </Svg>
);

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Succès', 'Connexion réussie !', [
          { text: 'OK', onPress: () => router.replace('/') }
        ]);
      } else {
        Alert.alert('Échec de connexion', data.detail || 'Identifiants invalides');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau. Veuillez réessayer.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/register');
  };

  const handleGoogleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Bientôt disponible', 'La connexion Google sera bientôt disponible !');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Organic Background */}
      <OrganicBackground />
      
      {/* Overlay for better readability */}
      <LinearGradient
        colors={['rgba(30, 41, 59, 0.1)', 'rgba(30, 41, 59, 0.05)']}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-left" size={28} color={COLORS.white} />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.welcomeTitle}>Bienvenue</Text>
              <Text style={styles.welcomeSubtitle}>Connectez-vous à votre compte</Text>
            </View>
          </View>

          {/* Login Form Card */}
          <View style={styles.formCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={styles.formGradient}
            >
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="votre@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={formData.username}
                    onChangeText={(text) => setFormData({ ...formData, username: text })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#9CA3AF', '#6B7280'] : [COLORS.primary, COLORS.organic1]}
                  style={styles.signInGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.signInText}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Bottom Links */}
              <View style={styles.bottomLinks}>
                <TouchableOpacity onPress={navigateToRegister}>
                  <Text style={styles.signUpLink}>S'inscrire</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.forgotLink}>Mot de passe oublié</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formCard: {
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  formGradient: {
    padding: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  signInButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 32,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  signInText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signUpLink: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  forgotLink: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});
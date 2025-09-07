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
  organic3: '#10B981', // Emerald
};

// Organic Background Shapes Component (Different from login)
const OrganicBackground = () => (
  <Svg width={width} height={height} style={StyleSheet.absoluteFillObject} viewBox={`0 0 ${width} ${height}`}>
    <Defs>
      <SvgLinearGradient id="organicGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={COLORS.organic3} stopOpacity="0.8" />
        <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.9" />
      </SvgLinearGradient>
      <SvgLinearGradient id="organicGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={COLORS.secondary} stopOpacity="0.8" />
        <Stop offset="100%" stopColor={COLORS.organic2} stopOpacity="0.7" />
      </SvgLinearGradient>
    </Defs>
    
    {/* Large organic shape - top left */}
    <Path
      d={`M0,0 L${width * 0.7},0 
          C${width * 0.6},${height * 0.2} ${width * 0.4},${height * 0.3} ${width * 0.3},${height * 0.45}
          C${width * 0.2},${height * 0.5} 0,${height * 0.4} 0,${height * 0.25} Z`}
      fill="url(#organicGradient1)"
    />
    
    {/* Medium organic shape - bottom */}
    <Path
      d={`M${width * 0.4},${height * 0.65} 
          C${width * 0.6},${height * 0.6} ${width * 0.8},${height * 0.7} ${width * 0.9},${height * 0.85}
          L${width},${height * 0.9} L${width},${height} L0,${height}
          C${width * 0.1},${height * 0.9} ${width * 0.2},${height * 0.75} ${width * 0.4},${height * 0.65} Z`}
      fill="url(#organicGradient2)"
    />
    
    {/* Small organic accent shapes */}
    <Path
      d={`M${width * 0.8},${height * 0.3} 
          C${width * 0.9},${height * 0.25} ${width * 0.95},${height * 0.35} ${width * 0.85},${height * 0.4}
          C${width * 0.75},${height * 0.38} ${width * 0.75},${height * 0.32} ${width * 0.8},${height * 0.3} Z`}
      fill={COLORS.white}
      opacity="0.15"
    />
    
    <Path
      d={`M${width * 0.05},${height * 0.7} 
          C${width * 0.15},${height * 0.68} ${width * 0.2},${height * 0.75} ${width * 0.12},${height * 0.8}
          C${width * 0.02},${height * 0.78} ${width * 0.0},${height * 0.72} ${width * 0.05},${height * 0.7} Z`}
      fill={COLORS.white}
      opacity="0.1"
    />
  </Svg>
);

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Succès', 'Compte créé avec succès !', [
          { text: 'OK', onPress: () => router.replace('/auth/login') }
        ]);
      } else {
        Alert.alert('Échec d\'inscription', data.detail || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau. Veuillez réessayer.');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Organic Background */}
      <OrganicBackground />
      
      {/* Overlay for better readability */}
      <LinearGradient
        colors={['rgba(30, 41, 59, 0.08)', 'rgba(30, 41, 59, 0.03)']}
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
              <Text style={styles.welcomeTitle}>Créer un compte</Text>
              <Text style={styles.welcomeSubtitle}>Rejoignez la communauté LCA TV</Text>
            </View>
          </View>

          {/* Register Form Card */}
          <View style={styles.formCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={styles.formGradient}
            >
              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom complet</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Votre nom complet"
                    placeholderTextColor="#9CA3AF"
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="votre@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text.toLowerCase() })}
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

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#9CA3AF', '#6B7280'] : [COLORS.organic3, COLORS.primary]}
                  style={styles.signInGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.signInText}>
                    {loading ? 'Création...' : 'Créer le compte'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Bottom Links */}
              <View style={styles.bottomLinks}>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.signUpLink}>Déjà un compte ? Se connecter</Text>
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
    marginBottom: 20,
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
    shadowColor: COLORS.organic3,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpLink: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
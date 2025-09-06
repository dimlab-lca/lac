import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Burkina Faso Colors
const BURKINA_COLORS = {
  primary: '#009639', // Green from flag
  secondary: '#FCD116', // Yellow from flag
  accent: '#CE1126', // Red from flag
  dark: '#1a1a1a',
  light: '#f8f9fa',
  white: '#ffffff'
};

interface AdvertisementForm {
  title: string;
  description: string;
  duration_days: string;
  budget: string;
  target_audience: string;
  ad_type: string;
  content_url: string;
}

export default function CreateAdvertisement() {
  const [formData, setFormData] = useState<AdvertisementForm>({
    title: '',
    description: '',
    duration_days: '',
    budget: '',
    target_audience: '',
    ad_type: 'banner',
    content_url: ''
  });
  const [loading, setLoading] = useState(false);

  const adTypes = [
    { value: 'banner', label: 'Bannière publicitaire', icon: 'image-outline' },
    { value: 'video', label: 'Spot vidéo', icon: 'videocam-outline' },
    { value: 'sponsored_content', label: 'Contenu sponsorisé', icon: 'star-outline' }
  ];

  const audienceOptions = [
    'Grand public (18-65 ans)',
    'Jeunes adultes (18-35 ans)',
    'Familles (25-50 ans)',
    'Professionnels (30-55 ans)',
    'Étudiants (16-25 ans)',
    'Entrepreneurs (25-45 ans)'
  ];

  const calculateEstimatedCost = () => {
    const budget = parseFloat(formData.budget) || 0;
    const days = parseInt(formData.duration_days) || 1;
    const multiplier = formData.ad_type === 'video' ? 1.5 : formData.ad_type === 'sponsored_content' ? 1.2 : 1;
    return Math.round(budget * days * multiplier);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.budget || !formData.duration_days) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (parseFloat(formData.budget) <= 0 || parseInt(formData.duration_days) <= 0) {
      Alert.alert('Erreur', 'Le budget et la durée doivent être supérieurs à 0');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      
      // In a real app, you would include the auth token
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/advertisements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          duration_days: parseInt(formData.duration_days),
          budget: parseFloat(formData.budget),
          target_audience: formData.target_audience,
          ad_type: formData.ad_type,
          content_url: formData.content_url || null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          'Demande envoyée !',
          `Votre demande publicitaire a été soumise avec succès.\n\nRéférence: ${result.id}\nCoût estimé: ${calculateEstimatedCost()} FCFA\n\nNotre équipe vous contactera sous 24h.`,
          [
            { text: 'OK', onPress: () => router.back() }
          ]
        );
      } else {
        const error = await response.json();
        Alert.alert('Erreur', error.detail || 'Erreur lors de la soumission');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau. Veuillez réessayer.');
      console.error('Advertisement creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Créer une Publicité</Text>
            <Text style={styles.headerSubtitle}>LCA TV Burkina Faso</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <BlurView intensity={20} style={styles.formContainer}>
            <View style={styles.formContent}>
              
              {/* Title Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre de la publicité *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="text-outline" size={20} color={BURKINA_COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: Promotion spéciale restaurant"
                    placeholderTextColor="#9ca3af"
                    value={formData.title}
                    onChangeText={(text) => setFormData({...formData, title: text})}
                  />
                </View>
              </View>

              {/* Description Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <Ionicons name="document-text-outline" size={20} color={BURKINA_COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Décrivez votre campagne publicitaire..."
                    placeholderTextColor="#9ca3af"
                    value={formData.description}
                    onChangeText={(text) => setFormData({...formData, description: text})}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Ad Type Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type de publicité *</Text>
                <View style={styles.adTypeContainer}>
                  {adTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.adTypeButton,
                        formData.ad_type === type.value && styles.adTypeButtonActive
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setFormData({...formData, ad_type: type.value});
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={20}
                        color={formData.ad_type === type.value ? 'white' : BURKINA_COLORS.primary}
                      />
                      <Text style={[
                        styles.adTypeText,
                        formData.ad_type === type.value && styles.adTypeTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Budget and Duration Row */}
              <View style={styles.rowContainer}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Budget (FCFA) *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="cash-outline" size={20} color={BURKINA_COLORS.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="50000"
                      placeholderTextColor="#9ca3af"
                      value={formData.budget}
                      onChangeText={(text) => setFormData({...formData, budget: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Durée (jours) *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="calendar-outline" size={20} color={BURKINA_COLORS.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="7"
                      placeholderTextColor="#9ca3af"
                      value={formData.duration_days}
                      onChangeText={(text) => setFormData({...formData, duration_days: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Target Audience */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Public cible</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="people-outline" size={20} color={BURKINA_COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: Jeunes adultes de Ouagadougou"
                    placeholderTextColor="#9ca3af"
                    value={formData.target_audience}
                    onChangeText={(text) => setFormData({...formData, target_audience: text})}
                  />
                </View>
              </View>

              {/* Content URL (optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>URL du contenu (optionnel)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="link-outline" size={20} color={BURKINA_COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="https://votre-site.com/video.mp4"
                    placeholderTextColor="#9ca3af"
                    value={formData.content_url}
                    onChangeText={(text) => setFormData({...formData, content_url: text})}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              {/* Cost Estimation */}
              {formData.budget && formData.duration_days && (
                <View style={styles.costEstimation}>
                  <LinearGradient
                    colors={[BURKINA_COLORS.secondary, '#f59e0b']}
                    style={styles.costEstimationGradient}
                  >
                    <Ionicons name="calculator-outline" size={24} color="white" />
                    <View style={styles.costEstimationText}>
                      <Text style={styles.costEstimationTitle}>Coût Estimé</Text>
                      <Text style={styles.costEstimationAmount}>
                        {calculateEstimatedCost().toLocaleString()} FCFA
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#9ca3af', '#6b7280'] : [BURKINA_COLORS.primary, '#16a34a']}
                  style={styles.submitButtonGradient}
                >
                  {loading ? (
                    <Text style={styles.submitButtonText}>Envoi en cours...</Text>
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="white" style={styles.buttonIcon} />
                      <Text style={styles.submitButtonText}>Soumettre la demande</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={BURKINA_COLORS.primary} />
                <Text style={styles.infoText}>
                  Notre équipe commerciale vous contactera sous 24h pour finaliser votre campagne publicitaire.
                </Text>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  formContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: BURKINA_COLORS.dark,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  adTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  adTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: BURKINA_COLORS.white,
    borderWidth: 1,
    borderColor: BURKINA_COLORS.primary,
    marginBottom: 8,
  },
  adTypeButtonActive: {
    backgroundColor: BURKINA_COLORS.primary,
  },
  adTypeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: BURKINA_COLORS.primary,
  },
  adTypeTextActive: {
    color: 'white',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  costEstimation: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  costEstimationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  costEstimationText: {
    marginLeft: 12,
    flex: 1,
  },
  costEstimationTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  costEstimationAmount: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 2,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: BURKINA_COLORS.primary,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
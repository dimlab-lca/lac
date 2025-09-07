import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// LCA TV Colors (Updated with Blue Theme)
const BURKINA_COLORS = {
  primary: '#2563EB', // Modern Blue (was green)
  secondary: '#FCD116', // Yellow from flag
  accent: '#CE1126', // Red from flag
  dark: '#1a1a1a',
  light: '#f8f9fa',
  white: '#ffffff'
};

export default function CreateAdvertisingScreen() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    adType: '',
    duration: '',
    budget: '',
    description: '',
    targetAudience: '',
    startDate: '',
  });
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();

  const adTypes = [
    { id: 'video', label: 'Spot Vidéo', description: '30-60 secondes', price: '500,000 FCFA' },
    { id: 'banner', label: 'Bannière TV', description: 'Affichage fixe', price: '200,000 FCFA' },
    { id: 'sponsorship', label: 'Parrainage', description: 'Émission sponsorisée', price: '1,000,000 FCFA' },
    { id: 'breaking', label: 'Breaking News', description: 'Bandeau d\'actualité', price: '300,000 FCFA' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdTypeSelect = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleInputChange('adType', type);
  };

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.contactName || !formData.email || !formData.adType) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Demande envoyée !',
        'Votre demande de publicité a été envoyée avec succès. Notre équipe commerciale vous contactera dans les 24h.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderAdTypeCard = (adType: any) => (
    <TouchableOpacity
      key={adType.id}
      style={[
        styles.adTypeCard,
        formData.adType === adType.id && styles.adTypeCardSelected
      ]}
      onPress={() => handleAdTypeSelect(adType.id)}
      activeOpacity={0.8}
    >
      <View style={styles.adTypeHeader}>
        <Text style={[
          styles.adTypeLabel,
          formData.adType === adType.id && styles.adTypeLabelSelected
        ]}>
          {adType.label}
        </Text>
        <Text style={styles.adTypePrice}>{adType.price}</Text>
      </View>
      <Text style={styles.adTypeDescription}>{adType.description}</Text>
      {formData.adType === adType.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={20} color={BURKINA_COLORS.primary} />
        </View>
      )}
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer une Publicité</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.section}>
          <View style={styles.introCard}>
            <Ionicons name="megaphone" size={40} color={BURKINA_COLORS.primary} />
            <Text style={styles.introTitle}>Faites connaître votre entreprise</Text>
            <Text style={styles.introText}>
              Diffusez votre publicité sur LCA TV et atteignez des milliers de téléspectateurs au Burkina Faso.
            </Text>
          </View>
        </View>

        {/* Ad Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de Publicité *</Text>
          <View style={styles.adTypeGrid}>
            {adTypes.map(renderAdTypeCard)}
          </View>
        </View>

        {/* Company Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Entreprise</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom de l'entreprise *</Text>
              <TextInput
                style={styles.input}
                value={formData.companyName}
                onChangeText={(value) => handleInputChange('companyName', value)}
                placeholder="Nom de votre entreprise"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom du contact *</Text>
              <TextInput
                style={styles.input}
                value={formData.contactName}
                onChangeText={(value) => handleInputChange('contactName', value)}
                placeholder="Votre nom complet"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="votre@email.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="+226 XX XX XX XX"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Campaign Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la Campagne</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Durée souhaitée</Text>
              <TextInput
                style={styles.input}
                value={formData.duration}
                onChangeText={(value) => handleInputChange('duration', value)}
                placeholder="ex: 1 semaine, 1 mois..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Budget approximatif</Text>
              <TextInput
                style={styles.input}
                value={formData.budget}
                onChangeText={(value) => handleInputChange('budget', value)}
                placeholder="Budget en FCFA"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Public cible</Text>
              <TextInput
                style={styles.input}
                value={formData.targetAudience}
                onChangeText={(value) => handleInputChange('targetAudience', value)}
                placeholder="ex: Jeunes adultes, Familles..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description du produit/service</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Décrivez votre produit ou service..."
                placeholderTextColor="#9ca3af"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
              style={styles.submitGradient}
            >
              {loading ? (
                <Text style={styles.submitText}>Envoi en cours...</Text>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="white" />
                  <Text style={styles.submitText}>Envoyer la Demande</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
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
    fontSize: 18,
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
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  introCard: {
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 16,
  },
  adTypeGrid: {
    gap: 12,
  },
  adTypeCard: {
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  adTypeCardSelected: {
    borderColor: BURKINA_COLORS.primary,
    backgroundColor: `${BURKINA_COLORS.primary}10`,
  },
  adTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
  },
  adTypeLabelSelected: {
    color: BURKINA_COLORS.primary,
  },
  adTypePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BURKINA_COLORS.accent,
  },
  adTypeDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  form: {
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: BURKINA_COLORS.dark,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
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
  Linking,
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

export default function ContactScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();

  const contactInfo = [
    {
      title: 'Siège Social',
      icon: 'location-outline',
      details: 'Secteur 4, Avenue Kwame Nkrumah\nOuagadougou, Burkina Faso',
      action: () => openMap()
    },
    {
      title: 'Téléphone',
      icon: 'call-outline',
      details: '+226 25 XX XX XX\n+226 70 XX XX XX',
      action: () => Linking.openURL('tel:+22625XXXXXX')
    },
    {
      title: 'Email',
      icon: 'mail-outline',
      details: 'contact@lcatv.bf\nredaction@lcatv.bf',
      action: () => Linking.openURL('mailto:contact@lcatv.bf')
    },
    {
      title: 'Réseaux Sociaux',
      icon: 'logo-facebook',
      details: 'Facebook, Twitter, YouTube\nInstagram, LinkedIn',
      action: () => openSocialMedia()
    }
  ];

  const departments = [
    {
      name: 'Rédaction',
      phone: '+226 25 XX XX XX',
      email: 'redaction@lcatv.bf',
      hours: '24h/24, 7j/7',
      icon: 'newspaper-outline'
    },
    {
      name: 'Publicité',
      phone: '+226 25 XX XX XX',
      email: 'pub@lcatv.bf',
      hours: 'Lun-Ven: 8h-17h',
      icon: 'megaphone-outline'
    },
    {
      name: 'Technique',
      phone: '+226 25 XX XX XX',
      email: 'technique@lcatv.bf',
      hours: 'Lun-Ven: 8h-17h',
      icon: 'settings-outline'
    }
  ];

  const openMap = () => {
    const url = `https://maps.google.com/?q=12.3714,-1.5197`;
    Linking.openURL(url);
  };

  const openSocialMedia = () => {
    Alert.alert(
      'Réseaux Sociaux',
      'Suivez-nous sur nos différentes plateformes',
      [
        { text: 'Facebook', onPress: () => Linking.openURL('https://facebook.com/lcatvbf') },
        { text: 'YouTube', onPress: () => Linking.openURL('https://youtube.com/@LCATV') },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Message envoyé !',
        'Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 2000);
  };

  const renderContactCard = (contact: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.contactCard}
      onPress={contact.action}
      activeOpacity={0.8}
    >
      <BlurView intensity={15} style={styles.contactCardBlur}>
        <View style={styles.contactCardContent}>
          <View style={styles.contactIcon}>
            <Ionicons name={contact.icon} size={24} color={BURKINA_COLORS.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>{contact.title}</Text>
            <Text style={styles.contactDetails}>{contact.details}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderDepartmentCard = (dept: any, index: number) => (
    <View key={index} style={styles.departmentCard}>
      <View style={styles.departmentHeader}>
        <View style={styles.departmentIcon}>
          <Ionicons name={dept.icon} size={20} color={BURKINA_COLORS.accent} />
        </View>
        <Text style={styles.departmentName}>{dept.name}</Text>
      </View>
      <View style={styles.departmentInfo}>
        <View style={styles.departmentRow}>
          <Ionicons name="call" size={14} color="#6b7280" />
          <Text style={styles.departmentText}>{dept.phone}</Text>
        </View>
        <View style={styles.departmentRow}>
          <Ionicons name="mail" size={14} color="#6b7280" />
          <Text style={styles.departmentText}>{dept.email}</Text>
        </View>
        <View style={styles.departmentRow}>
          <Ionicons name="time" size={14} color="#6b7280" />
          <Text style={styles.departmentText}>{dept.hours}</Text>
        </View>
      </View>
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
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Contact</Text>
            <Text style={styles.headerSubtitle}>Contactez LCA TV</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Nous Contacter</Text>
          <Text style={styles.heroSubtitle}>
            L'équipe LCA TV est à votre écoute. N'hésitez pas à nous faire part de vos commentaires, suggestions ou questions.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Informations de Contact</Text>
          {contactInfo.map(renderContactCard)}
        </View>

        {/* Departments */}
        <View style={styles.departmentsSection}>
          <Text style={styles.sectionTitle}>Nos Départements</Text>
          {departments.map(renderDepartmentCard)}
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Envoyez-nous un Message</Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom complet *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={BURKINA_COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Votre nom complet"
                  placeholderTextColor="#9ca3af"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={BURKINA_COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="votre@email.com"
                  placeholderTextColor="#9ca3af"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sujet *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="bookmark-outline" size={20} color={BURKINA_COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Sujet de votre message"
                  placeholderTextColor="#9ca3af"
                  value={formData.subject}
                  onChangeText={(text) => setFormData({...formData, subject: text})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons name="chatbubble-outline" size={20} color={BURKINA_COLORS.primary} style={[styles.inputIcon, styles.textAreaIcon]} />
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Votre message..."
                  placeholderTextColor="#9ca3af"
                  value={formData.message}
                  onChangeText={(text) => setFormData({...formData, message: text})}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#9ca3af', '#6b7280'] : [BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
                style={styles.submitButtonGradient}
              >
                {loading ? (
                  <Text style={styles.submitButtonText}>Envoi en cours...</Text>
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="white" style={styles.buttonIcon} />
                    <Text style={styles.submitButtonText}>Envoyer le message</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <LinearGradient
            colors={[BURKINA_COLORS.accent, '#dc2626']}
            style={styles.emergencyGradient}
          >
            <Ionicons name="warning" size={24} color="white" />
            <View style={styles.emergencyText}>
              <Text style={styles.emergencyTitle}>Urgence Médiatique</Text>
              <Text style={styles.emergencyDescription}>
                Pour les urgences médiatiques: +226 70 XX XX XX (24h/24)
              </Text>
            </View>
          </LinearGradient>
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
  heroSection: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  contactSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 16,
  },
  contactCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  contactCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${BURKINA_COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 4,
  },
  contactDetails: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  departmentsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  departmentCard: {
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  departmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${BURKINA_COLORS.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
  },
  departmentInfo: {
    paddingLeft: 44,
  },
  departmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  departmentText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  formSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  form: {
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  textAreaIcon: {
    alignSelf: 'flex-start',
    marginTop: 2,
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
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
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
  emergencySection: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  emergencyText: {
    marginLeft: 12,
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emergencyDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
});
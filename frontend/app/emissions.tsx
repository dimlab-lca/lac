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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Burkina Faso Colors
const BURKINA_COLORS = {
  primary: '#009639',
  secondary: '#FCD116',
  accent: '#CE1126',
  dark: '#1a1a1a',
  light: '#f8f9fa',
  white: '#ffffff'
};

interface Emission {
  id: string;
  title: string;
  description: string;
  category: string;
  schedule: string;
  duration: string;
  host: string;
  rating: number;
  isLive: boolean;
  thumbnail: string;
}

export default function EmissionsScreen() {
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const navigation = useNavigation();

  const categories = [
    { key: 'all', label: 'Toutes', icon: 'tv-outline', color: BURKINA_COLORS.primary },
    { key: 'actualites', label: 'Actualités', icon: 'newspaper-outline', color: BURKINA_COLORS.accent },
    { key: 'debats', label: 'Débats', icon: 'chatbubbles-outline', color: BURKINA_COLORS.primary },
    { key: 'culture', label: 'Culture', icon: 'musical-notes-outline', color: BURKINA_COLORS.secondary },
    { key: 'sport', label: 'Sport', icon: 'football-outline', color: BURKINA_COLORS.accent },
    { key: 'jeunesse', label: 'Jeunesse', icon: 'people-outline', color: BURKINA_COLORS.primary },
  ];

  useEffect(() => {
    loadEmissions();
  }, []);

  const loadEmissions = () => {
    const mockEmissions: Emission[] = [
      {
        id: '1',
        title: 'Journal Télévisé',
        description: 'L\'essentiel de l\'actualité nationale et internationale présenté par nos journalistes chevronnés.',
        category: 'actualites',
        schedule: 'Tous les jours à 20h00',
        duration: '45 min',
        host: 'Fatimata Ouédraogo',
        rating: 4.8,
        isLive: true,
        thumbnail: 'news'
      },
      {
        id: '2',
        title: 'Franc-Parler',
        description: 'Débat politique et social avec les personnalités qui font l\'actualité burkinabè.',
        category: 'debats',
        schedule: 'Mercredi à 21h00',
        duration: '90 min',
        host: 'Issouf Sanogo',
        rating: 4.5,
        isLive: false,
        thumbnail: 'debate'
      },
      {
        id: '3',
        title: 'Culture & Tradition',
        description: 'Découverte des richesses culturelles et traditionnelles du Burkina Faso.',
        category: 'culture',
        schedule: 'Samedi à 19h30',
        duration: '60 min',
        host: 'Aminata Traoré',
        rating: 4.6,
        isLive: false,
        thumbnail: 'culture'
      },
      {
        id: '4',
        title: 'Sport Nacional',
        description: 'Toute l\'actualité sportive burkinabè et internationale, focus sur les Étalons.',
        category: 'sport',
        schedule: 'Dimanche à 18h00',
        duration: '30 min',
        host: 'Brahima Ouédraogo',
        rating: 4.3,
        isLive: false,
        thumbnail: 'sport'
      },
      {
        id: '5',
        title: 'Jeunes Entrepreneurs',
        description: 'Portraits de jeunes entrepreneurs burkinabè qui réussissent et inspirent.',
        category: 'jeunesse',
        schedule: 'Vendredi à 20h30',
        duration: '45 min',
        host: 'Marie Kaboré',
        rating: 4.4,
        isLive: false,
        thumbnail: 'youth'
      }
    ];
    
    setEmissions(mockEmissions);
  };

  const handleCategoryPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const filteredEmissions = selectedCategory === 'all' 
    ? emissions 
    : emissions.filter(emission => emission.category === selectedCategory);

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryButton,
            selectedCategory === category.key && styles.categoryButtonActive,
            { borderColor: category.color }
          ]}
          onPress={() => handleCategoryPress(category.key)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={category.icon as any}
            size={18}
            color={selectedCategory === category.key ? 'white' : category.color}
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.key && styles.categoryTextActive,
            { color: selectedCategory === category.key ? 'white' : category.color }
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderEmissionCard = (emission: Emission) => (
    <TouchableOpacity
      key={emission.id}
      style={styles.emissionCard}
      activeOpacity={0.9}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    >
      <View style={styles.emissionThumbnail}>
        <LinearGradient
          colors={[BURKINA_COLORS.primary, BURKINA_COLORS.secondary]}
          style={styles.thumbnailGradient}
        >
          <Ionicons name="play-circle" size={40} color="white" />
        </LinearGradient>
        
        {emission.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{emission.rating}</Text>
        </View>
      </View>

      <View style={styles.emissionInfo}>
        <Text style={styles.emissionTitle}>{emission.title}</Text>
        <Text style={styles.emissionDescription} numberOfLines={2}>
          {emission.description}
        </Text>
        
        <View style={styles.emissionMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{emission.schedule}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="hourglass-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{emission.duration}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{emission.host}</Text>
          </View>
        </View>

        <View style={styles.emissionFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {categories.find(c => c.key === emission.category)?.label}
            </Text>
          </View>
          <TouchableOpacity style={styles.watchButton}>
            <Ionicons name="play" size={16} color="white" />
            <Text style={styles.watchButtonText}>Regarder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderScheduleSection = () => (
    <View style={styles.scheduleSection}>
      <Text style={styles.sectionTitle}>Programme de la Semaine</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scheduleScroll}
        contentContainerStyle={styles.scheduleContent}
      >
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
          <TouchableOpacity key={index} style={styles.dayCard} activeOpacity={0.8}>
            <BlurView intensity={20} style={styles.dayBlur}>
              <Text style={styles.dayText}>{day}</Text>
              <Text style={styles.dayDate}>{15 + index}</Text>
              <View style={styles.dayPrograms}>
                <View style={styles.programDot} />
                <Text style={styles.programCount}>3 émissions</Text>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BURKINA_COLORS.secondary} />
      
      {/* Header */}
      <LinearGradient
        colors={[BURKINA_COLORS.secondary, '#f59e0b']}
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
            <Text style={styles.headerTitle}>Émissions</Text>
            <Text style={styles.headerSubtitle}>Programmes LCA TV</Text>
          </View>
          <TouchableOpacity style={styles.scheduleButton}>
            <Ionicons name="calendar-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Category Filter */}
        {renderCategoryFilter()}

        {/* Emissions Section */}
        <View style={styles.emissionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'Toutes les Émissions' : 
               categories.find(c => c.key === selectedCategory)?.label}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredEmissions.length} émission{filteredEmissions.length > 1 ? 's' : ''}
            </Text>
          </View>

          {filteredEmissions.map(renderEmissionCard)}
        </View>

        {/* Schedule Section */}
        {renderScheduleSection()}
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
  scheduleButton: {
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
  categoryContainer: {
    paddingVertical: 16,
  },
  categoryContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BURKINA_COLORS.white,
    marginRight: 12,
    borderWidth: 1,
  },
  categoryButtonActive: {
    backgroundColor: BURKINA_COLORS.primary,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  emissionsSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  emissionCard: {
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emissionThumbnail: {
    height: 120,
    position: 'relative',
  },
  thumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BURKINA_COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emissionInfo: {
    padding: 16,
  },
  emissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.dark,
    marginBottom: 8,
  },
  emissionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  emissionMeta: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  emissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: BURKINA_COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BURKINA_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  watchButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  scheduleSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  scheduleScroll: {
    marginTop: 16,
  },
  scheduleContent: {
    paddingRight: 16,
  },
  dayCard: {
    width: 80,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dayBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURKINA_COLORS.primary,
    marginBottom: 8,
  },
  dayPrograms: {
    alignItems: 'center',
  },
  programDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BURKINA_COLORS.accent,
    marginBottom: 4,
  },
  programCount: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
});
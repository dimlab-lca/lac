import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
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

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  readTime: string;
  isBreaking: boolean;
}

export default function JournalScreen() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const navigation = useNavigation();

  const categories = [
    { key: 'all', label: 'Tout', icon: 'newspaper-outline' },
    { key: 'politique', label: 'Politique', icon: 'people-outline' },
    { key: 'economie', label: 'Économie', icon: 'trending-up-outline' },
    { key: 'social', label: 'Social', icon: 'heart-outline' },
    { key: 'sport', label: 'Sport', icon: 'football-outline' },
    { key: 'international', label: 'International', icon: 'globe-outline' },
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = () => {
    // Simulate news articles
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'Le Président du Faso inaugure une nouvelle université à Ouagadougou',
        summary: 'Cette nouvelle infrastructure éducative va accueillir plus de 5000 étudiants dès la rentrée prochaine.',
        category: 'social',
        publishedAt: '2024-12-15T10:30:00Z',
        readTime: '3 min',
        isBreaking: true
      },
      {
        id: '2',
        title: 'Agriculture: Bonne campagne agricole 2024 au Burkina Faso',
        summary: 'Les premières estimations montrent une augmentation de 15% de la production céréalière cette année.',
        category: 'economie',
        publishedAt: '2024-12-15T08:45:00Z',
        readTime: '4 min',
        isBreaking: false
      },
      {
        id: '3',
        title: 'Les Étalons du Burkina qualifiés pour la CAN 2025',
        summary: 'L\'équipe nationale de football décroche son billet pour la Coupe d\'Afrique des Nations.',
        category: 'sport',
        publishedAt: '2024-12-14T22:15:00Z',
        readTime: '2 min',
        isBreaking: false
      },
      {
        id: '4',
        title: 'Sommet de la CEDEAO: Le Burkina défend sa position',
        summary: 'Les dirigeants ouest-africains se réunissent pour discuter des défis régionaux.',
        category: 'international',
        publishedAt: '2024-12-14T16:20:00Z',
        readTime: '5 min',
        isBreaking: false
      }
    ];
    
    setArticles(mockArticles);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadArticles();
  };

  const handleCategoryPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Il y a moins d\'1h';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${Math.floor(diffHours / 24)} jour(s)`;
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

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
            selectedCategory === category.key && styles.categoryButtonActive
          ]}
          onPress={() => handleCategoryPress(category.key)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={category.icon as any}
            size={18}
            color={selectedCategory === category.key ? 'white' : BURKINA_COLORS.primary}
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.key && styles.categoryTextActive
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderArticleCard = (article: NewsArticle) => (
    <TouchableOpacity
      key={article.id}
      style={styles.articleCard}
      activeOpacity={0.9}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {article.isBreaking && (
        <View style={styles.breakingBadge}>
          <Text style={styles.breakingText}>URGENT</Text>
        </View>
      )}
      
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleSummary}>{article.summary}</Text>
        
        <View style={styles.articleMeta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {categories.find(c => c.key === article.category)?.label || 'Général'}
            </Text>
          </View>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>{formatTime(article.publishedAt)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{article.readTime}</Text>
          </View>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
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
            <Text style={styles.headerTitle}>Journal & Actualités</Text>
            <Text style={styles.headerSubtitle}>Les dernières nouvelles</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BURKINA_COLORS.primary]}
            tintColor={BURKINA_COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Breaking News Banner */}
        <View style={styles.breakingBanner}>
          <LinearGradient
            colors={[BURKINA_COLORS.accent, '#dc2626']}
            style={styles.breakingGradient}
          >
            <Ionicons name="flash" size={20} color="white" />
            <Text style={styles.breakingBannerText}>
              Dernières actualités en temps réel
            </Text>
          </LinearGradient>
        </View>

        {/* Category Filter */}
        {renderCategoryFilter()}

        {/* Articles Section */}
        <View style={styles.articlesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'Toutes les Actualités' : 
               categories.find(c => c.key === selectedCategory)?.label}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
            </Text>
          </View>

          {filteredArticles.map(renderArticleCard)}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <BlurView intensity={20} style={styles.emergencyBlur}>
            <View style={styles.emergencyContent}>
              <Ionicons name="call" size={24} color={BURKINA_COLORS.accent} />
              <View style={styles.emergencyText}>
                <Text style={styles.emergencyTitle}>Contactez la Rédaction</Text>
                <Text style={styles.emergencyDescription}>
                  +226 25 XX XX XX • redaction@lcatv.bf
                </Text>
              </View>
            </View>
          </BlurView>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchButton: {
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
  breakingBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  breakingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  breakingBannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
    borderColor: BURKINA_COLORS.primary,
  },
  categoryButtonActive: {
    backgroundColor: BURKINA_COLORS.primary,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: BURKINA_COLORS.primary,
  },
  categoryTextActive: {
    color: 'white',
  },
  articlesSection: {
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
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BURKINA_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  breakingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: BURKINA_COLORS.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  breakingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  articleContent: {
    flex: 1,
    marginRight: 12,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BURKINA_COLORS.dark,
    lineHeight: 22,
    marginBottom: 8,
  },
  articleSummary: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleMeta: {
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
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  metaDot: {
    fontSize: 12,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  emergencySection: {
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emergencyBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  emergencyContent: {
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
    color: BURKINA_COLORS.dark,
  },
  emergencyDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});
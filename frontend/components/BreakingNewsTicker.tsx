import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// LCA TV Colors
const COLORS = {
  primary: '#2563EB',
  secondary: '#FCD116',
  accent: '#CE1126', // Rouge Burkina
  dark: '#1a1a1a',
  white: '#ffffff'
};

interface BreakingNewsItem {
  id: string;
  type: 'news' | 'weather' | 'market';
  content: string;
  icon: string;
}

const BreakingNewsTicker: React.FC = () => {
  const [newsItems, setNewsItems] = useState<BreakingNewsItem[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTickerData();
  }, []);

  useEffect(() => {
    if (newsItems.length > 0) {
      // Démarrer l'animation après que les données soient chargées
      startScrollAnimation();
    }
  }, [newsItems]);

  const loadTickerData = async () => {
    try {
      // Charger les breaking news depuis l'API
      const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/breaking-news?limit=3`);
      const breakingNews = await response.json();

      // Préparer les données du ticker
      const tickerItems: BreakingNewsItem[] = [];

      // Ajouter les breaking news
      breakingNews.slice(0, 2).forEach((news: any, index: number) => {
        tickerItems.push({
          id: `news-${index}`,
          type: 'news',
          content: `🔴 URGENT: ${news.title}`,
          icon: 'flash'
        });
      });

      // Ajouter la météo (données simulées - à remplacer par vraie API météo)
      tickerItems.push({
        id: 'weather-1',
        type: 'weather',
        content: `🌤️ OUAGADOUGOU: 32°C - Ensoleillé avec quelques nuages - Vent: 15 km/h`,
        icon: 'sunny'
      });

      // Ajouter les cours des marchés (données simulées)
      tickerItems.push({
        id: 'market-1',
        type: 'market',
        content: `📈 MARCHÉ: FCFA/USD: 590.25 (+0.15%) - Or: 1,950$/oz (+1.2%) - Coton: 82.50 FCFA/kg`,
        icon: 'trending-up'
      });

      tickerItems.push({
        id: 'market-2',
        type: 'market',
        content: `📊 BOURSE: BRVM +2.1% - Total Sénégal: +3.4% - Sonatel: +1.8% - BOA: +0.9%`,
        icon: 'bar-chart'
      });

      setNewsItems(tickerItems);
    } catch (error) {
      console.error('Erreur lors du chargement du ticker:', error);
      // Données de fallback
      setNewsItems([
        {
          id: 'fallback-1',
          type: 'news',
          content: '🔴 URGENT: Suivez l\'actualité en temps réel sur LCA TV',
          icon: 'flash'
        },
        {
          id: 'fallback-2',
          type: 'weather',
          content: '🌤️ OUAGADOUGOU: Temps clément - Restez informés',
          icon: 'sunny'
        },
        {
          id: 'fallback-3',
          type: 'market',
          content: '📈 MARCHÉ: FCFA/USD stable - Marchés ouverts',
          icon: 'trending-up'
        }
      ]);
    }
  };

  const startScrollAnimation = () => {
    // Reset animation
    scrollX.setValue(width);
    
    const totalWidth = width + (newsItems.length * 500); // Plus d'espace pour chaque item
    
    const animate = () => {
      Animated.timing(scrollX, {
        toValue: -totalWidth,
        duration: newsItems.length * 12000, // Plus lent pour meilleure lisibilité
        useNativeDriver: false, // Compatibilité web
      }).start(({ finished }) => {
        if (finished) {
          scrollX.setValue(width);
          animate(); // Recommencer
        }
      });
    };
    
    animate();
  };

  const renderNewsItem = (item: BreakingNewsItem, index: number) => (
    <View key={item.id} style={styles.newsItem}>
      <Ionicons 
        name={item.icon as any} 
        size={16} 
        color={COLORS.white} 
        style={styles.newsIcon}
      />
      <Text style={styles.newsText}>{item.content}</Text>
      {index < newsItems.length - 1 && (
        <View style={styles.separator}>
          <Ionicons name="ellipse" size={8} color={COLORS.white} />
        </View>
      )}
    </View>
  );

  if (!isVisible || newsItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.accent, '#B91C1C']}
        style={styles.tickerBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* Label BREAKING NEWS */}
        <View style={styles.labelContainer}>
          <LinearGradient
            colors={['#DC2626', '#991B1B']}
            style={styles.labelGradient}
          >
            <Ionicons name="flash" size={12} color={COLORS.white} />
            <Text style={styles.labelText}>DIRECT</Text>
          </LinearGradient>
        </View>

        {/* Ticker Content */}
        <View style={styles.tickerContainer}>
          <Animated.View
            style={[
              styles.tickerContent,
              {
                transform: [{ translateX: scrollX }]
              }
            ]}
          >
            {newsItems.map((item, index) => renderNewsItem(item, index))}
            {/* Dupliquer pour un défilement continu */}
            {newsItems.map((item, index) => renderNewsItem({
              ...item,
              id: `${item.id}-duplicate`
            }, index))}
          </Animated.View>
        </View>

        {/* Close Button */}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => setIsVisible(false)}
        >
          <Ionicons name="close" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  tickerBackground: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  labelContainer: {
    paddingLeft: 8,
  },
  labelGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  labelText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  tickerContainer: {
    flex: 1,
    overflow: 'hidden',
    marginLeft: 8,
  },
  tickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: width * 3, // Assurer un défilement fluide
  },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 24,
    minWidth: 300,
  },
  newsIcon: {
    marginRight: 8,
  },
  newsText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  separator: {
    marginLeft: 16,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
    marginRight: 4,
  },
});

export default BreakingNewsTicker;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Campaign {
  id: string;
  title: string;
  description: string;
  modalities: string[];
  budget: number;
  rating: number;
  total_ratings: number;
}

export default function Index() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'main'>('welcome');
  const [loading, setLoading] = useState(false);

  const onboardingSteps = [
    {
      title: 'Create Powerful Campaigns',
      subtitle: 'Design and launch publicity campaigns that reach your target audience effectively',
      icon: 'rocket-outline',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      title: 'Multi-Modal Content',
      subtitle: 'Choose from video, text, and audio content to create engaging campaigns',
      icon: 'play-circle-outline',
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      title: 'Track & Rate Content',
      subtitle: 'Follow your favorite campaigns and rate content to improve recommendations',
      icon: 'star-outline',
      gradient: ['#4facfe', '#00f2fe'],
    },
  ];

  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);

  useEffect(() => {
    if (currentStep === 'main') {
      fetchCampaigns();
    }
  }, [currentStep]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/campaigns`);
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Sample data for demo
      setCampaigns([
        {
          id: '1',
          title: 'Summer Fashion Campaign',
          description: 'Promote your summer fashion collection with stunning visuals',
          modalities: ['video', 'text', 'audio'],
          budget: 5000,
          rating: 4.5,
          total_ratings: 12,
        },
        {
          id: '2',
          title: 'Tech Product Launch',
          description: 'Launch your innovative tech product with comprehensive digital marketing',
          modalities: ['video', 'text'],
          budget: 8000,
          rating: 4.8,
          total_ratings: 8,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStep('main');
  };

  const nextOnboardingStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentOnboardingStep < onboardingSteps.length - 1) {
      setCurrentOnboardingStep(currentOnboardingStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const skipOnboarding = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleGetStarted();
  };

  const renderOnboardingScreen = () => {
    const step = onboardingSteps[currentOnboardingStep];
    
    return (
      <LinearGradient colors={step.gradient} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          {/* Skip Button */}
          <View style={styles.skipContainer}>
            <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.onboardingContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <BlurView intensity={20} style={styles.iconBlur}>
                <Ionicons name={step.icon as any} size={80} color="white" />
              </BlurView>
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text style={styles.onboardingTitle}>{step.title}</Text>
              <Text style={styles.onboardingSubtitle}>{step.subtitle}</Text>
            </View>

            {/* Progress Indicators */}
            <View style={styles.progressContainer}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentOnboardingStep && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={nextOnboardingStep}
              style={styles.nextButton}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {currentOnboardingStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  const renderMainApp = () => {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.headerTitle}>Publicity Campaigns</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/auth/login')}>
            <Ionicons name="person-circle-outline" size={32} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Featured Section */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Featured Campaigns</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredScroll}
            contentContainerStyle={styles.featuredScrollContent}
          >
            {campaigns.slice(0, 3).map((campaign, index) => (
              <TouchableOpacity
                key={campaign.id}
                style={[styles.featuredCard, index === 0 && styles.firstCard]}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.featuredCardGradient}
                >
                  <View style={styles.featuredCardContent}>
                    <View style={styles.featuredCardHeader}>
                      <Text style={styles.featuredCardTitle}>{campaign.title}</Text>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>{campaign.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.featuredCardDescription}>
                      {campaign.description}
                    </Text>
                    <View style={styles.modalityContainer}>
                      {campaign.modalities.map((modality) => (
                        <View key={modality} style={styles.modalityTag}>
                          <Text style={styles.modalityText}>{modality}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.budgetText}>Budget: ${campaign.budget}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.quickActionGradient}>
                <Ionicons name="add-circle-outline" size={32} color="white" />
                <Text style={styles.quickActionText}>New Campaign</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.quickActionGradient}>
                <Ionicons name="list-outline" size={32} color="white" />
                <Text style={styles.quickActionText}>My Orders</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <LinearGradient colors={['#43e97b', '#38f9d7']} style={styles.quickActionGradient}>
                <Ionicons name="analytics-outline" size={32} color="white" />
                <Text style={styles.quickActionText}>Analytics</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* All Campaigns */}
          <Text style={styles.sectionTitle}>All Campaigns</Text>
          {campaigns.map((campaign) => (
            <TouchableOpacity key={campaign.id} style={styles.campaignCard} activeOpacity={0.9}>
              <View style={styles.campaignCardContent}>
                <View style={styles.campaignCardLeft}>
                  <Text style={styles.campaignCardTitle}>{campaign.title}</Text>
                  <Text style={styles.campaignCardDescription}>{campaign.description}</Text>
                  <View style={styles.campaignCardFooter}>
                    <View style={styles.modalityContainer}>
                      {campaign.modalities.slice(0, 2).map((modality) => (
                        <View key={modality} style={styles.modalityTagSmall}>
                          <Text style={styles.modalityTextSmall}>{modality}</Text>
                        </View>
                      ))}
                      {campaign.modalities.length > 2 && (
                        <Text style={styles.moreModalities}>+{campaign.modalities.length - 2}</Text>
                      )}
                    </View>
                    <View style={styles.ratingContainerSmall}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingTextSmall}>{campaign.rating}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.campaignCardRight}>
                  <Text style={styles.budgetTextSmall}>${campaign.budget}</Text>
                  <TouchableOpacity style={styles.orderButton}>
                    <Text style={styles.orderButtonText}>Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  };

  return currentStep === 'welcome' ? renderOnboardingScreen() : renderMainApp();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  onboardingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconBlur: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  profileButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  featuredScroll: {
    paddingLeft: 24,
  },
  featuredScrollContent: {
    paddingRight: 24,
  },
  featuredCard: {
    width: width * 0.8,
    height: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  firstCard: {
    marginLeft: 0,
  },
  featuredCardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  featuredCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  featuredCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  featuredCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginVertical: 8,
  },
  modalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  modalityTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  modalityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  budgetText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  quickActionCard: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  campaignCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  campaignCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignCardLeft: {
    flex: 1,
    marginRight: 16,
  },
  campaignCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  campaignCardDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 8,
  },
  campaignCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalityTagSmall: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
  },
  modalityTextSmall: {
    color: '#495057',
    fontSize: 10,
    fontWeight: '500',
  },
  moreModalities: {
    fontSize: 10,
    color: '#6c757d',
    marginLeft: 4,
  },
  ratingContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingTextSmall: {
    color: '#495057',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  campaignCardRight: {
    alignItems: 'flex-end',
  },
  budgetTextSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  orderButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  orderButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
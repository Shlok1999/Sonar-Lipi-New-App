import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#4CAF50', '#2E7D32', '#A5D6A7']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Music size={80} color="#FFFFFF" strokeWidth={1.5} />
          </View>
        </View>
        
        <Text style={styles.appTitle}>सोनार लिपि</Text>
        <Text style={styles.appSubtitle}>Sonar Lipi</Text>
        
        <Text style={styles.description}>
          Create and preserve beautiful Indian classical compositions
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.featureText}>Created By Shlok Ranjan</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => router.push('/compositions')}
        >
          <Text style={styles.continueText}>Continue</Text>
          <ArrowRight size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -50,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
    marginBottom: 30,
    opacity: 0.9,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    opacity: 0.95,
  },
  features: {
    marginBottom: 50,
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.9,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  continueText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
});
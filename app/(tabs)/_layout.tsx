import { Tabs } from 'expo-router';
import { Music, Library, Plus } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';

export default function TabLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Make app fullscreen
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  }, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#4CAF50',  // Material Green
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
          marginBottom: 0,
        },
        tabBarActiveTintColor: '#2E7D32',  // Dark Green
        tabBarInactiveTintColor: '#A5D6A7',  // Light Green
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Music size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="compositions"
        options={{
          title: 'Library',
          tabBarIcon: ({ size, color }) => (
            <Library size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, CreditCard as Edit3, Trash2, Music } from 'lucide-react-native';
import { TAALS } from '@/constants/taals';

interface TaalType {
  id: string;
  name: string;
  structure: number[];
  numberOfColumns: number;
  description: string;
}

interface Composition {
  id: string;
  name: string;
  taal: string | TaalType;  // can be either string (ID) or TaalType object (legacy data)
  createdAt: string;
  grid: string[][];
}

export default function CompositionsScreen() {
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadCompositions();
    }, [])
  );

  const loadCompositions = async () => {
    try {
      const stored = await AsyncStorage.getItem('compositions');
      if (stored) {
        const parsedCompositions = JSON.parse(stored);
        // Convert any old format compositions where taal is an object to new format
        const convertedCompositions = parsedCompositions.map((comp: any) => ({
          ...comp,
          taal: typeof comp.taal === 'object' ? comp.taal.id : comp.taal
        }));
        setCompositions(convertedCompositions);
        
        // Save the converted format back if any conversions were made
        if (parsedCompositions.some((comp: any) => typeof comp.taal === 'object')) {
          await AsyncStorage.setItem('compositions', JSON.stringify(convertedCompositions));
        }
      }
    } catch (error) {
      console.error('Error loading compositions:', error);
    }
  };

  const deleteComposition = async (id: string) => {
    Alert.alert(
      'Delete Composition',
      'Are you sure you want to delete this composition?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedCompositions = compositions.filter(comp => comp.id !== id);
            setCompositions(updatedCompositions);
            await AsyncStorage.setItem('compositions', JSON.stringify(updatedCompositions));
          },
        },
      ]
    );
  };

  const renderComposition = ({ item }: { item: Composition }) => (
    <View style={styles.compositionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Music size={20} color="#FF6B35" strokeWidth={2} />
          <Text style={styles.compositionTitle}>{item.name}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/edit/${item.id}`)}
          >
            <Edit3 size={18} color="#F7931E" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteComposition(item.id)}
          >
            <Trash2 size={18} color="#FF4757" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.taalText}>
        Taal: {(typeof item.taal === 'string' ? 
          TAALS.find((t: TaalType) => t.id === item.taal)?.name : 
          typeof item.taal === 'object' ? item.taal.name : 
          'Unknown')}
      </Text>
      <Text style={styles.dateText}>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
      
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => router.push(`/edit/${item.id}`)}
      >
        <Text style={styles.openButtonText}>Open Composition</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Compositions</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create')}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {compositions.length === 0 ? (
        <View style={styles.emptyState}>
          <Music size={64} color="#E0E0E0" strokeWidth={1} />
          <Text style={styles.emptyTitle}>No Compositions Yet</Text>
          <Text style={styles.emptyText}>Create your first composition to get started</Text>
          <TouchableOpacity
            style={styles.emptyCreateButton}
            onPress={() => router.push('/create')}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.emptyCreateText}>Create Composition</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={compositions}
          renderItem={renderComposition}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  createButton: {
    backgroundColor: '#FF6B35',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  listContainer: {
    padding: 20,
  },
  compositionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compositionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginLeft: 8,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  taalText: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#B2BEC3',
    marginBottom: 12,
  },
  openButton: {
    backgroundColor: '#F7931E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  openButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#636E72',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#B2BEC3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyCreateText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Save, ChevronDown } from 'lucide-react-native';
import { TAALS } from '@/constants/taals';

export default function CreateCompositionScreen() {
  const [name, setName] = useState('');
  const [selectedTaal, setSelectedTaal] = useState(TAALS[0]);
  const [showTaalPicker, setShowTaalPicker] = useState(false);
  const router = useRouter();

  const createComposition = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter composition name');
      return;
    }

    try {
      const newComposition = {
        id: Date.now().toString(),
        name: name.trim(),
        taal: selectedTaal.id,
        createdAt: new Date().toISOString(),
        grid: Array(12).fill(null).map(() => Array(selectedTaal.numberOfColumns).fill('')),
      };

      const stored = await AsyncStorage.getItem('compositions');
      const compositions = stored ? JSON.parse(stored) : [];
      compositions.push(newComposition);
      
      await AsyncStorage.setItem('compositions', JSON.stringify(compositions));
      
      router.push(`/edit/${newComposition.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create composition');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#2D3436" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Composition</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Composition Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter composition name"
            placeholderTextColor="#B2BEC3"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Taal</Text>
          <TouchableOpacity
            style={styles.taalSelector}
            onPress={() => setShowTaalPicker(true)}
          >
            <View style={styles.taalSelectorContent}>
              <View>
                <Text style={styles.taalName}>{selectedTaal.name}</Text>
                <Text style={styles.taalDescription}>{selectedTaal.numberOfColumns} beats</Text>
              </View>
              <ChevronDown size={20} color="#636E72" strokeWidth={2} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={createComposition}
        >
          <Save size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.createButtonText}>Create Composition</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showTaalPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTaalPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Taal</Text>
              <TouchableOpacity
                onPress={() => setShowTaalPicker(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.taalList}>
              {TAALS.map((taal) => (
                <TouchableOpacity
                  key={taal.id}
                  style={[
                    styles.taalOption,
                    selectedTaal.id === taal.id && styles.selectedTaalOption
                  ]}
                  onPress={() => {
                    setSelectedTaal(taal);
                    setShowTaalPicker(false);
                  }}
                >
                  <View style={styles.taalOptionContent}>
                    <Text style={[
                      styles.taalOptionName,
                      selectedTaal.id === taal.id && styles.selectedTaalOptionText
                    ]}>
                      {taal.name}
                    </Text>
                    <Text style={[
                      styles.taalOptionDescription,
                      selectedTaal.id === taal.id && styles.selectedTaalOptionText
                    ]}>
                      {taal.numberOfColumns} beats • {taal.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#2D3436',
  },
  taalSelector: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  taalSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  taalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
  taalDescription: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  modalCloseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  taalList: {
    paddingHorizontal: 20,
  },
  taalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedTaalOption: {
    backgroundColor: '#FFF5F0',
  },
  taalOptionContent: {
    flex: 1,
  },
  taalOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  taalOptionDescription: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
  selectedTaalOptionText: {
    color: '#4CAF50',
  },
});
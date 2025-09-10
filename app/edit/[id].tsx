import React, { useState, useEffect, useRef } from 'react';
  const { id } = useLocalSearchParams();
  const [composition, setComposition] = useState<Composition | null>(null);
  const [grid, setGrid] = useState<string[][]>([]);
  const [taalInfo, setTaalInfo] = useState<any>(null);
  const [showRowActions, setShowRowActions] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showTaalPicker, setShowTaalPicker] = useState(false);
  const inputRefs = useRef<Array<Array<TextInput | null>>>([]);
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Modal,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ArrowLeft, Save, Download } from 'lucide-react-native';
import { TAALS } from '@/constants/taals';

interface TaalInfo {
  id: string;
  name: string;
  structure: number[];
  numberOfColumns: number;
  description: string;
}

interface Composition {
  id: string;
  name: string;
  taal: string;
  createdAt: string;
  grid: string[][];
}

export default function EditCompositionScreen() {
  const { id } = useLocalSearchParams();
  const [composition, setComposition] = useState<Composition | null>(null);
  const [grid, setGrid] = useState<string[][]>([]);
  const [taalInfo, setTaalInfo] = useState<TaalInfo | null>(null);
  const [showRowActions, setShowRowActions] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showTaalPicker, setShowTaalPicker] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadComposition();
  }, [id]);

  const loadComposition = async () => {
    try {
      const stored = await AsyncStorage.getItem('compositions');
      if (stored) {
        const compositions = JSON.parse(stored);
        const comp = compositions.find((c: Composition) => c.id === id);
        if (comp) {
          setComposition(comp);
          
          // Find the taal info from TAALS using the taal ID
          const taalInfo = TAALS.find(t => t.id === comp.taal) || TAALS[0];
          setTaalInfo(taalInfo);
          
          const columns = taalInfo.numberOfColumns;
          setGrid(comp.grid || Array(12).fill(null).map(() => Array(columns).fill('')));
        }
      }
    } catch (error) {
      console.error('Error loading composition:', error);
    }
  };

  const saveComposition = async () => {
    if (!composition) return;

    try {
      const stored = await AsyncStorage.getItem('compositions');
      const compositions = stored ? JSON.parse(stored) : [];
      
      const updatedComposition = { ...composition, grid };
      const index = compositions.findIndex((c: Composition) => c.id === id);
      
      if (index !== -1) {
        compositions[index] = updatedComposition;
        await AsyncStorage.setItem('compositions', JSON.stringify(compositions));
        Alert.alert('Success', 'Composition saved successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save composition');
    }
  };

  const exportToPDF = async () => {
    if (!composition) return;

    try {
      const htmlContent = generateHTMLContent();
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri, {
          UTI: 'com.adobe.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const generateHTMLContent = () => {
    if (!composition || !taalInfo) return '';

    const columns = taalInfo.numberOfColumns;
    let tableRows = '';

    // Calculate vibhag boundaries
    const vibhagBoundaries = new Set();
    let columnCount = 0;
    taalInfo.structure.forEach(count => {
      columnCount += count;
      vibhagBoundaries.add(columnCount);
    });
    
    // Header row
    tableRows += '<tr><th style="background-color: #f5f5f5; padding: 12px; border-bottom: 1px solid #ddd; border-right: 1px solid #000000; font-weight: bold;">#</th>';
    for (let i = 1; i <= columns; i++) {
      const isVibhagBoundary = vibhagBoundaries.has(i);
      tableRows += `<th style="
        background-color: #f5f5f5;
        padding: 12px;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
        ${isVibhagBoundary ? 'border-right: 1px solid #000000;' : ''}
      ">${i}</th>`;
    }
    tableRows += '</tr>';

    // Data rows
    for (let row = 0; row < 12; row++) {
      tableRows += `<tr><td style="
        background-color: #f9f9f9;
        padding: 12px;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
        text-align: center;
        border-right: 1px solid #000000;
      ">${row + 1}</td>`;
      for (let col = 0; col < columns; col++) {
        const cellValue = grid[row] && grid[row][col] ? grid[row][col] : '';
        const isVibhagBoundary = vibhagBoundaries.has(col + 1);
        tableRows += `<td style="
          padding: 12px;
          border-bottom: 1px solid #E0E0E0;
          min-height: 40px;
          width: 150px;
          border: none;
          ${isVibhagBoundary ? 'border-right: 1px solid #000000;' : ''}
          border-bottom: 1px solid #E0E0E0;
        ">${cellValue}</td>`;
      }
      tableRows += '</tr>';
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${composition.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .composition-title { font-size: 24px; font-weight: bold; color: #2D3436; margin-bottom: 10px; }
            .taal-info { font-size: 18px; color: #636E72; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              border: 1px solid #000000;
            }
            th, td { 
              border: none;
              border-bottom: 1px solid #ddd; 
              text-align: center; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="composition-title">${composition.name}</div>
            <div class="taal-info">Taal: ${taalInfo.name}</div>
          </div>
          <table>
            ${tableRows}
          </table>
        </body>
      </html>
    `;
  };

  const updateCell = (row: number, col: number, value: string) => {
    const columns = taalInfo ? taalInfo.numberOfColumns : 8;
    const newGrid = [...grid];
    if (!newGrid[row]) {
      newGrid[row] = Array(columns).fill('');
    }
    newGrid[row][col] = value;
    setGrid(newGrid);
  };

  const getBorderStyle = (colIndex: number) => {
    if (!taalInfo) return {};
    
    let cumulativeBeats = 0;
    for (let i = 0; i < taalInfo.structure.length; i++) {
      cumulativeBeats += taalInfo.structure[i];
      if (colIndex + 1 === cumulativeBeats && colIndex + 1 < taalInfo.numberOfColumns) {
        return {
          borderRightWidth: 1,
          borderRightColor: '#000000',
        };
      }
    }
    return {
      borderRightWidth: 0,
    };
  };

  const addRow = (position: 'above' | 'below') => {
    if (selectedRow === null || !taalInfo) return;
    
    const newGrid = [...grid];
    const newRow = Array(taalInfo.numberOfColumns).fill('');
    const insertIndex = position === 'above' ? selectedRow : selectedRow + 1;
    newGrid.splice(insertIndex, 0, newRow);
    setGrid(newGrid);
    setShowRowActions(false);
  };

  const deleteRow = () => {
    if (selectedRow === null) return;
    
    const newGrid = [...grid];
    newGrid.splice(selectedRow, 1);
    setGrid(newGrid);
    setShowRowActions(false);
  };

  const clearRow = () => {
    if (selectedRow === null || !taalInfo) return;
    
    const newGrid = [...grid];
    newGrid[selectedRow] = Array(taalInfo.numberOfColumns).fill('');
    setGrid(newGrid);
    setShowRowActions(false);
  };

  const changeTaal = (newTaal: TaalInfo) => {
    if (!composition) return;
    
    setTaalInfo(newTaal);
    
    // Resize the grid for the new taal
    const newGrid = grid.map(row => {
      const newRow = Array(newTaal.numberOfColumns).fill('');
      // Copy over existing values where possible
      row.forEach((cell, index) => {
        if (index < newTaal.numberOfColumns) {
          newRow[index] = cell;
        }
      });
      return newRow;
    });
    
    setGrid(newGrid);
    
    // Update composition
    const updatedComposition = {
      ...composition,
      taal: newTaal.id
    };
    setComposition(updatedComposition);
    setShowTaalPicker(false);
  };

  if (!composition) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{composition.name}</Text>
          <TouchableOpacity onPress={() => setShowTaalPicker(true)}>
            <Text style={styles.headerSubtitle}>
              Taal: {taalInfo?.name || composition.taal} (tap to change)
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={saveComposition}
          >
            <Save size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={exportToPDF}
          >
            <Download size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.gridMainContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          style={styles.gridScrollView}
          contentContainerStyle={styles.gridContentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.gridContainer}>
              <View style={styles.grid}>
                {/* Header Row */}
                <View style={styles.gridRow}>
                  <TouchableOpacity style={[styles.gridCell, styles.headerCell, styles.rowNumberCell]}>
                    <Text style={styles.headerText}>#</Text>
                  </TouchableOpacity>
                  {Array.from({ length: taalInfo ? taalInfo.numberOfColumns : 8 }, (_, i) => (
                    <View key={i} style={[styles.gridCell, styles.headerCell, getBorderStyle(i)]}>
                      <Text style={styles.headerText}>{i + 1}</Text>
                    </View>
                  ))}
                </View>

                {/* Data Rows */}
                {grid.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.gridRow}>
                    <TouchableOpacity 
                      style={[styles.gridCell, styles.rowNumberCell]}
                      onPress={() => {
                        setSelectedRow(rowIndex);
                        setShowRowActions(true);
                      }}
                    >
                      <Text style={styles.rowNumberText}>{rowIndex + 1}</Text>
                    </TouchableOpacity>
                    {Array.from({ length: taalInfo ? taalInfo.numberOfColumns : 8 }, (_, colIndex) => (
                      <View key={colIndex} style={[styles.gridCell, getBorderStyle(colIndex)]}>
                        <TextInput
                          ref={input => {
                            if (!inputRefs.current[rowIndex]) {
                              inputRefs.current[rowIndex] = [];
                            }
                            inputRefs.current[rowIndex][colIndex] = input;
                          }}
                          style={styles.cellInput}
                          value={row[colIndex] || ''}
                          onChangeText={(value) => updateCell(rowIndex, colIndex, value)}
                          multiline
                          numberOfLines={2}
                          textAlignVertical="center"
                          onKeyPress={({ nativeEvent: { key } }) => {
                            if (key === ' ') {
                              const totalColumns = taalInfo ? taalInfo.numberOfColumns : 8;
                              const nextCol = colIndex + 1;
                              const nextRow = rowIndex + (nextCol >= totalColumns ? 1 : 0);
                              const nextColWrapped = nextCol >= totalColumns ? 0 : nextCol;
                              
                              if (nextRow < grid.length && inputRefs.current[nextRow] && inputRefs.current[nextRow][nextColWrapped]) {
                                inputRefs.current[nextRow][nextColWrapped]?.focus();
                              }
                            }
                          }}
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Row Actions Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showRowActions}
        onRequestClose={() => setShowRowActions(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowRowActions(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => addRow('above')}
            >
              <Text style={styles.modalButtonText}>Add Row Above</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => addRow('below')}
            >
              <Text style={styles.modalButtonText}>Add Row Below</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={clearRow}
            >
              <Text style={styles.modalButtonText}>Clear Row</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={deleteRow}
            >
              <Text style={[styles.modalButtonText, styles.deleteButtonText]}>Delete Row</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Taal Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTaalPicker}
        onRequestClose={() => setShowTaalPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowTaalPicker(false)}
        >
          <View style={[styles.modalContent, styles.taalPickerContent]}>
            <Text style={styles.modalTitle}>Select Taal</Text>
            {TAALS.map((taal) => (
              <TouchableOpacity
                key={taal.id}
                style={styles.taalOption}
                onPress={() => changeTaal(taal)}
              >
                <View>
                  <Text style={styles.taalName}>{taal.name}</Text>
                  <Text style={styles.taalDescription}>{taal.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#4CAF50',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  gridMainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gridScrollView: {
    flex: 1,
  },
  gridContentContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  gridContainer: {
    padding: 16,
    minWidth: '100%',
    paddingBottom: 100,
  },
  grid: {
    borderRadius: 8,
    overflow: 'hidden',
    flexGrow: 0,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  gridCell: {
    minHeight: 45,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 2,
  },
  headerCell: {
    backgroundColor: '#F5F5F5',
    minHeight: 35,
    paddingHorizontal: 4,
  },
  rowNumberCell: {
    backgroundColor: '#F9F9F9',
    width: 35,
    minWidth: 35,
    maxWidth: 35,
    position: 'sticky',
    left: 0,
    zIndex: 1,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#2D3436',
    textAlign: 'center',
  },
  rowNumberText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#2D3436',
    textAlign: 'center',
  },
  cellInput: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 2,
    paddingVertical: 2,
    fontSize: 13,
    color: '#2D3436',
    textAlign: 'center',
    minHeight: 45,
    maxHeight: 45,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#2D3436',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  deleteButtonText: {
    color: '#FF4757',
  },
  taalPickerContent: {
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2D3436',
  },
  taalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  taalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  taalDescription: {
    fontSize: 14,
    color: '#636E72',
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

import { theme } from '../theme';
import { Button } from '../button.native';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../card.native';

export interface ModalPickerOption<T> {
  label: string;
  value: T;
}

interface ModalPickerProps<T> {
  label: string;
  options: ModalPickerOption<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
}

export function ModalPicker<T>({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option...'
}: ModalPickerProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = options.find(option => option.value === selectedValue)?.label || placeholder;

  const handleSelect = (value: T) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <>
      <View>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.pickerButtonText}>{selectedLabel}</Text>
          <ChevronDown size={20} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable onPress={() => setModalVisible(false)} style={styles.modalBackdrop}>
          <Pressable onPress={() => {}} style={styles.modalContainer}>
            <Card style={styles.card}>
              <CardHeader>
                <CardTitle style={styles.modalTitle}>{label}</CardTitle>
              </CardHeader>
              <CardContent style={styles.cardContent}>
                <FlatList
                  data={options}
                  keyExtractor={(item) => String(item.value)}
                  renderItem={({ item }) => {
                    const isSelected = selectedValue === item.value;
                    return (
                      <TouchableOpacity
                        style={styles.optionButton}
                        onPress={() => handleSelect(item.value)}
                      >
                        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                          {item.label}
                        </Text>
                        {isSelected && <Check size={20} color={theme.colors.primary} />}
                      </TouchableOpacity>
                    );
                  }}
                />
              </CardContent>
              <CardFooter style={styles.cardFooter}>
                 <Button 
                    onPress={() => setModalVisible(false)} 
                    style={{ flex: 1, borderRadius: theme.radius.md, marginVertical: theme.spacing.lg }}
                    textStyle={styles.closeButtonText}
                  >
                    Close
                </Button>
              </CardFooter>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.input,
    paddingHorizontal: theme.spacing.md,
    height: 50,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickerButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.foreground,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '70%',
  },
  card: {
    width: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardContent: {
    paddingHorizontal: 0, 
    paddingBottom: 0,
  },
  cardFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.primary,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.foreground,
  },
  selectedOptionText: {
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.primary,
  },
  closeButtonText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamilyBold,
  },
}); 
import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface FeedbackModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error';
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  title,
  message,
  onClose,
  type = 'success',
}) => {
  const titleColor = type === 'success' ? '#4F46E5' : '#DC2626'; // primary and danger colors

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={[styles.modalTitle, { color: titleColor }]}>
            {title}
          </Text>
          <Text style={styles.modalText}>{message}</Text>
          <Button
            mode="contained"
            onPress={onClose}
            style={{ marginTop: 15, width: '100%' }}
            buttonColor="#4F46E5" // primary color
          >
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12, // lg
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20, // lg
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16, // md
  },
}); 
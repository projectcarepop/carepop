import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../components';
import { Card, Button } from '../components';
import { MaterialIcons } from '@expo/vector-icons';

// Placeholder data
const dummyPaymentMethods = [
  { id: 'pm1', type: 'Visa', last4: '1234', expiry: '12/25' },
  { id: 'pm2', type: 'Mastercard', last4: '5678', expiry: '06/26' },
];

type PaymentMethod = typeof dummyPaymentMethods[0];

export function PaymentMethodsScreen({ navigation }: any) {
  const [methods, setMethods] = useState(dummyPaymentMethods);

  const handleAddMethod = () => {
    // TODO: Navigate to an AddPaymentMethodScreen
    Alert.alert('Add Method', 'Navigation to Add Payment Method screen needed.');
  };

  const handleRemoveMethod = (id: string) => {
    // TODO: Add confirmation and API call
    Alert.alert('Remove Method', `Confirm removal of method ending in ${methods.find(m => m.id === id)?.last4}? (Placeholder)`);
    // setMethods(currentMethods => currentMethods.filter(method => method.id !== id));
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <View style={styles.methodItemContainer}>
      <MaterialIcons name="credit-card" size={24} color={theme.colors.primary} />
      <View style={styles.methodTextContainer}>
        <Text style={styles.methodType}>{item.type} ending in {item.last4}</Text>
        <Text style={styles.methodExpiry}>Expires: {item.expiry}</Text>
      </View>
      <Button 
        title="Remove" 
        onPress={() => handleRemoveMethod(item.id)}
        variant="destructive"
        size="sm"
        styleType='outline'
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Payment Methods</Text>

        <FlatList
          data={methods}
          renderItem={renderPaymentMethod}
          keyExtractor={item => item.id}
          style={styles.list}
          ListHeaderComponent={() => (
            <Text style={styles.subTitle}>Your saved payment methods</Text>
          )}
          ListEmptyComponent={<Text style={styles.placeholderText}>No payment methods saved.</Text>}
        />

        <Button 
            title="Add New Payment Method" 
            onPress={handleAddMethod} 
            style={styles.addButton}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
  },
   subTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: '600',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  list: {
      flex: 1,
      marginBottom: theme.spacing.md,
  },
  methodItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background, // Use background color
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  methodTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  methodType: {
    fontSize: theme.typography.body,
    fontWeight: '500',
    color: theme.colors.text,
  },
  methodExpiry: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    padding: theme.spacing.md,
  },
  addButton: {
    margin: theme.spacing.md,
  }
}); 
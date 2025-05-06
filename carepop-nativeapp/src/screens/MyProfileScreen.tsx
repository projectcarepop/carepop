import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { theme } from '@repo/ui/src/theme';
import { Card, Button } from '@repo/ui';
import { MaterialIcons } from '@expo/vector-icons';

// Rename the component function
export function MyProfileScreen() {
  // Placeholder data for user info
  const [userInfo, setUserInfo] = useState({
    dob: '1990-01-15',
    gender: 'Female',
    height: '175 cm',
    weight: '70 kg',
    bloodType: 'O+',
    allergies: ['Pollen', 'Peanuts', 'Dust Mites'],
    medications: ['Lisinopril 10mg', 'Metformin 500mg'],
  });

  const navigateTo = (screenName: string) => {
    console.log(`Navigate to ${screenName}`);
  };

  // Helper function to calculate age
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Profile Picture Section */}
        <View style={styles.dpContainer}>
            <Image
                source={{ uri: 'https://via.placeholder.com/100' }}
                style={styles.dpImage}
            />
        </View>

        <Card style={styles.card}>
          {/* Basic Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{calculateAge(userInfo.dob)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>{userInfo.gender}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth:</Text>
              <Text style={styles.infoValue}>{userInfo.dob}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height:</Text>
              <Text style={styles.infoValue}>{userInfo.height}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight:</Text>
              <Text style={styles.infoValue}>{userInfo.weight}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Blood Type:</Text>
              <Text style={styles.infoValue}>{userInfo.bloodType}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Allergies Section */}
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            {userInfo.allergies.length > 0 ? (
              userInfo.allergies.map((allergy, index) => (
                <Text key={index} style={styles.listItem}>- {allergy}</Text>
              ))
            ) : (
              <Text style={styles.placeholderText}>No allergies listed.</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Medications Section */}
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Current Medications</Text>
            {userInfo.medications.length > 0 ? (
              userInfo.medications.map((med, index) => (
                <Text key={index} style={styles.listItem}>- {med}</Text>
              ))
            ) : (
              <Text style={styles.placeholderText}>No current medications listed.</Text>
            )}
          </View>

        </Card>

        {/* Update Profile Button */}
        <Button
          title="Update Profile"
          onPress={() => navigateTo('UpdateProfile')}
          style={styles.updateButton}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  menuText: {
    flex: 1,
    marginLeft: theme.spacing.md,
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  // New styles for info section
  infoSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
  },
  infoValue: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  // Styles for DP
  dpContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dpImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  // Styles for list sections (Allergies, Meds)
  listSection: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
  },
  listItem: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  // Style for the update button
  updateButton: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing.sm,
  }
}); 
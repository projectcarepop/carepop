import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { theme, Button } from '../components';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// Import our new service function and types
import { getMyMedicalRecords } from '../services/api';
import type { MedicalRecord } from '../lib/types';

type MyRecordsNavigationProp = DrawerScreenProps<DrawerParamList, 'Records'>['navigation'];

export function MyRecordsScreen() {
  const navigation = useNavigation<MyRecordsNavigationProp>();
  const insets = useSafeAreaInsets();
  const { session } = useAuth(); // Use session to control the query

  const { 
    data: medicalRecords, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<MedicalRecord[], Error>({
    queryKey: ['myMedicalRecords'],
    queryFn: getMyMedicalRecords, // Use the new service function directly
    enabled: !!session, // Only run the query if the user is logged in
  });

  // Animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
      flex: 1,
    };
  });

  const handleViewRecord = async (recordId: string) => {
    Alert.alert('Feature In Development', 'Securely viewing documents is coming soon!');
    // try {
    //   const res = await apiClient.api.me.medicalRecords[':id']['signed-url'].$get({ 
    //       param: { id: recordId } 
    //   });
    //   if (!res.ok) throw new Error('Could not get viewable link.');
    //   const { signedUrl } = await res.json();
    //   await Linking.openURL(signedUrl);
    // } catch (err) {
    //   Alert.alert('Error', 'Could not open the record. Please try again.');
    // }
  };

  const renderRecordItem = ({ item }: { item: MedicalRecord }) => (
    <View style={styles.recordItemContainer}>
      <View style={styles.recordInfo}>
        <Text style={styles.recordType}>{item.recordType.replace(/_/g, ' ')}</Text>
        <Text style={styles.recordDescription} numberOfLines={2}>
          {typeof item.details === 'string' ? item.details : JSON.stringify(item.details)}
        </Text>
      </View>
      <View style={styles.recordMeta}>
        <Text style={styles.recordDate}>
          {format(new Date(item.createdAt), 'MMM d, yyyy')}
        </Text>
        <Button
          title="View"
          onPress={() => handleViewRecord(item.id)}
          variant="outline"
          size="sm"
        />
      </View>
    </View>
  );

  const ListContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.centered} />;
    }

    if (isError) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to fetch records.</Text>
           <Button title="Retry" onPress={() => refetch()} style={{marginTop: 20}} />
        </View>
      );
    }

    if (!medicalRecords || medicalRecords.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>You have no medical records.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={medicalRecords}
        renderItem={renderRecordItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
      />
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        menuButton: {
          position: 'absolute',
          top: insets.top + theme.spacing.sm,
          left: insets.left + theme.spacing.xl,
          zIndex: 10,
          backgroundColor: theme.colors.background,
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        container: {
          flex: 1,
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: insets.bottom,
        },
        title: {
          ...theme.typography.h1,
          fontFamily: theme.typography.fontFamilyBold,
          paddingTop: insets.top + 60,
          paddingBottom: theme.spacing.md,
        },
        centered: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.xl,
        },
        errorText: {
          ...theme.typography.h3,
          fontFamily: theme.typography.fontFamilySemiBold,
          textAlign: 'center',
          color: theme.colors.destructive,
        },
        emptyText: {
          ...theme.typography.h3,
          fontFamily: theme.typography.fontFamilySemiBold,
          textAlign: 'center',
          color: theme.colors.mutedForeground,
        },
        listContentContainer: {
          paddingBottom: 20,
        },
        recordItemContainer: {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        recordInfo: {
          flex: 1,
          marginRight: theme.spacing.lg,
        },
        recordType: {
          ...theme.typography.h4,
          fontFamily: theme.typography.fontFamilySemiBold,
          color: theme.colors.foreground,
          marginBottom: theme.spacing.xs,
        },
        recordDate: {
          ...theme.typography.small,
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.mutedForeground,
          marginBottom: theme.spacing.md,
          textAlign: 'right',
        },
        recordDescription: {
          ...theme.typography.body,
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.mutedForeground,
        },
        recordMeta: {
          alignItems: 'flex-end',
        },
      }),
    [insets]
  );

  return (
    <View style={styles.safeArea}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color={theme.colors.foreground} />
      </TouchableOpacity>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={styles.title}>My Records</Text>
        <ListContent />
      </Animated.View>
    </View>
  );
}
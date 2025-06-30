import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { format } from 'date-fns';
import { theme, Button } from '../components';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../navigation/AppDrawerNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getMyMedicalRecords } from '../services/api';
import type { MedicalRecordWithRelations } from '../lib/types';
import { supabase } from '../utils/supabase';
import { FileText, AlertCircle } from 'lucide-react-native';

type MyRecordsNavigationProp = DrawerScreenProps<DrawerParamList, 'Records'>['navigation'];

export function MyRecordsScreen() {
  const navigation = useNavigation<MyRecordsNavigationProp>();
  const insets = useSafeAreaInsets();
  const { authStatus } = useAuth();

  const { 
    data: medicalRecords, 
    isLoading, 
    isError, 
    error,
    refetch,
    isRefetching
  } = useQuery<MedicalRecordWithRelations[], Error>({
    queryKey: ['myMedicalRecords', authStatus],
    queryFn: () => getMyMedicalRecords(supabase),
    enabled: authStatus === 'authenticated',
  });

  const groupedRecords = useMemo(() => {
    if (!medicalRecords) return [];

    const groups: { [key: string]: MedicalRecordWithRelations[] } = medicalRecords.reduce((acc, record) => {
      const appointment = record.appointments;
      const title = appointment 
        ? `${format(new Date(appointment.appointmentTime), 'MMMM dd, yyyy')} - ${appointment.service.name}`
        : 'General Records';
      
      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(record);
      return acc;
    }, {} as { [key: string]: MedicalRecordWithRelations[] });

    return Object.keys(groups).map(title => ({
      title,
      data: groups[title].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    }));
  }, [medicalRecords]);

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

  const renderRecordItem = ({ item }: { item: MedicalRecordWithRelations }) => (
    <View style={styles.recordItemContainer}>
      <View style={styles.recordInfo}>
        <Text style={styles.recordType} numberOfLines={1}>
          {item.recordType ? item.recordType.replace(/_/g, ' ') : 'Record'}
        </Text>
        <Text style={styles.recordDate}>
          Created: {format(new Date(item.createdAt), 'p')}
        </Text>
      </View>
      <Button
        title="View"
        onPress={() => handleViewRecord(item.id)}
        variant="outline"
        size="sm"
      />
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const ListEmptyComponent = () => (
    <View style={styles.centered}>
      <FileText size={48} color={theme.colors.mutedForeground} />
      <Text style={styles.emptyText}>You have no medical records.</Text>
      <Text style={styles.emptySubText}>Records from your appointments will appear here.</Text>
    </View>
  );

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
          color: theme.colors.foreground,
        },
        emptySubText: {
          fontSize: 14,
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.mutedForeground,
          textAlign: 'center',
          marginTop: theme.spacing.sm,
        },
        errorSubText: {
          fontSize: 14,
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.mutedForeground,
          textAlign: 'center',
          marginTop: theme.spacing.sm,
        },
        listContentContainer: {
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.lg,
          flexGrow: 1,
        },
        sectionHeader: {
          fontSize: 16,
          fontFamily: theme.typography.fontFamilyBold,
          color: theme.colors.foreground,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.sm,
          backgroundColor: theme.colors.background,
          marginTop: theme.spacing.md,
        },
        recordItemContainer: {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
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
          fontSize: 16,
          fontFamily: theme.typography.fontFamilySemiBold,
          color: theme.colors.cardForeground,
          textTransform: 'capitalize',
        },
        recordDate: {
          fontSize: 12,
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.mutedForeground,
          marginTop: 4,
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
        <SectionList
          sections={groupedRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderRecordItem}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl 
              refreshing={isRefetching} 
              onRefresh={refetch}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      </Animated.View>
    </View>
  );
}
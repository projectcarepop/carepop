import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
// Removed: getMyRecords, getRecordSignedUrl as they are not defined. This will use dummy data.
import { format } from 'date-fns';
import { theme, Button } from '../components';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type MyRecordsNavigationProp = DrawerScreenProps<DrawerParamList, 'MyRecords'>['navigation'];

// Dummy data to allow the component to render without a real API
type MedicalRecord = {
  id: string;
  record_type: string;
  description: string;
  created_at: string;
};

export function MyRecordsScreen() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<MyRecordsNavigationProp>();
  const insets = useSafeAreaInsets();

  // Animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });

    const fetchRecords = async () => {
      try {
        setLoading(true);
        // Using dummy data
        const fetchedRecords: MedicalRecord[] = [
          {id: '1', record_type: 'Lab Result', description: 'Annual Checkup', created_at: new Date().toISOString()},
          {id: '2', record_type: 'Prescription', description: 'Allergy Medication', created_at: new Date().toISOString()},
        ];
        setRecords(fetchedRecords);
        setError(null);
      } catch (e) {
        setError('Failed to fetch medical records. Please try again later.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
      flex: 1,
    };
  });

  const handleViewRecord = async (recordId: string) => {
    Alert.alert('View Record', `This would open record with ID: ${recordId}`);
    // try {
    //     const { signedUrl } = await getRecordSignedUrl(recordId);
    //     await Linking.openURL(signedUrl);
    // } catch (err) {
    //     Alert.alert('Error', 'Could not open the record. Please try again.');
    // }
  };

  const renderRecordItem = ({ item }: { item: MedicalRecord }) => (
    <View style={styles.recordItemContainer}>
      <View style={styles.recordInfo}>
        <Text style={styles.recordType}>{item.record_type}</Text>
        <Text style={styles.recordDescription} numberOfLines={1}>
          {item.description || 'No description'}
        </Text>
      </View>
      <View style={styles.recordMeta}>
        <Text style={styles.recordDate}>
          {format(new Date(item.created_at), 'MMM d, yyyy')}
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
    if (loading) {
      return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.centered} />;
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (records.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>You have no medical records.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={records}
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
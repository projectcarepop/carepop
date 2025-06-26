import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPublicSlots, createAppointment } from '../src/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, CheckCircle } from 'lucide-react-native';
import { theme, Button } from '../src/components';
import { BookingStackParamList } from '../src/navigation/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';

type SelectDateTimeScreenRouteProp = RouteProp<BookingStackParamList, 'SelectDateTime'>;
type SelectDateTimeNavigationProp = NativeStackNavigationProp<BookingStackParamList>;

export const SelectDateTimeScreen: React.FC = () => {
  const route = useRoute<SelectDateTimeScreenRouteProp>();
  const navigation = useNavigation<SelectDateTimeNavigationProp>();
  const queryClient = useQueryClient();
  const { clinicId, serviceId } = route.params;

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const {
    data: availability,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['publicSlots', { clinicId, serviceId }],
    queryFn: () => getPublicSlots({ clinicId, serviceId }),
    enabled: !!clinicId && !!serviceId,
  });

  const { mutate: bookAppointment, isPending: isBooking } = useMutation({
    mutationFn: createAppointment,
    onSuccess: (data) => {
      Alert.alert(
        'Booking Confirmed!',
        `Your appointment is scheduled for ${format(new Date(data.appointmentTime), 'MMM d, yyyy, h:mm a')}.`,
        [{ text: 'OK', onPress: () => navigation.popToTop() }],
      );
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
    },
    onError: (error) => {
      Alert.alert('Booking Failed', error.message || 'An unexpected error occurred.');
    },
  });

  const handleBookAppointment = () => {
    if (selectedSlot) {
      bookAppointment({
        clinicId,
        serviceId,
        appointmentTime: selectedSlot,
      });
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Finding available slots...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load available times. Please try again later.</Text>
        </View>
      );
    }
    
    const allSlots = availability?.flatMap(doc => doc.slots) ?? [];

    if (!allSlots.length) {
         return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>No available appointments found.</Text>
                <Text style={styles.errorSubtitle}>Please try another service or check back later.</Text>
            </View>
        );
    }

    // Group slots by date
    const slotsByDate = allSlots.reduce((acc, slot) => {
        const date = format(new Date(slot), 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(slot);
        return acc;
    }, {} as Record<string, string[]>);


    return (
       <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(slotsByDate).map(([date, slots]) => (
                <View key={date} style={styles.dateSection}>
                    <View style={styles.dateHeader}>
                        <Calendar color={theme.colors.primary} size={20}/>
                        <Text style={styles.dateHeaderText}>{format(new Date(date), 'eeee, MMMM d')}</Text>
                    </View>
                    <View style={styles.slotsGrid}>
                        {slots.map((slot) => {
                            const isSelected = selectedSlot === slot;
                            return (
                                <TouchableOpacity
                                    key={slot}
                                    style={[styles.slotChip, isSelected && styles.selectedSlotChip]}
                                    onPress={() => setSelectedSlot(slot)}
                                >
                                    <Clock size={16} color={isSelected ? theme.colors.primary : theme.colors.foreground}/>
                                    <Text style={[styles.slotText, isSelected && styles.selectedSlotText]}>
                                        {format(new Date(slot), 'h:mm a')}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            ))}
       </ScrollView>
    );
  };


  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Date & Time</Text>
        </View>
        <View style={styles.stepIndicator}>
            <View style={[styles.step]}>
                <CheckCircle color={theme.colors.primary} size={16} />
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.step]}>
                <CheckCircle color={theme.colors.primary} size={16} />
            </View>
             <View style={styles.stepLine} />
            <View style={[styles.step, styles.activeStep]}>
                <Text style={styles.stepText}>3</Text>
            </View>
        </View>
      <View style={styles.contentContainer}>{renderContent()}</View>
      <View style={styles.footer}>
        <Button
          title="Confirm Booking"
          onPress={handleBookAppointment}
          disabled={!selectedSlot || isBooking}
          isLoading={isBooking}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { flex: 1, paddingHorizontal: theme.spacing.md, },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  loadingText: {
    marginTop: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
  errorText: {
    ...theme.typography.h3,
    color: theme.colors.destructive,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamilySemiBold,
  },
   errorSubtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  header: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
  },
  headerTitle: { 
      ...theme.typography.h1,
      fontFamily: theme.typography.fontFamilyBold,
  },
  stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
  },
  step: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.muted,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
  },
  activeStep: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
  },
  stepText: {
      ...theme.typography.body,
      fontFamily: theme.typography.fontFamilySemiBold,
      color: theme.colors.primaryForeground,
  },
  stepLine: {
      flex: 1,
      height: 2,
      backgroundColor: theme.colors.border,
  },
  dateSection: {
      marginBottom: theme.spacing.xl,
  },
  dateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
  },
  dateHeaderText: {
      ...theme.typography.h3,
      fontFamily: theme.typography.fontFamilySemiBold,
      marginLeft: theme.spacing.sm
  },
  slotsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm
  },
  slotChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
  },
  selectedSlotChip: {
      backgroundColor: theme.colors.muted,
      borderColor: theme.colors.primary,
  },
  slotText: {
      ...theme.typography.body,
      fontFamily: theme.typography.fontFamilyMedium,
      marginLeft: theme.spacing.xs,
      color: theme.colors.foreground,
  },
  selectedSlotText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamilySemiBold,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
}); 
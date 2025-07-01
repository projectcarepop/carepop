import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';

import { theme } from '../components/theme';
import { useAuth } from '../context/AuthContext';
import type { DrawerParamList } from '../navigation/AppDrawerNavigator';
import { getMyAppointments, getMyProfile, getAiInsight, getPublicClinics } from '../services/api';
import type { AIInsight, Clinic } from '../lib/types';
import AiInsightModal from '../components/health-buddy/AiInsightModal';
import { Button } from '../components/button.native';
import { parseISOString } from '../lib/utils/date';

import {
  ChevronRight,
  Calendar,
  ClipboardList,
  HeartPulse,
  Map,
  Menu,
  Stethoscope,
  User,
  Sparkles,
  MapPin,
} from 'lucide-react-native';

type DashboardNavigationProp = DrawerNavigationProp<DrawerParamList>;

const ActionCard = ({
  icon: Icon,
  title,
  onPress,
}: {
  icon: React.ElementType;
  title: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <View style={styles.actionCardContent}>
      <Icon size={24} color={theme.colors.primary} />
      <Text style={styles.actionCardTitle}>{title}</Text>
    </View>
    <ChevronRight size={24} color={theme.colors.mutedForeground} />
  </TouchableOpacity>
);

const RecordCard = ({
    icon: Icon,
    title,
    description,
    onPress,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    onPress: () => void;
}) => (
    <TouchableOpacity style={styles.recordCard} onPress={onPress}>
        <Icon size={24} color={theme.colors.primary} />
        <View style={styles.recordCardTextContainer}>
            <Text style={styles.recordCardTitle}>{title}</Text>
            <Text style={styles.recordCardDescription}>{description}</Text>
        </View>
    </TouchableOpacity>
);

const ClinicCard = ({ clinic, onPress }: { clinic: Clinic, onPress: () => void }) => (
    <TouchableOpacity style={styles.clinicCard} onPress={onPress}>
        <Map size={24} color={theme.colors.secondary} />
        <View style={styles.clinicCardTextContainer}>
            <Text style={styles.clinicCardTitle} numberOfLines={1}>{clinic.name}</Text>
            <Text style={styles.clinicCardAddress} numberOfLines={1}>{clinic.address?.street}, {clinic.address?.city}</Text>
        </View>
    </TouchableOpacity>
);

export const DashboardScreen = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const [isInsightModalVisible, setIsInsightModalVisible] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: getMyProfile,
  });

  const {
    data: appointments,
    isLoading: isLoadingAppointments,
  } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: () => getMyAppointments(),
  });

  const { data: clinics, isLoading: isLoadingClinics } = useQuery<Clinic[]>({
      queryKey: ['publicClinics'],
      queryFn: () => getPublicClinics(),
  });

  const {
    mutate: fetchAiInsight,
    data: aiInsight,
    isPending: isFetchingInsight,
  } = useMutation<AIInsight>({
    mutationFn: getAiInsight,
    onSuccess: () => setIsInsightModalVisible(true),
    onError: () => {
      // For demo purposes, show mock insight on error
      setIsInsightModalVisible(true);
    },
  });

  const nextAppointment = appointments?.[0];

  const renderAppointmentCard = () => {
    if (isLoadingAppointments) {
      return (
        <View style={styles.mainCard}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      );
    }

    if (!nextAppointment) {
      return (
        <View style={styles.mainCard}>
          <Text style={styles.mainCardTitle}>No Upcoming Appointments</Text>
          <Text style={styles.mainCardSubtitle}>You&apos;re all clear! Book a new one anytime.</Text>
          <Button 
            title="Book a new appointment" 
            onPress={() => navigation.navigate('Booking')}
            style={{marginTop: theme.spacing.lg}}
          />
        </View>
      );
    }

    const appointmentDate = parseISOString(nextAppointment.appointmentTime);

    if (!appointmentDate) {
        return (
            <View style={styles.mainCard}>
                <Text style={styles.mainCardTitle}>Next Appointment</Text>
                <Text style={styles.mainCardSubtitle}>Could not display appointment time.</Text>
            </View>
        );
    }

    return (
      <View style={styles.mainCard}>
        <Text style={styles.mainCardTitle}>{nextAppointment.service.name}</Text>
        <Text style={styles.mainCardSubtitle}>
          {appointmentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })} at {appointmentDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <View style={styles.mainCardLocationContainer}>
            <MapPin size={14} color={theme.colors.secondary} />
            <Text style={styles.mainCardLocation}>
                {nextAppointment.clinic.name}
            </Text>
        </View>
        <Button 
            title="View Details" 
            onPress={() => navigation.navigate('Appointments')}
            variant='default'
            style={{marginTop: theme.spacing.lg, borderRadius: theme.radius.md}}
        />
      </View>
    );
  };

  const renderClinics = () => (
      <View style={styles.clinicsSection}>
          <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Clinics</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Clinic Finder')}>
                  <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
          </View>
          {isLoadingClinics ? (
              <ActivityIndicator color={theme.colors.primary} />
          ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {clinics?.slice(0, 4).map(clinic => (
                      <ClinicCard 
                        key={clinic.id} 
                        clinic={clinic} 
                        onPress={() => navigation.navigate('Booking', { clinicId: clinic.id })}
                      />
                  ))}
              </ScrollView>
          )}
      </View>
  );

  const mockAiInsight: AIInsight = {
    insight: "We've noticed a pattern of headaches and fatigue. Consider discussing this with your provider. Remember to stay hydrated and get plenty of rest!"
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.displayNameText}>
              {profile?.firstName || 'there'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.menuButton}>
            <Menu size={28} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>
        
        <View>
            <Text style={styles.sectionTitle}>Your Upcoming Appointment</Text>
            {renderAppointmentCard()}
        </View>

        {renderClinics()}

        <View style={{marginTop: theme.spacing.md}}>
            <Text style={styles.sectionTitle}>Access our Health Buddy</Text>
            <TouchableOpacity style={styles.insightCard} onPress={() => fetchAiInsight()}>
              <View style={styles.actionCardContent}>
                <Sparkles size={24} color={theme.colors.accentForeground} />
                <View>
                    <Text style={styles.insightCardTitle}>
                    {isFetchingInsight ? 'Generating...' : 'Weekly Health Insight'}
                    </Text>
                    <Text style={styles.insightCardSubtitle}>Let AI summarize your week</Text>
                </View>
              </View>
            </TouchableOpacity>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Access your records</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <RecordCard
                icon={ClipboardList}
                title="My Medical Records"
                description="View your health history."
                onPress={() => navigation.navigate('Records')}
            />
            <RecordCard
                icon={Calendar}
                title="My Appointments"
                description="Check your upcoming visits."
                onPress={() => navigation.navigate('Appointments')}
            />
            <RecordCard
                icon={User}
                title="My Profile"
                description="Update your information."
                onPress={() => navigation.navigate('Profile')}
            />
          </ScrollView>
        </View>
      </ScrollView>

      {isInsightModalVisible && (
        <AiInsightModal
          visible={isInsightModalVisible}
          insight={aiInsight?.insight || mockAiInsight.insight}
          onClose={() => setIsInsightModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  greetingText: {
    ...theme.typography.h3,
    fontSize: 28,
    color: theme.colors.secondary,
  },
  displayNameText: {
    ...theme.typography.h1,
    fontSize: 36,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamilyBold,
  },
  menuButton: {
    padding: theme.spacing.sm,
    color: theme.colors.secondary,
  },
  mainCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 0.5,
    borderColor: theme.colors.muted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xs,
  },
  mainCardTitle: {
    ...theme.typography.h4,
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilySemiBold,
  },
  mainCardSubtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  mainCardLocationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.md,
  },
  mainCardLocation: {
      ...theme.typography.small,
      color: theme.colors.secondary,
      opacity: 0.8,
      fontFamily: theme.typography.fontFamilyMedium
  },
  insightCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  insightCardTitle: {
    ...theme.typography.h3,
    color: theme.colors.accentForeground,
    fontFamily: theme.typography.fontFamilySemiBold,
  },
  insightCardSubtitle: {
      ...theme.typography.body,
      color: theme.colors.accentForeground,
      opacity: 0.9,
  },
  actionsSection: {
    marginTop: theme.spacing.lg,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
  },
  sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.secondary,
      marginBottom: theme.spacing.md,
      fontFamily: theme.typography.fontFamilySemiBold,
  },
  sectionSubtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.lg,
  },
  viewAllText: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamilySemiBold,
  },
  clinicsSection: {
      marginTop: theme.spacing.xl,
  },
  clinicCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      width: 250,
      marginRight: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
  },
  clinicCardTextContainer: {
      flex: 1,
  },
  clinicCardTitle: {
      ...theme.typography.h4,
      fontFamily: theme.typography.fontFamilySemiBold,
      color: theme.colors.foreground,
  },
  clinicCardAddress: {
      ...theme.typography.small,
      color: theme.colors.mutedForeground,
      marginTop: theme.spacing.xs,
  },
  actionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  actionCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
  },
  actionCardTitle: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
  },
  recordCardsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
  },
  recordCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      width: 200,
      marginRight: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
  },
  recordCardTextContainer: {
      flex: 1,
  },
  recordCardTitle: {
      ...theme.typography.h4,
      fontFamily: theme.typography.fontFamilySemiBold,
      color: theme.colors.foreground,
  },
  recordCardDescription: {
      ...theme.typography.small,
      color: theme.colors.mutedForeground,
      marginTop: theme.spacing.xs,
  },
});


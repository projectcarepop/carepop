import { useQuery } from '@tanstack/react-query';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar,
  FileText,
  HeartPulse,
  Pill,
  Stethoscope,
  User,
} from 'lucide-react-native';
import { format, isValid, parse } from 'date-fns';
import React from 'react';

import { Button } from '../components/button.native';
import { theme } from '../components/theme';
import { DetailedMedicalRecord } from '../lib/types';
import { getMedicalRecordDetails } from '../services/api';
import { RecordsStackParamList } from '../navigation/AppDrawerNavigator';
import { Card } from '../components/card.native';

type RecordDetailScreenRouteProp = RouteProp<RecordsStackParamList, 'RecordDetail'>;

const DetailRow = ({ icon: Icon, label, value }: any) => (
  <View style={styles.detailRow}>
    <Icon size={16} color={theme.colors.secondary} style={styles.icon} />
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const Section = ({ title, children }: any) => (
  <Card style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </Card>
);

const renderRecordDetails = (record: DetailedMedicalRecord) => {
  const { details, recordType } = record;
  if (!details) return <Text style={styles.value}>No additional details provided.</Text>;

  switch (recordType) {
    case 'DOCTOR_NOTE':
      return (
        <Text style={styles.value}>{details.note || 'No note content available.'}</Text>
      );
    case 'PRESCRIPTION':
      return (
        <>
          <DetailRow icon={Pill} label="Medication" value={details.medicationName || 'N/A'} />
          <DetailRow icon={Pill} label="Dosage" value={details.dosage || 'N/A'} />
          <DetailRow icon={Pill} label="Frequency" value={details.frequency || 'N/A'} />
          <DetailRow icon={FileText} label="Instructions" value={details.instructions || 'N/A'} />
        </>
      );
    case 'CLINICAL_DOCUMENT':
      return (
        <DetailRow icon={FileText} label="Document Name" value={details.documentName || 'N/A'} />
      );
    default:
      return <Text style={styles.value}>This record type has no specific details view.</Text>;
  }
};

export const RecordDetailScreen = () => {
  const route = useRoute<RecordDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { recordId } = route.params;

  const { data, isLoading, isError, error, refetch } = useQuery<DetailedMedicalRecord, Error>({
    queryKey: ['medicalRecordDetails', recordId],
    queryFn: () => getMedicalRecordDetails(recordId),
    enabled: !!recordId,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <AlertCircle size={48} color={theme.colors.destructive} />
        <Text style={styles.errorText}>Failed to load record details.</Text>
        <Text style={styles.errorSubText}>{error?.message}</Text>
        <Button onPress={() => refetch()} variant="outline" style={{ marginTop: 20 }}>
          Try Again
        </Button>
      </View>
    );
  }

  if (!data) return null;

  const appointmentDate = parse(data.appointment.appointmentTime, "yyyy-MM-dd HH:mm:ss+00", new Date());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Section title="Appointment Info">
          <DetailRow
            icon={Calendar}
            label="Date"
            value={isValid(appointmentDate) ? format(appointmentDate, 'MMMM dd, yyyy @ p') : 'Invalid Date'}
          />
          <DetailRow icon={Stethoscope} label="Provider" value={data.doctor.fullName} />
          <DetailRow icon={Building} label="Clinic" value={data.clinic.name} />
          <DetailRow icon={HeartPulse} label="Service" value={data.service.name} />
        </Section>
        
        <Section title="Clinical Notes">
          {renderRecordDetails(data)}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  sectionCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: theme.spacing.sm,
  },
  icon: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  label: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
    width: '30%',
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    flex: 1,
  },
  errorText: {
    ...theme.typography.h3,
    color: theme.colors.destructive,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorSubText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
}); 
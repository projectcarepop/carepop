import { useQuery } from '@tanstack/react-query';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  Linking,
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
  Download,
  FileText,
  HeartPulse,
  Pill,
  Stethoscope,
  User,
} from 'lucide-react-native';
import { format, isValid, parse } from 'date-fns';
import React, { useCallback, useMemo, useState, useEffect } from 'react';

import { Button } from '../components/button.native';
import { theme } from '../components/theme';
import { MedicalRecordWithRelations } from '../lib/types';
import { getMedicalRecordDetails, downloadMedicalDocument } from '../services/api';
import { RecordsStackParamList } from '../navigation/AppDrawerNavigator';
import { Card } from '../components/card.native';
import { downloadDocument } from '../services/actions';

type RecordDetailScreenRouteProp = RouteProp<RecordsStackParamList, 'RecordDetail'>;

const formatDate = (dateString: string): string => {
  const date = parse(dateString, "yyyy-MM-dd HH:mm:ss+00", new Date());
  return isValid(date) ? format(date, 'MMMM dd, yyyy @ p') : 'Invalid Date';
};

const formatRecordTypeLabel = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// === OPTIMIZED COMPONENTS ===
const DetailRow = React.memo(({ icon: Icon, label, value }: any) => (
  <View style={styles.detailRow}>
    <Icon size={16} color={theme.colors.secondary} style={styles.icon} />
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
));
DetailRow.displayName = 'DetailRow';

const Section = React.memo(({ title, children }: any) => (
  <Card style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </Card>
));
Section.displayName = 'Section';

const PrescriptionDetails = ({ details }: { details: any }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!details.linkedDocumentFilePath) {
            Alert.alert("No Document", "There is no document linked to this prescription.");
            return;
        }
        setIsDownloading(true);
        try {
            const result = await downloadDocument(details.linkedDocumentFilePath);
            if (result.error || !result.downloadUrl) {
                throw new Error(result.error || 'Could not get download URL.');
            }
            await Linking.openURL(result.downloadUrl);
        } catch (error: any) {
            Alert.alert("Download Failed", error.message);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <View>
            <DetailRow icon={Pill} label="Medication" value={details.medicationName || details.medication || 'N/A'} />
            <DetailRow icon={Pill} label="Dosage" value={details.dosage || 'N/A'} />
            <DetailRow icon={Pill} label="Frequency" value={details.frequency || 'N/A'} />
            <DetailRow icon={FileText} label="Instructions" value={details.instructions || details.notes || 'N/A'} />

            {details.linkedDocumentFilePath && (
                <View style={styles.documentContainer}>
                    <Download size={20} color={theme.colors.primary} />
                    <Text style={styles.documentName}>{details.documentName || 'Linked Document'}</Text>
                    <TouchableOpacity onPress={handleDownload} disabled={isDownloading} style={styles.downloadButton}>
                        {isDownloading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Download size={16} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};


const renderRecordDetails = (record: MedicalRecordWithRelations, onDownload: (record: MedicalRecordWithRelations) => void, downloading: boolean) => {
  const { details, recordType } = record;
  if (!details) return <Text style={styles.value}>No additional details provided.</Text>;

  switch (recordType) {
    case 'DOCTOR_NOTE':
      return (
        <Text style={styles.value}>{(details as any)?.note || 'No note content available.'}</Text>
      );
    case 'PRESCRIPTION':
      return <PrescriptionDetails details={details} />;
    case 'CLINICAL_DOCUMENT':
      const documentDetails = details as any;
      return (
        <View>
          <DetailRow icon={FileText} label="Document Name" value={documentDetails?.documentName || 'N/A'} />
          {documentDetails?.documentName && (
            <View style={styles.downloadContainer}>
              <Button 
                variant="outline" 
                size="sm" 
                onPress={() => onDownload(record)}
                disabled={downloading}
                style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
              >
                {downloading ? (
                  <>
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: theme.spacing.xs }} />
                    <Text style={styles.downloadButtonText}>Downloading...</Text>
                  </>
                ) : (
                  <>
                    <Download size={16} color={theme.colors.primary} style={{ marginRight: theme.spacing.xs }} />
                    <Text style={styles.downloadButtonText}>Download</Text>
                  </>
                )}
              </Button>
            </View>
          )}
        </View>
      );
    default:
      return <Text style={styles.value}>This record type has no specific details view.</Text>;
  }
};

export const RecordDetailScreen = () => {
  const route = useRoute<RecordDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { recordId } = route.params;
  const [isDownloading, setIsDownloading] = useState(false);

  // === DATA FETCHING ===
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['medicalRecordDetails', recordId],
    queryFn: () => getMedicalRecordDetails(recordId),
    enabled: !!recordId,
  });

  // Debug logging
  useEffect(() => {
    if (data) {
      console.log('🔍 [RecordDetailScreen] Received data:', JSON.stringify(data, null, 2));
      console.log('🔍 [RecordDetailScreen] Doctor:', data.appointment?.doctor);
      console.log('🔍 [RecordDetailScreen] Clinic:', data.appointment?.clinic);
      console.log('🔍 [RecordDetailScreen] Service:', data.appointment?.service);
    }
  }, [data]);

  // === OPTIMIZED EVENT HANDLERS ===
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDownload = useCallback(async (record: MedicalRecordWithRelations) => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await downloadMedicalDocument(record.id);
      
      // Use Linking to open the download URL
      const supported = await Linking.canOpenURL(response.downloadUrl);
      if (supported) {
        await Linking.openURL(response.downloadUrl);
      } else {
        Alert.alert('Error', 'Cannot open download link. Please try again.');
      }
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert(
        'Download Failed', 
        error instanceof Error ? error.message : 'Failed to download document. Please try again.'
      );
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading]);

  // === OPTIMIZED DERIVED STATE ===
  const appointmentDate = useMemo(() => {
    if (!data?.appointment?.appointmentTime) return null;
    return parse(data.appointment.appointmentTime, "yyyy-MM-dd HH:mm:ss+00", new Date());
  }, [data?.appointment?.appointmentTime]);

  // === LOADING STATE ===
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // === ERROR STATE ===
  if (isError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <AlertCircle size={48} color={theme.colors.destructive} />
        <Text style={styles.errorText}>Failed to load record details.</Text>
        <Text style={styles.errorSubText}>{error?.message}</Text>
        <Button onPress={handleRetry} variant="outline" style={{ marginTop: 20 }}>
          Try Again
        </Button>
      </View>
    );
  }

  if (!data) return null;

  // === MAIN RENDER ===
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Section title="Appointment Info">
          <DetailRow
            icon={Calendar}
            label="Date"
            value={appointmentDate && isValid(appointmentDate) ? format(appointmentDate, 'MMMM dd, yyyy @ p') : 'Invalid Date'}
          />
          <DetailRow icon={Stethoscope} label="Provider" value={data.appointment?.doctor?.fullName || 'Provider information not available'} />
          <DetailRow icon={Building} label="Clinic" value={data.appointment?.clinic?.name || 'Clinic information not available'} />
          <DetailRow icon={HeartPulse} label="Service" value={data.appointment?.service?.name || 'Service information not available'} />
        </Section>
        
        <Section title="Clinical Notes">
          {renderRecordDetails(data, handleDownload, isDownloading)}
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
  downloadContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'flex-end',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.typography.fontFamilyMedium,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.muted,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.lg,
  },
  documentName: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilySemiBold,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
}); 
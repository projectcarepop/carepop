import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { FileText, Stethoscope, Building, Calendar, Paperclip } from 'lucide-react-native';
import { theme } from '../theme';
import { Card } from '../card.native';
import type { MedicalRecordWithRelations } from '../../lib/types';
import { Button } from '../button.native';

interface MedicalRecordCardProps {
  record: MedicalRecordWithRelations;
  onPress: () => void;
}

// A helper to format the record type for display
const formatRecordType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper to check if record has attached files
const hasAttachedFile = (record: MedicalRecordWithRelations): boolean => {
  const details = record.details as any;
  if (!details) return false;

  switch (record.recordType) {
    case 'PRESCRIPTION':
      return !!(details.filePath && typeof details.filePath === 'string');
    case 'CLINICAL_DOCUMENT':
      return !!(details.filePath && typeof details.filePath === 'string');
    default:
      return false;
  }
};

// Helper to get file attachment info
const getFileAttachmentInfo = (record: MedicalRecordWithRelations) => {
  const details = record.details as any;
  if (!details || !hasAttachedFile(record)) return null;

  switch (record.recordType) {
    case 'PRESCRIPTION':
      return {
        fileName: details.documentName || 'Prescription Document',
        color: '#059669', // green-600
        backgroundColor: '#D1FAE5', // green-100
        borderColor: '#A7F3D0', // green-200
      };
    case 'CLINICAL_DOCUMENT':
      return {
        fileName: details.documentName || 'Clinical Document',
        color: '#2563EB', // blue-600
        backgroundColor: '#DBEAFE', // blue-100
        borderColor: '#BFDBFE', // blue-200
      };
    default:
      return null;
  }
};

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({ record, onPress }) => {
  const { recordType, createdAt, appointment } = record;
  const fileInfo = getFileAttachmentInfo(record);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <FileText size={18} color={theme.colors.primary} />
        <Text style={styles.recordType}>{formatRecordType(recordType)}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Stethoscope size={16} color={theme.colors.secondary} />
          <Text style={styles.detailText}>{appointment?.doctor?.fullName || 'Provider information not available'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Building size={16} color={theme.colors.secondary} />
          <Text style={styles.detailText}>{appointment?.clinic?.name || 'Clinic information not available'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color={theme.colors.secondary} />
          <Text style={styles.detailText}>
            {createdAt ? format(new Date(createdAt), 'MMMM dd, yyyy') : 'No date'}
          </Text>
        </View>
      </View>
      
      {/* File Attachment Indicator */}
      {fileInfo && (
        <View style={[styles.attachmentContainer, { 
          backgroundColor: fileInfo.backgroundColor, 
          borderColor: fileInfo.borderColor 
        }]}>
          <Paperclip size={14} color={fileInfo.color} />
          <Text style={[styles.attachmentText, { color: fileInfo.color }]}>
            📎 Document Attached
          </Text>
          <Text style={[styles.attachmentFileName, { color: fileInfo.color }]}>
            ({fileInfo.fileName})
          </Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <Button variant="outline" size="sm" onPress={onPress}>
          View Details
        </Button>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  recordType: {
    marginLeft: theme.spacing.sm,
    fontSize: 18,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.primary,
  },
  detailsContainer: {
    paddingLeft: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    marginLeft: theme.spacing.md,
    fontSize: 14,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.secondary,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    flexWrap: 'wrap',
  },
  attachmentText: {
    marginLeft: theme.spacing.xs,
    fontSize: 12,
    fontFamily: theme.typography.fontFamilySemiBold,
  },
  attachmentFileName: {
    marginLeft: theme.spacing.xs,
    fontSize: 11,
    fontFamily: theme.typography.fontFamily,
    opacity: 0.8,
  },
  footer: {
    marginTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    alignItems: 'flex-end',
  },
});

export default MedicalRecordCard; 
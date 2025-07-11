import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { FileText, Stethoscope, Building, Calendar } from 'lucide-react-native';
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

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({ record, onPress }) => {
  const { recordType, createdAt, appointment } = record;

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
  footer: {
    marginTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    alignItems: 'flex-end',
  },
});

export default MedicalRecordCard; 
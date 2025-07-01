import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, AlertCircle, Clock4, XCircle, Ban, HelpCircle } from 'lucide-react-native';
import { theme } from './theme';
import type { AppointmentStatus } from '../lib/types';

interface BadgeProps {
  text: string;
  backgroundColor: string;
  textColor: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ text, backgroundColor, textColor, icon }) => {
  return (
    <View style={[styles.badgeContainer, { backgroundColor }]}>
      {icon}
      <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
    </View>
  );
};

export const getStatusStyles = (status: AppointmentStatus | undefined) => {
  switch (status) {
    case 'scheduled':
      return {
        bgColor: theme.colors.secondary,
        textColor: theme.colors.secondaryForeground,
        Icon: CheckCircle,
      };
    case 'completed':
      return {
        bgColor: theme.colors.secondary,
        textColor: theme.colors.secondaryForeground,
        Icon: CheckCircle,
      };
    case 'canceled_by_patient':
    case 'canceled_by_admin':
      return {
        bgColor: theme.colors.destructive,
        textColor: theme.colors.destructiveForeground,
        Icon: XCircle,
      };
    case 'no_show':
        return {
            bgColor: theme.colors.mutedForeground,
            textColor: theme.colors.background,
            Icon: Ban,
        }
    default:
      return {
        bgColor: theme.colors.muted,
        textColor: theme.colors.mutedForeground,
        Icon: HelpCircle,
      };
  }
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  badgeText: {
    marginLeft: theme.spacing.xs,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
}); 
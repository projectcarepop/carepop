import React from 'react';
import { View, Text, StyleSheet, type ViewProps, type TextProps, Platform } from 'react-native';
import { theme } from './theme';

// --- Card Container ---
const Card = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.card, style]} {...props} />
));
Card.displayName = 'Card';

// --- Card Header ---
const CardHeader = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.header, style]} {...props} />
));
CardHeader.displayName = 'CardHeader';

// --- Card Title ---
const CardTitle = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={[styles.title, style]} {...props} />
));
CardTitle.displayName = 'CardTitle';

// --- Card Description ---
const CardDescription = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={[styles.description, style]} {...props} />
));
CardDescription.displayName = 'CardDescription';

// --- Card Content ---
const CardContent = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.content, style]} {...props} />
));
CardContent.displayName = 'CardContent';

// --- Card Footer ---
const CardFooter = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.footer, style]} {...props} />
));
CardFooter.displayName = 'CardFooter';

// --- StyleSheet ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    // Note: React Native shadow props are iOS-only. Use elevation for Android.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02, // Softer shadow
    shadowRadius: 8, // Wider, more diffuse shadow
    elevation: 1, // Softer elevation
  },
  header: {
    padding: theme.spacing.xl, // 24px
    paddingBottom: 0,
  },
  content: {
    padding: theme.spacing.xl, // 24px
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xl, // 24px
    paddingTop: 0,
  },
  title: {
    ...theme.typography.h3,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.foreground,
  },
  description: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.md, // 8px
  },
});

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };
import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Button } from '../button.native';

type AiInsightModalProps = {
  visible: boolean;
  onClose: () => void;
  insight: string;
};

// Simple Markdown-like text parser
const renderInsight = (text: string) => {
  if (!text) return null;
  
  const lines = text.split('\\n');
  
  return lines.map((line, index) => {
    line = line.trim();
    if (line.startsWith('### ')) {
      return <Text key={index} style={styles.header3}>{line.replace('### ', '')}</Text>;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <Text key={index} style={styles.boldText}>{line.replace(/\\*\\*/g, '')}</Text>;
    }
    if (line.startsWith('- ')) {
      return (
        <View key={index} style={styles.listItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.insightText}>{line.replace('- ', '')}</Text>
        </View>
      );
    }
    if (line === '---') {
      return <View key={index} style={styles.divider} />;
    }
    return <Text key={index} style={styles.insightText}>{line}</Text>;
  });
};

const AiInsightModal = ({ visible, onClose, insight }: AiInsightModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
            <Ionicons name="sparkles" size={48} color={theme.colors.accent} style={styles.icon} />
            <Text style={styles.title}>Your Weekly Insight</Text>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {renderInsight(insight)}
            </ScrollView>
          <Button
              title="Got it!"
              onPress={onClose}
              fullWidth
              style={styles.insightButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg * 2,
    alignItems: 'center',
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  icon: {
    marginBottom: theme.spacing.md,
    color: theme.colors.secondary,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.lg,
  },
  scrollView: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.sm,
  },
  header3: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  boldText: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.primary,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  insightText: {
    ...theme.typography.body,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
    flexShrink: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    paddingRight: theme.spacing.md, // prevent text from touching edge
  },
  bulletPoint: {
    ...theme.typography.body,
    color: theme.colors.accent,
    marginRight: theme.spacing.sm,
    lineHeight: theme.typography.body.lineHeight,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    alignSelf: 'stretch',
    marginVertical: theme.spacing.md,
  },
  insightButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    fontSize: theme.typography.body.fontSize,
    padding: theme.spacing.md,
  },
});

export default AiInsightModal; 
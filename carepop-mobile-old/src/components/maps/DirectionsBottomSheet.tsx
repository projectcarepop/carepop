import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Animated from 'react-native-reanimated';
import { theme } from '../../components/theme';
import { X, Footprints, Car } from 'lucide-react-native';

interface RouteStep {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  html_instructions: string;
  travel_mode: 'DRIVING' | 'WALKING';
}

interface DirectionsBottomSheetProps {
  onClose: () => void;
  steps: RouteStep[];
}

const DirectionStepItem = ({ item }: { item: RouteStep }) => (
  <View style={styles.stepContainer}>
    {item.travel_mode === 'DRIVING' ? (
      <Car size={24} color={theme.colors.secondary} style={styles.stepIcon} />
    ) : (
      <Footprints size={24} color={theme.colors.secondary} style={styles.stepIcon} />
    )}
    <View style={styles.stepTextContainer}>
      <Text style={styles.stepInstruction}>{item.html_instructions.replace(/<[^>]*>/g, '')}</Text>
      <Text style={styles.stepDetails}>{item.distance.text} ({item.duration.text})</Text>
    </View>
  </View>
);

export const DirectionsBottomSheet: React.FC<DirectionsBottomSheetProps> = ({ onClose, steps }) => {
  return (
    <Animated.View style={styles.bottomSheetContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Directions</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={steps}
        renderItem={({ item }) => <DirectionStepItem item={item} />}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.listContentContainer}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20,
    height: '45%', // Adjusted height
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  listContentContainer: {
    paddingTop: theme.spacing.sm,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  stepIcon: {
    marginRight: theme.spacing.md,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepInstruction: {
    ...theme.typography.body,
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  stepDetails: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
}); 
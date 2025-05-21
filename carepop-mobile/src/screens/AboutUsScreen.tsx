import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Linking, TouchableOpacity } from 'react-native';
import { theme } from '../components'; 
import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';

interface AboutUsScreenProps {
  navigation: NavigationProp<any>;
}

export function AboutUsScreen({ navigation }: AboutUsScreenProps) {

  const openLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
        // Optionally, show an alert to the user
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.mainTitle}>Family Planning Organization of the Philippines (FPOP)</Text>
        
        <Text style={styles.sectionBody}>
          FPOP is a non-stock, non-profit, service-oriented organization providing quality sexual and reproductive health services to all Filipinos, especially the poor and the underserved.
        </Text>
        <Text style={styles.sectionBody}>
          It has 12 active organizational chapters with 18 Community Health Care Clinics nationwide offering an integrated package of essential services on family planning and reproductive health. FPOP is one of the oldest and biggest volunteer organizations in the Philippines, founded on August 4, 1969. It is a member association of the International Planned Parenthood Federation.
        </Text>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.sectionBody}>
          We champion sexual and reproductive health and rights (SRHR) through advocacy and provision of reproductive health services especially to the poor, marginalized, socially excluded and underserved people including the young ones. We work in partnership with stakeholders at the national, chapter and community levels. We are committed to the eradication of HIV and AIDS, and the advancement of the right of everyone to enjoy a sexual life that is free from ill health, unwanted pregnancy, violence and discrimination.
        </Text>

        <Text style={styles.sectionTitle}>Our Vision</Text>
        <Text style={styles.sectionBody}>
          We envision a world where every woman, man and young person has access to sexual and reproductive health (SRH) information and services, and sexuality is seen as a natural and precious part of human life and a fundamental human right.
        </Text>

        <Text style={styles.sectionTitle}>Our Principles</Text>
        <View style={styles.principlesContainer}>
          <PrincipleItem icon="star-outline" text="Excellence: Drives us to go beyond and do more." />
          <PrincipleItem icon="shield-checkmark-outline" text="Accountability: Makes us responsible for our actions, inactions & decisions." />
          <PrincipleItem icon="heart-outline" text="Passion: Determined to work on our advocacy & service delivery despite the challenging environment." />
          <PrincipleItem icon="people-outline" text="Diversity: All Filipinos regardless of age, sexual orientation, identity & expression and ethnicity & status deserved to have access to SRHR." />
          <PrincipleItem icon="checkbox-outline" text="Social Inclusion: No one is left behind and everyone journeys together towards achieving quality of life anchored on rights-based approach programs and services." />
          <PrincipleItem icon="ribbon-outline" text="Volunteerism: Significant contribution our volunteerism delivers across a range of roles as activists inspiring the organization to advance its mission." />
        </View>
        
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <ContactItem icon="call-outline" label="Telephone:" value="(632) 722 6466" onPress={() => openLink('tel:+6327226466')} />
        <ContactItem icon="print-outline" label="Telefax:" value="(632) 721 7101" />
        <ContactItem icon="mail-outline" label="Email:" value="fpop1969@yahoo.com" onPress={() => openLink('mailto:fpop1969@yahoo.com')} />
        
        <Text style={styles.subSectionTitle}>Visit our Office</Text>
        <TouchableOpacity onPress={() => openLink('https://maps.google.com/?q=FPOP,+298+15th+Avenue,+Barangay+Silangan,+Cubao,+Quezon+City,+Metro+Manila,+Philippines')}>
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={20} color={theme.colors.primary} style={styles.contactIcon} />
            <Text style={styles.addressText}>#298 15th Avenue, Barangay Silangan, Cubao, Quezon City, Metro Manila, Philippines</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          © 2022 FPOP - Family Planning Organization of the Philippines. All Rights Reserved.
        </Text>
        <Text style={styles.dataSourceText}>
          Content sourced from fpop1969.org/about-fpop/
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const PrincipleItem: React.FC<{icon: keyof typeof Ionicons.glyphMap, text: string}> = ({ icon, text }) => (
  <View style={styles.principleItem}>
    <Ionicons name={icon} size={24} color={theme.colors.secondary} style={styles.principleIcon} />
    <Text style={styles.principleText}>{text}</Text>
  </View>
);

const ContactItem: React.FC<{icon: keyof typeof Ionicons.glyphMap, label: string, value: string, onPress?: () => void}> = ({ icon, label, value, onPress }) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress}>
    <View style={styles.contactItem}>
      <Ionicons name={icon} size={20} color={theme.colors.primary} style={styles.contactIcon} />
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  container: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  mainTitle: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.subheading + 1,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.xs,
  },
  subSectionTitle: {
    fontSize: theme.typography.subheading -1,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  sectionBody: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    lineHeight: theme.typography.body * 1.5,
    marginBottom: theme.spacing.sm,
  },
  principlesContainer: {
    marginTop: theme.spacing.sm,
  },
  principleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  principleIcon: {
    marginRight: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  principleText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    flexShrink: 1,
    lineHeight: theme.typography.body * 1.4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  contactIcon: {
    marginRight: theme.spacing.md,
  },
  contactLabel: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
    marginRight: theme.spacing.xs,
  },
  contactValue: {
    fontSize: theme.typography.body,
    color: theme.colors.primary, // Make contact values stand out
    flexShrink: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
  },
  addressText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    flexShrink: 1,
    lineHeight: theme.typography.body * 1.4,
  },
  footerText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xs,
  },
  dataSourceText: {
    fontSize: theme.typography.caption - 2,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  }
}); 
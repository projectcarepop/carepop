import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Linking, TouchableOpacity, Image } from 'react-native';
import { theme } from '../components/theme'; 
import { ArrowLeft, Star, ShieldCheck, Heart, Users, CheckSquare, Award, Phone, Printer, Mail, MapPin, Sparkles } from 'lucide-react-native';
import type { NavigationProp } from '@react-navigation/native';

interface AboutUsScreenProps {
  navigation: NavigationProp<any>;
}

const Header = ({ onBackPress }: { onBackPress: () => void }) => (
  <View style={styles.headerBar}>
    <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
      <ArrowLeft size={24} color={theme.colors.foreground} />
    </TouchableOpacity>
  </View>
);

export function AboutUsScreen({ navigation }: AboutUsScreenProps) {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroSection}>
          <Image source={require('../../assets/carepop-logo-blue.png')} style={styles.logo} />
          <Text style={styles.mainTitle}>About Carepop</Text>
        </View>
        
        <Text style={styles.sectionBody}>
          Carepop is a modern, secure, and user-friendly digital platform designed to enhance healthcare accessibility for diverse and underserved communities in the Philippines. In partnership with FPOP, we aim to bridge the gap in healthcare by providing tools for easy appointment scheduling, finding inclusive providers, and managing your health with confidence and privacy.
        </Text>

        <View style={styles.sectionSpacer} />

        <Text style={styles.sectionTitle}>Carepop&apos;s Mission</Text>
        <Text style={styles.sectionBody}>
          To empower every Filipino&apos;s health journey with user-friendly technology and an unwavering commitment to inclusive, compassionate, and accessible care. We champion sexual and reproductive health and rights (SRHR) for all.
        </Text>

        <View style={styles.sectionSpacer} />

        <Text style={styles.sectionTitle}>Carepop&apos;s Vision</Text>
        <Text style={styles.sectionBody}>
          We envision a Philippines where every individual has seamless access to the health information and services they need, and where sexuality is embraced as a natural and fundamental human right, free from stigma and discrimination.
        </Text>

        <View style={styles.sectionSpacer} />

        <Text style={styles.sectionTitle}>Our Guiding Principles</Text>
        <PrincipleItem icon={Heart} text="Unwavering Respect: We treat every individual with dignity, honoring their identity, choices, and journey." />
        <PrincipleItem icon={Award} text="Quality Without Compromise: We are committed to the highest standards of care and technology." />
        <PrincipleItem icon={Users} text="Healthcare for All: We believe quality healthcare is a fundamental right and work to break down barriers to access." />
        <PrincipleItem icon={ShieldCheck} text="Privacy & Security: Your confidentiality is paramount. We protect your data with robust security." />
        <PrincipleItem icon={Sparkles} text="Empowering Journeys: We empower you with the tools and information to take control of your health." />
        
        <View style={styles.sectionSpacer} />

        <Text style={styles.sectionTitle}>Our Partner: Family Planning Organization of the Philippines (FPOP)</Text>
        <Text style={styles.sectionBody}>
          FPOP is a non-stock, non-profit, service-oriented organization providing quality sexual and reproductive health services to all Filipinos, especially the poor and the underserved. It is a member association of the International Planned Parenthood Federation.
        </Text>

        <View style={styles.sectionSpacer} />

        <Text style={styles.sectionTitle}>FPOP&apos;s Mission</Text>
        <Text style={styles.sectionBody}>
          We champion sexual and reproductive health and rights (SRHR) through advocacy and provision of reproductive health services especially to the poor, marginalized, socially excluded and underserved people.
        </Text>

        <View style={styles.sectionSpacer} />

        <Text style={styles.sectionTitle}>FPOP&apos;s Vision</Text>
        <Text style={styles.sectionBody}>
          We envision a world where every person has access to sexual and reproductive health (SRH) information and services, and sexuality is seen as a natural and precious part of human life and a fundamental human right.
        </Text>

        <View style={styles.sectionSpacer} />

        <Text style={styles.sectionTitle}>FPOP&apos;s Principles</Text>
        <PrincipleItem icon={Star} text="Excellence: Drives us to go beyond and do more." />
        <PrincipleItem icon={ShieldCheck} text="Accountability: Makes us responsible for our actions, inactions & decisions." />
        <PrincipleItem icon={Heart} text="Passion: Determined to work on our advocacy & service delivery." />
        <PrincipleItem icon={Users} text="Diversity: All Filipinos deserve access to SRHR regardless of age, sexual orientation, identity & expression, and ethnicity & status." />
        <PrincipleItem icon={CheckSquare} text="Social Inclusion: No one is left behind." />
        <PrincipleItem icon={Award} text="Volunteerism: Our volunteers inspire the organization to advance its mission." />
        
        <View style={styles.sectionSpacer} />
        
        <Text style={styles.sectionTitle}>Contact FPOP</Text>
        <ContactItem icon={Phone} label="Telephone" value="(632) 722 6466" onPress={() => openLink('tel:+6327226466')} />
        <ContactItem icon={Printer} label="Telefax" value="(632) 721 7101" />
        <ContactItem icon={Mail} label="Email" value="fpop1969@yahoo.com" onPress={() => openLink('mailto:fpop1969@yahoo.com')} />
        
        <View style={styles.sectionSpacer} />
        
        <Text style={styles.sectionTitle}>Visit FPOP</Text>
        <TouchableOpacity onPress={() => openLink('https://maps.google.com/?q=FPOP,+298+15th+Avenue,+Barangay+Silangan,+Cubao,+Quezon+City,+Metro+Manila,+Philippines')}>
          <View style={styles.addressContainer}>
            <MapPin size={28} color={theme.colors.secondary} style={styles.contactIcon} />
            <Text style={styles.addressText}>#298 15th Avenue, Barangay Silangan, Cubao, Quezon City, Metro Manila, Philippines</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
        <Text style={styles.footerText}>
            © 2024 FPOP. All Rights Reserved.
        </Text>
        <Text style={styles.dataSourceText}>
            Content sourced from fpop1969.org
        </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const PrincipleItem: React.FC<{icon: React.ElementType, text: string}> = ({ icon: Icon, text }) => (
  <View style={styles.principleItem}>
    <Icon size={24} color={theme.colors.primary} style={styles.principleIcon} />
    <Text style={styles.principleText}>{text}</Text>
  </View>
);

const ContactItem: React.FC<{icon: React.ElementType, label: string, value: string, onPress?: () => void}> = ({ icon: Icon, label, value, onPress }) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress}>
    <View style={styles.contactItem}>
      <Icon size={24} color={theme.colors.secondary} style={styles.contactIcon} />
      <View>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue}>{value}</Text>
      </View>
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  container: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  logo: {
      width: 80,
      height: 80,
      resizeMode: 'contain',
      marginBottom: theme.spacing.lg,
  },
  mainTitle: {
    ...theme.typography.h1,
    fontFamily: theme.typography.interFontFamilyBold,
    color: theme.colors.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...theme.typography.h3,
    fontFamily: theme.typography.interFontFamilyMedium,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
  },
  sectionBody: {
    ...theme.typography.body,
    color: theme.colors.foreground,
    lineHeight: 26,
  },
  sectionSpacer: {
      height: theme.spacing.xl,
  },
  principleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  principleIcon: {
    marginRight: theme.spacing.md,
  },
  principleText: {
    ...theme.typography.body,
    color: theme.colors.foreground,
    flex: 1,
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  contactIcon: {
    marginRight: theme.spacing.md,
  },
  contactLabel: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
  contactValue: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.secondary,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  addressText: {
    ...theme.typography.body,
    color: theme.colors.foreground,
    flex: 1,
    lineHeight: 24,
  },
  footer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      alignItems: 'center',
  },
  footerText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  dataSourceText: {
    ...theme.typography.xsmall,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
  }
}); 
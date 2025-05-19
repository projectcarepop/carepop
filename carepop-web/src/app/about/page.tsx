'use client'; // Can be a server component if no client-side interactivity needed

import React from 'react';
import { Users, Target, Eye, ShieldCheck, Heart, Sparkles, CheckSquare, Award, Phone, Mail, MapPin, Printer, ArrowRight } from 'lucide-react';
import Link from 'next/link'; // For potential "Learn More" buttons

const AboutPage = () => {
  const carepopAppInfo = {
    superTitle: "Meet CarePop",
    title: "Healthcare, Reimagined for You.",
    introduction: 
      "CarePop is your dedicated digital partner for accessible and compassionate healthcare in the Philippines. We connect you with vital services, focusing on sexual and reproductive health, through an intuitive and supportive platform.",
    features: [
      { icon: Users, title: "Find Providers", description: "Easily locate trusted clinics and healthcare professionals." },
      { icon: Target, title: "Book Appointments", description: "Schedule your consultations and services seamlessly online." },
      { icon: Eye, title: "Manage Health", description: "Securely maintain your health profile and history." },
    ],
    missionStatement: "Our mission is to empower your health journey with user-friendly technology and a commitment to inclusive care."
  };

  const fpopInfo = {
    partnerTitle: "Our Esteemed Partner",
    name: "Family Planning Organization of the Philippines (FPOP)",
    introduction: 
      "FPOP is a cornerstone of sexual and reproductive health services in the Philippines, dedicated to providing quality care, especially for the poor and underserved.",
    mission: 
      "FPOP champions sexual and reproductive health and rights (SRHR) through advocacy and comprehensive service provision, committed to eradicating HIV/AIDS and ensuring a life free from ill health, unwanted pregnancy, and discrimination.",
    vision: 
      "They envision a world where every individual has access to SRH information and services, and sexuality is recognized as a natural and fundamental human right.",
    principles: [
      { icon: Sparkles, text: "Excellence: Striving to go beyond and do more." },
      { icon: ShieldCheck, text: "Accountability: Responsible for actions and decisions." },
      { icon: Heart, text: "Passion: Dedicated to advocacy and service delivery." },
      { icon: Users, text: "Diversity: Inclusive access to SRHR for all Filipinos." },
      { icon: CheckSquare, text: "Social Inclusion: Leaving no one behind in achieving quality of life." },
      { icon: Award, text: "Volunteerism: Advancing the mission through dedicated activists." }
    ],
    contact: [
        { icon: Phone, label: "Telephone", value: "(632) 722 6466", href: "tel:+6327226466" },
        { icon: Mail, label: "Email", value: "fpop1969@yahoo.com", href: "mailto:fpop1969@yahoo.com" },
        { icon: Printer, label: "Telefax", value: "(632) 721 7101" },
        { icon: MapPin, label: "Main Office", value: "#298 15th Ave, Cubao, Quezon City", href: "https://maps.google.com/?q=FPOP,+298+15th+Avenue,+Barangay+Silangan,+Cubao,+Quezon+City,+Metro+Manila,+Philippines" },
    ],
    dataSource: "FPOP content sourced from fpop1969.org"
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Section 1: About CarePop App */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-pink-900/30 dark:via-rose-900/30 dark:to-red-900/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-base font-semibold uppercase tracking-wider text-gray-700 dark:text-pink-400 mb-2">
            {carepopAppInfo.superTitle}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-space-grotesk leading-tight">
            {carepopAppInfo.title}
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-700 dark:text-gray-300 mb-10 font-inter">
            {carepopAppInfo.introduction}
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            {carepopAppInfo.features.map((feature, index) => (
              <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <feature.icon className="h-10 w-10 text-pink-500 dark:text-pink-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 font-space-grotesk">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">{feature.description}</p>
              </div>
            ))}
          </div>
           <p className="text-lg italic text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-inter">
            {carepopAppInfo.missionStatement}
          </p>
        </div>
      </section>

      {/* Section 2: FPOP Introduction */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-1">
              {fpopInfo.partnerTitle}
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 font-space-grotesk leading-tight">
              {fpopInfo.name}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 font-inter leading-relaxed">
              {fpopInfo.introduction}
            </p>
            <div className="space-y-6 text-gray-700 dark:text-gray-300 font-inter leading-relaxed">
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Mission:</h4>
                    <p>{fpopInfo.mission}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Vision:</h4>
                    <p>{fpopInfo.vision}</p>
                </div>
            </div>
          </div>
          <div className="order-1 md:order-2 flex items-center justify-center">
            {/* Placeholder for FPOP Image/Visual */}
            <div className="w-full h-80 md:h-96 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center">
              <Users className="h-32 w-32 text-gray-300 dark:text-gray-700" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Section 3: FPOP Principles */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 font-space-grotesk">
            FPOP&apos;s Guiding Principles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {fpopInfo.principles.map((principle, index) => (
              <div key={index} className="flex items-start p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <principle.icon className="h-8 w-8 text-pink-500 dark:text-pink-400 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-inter leading-relaxed">{principle.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Optional Call to Action (Engage)*/}
      <section className="py-16 md:py-24 bg-gray-800 dark:bg-gray-950 text-white">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-space-grotesk">
                Engage with CarePop
            </h2>
            <p className="max-w-xl mx-auto text-lg text-gray-300 mb-8 font-inter">
                Ready to take control of your health? Download the CarePop app or explore our services.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link href="/download-app" passHref>
                    <button className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center text-lg">
                        Download App
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                </Link>
                <Link href="/book-service" passHref>
                     <button className="w-full sm:w-auto bg-transparent hover:bg-pink-500/10 border-2 border-pink-500 text-pink-500 font-semibold py-3 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out flex items-center justify-center text-lg">
                        Explore Services
                    </button>
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 
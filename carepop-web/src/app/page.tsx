import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Search, Calendar, ShieldCheck, Users, Stethoscope, BriefcaseMedical } from 'lucide-react';
import Image from 'next/image';
import React from "react";

const features = [
  {
    icon: <Search className="w-10 h-10 text-primary" />,
    title: "Find Inclusive Providers",
    description: "Easily search and filter for healthcare providers who understand and cater to your specific needs.",
  },
  {
    icon: <Calendar className="w-10 h-10 text-primary" />,
    title: "Seamless Booking",
    description: "Schedule appointments online in just a few clicks. View availability and book a slot that works for you.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-primary" />,
    title: "Private & Secure",
    description: "Your privacy is our priority. All your data is encrypted and handled with the utmost confidentiality.",
  },
  {
    icon: <Users className="w-10 h-10 text-primary" />,
    title: "Community Focused",
    description: "A platform built by the community, for the community, with a focus on inclusive and accessible care.",
  },
];

const howItWorksSteps = [
    {
      icon: <BriefcaseMedical />,
      title: "1. Explore Services",
      description: "Browse a wide range of health services, from general check-ups to specialized care, all in one place.",
    },
    {
      icon: <Stethoscope />,
      title: "2. Choose Your Provider",
      description: "Select a trusted, vetted healthcare professional or clinic that aligns with your values and needs.",
    },
    {
      icon: <CheckCircle />,
      title: "3. Book with Confidence",
      description: "Pick a convenient time, book your appointment instantly, and manage your health journey with ease.",
    },
  ];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-space-grotesk text-primary">
                  Healthcare Centered On You
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl font-inter">
                  CarePoP is your safe space for accessible and inclusive healthcare. Find affirming providers, schedule appointments with ease, and manage your health journey with confidence and dignity.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Link href="/clinic-finder" passHref>
                  <Button size="lg">
                    Find a Clinic
                  </Button>
                </Link>
                <Link href="/about" passHref>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <Image
              src="/hero-image.jpg"
              width={600}
              height={400}
              alt="Hero Image - A diverse group of people's hands together in a circle, showing unity and support"
              className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 md:py-20 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-space-grotesk">A New Standard for Inclusive Healthcare</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-inter">
                We built CarePoP to dismantle barriers and provide a healthcare experience where you feel seen, heard, and respected.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-10 sm:grid-cols-2 md:grid-cols-2 md:gap-12 lg:grid-cols-4 mt-12">
            {features.map((feature) => (
              <div key={feature.title} className="grid gap-2 text-center">
                 <div className="flex justify-center items-center mb-2">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold font-space-grotesk">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-inter">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-space-grotesk">Get Care in 3 Easy Steps</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed font-inter">
              Your path to better health is just a few clicks away.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {howItWorksSteps.map((step) => (
              <Card key={step.title} className="flex flex-col items-center justify-start text-center p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  {React.cloneElement(step.icon, { className: "w-10 h-10 text-primary" })}
                </div>
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="font-space-grotesk text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground font-inter text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-20 lg:py-24 bg-muted">
          <div className="container mx-auto flex flex-col items-center justify-center gap-4 text-center px-4 md:px-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-space-grotesk">
                    Ready to Take Control of Your Health?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    Join CarePoP today. Register on the web or download our mobile app to get started.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Link href="/register">
                  <Button size="lg">Create an Account</Button>
                  </Link>
                  <Link href="/download-app">
                  <Button size="lg" variant="secondary">Download the App</Button>
                  </Link>
              </div>
          </div>
      </section>
    </>
  );
}

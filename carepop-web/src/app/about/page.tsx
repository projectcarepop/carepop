'use client'; // Can be a server component if no client-side interactivity needed

import React from 'react';
import { Award, Heart, Sparkles, Users, ShieldCheck, Handshake } from 'lucide-react';
import Link from 'next/link'; // For potential "Learn More" buttons
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel"

const values = [
  {
    icon: <Heart />,
    title: "Unwavering Respect",
    description: "We treat every individual with dignity, honoring their identity, choices, and journey. Our platform is a safe space built on trust and confidentiality.",
  },
  {
    icon: <Award />,
    title: "Quality Without Compromise",
    description: "We are committed to the highest standards of care, partnering with vetted providers and building technology that is reliable, secure, and effective.",
  },
  {
    icon: <Users />,
    title: "Healthcare for All",
    description: "We believe quality healthcare is a fundamental right. Our mission is to break down barriers and ensure access for every Filipino, especially the underserved.",
  },
  {
    icon: <ShieldCheck />,
    title: "Privacy & Security",
    description: "Your confidentiality is paramount. We protect your data with robust security measures and a commitment to privacy.",
  },
  {
    icon: <Handshake />,
    title: "Community & Volunteerism",
    description: "We are powered by a collective of advocates and volunteers dedicated to supporting our shared mission of accessible healthcare.",
  },
  {
    icon: <Sparkles />,
    title: "Empowering Journeys",
    description: "We empower you with the tools and information to take control of your health. Your well-being is our ultimate measure of success.",
  },
];

const AboutPage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-16 md:py-20 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-space-grotesk text-primary">
              About CarePoP
            </h1>
            <p className="max-w-[800px] text-muted-foreground md:text-xl font-inter">
              We are dedicated to revolutionizing healthcare in the Philippines by providing a safe, inclusive, and accessible platform for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="w-full py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">Our Story: A Partnership for Health</h2>
                </div>
                <div className="space-y-4 text-muted-foreground font-inter">
                    <p>
                        CarePoP was born from a collaboration with the Family Planning Organization of the Philippines (FPOP), the country&apos;s leading provider of sexual and reproductive health services. We saw a critical need to bridge the gap between healthcare providers and the communities that need them most, especially the underserved and marginalized.
                    </p>
                    <p>
                        Manual workflows, stigma, and lack of access to affirming providers create significant barriers to care. CarePoP is our answer: a modern, user-friendly digital platform designed to empower individuals on their health journey.
                    </p>
                </div>
            </div>
            <Image
              src="/CAREPOP-TEAM.jpg"
              width={600}
              height={400}
              alt="The CarePoP Team"
              className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* FPOP Partner Section */}
      <section className="w-full py-16 md:py-20 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk text-primary">Our Partner in Care</h2>
                    <h3 className="text-2xl font-semibold tracking-tight font-space-grotesk">Family Planning Organization of the Philippines (FPOP)</h3>
                </div>
                <div className="space-y-4 text-muted-foreground font-inter">
                    <p>
                        Our work is made possible through our deep partnership with FPOP, a cornerstone of sexual and reproductive health and rights (SRHR) in the Philippines.
                    </p>
                    <p>
                        For decades, FPOP has been a champion for accessible care, advocating for policies and providing vital services to countless communities. We are proud to build on their legacy by bringing their mission into the digital age.
                    </p>
                </div>
            </div>
            <Image
              src="/FPOP-NCR.png"
              width={600}
              height={400}
              alt="The logo of FPOP NCR Chapter"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-contain"
              style={{ height: 'auto' }}
            />
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="w-full py-16 md:py-20 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <Carousel
            plugins={[ Autoplay({ delay: 5000, stopOnInteraction: false }) ]}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              <CarouselItem>
                <div className="space-y-4 text-center px-12">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">Our Mission</h2>
                  <p className="font-inter max-w-3xl mx-auto">
                    To empower every Filipino&apos;s health journey with user-friendly technology and an unwavering commitment to inclusive, compassionate, and accessible care. We champion sexual and reproductive health and rights (SRHR) for all.
                  </p>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="space-y-4 text-center px-12">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">Our Vision</h2>
                  <p className="font-inter max-w-3xl mx-auto">
                    We envision a Philippines where every individual has seamless access to the health information and services they need, and where sexuality is embraced as a natural and fundamental human right, free from stigma and discrimination.
                  </p>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselDots />
          </Carousel>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section id="values" className="w-full py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-space-grotesk">Our Guiding Principles</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed font-inter">
              These values, inherited from our partners at FPOP, are the bedrock of our platform and our promise to you.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
            {values.map((value) => (
               <Card key={value.title} className="flex flex-col items-center justify-start text-center p-6 transition-all duration-300 ease-in-out md:hover:shadow-lg md:hover:scale-105 bg-transparent border-0 shadow-none">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  {React.cloneElement(value.icon, { className: "w-10 h-10 text-primary" })}
                </div>
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="font-space-grotesk text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground font-inter text-sm">{value.description}</p>
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
};

export default AboutPage; 
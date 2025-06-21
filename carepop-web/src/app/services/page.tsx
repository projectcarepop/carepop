import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Brain, HeartPulse, Bone, Baby, Syringe } from "lucide-react";
import Link from "next/link";
import React from 'react';

const serviceCategories = [
  {
    title: "General Health",
    description: "Routine check-ups, preventive care, and treatment for common illnesses.",
    icon: <HeartPulse className="w-10 h-10 text-primary" />,
    href: "/services/general-health"
  },
  {
    title: "Mental Health & Wellness",
    description: "Counseling, therapy, and psychiatric services to support your mental well-being.",
    icon: <Brain className="w-10 h-10 text-primary" />,
    href: "/services/mental-health"
  },
  {
    title: "Specialized Medical Care",
    description: "Expert care for specific conditions, including cardiology, dermatology, and more.",
    icon: <Stethoscope className="w-10 h-10 text-primary" />,
    href: "/services/specialized-care"
  },
  {
    title: "Vaccinations & Immunizations",
    description: "Stay protected with a full range of vaccines for all ages.",
    icon: <Syringe className="w-10 h-10 text-primary" />,
    href: "/services/vaccinations"
  },
  {
    title: "Reproductive & Sexual Health",
    description: "Comprehensive and confidential services for your reproductive and sexual health needs.",
    icon: <Baby className="w-10 h-10 text-primary" />,
    href: "/services/sexual-health"
  },
  {
    title: "Diagnostics & Lab Tests",
    description: "Accurate and timely diagnostic imaging and laboratory testing services.",
    icon: <Bone className="w-10 h-10 text-primary" />,
    href: "/services/diagnostics"
  },
];


export default function ServicesPage() {
  return (
    <main className="container mx-auto py-16 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-space-grotesk text-primary">
                Our Services
            </h1>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-inter">
                Find the right care for you. We offer a wide range of services to meet your unique health needs.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCategories.map((category) => (
                <Link href={category.href} key={category.title} className="group">
                    <Card className="h-full flex flex-col items-center justify-start text-center p-6 transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:scale-105">
                        <div className="mb-4 rounded-full bg-primary/10 p-4">
                            {category.icon}
                        </div>
                        <CardHeader className="p-0 mb-2">
                        <CardTitle className="font-space-grotesk text-lg">{category.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                        <p className="text-muted-foreground font-inter text-sm">{category.description}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    </main>
  );
} 
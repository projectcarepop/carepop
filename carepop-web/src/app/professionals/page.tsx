import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Stethoscope } from "lucide-react";
import React from 'react';

// This is a placeholder component. We will replace this with real data later.
const ProfessionalCard = ({ name, specialty, location }: { name: string; specialty: string; location: string; }) => (
  <div className="border rounded-lg p-4 flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:shadow-lg">
    <div className="w-24 h-24 rounded-full bg-muted mb-4 flex items-center justify-center">
        <Stethoscope className="w-12 h-12 text-muted-foreground" />
    </div>
    <h3 className="font-bold text-lg">{name}</h3>
    <p className="text-primary">{specialty}</p>
    <p className="text-muted-foreground text-sm flex items-center mt-2">
      <MapPin className="w-4 h-4 mr-1" />
      {location}
    </p>
    <Button variant="outline" className="mt-4">View Profile</Button>
  </div>
);

const mockProfessionals = [
    { name: "Dr. Alex Chen", specialty: "General Practice", location: "Manila, NCR" },
    { name: "Dr. Maria dela Cruz", specialty: "Psychology", location: "Quezon City, NCR" },
    { name: "Dr. Fatima Ahmed", specialty: "Dermatology", location: "Cebu City" },
    { name: "Dr. Ben Santos", specialty: "Cardiology", location: "Davao City" },
    { name: "Dr. Emily Garcia", specialty: "Pediatrics", location: "Makati, NCR" },
    { name: "Dr. Kenji Tanaka", specialty: "Endocrinology", location: "Pasig, NCR" },
];

export default function ProfessionalsPage() {
  return (
    <main className="container mx-auto py-16 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-space-grotesk text-primary">
                Find Your Provider
            </h1>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-inter">
                Search our network of trusted, inclusive, and affirming healthcare professionals.
            </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-12 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search by name..." className="pl-10" />
            </div>
            <Select>
                <SelectTrigger className="flex-grow sm:flex-grow-0 sm:w-60">
                    <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="general-practice">General Practice</SelectItem>
                    <SelectItem value="psychology">Psychology</SelectItem>
                    <SelectItem value="dermatology">Dermatology</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                </SelectContent>
            </Select>
            <Button>Search</Button>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProfessionals.map((prof) => (
                <ProfessionalCard key={prof.name} name={prof.name} specialty={prof.specialty} location={prof.location} />
            ))}
        </div>
    </main>
  );
} 
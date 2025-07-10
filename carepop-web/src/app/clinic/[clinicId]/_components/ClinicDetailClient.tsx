'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { type Clinic } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Phone, Globe, Calendar, User, Stethoscope, Search, ArrowLeft } from 'lucide-react';

interface ClinicDetailClientProps {
    clinic: Clinic;
}

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem',
};

const ClinicMap = ({ lat, lng, name }: { lat: number; lng: number; name: string }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places'],
    });

    if (loadError) return <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center text-gray-500">Map cannot be loaded right now, sorry.</div>;
    if (!isLoaded) return <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">Loading Map...</div>;

    const center = { lat, lng };

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={15}
            options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
        >
            <MarkerF position={center} title={name} />
        </GoogleMap>
    );
};

export default function ClinicDetailClient({ clinic }: ClinicDetailClientProps) {
    const { name, street, cityMunicipality, province, zipCode, phone, website, latitude, longitude, services } = clinic;
    const [searchTerm, setSearchTerm] = useState('');

    // Build full address from individual components
    const addressParts = [street, typeof cityMunicipality === 'string' ? cityMunicipality : cityMunicipality?.name, typeof province === 'string' ? province : province?.name, zipCode].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    const directionsUrl = latitude && longitude
        ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', ' + fullAddress)}`;

    // Sample doctors data (simplified)
    const sampleDoctors = [
        { id: '1', fullName: 'Dr. Maria Santos', specialization: 'General Medicine' },
        { id: '2', fullName: 'Dr. Juan Dela Cruz', specialization: 'Pediatrics' },
        { id: '3', fullName: 'Dr. Anna Reyes', specialization: 'Gynecology' },
    ];

    // Filter services based on search only
    const filteredServices = useMemo(() => {
        if (!services) return [];
        return services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        });
    }, [services, searchTerm]);

    return (
        <div className="container mx-auto max-w-7xl py-8 md:py-12 px-4">
            {/* Header Section */}
            <header className="mb-4">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 mb-4">{name}</h1>
                        <div className="space-y-3">
                            {fullAddress && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600">{fullAddress}</span>
                                </div>
                            )}
                            {phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-gray-500" />
                                    <span className="text-gray-600">{phone}</span>
                                </div>
                            )}
                            {website && (
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-gray-500" />
                                    <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                                        {website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Quick Actions Card */}
                    <Card className="lg:w-80">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Book an Appointment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Ready to visit? Book your appointment through our booking system for the best experience.
                            </p>
                            <div className="space-y-2">
                                <Button className="w-full" asChild>
                                    <Link href={`/book-appointment?clinicId=${clinic.id}`}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Book Appointment
                                    </Link>
                                </Button>
                                {latitude && longitude && (
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={directionsUrl} target="_blank" rel="noopener noreferrer">
                                            <Navigation className="h-4 w-4 mr-2" />
                                            Get Directions
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </header>

            {/* Quick Information Section - Moved under header */}
            <section className="mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Operating Hours</h4>
                            <p className="text-sm text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                            <p className="text-sm text-gray-600">Saturday: 8:00 AM - 4:00 PM</p>
                            <p className="text-sm text-gray-600">Sunday: Closed</p>
                        </div>
                        
                        <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Services Available</h4>
                            <p className="text-sm text-gray-600">{services ? services.length : 0} services offered</p>
                        </div>
                        
                        <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Contact</h4>
                            {phone && <p className="text-sm text-gray-600">{phone}</p>}
                            {website && (
                                <a href={website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block">
                                    Visit Website
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <div className="space-y-8">
                {/* Map Section */}
                {latitude && longitude && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Location</h2>
                        <ClinicMap lat={latitude} lng={longitude} name={name} />
                    </section>
                )}
                
                {/* Services Section - Single column with filters */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Stethoscope className="h-6 w-6" />
                        Services Available
                    </h2>
                    
                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {filteredServices && filteredServices.length > 0 ? (
                        <div className="space-y-4">
                            {filteredServices.map(service => (
                                <Card key={service.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                                                {service.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {service.price && (
                                                    <Badge variant="secondary" className="font-medium">
                                                        ₱{parseFloat(service.price).toLocaleString()}
                                                    </Badge>
                                                )}
                                                <Button size="sm" asChild>
                                                    <Link href={`/book-appointment?clinicId=${clinic.id}&serviceId=${service.id}`}>
                                                        Book Now
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : services && services.length > 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-gray-500">No services match your search criteria.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-8">
                                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No specific services are listed for this clinic at the moment.</p>
                                <p className="text-gray-400 text-sm mt-2">Please call the clinic directly for information about available services.</p>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Doctors Section - Single column, simplified */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <User className="h-6 w-6" />
                        Our Doctors
                    </h2>
                    <div className="space-y-4">
                        {sampleDoctors.map(doctor => (
                            <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1">{doctor.fullName}</h3>
                                            <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                                        </div>
                                        <Button size="sm" asChild>
                                            <Link href={`/book-appointment?clinicId=${clinic.id}&doctorId=${doctor.id}`}>
                                                Book with Dr. {doctor.fullName.split(' ')[1]}
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Emergency Notice */}
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <h4 className="font-medium text-red-800 mb-2">Emergency Notice</h4>
                        <p className="text-sm text-red-700">
                            For medical emergencies, please call 911 or go to the nearest emergency room immediately.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

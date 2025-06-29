'use client';

import React from 'react';
import Link from 'next/link';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { type Clinic } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Navigation, Phone, Globe } from 'lucide-react';

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

    if (loadError) return <div>Map cannot be loaded right now, sorry.</div>;
    if (!isLoaded) return <div>Loading Map...</div>;

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
    const { name, address, phone, website, latitude, longitude, services } = clinic;

    const fullAddress = [address?.street, address?.barangay, address?.city, address?.province, address?.postal_code]
        .filter(Boolean)
        .join(', ');

    const directionsUrl = latitude && longitude
        ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', ' + fullAddress)}`;

    return (
        <div className="container mx-auto max-w-5xl py-8 md:py-12 px-4">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900">{name}</h1>
                <div className="mt-4 flex items-center space-x-4 text-gray-600 flex-wrap">
                    {fullAddress && (
                        <span className="flex items-center mt-2">
                            <MapPin className="h-5 w-5 mr-2" />
                            {fullAddress}
                        </span>
                    )}
                    {phone && (
                        <>
                            <Separator orientation="vertical" className="h-5 hidden md:block" />
                            <span className="flex items-center mt-2">
                                <Phone className="h-5 w-5 mr-2" />
                                {phone}
                            </span>
                        </>
                    )}
                    {website && (
                         <>
                            <Separator orientation="vertical" className="h-5 hidden md:block" />
                            <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600 mt-2">
                                <Globe className="h-5 w-5 mr-2" />
                                {website}
                            </a>
                        </>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {latitude && longitude && (
                        <section>
                            <ClinicMap lat={latitude} lng={longitude} name={name} />
                            <Button asChild className="mt-4 w-full md:w-auto">
                                <Link href={directionsUrl} target="_blank" rel="noopener noreferrer">
                                    <Navigation className="mr-2 h-4 w-4" />
                                    Get Directions
                                </Link>
                            </Button>
                        </section>
                    )}
                    
                    <Separator />
                    
                    <section>
                        <h2 className="text-3xl font-bold tracking-tight mb-6">Services Available</h2>
                        {services && services.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {services.map(service => (
                                    <Card key={service.id} className="shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{service.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                            {service.price && <Badge variant="secondary">₱{service.price}</Badge>}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No specific services are listed for this clinic at the moment. Please call for information.</p>
                        )}
                    </section>
                </div>

                <aside className="md:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Book an Appointment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Ready to visit? Book your appointment through our mobile app for the best experience.
                            </p>
                            <Button className="w-full" asChild>
                               <Link href="/book-appointment">
                                 Go to Booking
                               </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

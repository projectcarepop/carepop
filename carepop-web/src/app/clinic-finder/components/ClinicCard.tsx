'use client';

import { Clinic } from "@/lib/types/clinic";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  HeartPulse,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClinicCardProps {
  clinic: Clinic;
}

export default function ClinicCard({ clinic }: ClinicCardProps) {
  const getDisplayAddress = () => {
    if (clinic.full_address) return clinic.full_address;
    const addressParts = [];
    if (clinic.address_street) addressParts.push(clinic.address_street);
    if (clinic.address_barangay) addressParts.push(clinic.address_barangay);
    if (clinic.address_city) addressParts.push(clinic.address_city);
    if (clinic.address_province) addressParts.push(clinic.address_province);
    if (clinic.address_postal_code) addressParts.push(clinic.address_postal_code);
    return addressParts.join(', ');
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-pink-600 dark:text-pink-400">{clinic.name}</CardTitle>
        {clinic.fpop_chapter_affiliation && (
          <Badge variant="secondary" className="mt-1 text-xs">
            FPOP Chapter: {clinic.fpop_chapter_affiliation}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-start">
          <MapPin size={16} className="mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">{getDisplayAddress()}</span>
        </div>
        
        {clinic.contact_phone && (
          <div className="flex items-center">
            <Phone size={16} className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">{clinic.contact_phone}</span>
          </div>
        )}
        
        {clinic.contact_email && (
          <div className="flex items-center">
            <Mail size={16} className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 break-all">{clinic.contact_email}</span>
          </div>
        )}
        
        {clinic.operating_hours && (
          <div className="flex items-start">
            <Clock size={16} className="mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            {typeof clinic.operating_hours === 'string' ? (
                <span className="text-gray-700 dark:text-gray-300">{clinic.operating_hours}</span>
            ) : (
                <ul className="text-gray-700 dark:text-gray-300 list-none space-y-0.5">
                    {clinic.operating_hours.monday && <li>Mon: {clinic.operating_hours.monday}</li>}
                    {clinic.operating_hours.tuesday && <li>Tue: {clinic.operating_hours.tuesday}</li>}
                    {clinic.operating_hours.wednesday && <li>Wed: {clinic.operating_hours.wednesday}</li>}
                    {clinic.operating_hours.thursday && <li>Thu: {clinic.operating_hours.thursday}</li>}
                    {clinic.operating_hours.friday && <li>Fri: {clinic.operating_hours.friday}</li>}
                    {clinic.operating_hours.saturday && <li>Sat: {clinic.operating_hours.saturday}</li>}
                    {clinic.operating_hours.sunday && <li>Sun: {clinic.operating_hours.sunday}</li>}
                    {clinic.operating_hours.notes && <li className="text-xs italic">{clinic.operating_hours.notes}</li>}
                </ul>
            )}
          </div>
        )}

        {clinic.services_offered && clinic.services_offered.length > 0 && (
          <div className="flex items-start">
            <HeartPulse size={16} className="mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Services:</p>
              <div className="flex flex-wrap gap-1">
                {clinic.services_offered.map((service) => (
                  <Badge key={service.id} variant="outline" className="text-xs">
                    {service.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3">
        <Button variant="default" size="sm" className="w-full bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600">
          <Info size={16} className="mr-2" /> View Details / Book
        </Button>
      </CardFooter>
    </Card>
  );
} 
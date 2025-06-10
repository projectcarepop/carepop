'use client';

import { useMemo, useEffect } from "react";
import { Clinic } from "@/lib/types/clinic";
import { Service } from "@/lib/types/service";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Phone, Mail, Globe, MapPin, HeartPulse
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ClinicDetailModalProps {
  clinic: Clinic | null;
  isOpen: boolean;
  onClose: () => void;
  allServices: Service[];
}

export default function ClinicDetailModal({ clinic, isOpen, onClose, allServices }: ClinicDetailModalProps) {
  const services = useMemo(() => {
    if (!clinic || !clinic.services_offered || !allServices) {
      return [];
    }
    return allServices.filter(service => clinic.services_offered?.includes(service.id));
  }, [clinic, allServices]);

  useEffect(() => {
    if (isOpen && clinic) {
      console.log('ClinicDetailModal opened with clinic:', clinic);
      console.log('All available services:', allServices);
      console.log('Filtered services:', services);
    }
  }, [isOpen, clinic, allServices, services]);

  if (!clinic) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{clinic.name}</DialogTitle>
          {clinic.fpop_chapter_affiliation && (
            <DialogDescription>
              FPOP Chapter: {clinic.fpop_chapter_affiliation}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-6 -mr-6 space-y-6 py-4">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start">
                <MapPin size={16} className="mr-3 mt-0.5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{clinic.full_address}</span>
              </div>
              <div className="flex items-start">
                <Phone size={16} className="mr-3 mt-0.5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{clinic.contact_phone || 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <Mail size={16} className="mr-3 mt-0.5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 break-all">{clinic.contact_email || 'N/A'}</span>
              </div>
              {clinic.website_url && (
                <div className="flex items-start">
                  <Globe size={16} className="mr-3 mt-0.5 text-gray-500 flex-shrink-0" />
                  <a href={clinic.website_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline dark:text-pink-400 break-all">
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

          <Separator />
          
          {/* Services Offered */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <HeartPulse size={18} className="mr-2" /> Services Offered
            </h3>
            <div className="flex flex-wrap gap-2">
              {services.length > 0 ? services.map((service) => (
                <Badge key={service.id} variant="secondary">
                  {service.name}
                </Badge>
              )) : (
                <p className="text-sm text-gray-500">No specific services listed for this clinic.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
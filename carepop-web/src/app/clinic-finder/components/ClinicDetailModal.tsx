'use client';

import { Clinic } from "@/lib/types/clinic";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Phone, Mail, Clock, HeartPulse, Globe, Info, CalendarPlus, MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClinicDetailModalProps {
  clinic: Clinic | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClinicDetailModal({ clinic, isOpen, onClose }: ClinicDetailModalProps) {
  if (!clinic) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-pink-600 dark:text-pink-400">{clinic.name}</DialogTitle>
          {clinic.fpop_chapter_affiliation && (
            <DialogDescription>
              FPOP Chapter: {clinic.fpop_chapter_affiliation}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4 py-4 text-sm">
          {clinic.full_address && (
            <div className="flex items-start">
              <MapPin size={18} className="mr-3 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{clinic.full_address}</span>
            </div>
          )}

          {clinic.contact_phone && (
            <div className="flex items-center">
              <Phone size={18} className="mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{clinic.contact_phone}</span>
            </div>
          )}
          
          {clinic.contact_email && (
            <div className="flex items-center">
              <Mail size={18} className="mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 break-all">{clinic.contact_email}</span>
            </div>
          )}

          {clinic.website_url && (
            <div className="flex items-center">
              <Globe size={18} className="mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <a href={clinic.website_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline dark:text-pink-400 break-all">
                {clinic.website_url}
              </a>
            </div>
          )}
          
          {clinic.operating_hours && (
            <div className="flex items-start">
              <Clock size={18} className="mr-3 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Operating Hours:</p>
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
            </div>
          )}

          {clinic.services_offered && clinic.services_offered.length > 0 && (
            <div className="flex items-start">
              <HeartPulse size={18} className="mr-3 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Services Offered:</p>
                <div className="flex flex-wrap gap-2">
                  {clinic.services_offered.map((service, index) => (
                    <Badge key={`${service}-${index}`} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {clinic.additional_notes && (
            <div className="flex items-start">
              <Info size={18} className="mr-3 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Additional Notes:</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{clinic.additional_notes}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start pt-4 gap-2">
          <Button 
            type="button" 
            className="bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
            onClick={() => alert('Book Appointment clicked for: ' + clinic.name)} // Placeholder action
          >
            <CalendarPlus size={16} className="mr-2" />
            Book Appointment
          </Button>
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
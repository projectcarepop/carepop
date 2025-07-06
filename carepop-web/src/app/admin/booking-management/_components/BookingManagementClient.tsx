import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicOverridesManager } from "./ClinicOverridesManager";
import { DoctorScheduleManager } from "./DoctorScheduleManager";
import { DoctorOverridesManager } from './DoctorOverridesManager';

interface BookingManagementClientProps {
    clinicId: string;
}

export const BookingManagementClient: React.FC<BookingManagementClientProps> = ({ clinicId }) => {
    return (
        <Tabs defaultValue="clinic-overrides">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="clinic-overrides">Clinic-Wide Overrides</TabsTrigger>
                <TabsTrigger value="doctor-schedules">Doctor Schedules</TabsTrigger>
                <TabsTrigger value="doctor-overrides">Doctor Overrides</TabsTrigger>
            </TabsList>
            <TabsContent value="clinic-overrides">
                <ClinicOverridesManager clinicId={clinicId} />
            </TabsContent>
            <TabsContent value="doctor-schedules">
                <DoctorScheduleManager clinicId={clinicId} />
            </TabsContent>
            <TabsContent value="doctor-overrides">
                <DoctorOverridesManager clinicId={clinicId} />
            </TabsContent>
        </Tabs>
    )
} 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getFutureAppointments,
  getPastAppointments,
} from "@/lib/actions/appointments";
import AppointmentCard from "@/components/appointments/AppointmentCard";

// TODO: Create AppointmentCard component
// import AppointmentCard from "@/components/appointments/AppointmentCard";

export const dynamic = 'force-dynamic';

export default async function MyAppointmentsPage() {
  const futureAppointmentsResult = await getFutureAppointments();
  const pastAppointmentsResult = await getPastAppointments();

  const upcomingAppointments = futureAppointmentsResult.success ? futureAppointmentsResult.data : [];
  const pastAppointments = pastAppointmentsResult.success ? pastAppointmentsResult.data : [];

  const upcomingError = futureAppointmentsResult.success ? null : futureAppointmentsResult.message;
  const pastError = pastAppointmentsResult.success ? null : pastAppointmentsResult.message;

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">My Appointments</h1>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="mt-6">
            {upcomingError ? (
              <p className="text-red-500">{upcomingError}</p>
            ) : upcomingAppointments.length === 0 ? (
              <p>You have no upcoming appointments.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingAppointments.map(appt => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="past">
          <div className="mt-6">
            {pastError ? (
              <p className="text-red-500">{pastError}</p>
            ) : pastAppointments.length === 0 ? (
              <p>You have no past appointments.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastAppointments.map(appt => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
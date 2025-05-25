import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getFutureAppointments,
  getPastAppointments,
  UserAppointmentDetails
} from "@/lib/actions/appointments";
import AppointmentCard from "@/components/appointments/AppointmentCard";

// TODO: Create AppointmentCard component
// import AppointmentCard from "@/components/appointments/AppointmentCard";

export default async function MyAppointmentsPage() {
  let upcomingAppointments: UserAppointmentDetails[] = [];
  let pastAppointments: UserAppointmentDetails[] = [];
  let upcomingError: string | null = null;
  let pastError: string | null = null;

  try {
    upcomingAppointments = await getFutureAppointments();
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    upcomingError = error instanceof Error ? error.message : "Failed to load upcoming appointments.";
  }

  try {
    pastAppointments = await getPastAppointments();
  } catch (error) {
    console.error("Error fetching past appointments:", error);
    pastError = error instanceof Error ? error.message : "Failed to load past appointments.";
  }

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
import ServicesClient from './_components/ServicesClient';

export default function ManageServicesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Services</h1>
          <p className="text-muted-foreground">
            A list of all medical services offered in the system.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <ServicesClient />
      </div>
    </div>
  );
}

import { type Service } from '@/lib/types'; // Import the main Service type

export default function ServicesClient({ services }: { services: Service[] }) {
  // The hooks `useAuth`, `useQueryClient`, and `useMutation` were removed
  // as they are not currently used in this simplified component.
  // They will be needed again when mutations (add/edit/delete) are implemented.

  return (
    <div>
      <h1 className="text-2xl font-bold">Services</h1>
      <p>Manage your clinic&apos;s services here.</p>
      {/* A data table for services will be implemented here. */}
      <ul>
        {services.map((service) => (
          <li key={service.id}>{service.name}</li>
        ))}
      </ul>
    </div>
  );
}

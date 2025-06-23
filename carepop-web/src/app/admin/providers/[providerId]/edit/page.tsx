import { profilesService } from "@/app/admin/providers/_services/profiles.service";
import { providersService } from "@/app/admin/providers/_services/providers.service";
import { EditProviderForm } from "./_components/EditProviderForm";

interface EditProviderPageProps {
  params: {
    providerId: string;
  };
}

export default async function EditProviderPage({ params }: EditProviderPageProps) {
  const { providerId } = params;

  // Fetch the provider's details and all unlinked profiles concurrently
  const [provider, unlinkedProfiles] = await Promise.all([
    providersService.getProviderById(providerId),
    profilesService.getUnlinkedProfiles(),
  ]);

  if (!provider) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Provider not found</h1>
        <p>The provider with ID {providerId} could not be found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
       <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Edit Provider</h2>
        <p className="text-muted-foreground">
          Link this provider to a user profile and manage their details.
        </p>
      </div>
      <EditProviderForm provider={provider} profiles={unlinkedProfiles} />
    </div>
  );
} 
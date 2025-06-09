import { ServiceCategoryForm } from '../components/ServiceCategoryForm';

export default function NewServiceCategoryPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
            <h1 className="text-3xl font-bold">Create New Service Category</h1>
            <p className="text-muted-foreground mt-2">
                Fill out the form below to add a new category for your services.
            </p>
        </div>
        <ServiceCategoryForm />
      </div>
    </div>
  );
} 
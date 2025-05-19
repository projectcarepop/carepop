import React from 'react';

const ClinicFinderPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-pink-600">Find a Clinic</h1>
      </header>
      <main>
        <section className="mb-8 p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Search for Clinics and Healthcare Providers</h2>
          <p className="text-gray-600 mb-4 text-center">
            This is a placeholder page for finding clinics. You&apos;ll be able to search by location, services, and more.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Search Filters</h3>
            <p className="text-gray-600">
              Filters for location, specialty, services offered, etc., will be here.
            </p>
          </div>
          <div className="p-6 bg-gray-50 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Clinic Listings / Map</h3>
            <p className="text-gray-600">
              Clinic results will be displayed here, possibly with a map view.
            </p>
          </div>
        </section>
      </main>
      <footer className="mt-12 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} CarePop. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ClinicFinderPage; 
import React from 'react';

const BookServicePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-pink-600">Book a Service</h1>
      </header>
      <main>
        <section className="mb-8 p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Find and Book Healthcare Services</h2>
          <p className="text-gray-600 mb-4 text-center">
            This is a placeholder page for booking services. You&apos;ll be able to search for services and schedule them here.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Search Services</h3>
            <p className="text-gray-600">
              A search form or filter options for services will be here.
            </p>
          </div>
          <div className="p-6 bg-gray-50 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Available Professionals</h3>
            <p className="text-gray-600">
              List of professionals or clinics offering the selected service.
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

export default BookServicePage; 
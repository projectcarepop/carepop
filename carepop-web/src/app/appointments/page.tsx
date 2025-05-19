import React from 'react';

const AppointmentsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-pink-600">Your Appointments</h1>
      </header>
      <main>
        <section className="mb-8 p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Manage Your Appointments</h2>
          <p className="text-gray-600 mb-4 text-center">
            This is a placeholder page for viewing and managing your appointments. Full functionality will be added soon.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Upcoming Appointments</h3>
            <p className="text-gray-600">
              A list of upcoming appointments will be displayed here.
            </p>
          </div>
          <div className="p-6 bg-gray-50 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Past Appointments</h3>
            <p className="text-gray-600">
              A history of past appointments will be available here.
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

export default AppointmentsPage; 
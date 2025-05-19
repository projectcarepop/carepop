import React from 'react';

const DownloadAppPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-pink-600">Download Our App</h1>
      </header>
      <main>
        <section className="mb-8 p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Get CarePop on Your Mobile Device!</h2>
          <p className="text-gray-600 mb-4 text-center">
            Experience seamless healthcare management on the go. Download the CarePop mobile app today!
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-gray-50 shadow-md rounded-lg text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Download for iOS</h3>
            {/* Placeholder for App Store badge/link */}
            <div className="h-16 w-48 bg-gray-300 mx-auto my-4 flex items-center justify-center text-gray-500 rounded">
              App Store Badge
            </div>
            <p className="text-gray-600">
              Available soon on the Apple App Store.
            </p>
          </div>
          <div className="p-6 bg-gray-50 shadow-md rounded-lg text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Download for Android</h3>
            {/* Placeholder for Google Play badge/link */}
            <div className="h-16 w-48 bg-gray-300 mx-auto my-4 flex items-center justify-center text-gray-500 rounded">
              Google Play Badge
            </div>
            <p className="text-gray-600">
              Available soon on the Google Play Store.
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

export default DownloadAppPage; 
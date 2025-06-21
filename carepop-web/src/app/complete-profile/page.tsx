import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { CompleteProfileForm } from './_components/complete-profile-form';
import * as fs from 'fs/promises';
import path from 'path';

async function getPsgcData() {
  const dataPath = path.join(process.cwd(), 'public/data/psgc');
  const provincesData = await fs.readFile(path.join(dataPath, 'provinces.json'), 'utf-8');
  const citiesData = await fs.readFile(path.join(dataPath, 'cities-municipalities.json'), 'utf-8');
  const barangaysData = await fs.readFile(path.join(dataPath, 'barangays.json'), 'utf-8');
  
  return {
    provinces: JSON.parse(provincesData),
    cities: JSON.parse(citiesData),
    barangays: JSON.parse(barangaysData)
  };
}

export default async function CompleteProfilePage() {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const psgc = await getPsgcData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <CompleteProfileForm userProfile={user.publicMetadata} psgc={psgc} />
    </div>
  );
} 
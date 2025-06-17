import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreateProfileClientPage } from './CreateProfileClientPage';
import { promises as fs } from 'fs';
import path from 'path';

// Types for our address data
interface Province { province_code: string; province_name: string; }
interface CityMunicipality { city_code: string; city_name: string; province_code: string; }
interface Barangay { brgy_code: string; brgy_name: string; city_code: string; }

// Fetches all address data on the server
async function getPsgcData() {
    try {
        const dataDirectory = path.join(process.cwd(), 'public/data/psgc');
        const [provinces, cities, barangays] = await Promise.all([
            fs.readFile(path.join(dataDirectory, 'provinces.json'), 'utf8'),
            fs.readFile(path.join(dataDirectory, 'cities-municipalities.json'), 'utf8'),
            fs.readFile(path.join(dataDirectory, 'barangays.json'), 'utf8'),
        ]);
        return {
            provinces: JSON.parse(provinces) as Province[],
            cities: JSON.parse(cities) as CityMunicipality[],
            barangays: JSON.parse(barangays) as Barangay[],
        }
    } catch (error) {
        console.error("Failed to load PSGC data:", error);
        // Return empty arrays on error so the page can still render
        return { provinces: [], cities: [], barangays: [] };
    }
}

export default async function CreateProfilePage() {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch the user's current profile from the server
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id ?? '')
        .single();
        
    const psgcData = await getPsgcData();
        
    return (
        <CreateProfileClientPage
            userProfile={profile}
            psgc={psgcData}
        />
    );
}
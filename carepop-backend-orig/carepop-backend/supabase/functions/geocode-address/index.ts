import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Geocode Address function started');

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { address, street, city, country } = await req.json();
    let query = '';

    if (address) {
      query = address;
    } else if (street && city && country) {
      query = `${street}, ${city}, ${country}`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Missing address or street/city/country parameters' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const encodedQuery = encodeURIComponent(query);
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&countrycodes=ph`; // Added countrycodes=ph for Philippines

    console.log(`Geocoding query: ${query}`);
    console.log(`Nominatim URL: ${geocodeUrl}`);

    const nominatimResponse = await fetch(geocodeUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'CarePoP Geocoding Client v0.1 (projectcarepop@gmail.com)', // Replace with actual contact later
      },
    });

    console.log(`Nominatim response status: ${nominatimResponse.status}`);

    if (!nominatimResponse.ok) {
      const errorBody = await nominatimResponse.text();
      console.error(`Nominatim API error: ${nominatimResponse.status}, Body: ${errorBody}`);
      return new Response(
        JSON.stringify({ error: `Nominatim API error: ${nominatimResponse.status}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: nominatimResponse.status,
        }
      );
    }

    const data = await nominatimResponse.json();
    console.log('Nominatim response data:', data);

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Address not found or no results from Nominatim' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Assuming the first result is the most relevant
    const { lat, lon } = data[0];

    if (!lat || !lon) {
        return new Response(
            JSON.stringify({ error: 'Latitude or Longitude not found in Nominatim response' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404,
            }
          );
    }

    return new Response(
      JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lon) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 
import config from '../../config/config';

class NavigationService {
  private GOOGLE_API_KEY = config.google.apiKey;

  public async getDirections(
    origin: string,
    destination: string,
    mode: 'driving' | 'walking'
  ): Promise<any> {
    // In a real implementation, you would use a library like axios
    // or the built-in fetch to call the Google Directions API.
    // For now, this is a placeholder.
    
    if (!this.GOOGLE_API_KEY) {
      throw new Error('Google API key is not configured.');
    }

    console.log(`Fetching directions from ${origin} to ${destination} via ${mode}`);
    
    // const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${this.GOOGLE_API_KEY}`;
    // const response = await fetch(url);
    // const data = await response.json();
    
    // return data;

    // Returning mock data for now.
    return {
      status: "OK",
      routes: [{
        summary: "Mock Route",
        legs: [{
          distance: { text: "10 km", value: 10000 },
          duration: { text: "30 mins", value: 1800 },
          steps: [
            { distance: {text: "1km"}, duration: {text: "5mins"}, html_instructions: "Turn left on Main St", travel_mode: "DRIVING"},
            { distance: {text: "9km"}, duration: {text: "25mins"}, html_instructions: "Continue on Highway 1", travel_mode: "DRIVING"}
          ]
        }]
      }]
    };
  }
}

export const navigationService = new NavigationService(); 
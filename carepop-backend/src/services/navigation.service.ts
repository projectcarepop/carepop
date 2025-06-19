import config from '../config/config';

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
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${this.GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data;
  }
}

export const navigationService = new NavigationService(); 
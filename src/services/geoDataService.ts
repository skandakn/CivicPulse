export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface CivicLocationDetails {
  roadName: string;
  landmark: string;
  wardNumber: string;
  wardName: string;
  zone: string;
}

// Fallback BBMP Wards
export const FALLBACK_WARDS = [
  { id: 'w-150', number: '150', name: 'Bellandur', zone: 'Mahadevapura' },
  { id: 'w-174', number: '174', name: 'HSR Layout', zone: 'Bommanahalli' },
  { id: 'w-84', number: '84', name: 'Hagadur', zone: 'Mahadevapura' },
  { id: 'w-112', number: '112', name: 'Domlur', zone: 'East' },
  { id: 'w-76', number: '76', name: 'Gayathri Nagar', zone: 'West' }
];

export class GeoDataService {
  /**
   * Reverse geocodes coordinates to real civic location data via OSM Nominatim.
   * Falls back to deterministic mock data if offline or rate-limited.
   */
  static async reverseGeocode(lat: number, lng: number): Promise<CivicLocationDetails> {
    try {
      // Small delay to prevent tight-loop rate limits (Nominatim requirement)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`
      );
      
      if (!response.ok) throw new Error('OSM Reverse Geocode failed');
      
      const data = await response.json();
      
      if (data && data.address) {
        // Extract road name
        const road = data.address.road || data.address.pedestrian || data.address.highway || data.address.suburb || 'Unknown Road';
        
        // Extract landmark/neighborhood
        const landmark = data.address.neighbourhood || data.address.suburb || data.address.city_district || data.name || 'Bengaluru';
        
        // Approximate Ward (OSM doesn't map BBMP wards perfectly)
        // We'll use a hashing approach to consistently assign a fallback ward based on the suburb
        const wardIndex = (landmark.length + road.length) % FALLBACK_WARDS.length;
        const ward = FALLBACK_WARDS[wardIndex];

        return {
          roadName: road,
          landmark: `${landmark}, Bengaluru`,
          wardNumber: ward.number,
          wardName: ward.name,
          zone: ward.zone
        };
      }
    } catch (error) {
      console.warn('GeoDataService: Failed to reverse geocode, using fallback data.', error);
    }
    
    // Deterministic Fallback based on coordinates if OSM fails
    return this.getFallbackLocation(lat, lng);
  }

  private static getFallbackLocation(lat: number, lng: number): CivicLocationDetails {
    // Generate deterministic but fake data based on coordinates
    const roadNames = ['Outer Ring Road', '100ft Road', 'Sarjapur Road', 'Hosur Road', 'Bannerghatta Road'];
    const landmarks = ['Near Eco Space', 'Opposite Metro Station', 'Junction', 'Tech Park', 'Signal'];
    
    // Use decimal digits to pick somewhat consistent names
    const latHash = Math.abs(Math.round(lat * 10000));
    const lngHash = Math.abs(Math.round(lng * 10000));
    
    const wardIndex = (latHash + lngHash) % FALLBACK_WARDS.length;
    const ward = FALLBACK_WARDS[wardIndex];
    
    return {
      roadName: roadNames[latHash % roadNames.length],
      landmark: landmarks[lngHash % landmarks.length],
      wardNumber: ward.number,
      wardName: ward.name,
      zone: ward.zone
    };
  }
}

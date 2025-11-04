const axios = require('axios');

class GeocodingService {
  constructor() {
    this.nominatimBaseUrl = process.env.NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org';
    this.locationIQApiKey = process.env.LOCATIONIQ_API_KEY;
    this.locationIQBaseUrl = 'https://us1.locationiq.com/v1';
  }

  async geocodeAddress(address) {
    try {
      // Intentar con LocationIQ si está disponible (mejor precisión)
      if (this.locationIQApiKey) {
        try {
          return await this.geocodeWithLocationIQ(address);
        } catch (error) {
          console.warn('LocationIQ falló, usando Nominatim:', error.message);
        }
      }

      // Fallback a Nominatim (gratuito)
      return await this.geocodeWithNominatim(address);
    } catch (error) {
      console.error('Error en geocodificación:', error);
      throw new Error('No se pudo geocodificar la dirección');
    }
  }

  async geocodeWithNominatim(address) {
    const response = await axios.get(`${this.nominatimBaseUrl}/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        'accept-language': 'es'
      },
      headers: {
        'User-Agent': 'SchoolTrack/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name,
        address: result.address || {},
        type: result.type,
        importance: result.importance,
        confidence: this.calculateConfidence(result)
      };
    }

    throw new Error('No se encontraron resultados');
  }

  async geocodeWithLocationIQ(address) {
    const response = await axios.get(`${this.locationIQBaseUrl}/search.php`, {
      params: {
        key: this.locationIQApiKey,
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        'accept-language': 'es'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name,
        address: result.address || {},
        type: result.type,
        importance: result.importance,
        confidence: this.calculateConfidence(result)
      };
    }

    throw new Error('No se encontraron resultados');
  }

  async reverseGeocode(latitude, longitude) {
    try {
      // Intentar con LocationIQ si está disponible
      if (this.locationIQApiKey) {
        try {
          return await this.reverseGeocodeWithLocationIQ(latitude, longitude);
        } catch (error) {
          console.warn('LocationIQ falló, usando Nominatim:', error.message);
        }
      }

      // Fallback a Nominatim
      return await this.reverseGeocodeWithNominatim(latitude, longitude);
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      throw new Error('No se pudo obtener la dirección');
    }
  }

  async reverseGeocodeWithNominatim(latitude, longitude) {
    const response = await axios.get(`${this.nominatimBaseUrl}/reverse`, {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1,
        'accept-language': 'es'
      },
      headers: {
        'User-Agent': 'SchoolTrack/1.0'
      }
    });

    if (response.data) {
      return {
        latitude: latitude,
        longitude: longitude,
        display_name: response.data.display_name,
        address: response.data.address || {},
        type: response.data.type,
        confidence: this.calculateConfidence(response.data)
      };
    }

    throw new Error('No se pudo obtener la dirección');
  }

  async reverseGeocodeWithLocationIQ(latitude, longitude) {
    const response = await axios.get(`${this.locationIQBaseUrl}/reverse.php`, {
      params: {
        key: this.locationIQApiKey,
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1,
        'accept-language': 'es'
      }
    });

    if (response.data) {
      return {
        latitude: latitude,
        longitude: longitude,
        display_name: response.data.display_name,
        address: response.data.address || {},
        type: response.data.type,
        confidence: this.calculateConfidence(response.data)
      };
    }

    throw new Error('No se pudo obtener la dirección');
  }

  calculateConfidence(result) {
    // Calcular un score de confianza basado en varios factores
    let confidence = 0;

    // Importancia del resultado
    if (result.importance) {
      confidence += Math.min(result.importance * 10, 30);
    }

    // Tipo de resultado
    const highConfidenceTypes = ['house', 'residential', 'school', 'building'];
    const mediumConfidenceTypes = ['road', 'suburb', 'village', 'town', 'city'];
    
    if (highConfidenceTypes.includes(result.type)) {
      confidence += 40;
    } else if (mediumConfidenceTypes.includes(result.type)) {
      confidence += 20;
    }

    // Completitud de la dirección
    const address = result.address || {};
    if (address.house_number && address.road) {
      confidence += 20;
    } else if (address.road) {
      confidence += 10;
    }

    // Limitar entre 0 y 100
    return Math.min(confidence, 100);
  }

  async batchGeocode(addresses) {
    try {
      const results = [];
      
      // Procesar en lotes pequeños para no exceder límites de API
      const batchSize = 5;
      
      for (let i = 0; i < addresses.length; i += batchSize) {
        const batch = addresses.slice(i, i + batchSize);
        const batchPromises = batch.map(address => this.geocodeAddress(address));
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push({
              error: result.reason.message,
              address: batch[index]
            });
          }
        });

        // Pequeña pausa para respetar límites de API
        if (i + batchSize < addresses.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return results;
    } catch (error) {
      console.error('Error en geocodificación por lotes:', error);
      throw error;
    }
  }

  formatAddress(address) {
    const parts = [];
    
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    if (address.suburb) parts.push(address.suburb);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    
    return parts.join(', ');
  }
}

module.exports = new GeocodingService();
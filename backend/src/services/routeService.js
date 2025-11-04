const axios = require('axios');

class RouteService {
  constructor() {
    this.graphHopperApiKey = process.env.GRAPHHOPPER_API_KEY;
    this.graphHopperBaseUrl = 'https://graphhopper.com/api/1';
  }

  async calculateRoute(stops) {
    try {
      if (!this.graphHopperApiKey) {
        throw new Error('GraphHopper API key no configurada');
      }

      // Preparar puntos para GraphHopper
      const points = stops.map(stop => 
        `${stop.coordinates.latitude},${stop.coordinates.longitude}`
      ).join('&point=');

      const response = await axios.get(
        `${this.graphHopperBaseUrl}/route?point=${points}&vehicle=car&locale=es&key=${this.graphHopperApiKey}&calc_points=true&instructions=true`
      );

      if (response.data.paths && response.data.paths.length > 0) {
        const path = response.data.paths[0];
        return {
          distance: path.distance, // en metros
          time: path.time, // en milisegundos
          points: path.points, // coordenadas codificadas
          instructions: path.instructions,
          bbox: path.bbox
        };
      }

      throw new Error('No se pudo calcular la ruta');
    } catch (error) {
      console.error('Error calculando ruta con GraphHopper:', error);
      // Fallback a cálculo simple basado en línea recta
      return this.calculateSimpleRoute(stops);
    }
  }

  async calculateRouteGeometry(stops) {
    try {
      const routeData = await this.calculateRoute(stops);
      
      if (routeData.points) {
        // Decodificar puntos de GraphHopper (formato polyline)
        return this.decodePolyline(routeData.points);
      }
      
      // Fallback: crear línea simple entre paradas
      return this.createSimpleGeometry(stops);
    } catch (error) {
      console.error('Error calculando geometría:', error);
      return this.createSimpleGeometry(stops);
    }
  }

  calculateSimpleRoute(stops) {
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 0; i < stops.length - 1; i++) {
      const distance = this.calculateDistance(
        stops[i].coordinates,
        stops[i + 1].coordinates
      );
      totalDistance += distance;
      // Estimar tiempo asumiendo 30 km/h promedio
      totalTime += (distance / 30) * 3600000; // en milisegundos
    }

    return {
      distance: totalDistance * 1000, // convertir a metros
      time: totalTime,
      points: null,
      instructions: [],
      bbox: null
    };
  }

  createSimpleGeometry(stops) {
    return stops.map(stop => [
      stop.coordinates.longitude,
      stop.coordinates.latitude
    ]);
  }

  calculateDistance(coord1, coord2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(coord1.latitude)) * 
              Math.cos(this.toRadians(coord2.latitude)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en km
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  decodePolyline(str) {
    // Decodificador básico de polyline
    const coordinates = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < str.length) {
      let shift = 0;
      let result = 0;
      let byte;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      coordinates.push([lng / 1e5, lat / 1e5]);
    }

    return coordinates;
  }

  async getETA(origin, destination) {
    try {
      const response = await axios.get(
        `${this.graphHopperBaseUrl}/route?point=${origin.latitude},${origin.longitude}&point=${destination.latitude},${destination.longitude}&vehicle=car&key=${this.graphHopperApiKey}`
      );

      if (response.data.paths && response.data.paths.length > 0) {
        return {
          duration: response.data.paths[0].time, // milisegundos
          distance: response.data.paths[0].distance // metros
        };
      }

      // Fallback: cálculo simple
      const distance = this.calculateDistance(origin, destination);
      const duration = (distance / 30) * 3600000; // 30 km/h promedio
      
      return {
        duration,
        distance: distance * 1000
      };
    } catch (error) {
      console.error('Error calculando ETA:', error);
      
      // Fallback
      const distance = this.calculateDistance(origin, destination);
      const duration = (distance / 30) * 3600000;
      
      return {
        duration,
        distance: distance * 1000
      };
    }
  }

  async optimizeRoute(stops) {
    try {
      // Implementación básica de optimización de ruta
      // En producción, usar algoritmos más sofisticados como TSP
      
      if (stops.length <= 2) {
        return stops;
      }

      // Ordenar por ángulo respecto al punto inicial
      const start = stops[0];
      const others = stops.slice(1);
      
      others.sort((a, b) => {
        const angleA = Math.atan2(
          a.coordinates.latitude - start.coordinates.latitude,
          a.coordinates.longitude - start.coordinates.longitude
        );
        const angleB = Math.atan2(
          b.coordinates.latitude - start.coordinates.latitude,
          b.coordinates.longitude - start.coordinates.longitude
        );
        return angleA - angleB;
      });

      return [start, ...others];
    } catch (error) {
      console.error('Error optimizando ruta:', error);
      return stops;
    }
  }
}

module.exports = new RouteService();
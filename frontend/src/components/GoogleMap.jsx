import React, { useEffect, useRef, useState } from 'react';
import '../styles/GoogleMap.css';

const GoogleMap = ({ 
  center, 
  markers = [], 
  zoom = 14, 
  height = '400px',
  showUserLocation = true,
  onMarkerClick,
  showRoute = false,
  destination = null
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const markersRef = useRef([]);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    // Check if Google Maps script is loaded
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (map && markers.length > 0) {
      updateMarkers();
    }
  }, [map, markers]);

  useEffect(() => {
    if (map && showRoute && destination && userLocation) {
      displayRoute();
    }
  }, [map, showRoute, destination, userLocation]);

  const loadGoogleMapsScript = () => {
    // Check if script is already loading
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Map functionality will be limited.');
      // Show placeholder instead
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initializeMap();
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    const mapOptions = {
      center: center || { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore
      zoom: zoom,
      styles: [
        {
          "elementType": "geometry",
          "stylers": [{"color": "#1d1d1d"}]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [{"color": "#1a1a1a"}]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#8a8a8a"}]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [{"color": "#2c2c2c"}]
        },
        {
          "featureType": "road",
          "elementType": "geometry.stroke",
          "stylers": [{"color": "#212121"}]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#9a9a9a"}]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{"color": "#0e1626"}]
        }
      ]
    };

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);

    // Initialize directions service and renderer
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 4
      },
      suppressMarkers: false
    });
    directionsRendererRef.current.setMap(newMap);

    // Get user location
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          
          // Add user location marker
          new window.google.maps.Marker({
            position: userPos,
            map: newMap,
            title: 'Your Location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          });

          // Center map on user location if no center provided
          if (!center) {
            newMap.setCenter(userPos);
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  };

  const updateMarkers = () => {
    if (!window.google || !map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: map,
        title: markerData.title,
        icon: markerData.icon || {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });

      if (markerData.info) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #000; padding: 8px;">
              <h3 style="margin: 0 0 8px 0;">${markerData.title}</h3>
              <p style="margin: 0;">${markerData.info}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          if (onMarkerClick) {
            onMarkerClick(markerData);
          }
        });
      }

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(markerData => {
        bounds.extend({ lat: markerData.lat, lng: markerData.lng });
      });
      if (userLocation) {
        bounds.extend(userLocation);
      }
      map.fitBounds(bounds);
    }
  };

  const displayRoute = () => {
    if (!window.google || !directionsServiceRef.current || !directionsRendererRef.current) return;

    const request = {
      origin: userLocation,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
      } else {
        console.error('Directions request failed:', status);
      }
    });
  };

  // Fallback UI when Google Maps is not available
  if (!window.google && !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="map-placeholder" style={{ height }}>
        <div className="map-placeholder-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#3b82f6"/>
          </svg>
          <h3>Map View</h3>
          <p>Google Maps integration requires API key</p>
          <p className="map-placeholder-hint">Add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="google-map-container" style={{ height }}>
      <div ref={mapRef} className="google-map" style={{ height: '100%' }}></div>
      {!window.google && (
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;

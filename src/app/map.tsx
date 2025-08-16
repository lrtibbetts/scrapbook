"use client"

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (map.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        
        if (mapContainer.current) {
            map.current = new mapboxgl.Map({
              container: mapContainer.current,
              style: 'mapbox://styles/mapbox/outdoors-v12',
              center: [12.1357, 46.5369], // Cortina d'Ampezzo, Italy
              zoom: 9
            });
          }
    }, []);

    return (
        <div>
            <p>The Dolomites</p>
            <div 
                ref={mapContainer} 
                style={{ width: '100%', height: '400px'}}
            />
        </div>
    );
}
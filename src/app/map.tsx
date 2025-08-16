"use client"

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/standard-satellite',
            center: [12.0057, 46.5180], // Passo Falzarego, Italy
            zoom: 12
        });

        map.current.on('style.load', () => {
            map.current?.setConfig(
                'basemap',
                {
                    lightPreset: 'dawn',
                    showRoadsAndTransit: false,
                    showRoadLabels: false,
                    showTransitLabels: false,
                    showLandBoundaries: false,
                    showAdminBoundaries: false,
                    font: 'Roboto Mono'
                }
            );
        });
    }, []);

    return (
        <div>
            <div 
                ref={mapContainer} 
                style={{ width: '100%', height: '100vh'}}
            />
        </div>
    );
}
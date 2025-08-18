"use client"

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { loadGPXRoute } from './route-loader';

export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/standard-satellite',
            center: [12.0406, 46.4996], // Rifugio Averau
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


            if (map.current) {
                loadGPXRoute(map.current, 'day-1.gpx', 'day-1', '#ff3300');
                loadGPXRoute(map.current, 'day-2.gpx', 'day-2', '#00ffcc');
                loadGPXRoute(map.current, 'day-3.gpx', 'day-3', '#8b3a62');
                loadGPXRoute(map.current, 'day-4.gpx', 'day-4', '#ccff00');
                loadGPXRoute(map.current, 'day-5.gpx', 'day-5', '#0099aa');
            }
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
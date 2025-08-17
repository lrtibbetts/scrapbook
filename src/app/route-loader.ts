"use client"

export async function loadGPXRoute(map: mapboxgl.Map | null, gpxFilePath: string, routeId: string = 'route',  color: string) {
    if (!map) return;

    try {
        const response = await fetch(`/gpx/${gpxFilePath}`);
        const gpxText = await response.text();
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxText, 'text/xml');
        
        // Extract track points (trkpt elements)
        const trackPoints = gpxDoc.querySelectorAll('trkpt');
        const coordinates = Array.from(trackPoints).map(point => [
            parseFloat(point.getAttribute('lon')!),
            parseFloat(point.getAttribute('lat')!)
        ]);

        if (coordinates.length > 0) {
            // Add route data source
            map.addSource(`${routeId}-source`, {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': coordinates
                    }
                }
            });

            // Add route layer
            map.addLayer({
                'id': `${routeId}-line`,
                'type': 'line',
                'source': `${routeId}-source`,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': color,
                    'line-width': 3,
                    'line-opacity': 0.9
                }
            });

            // Add start/end markers
            const startPoint = coordinates[0];
            const endPoint = coordinates[coordinates.length - 1];
            
            map.addSource(`${routeId}-points`, {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'properties': { 'title': 'Start' },
                            'geometry': { 'type': 'Point', 'coordinates': startPoint }
                        },
                        {
                            'type': 'Feature',
                            'properties': { 'title': 'End' },
                            'geometry': { 'type': 'Point', 'coordinates': endPoint }
                        }
                    ]
                }
            });

            map.addLayer({
                'id': `${routeId}-points`,
                'type': 'circle',
                'source': `${routeId}-points`,
                'paint': {
                    'circle-radius': 4,
                    'circle-color': color
                }
            });
        }

    } catch (error) {
        console.error('Error loading GPX file: ', error);
    }
}
import exifr from 'exifr';
import mapboxgl from 'mapbox-gl';

export interface PhotoLocation {
    lat: number;
    lng: number;
    filename: string;
    url: string;
    timestamp?: Date;
}

export interface PhotoFeature extends GeoJSON.Feature {
    geometry: GeoJSON.Point;
    properties: {
        filename: string;
        url: string;
        timestamp?: string;
        index: number;
    };
}

export async function loadPhotoLocations(): Promise<PhotoLocation[]> {
    try {
        const response = await fetch('/photos/manifest.json');
        const photoFiles: string[] = await response.json();
        
        const photoLocations: PhotoLocation[] = [];
        
        for (const filename of photoFiles) {
            try {
                const photoResponse = await fetch(`/photos/${filename}`);
                const photoBlob = await photoResponse.blob();
                
                // Extract EXIF data
                const exifData = await exifr.parse(photoBlob);
                
                if (exifData?.latitude && exifData?.longitude) {
                    const photoLocation: PhotoLocation = {
                        lat: exifData.latitude,
                        lng: exifData.longitude,
                        filename: filename,
                        url: `/photos/${filename}`,
                        timestamp: exifData.DateTimeOriginal
                    };
                    photoLocations.push(photoLocation);
                    console.log(`Found GPS for ${filename}: ${exifData.latitude}, ${exifData.longitude}`);
                } else {
                    console.log(`No GPS data found in ${filename}`);
                }
            } catch (error) {
                console.error(`Error reading EXIF data from ${filename}:`, error);
            }
        }
        
        return photoLocations;
        
    } catch (error) {
        console.error('Error loading photos from public folder:', error);
        return [];
    }
}

export function addPhotoMarkersToMap(map: mapboxgl.Map, photoLocations: PhotoLocation[]) {
    if (photoLocations.length === 0) return;

    // Create GeoJSON for photo locations
    const photoGeoJSON = createPhotoGeoJSON(photoLocations);

    // Add source and layer
    map.addSource('photo-points', {
        type: 'geojson',
        data: photoGeoJSON
    });

    map.addLayer({
        id: 'photo-markers',
        type: 'circle',
        source: 'photo-points',
        paint: {
            'circle-radius': 6,
            'circle-color': '#8b3a62', // TODO match track where photo is located
        }
    });
}

export function addPhotoPopupHandlers(map: mapboxgl.Map) {
    // Add click event for photo popups
    map.on('click', 'photo-markers', (e) => {
        const features = e.features;
        if (!features || features.length === 0) return;

        const feature = features[0];
        const { filename, url, timestamp } = feature.properties!;

        if (feature.geometry.type !== 'Point') {
            console.error('Expected Point geometry for photo marker');
            return;
        }
        const [lng, lat] = (feature.geometry).coordinates;

        const popupContent = `
            <div style="max-width: 300px;">
                <img src="${url}" alt="${filename}" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 8px;"/>
                <div style="font-family: 'Roboto Mono', monospace; font-size: 12px;">
                    <strong>${filename}</strong><br/>
                    ${lat.toFixed(6)}, ${lng.toFixed(6)}<br/>
                    ${timestamp ? new Date(timestamp).toLocaleDateString() : ''}
                </div>
            </div>
        `;

        new mapboxgl.Popup({ offset: 25 })
            .setLngLat([lng, lat])
            .setHTML(popupContent)
            .addTo(map);
    });

    // Change cursor on hover
    map.on('mouseenter', 'photo-markers', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'photo-markers', () => {
        map.getCanvas().style.cursor = '';
    });
}

function createPhotoGeoJSON(photoLocations: PhotoLocation[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
    return {
        type: 'FeatureCollection' as const,
        features: photoLocations.map((photo, index) => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: [photo.lng, photo.lat]
            },
            properties: {
                filename: photo.filename,
                url: photo.url,
                timestamp: photo.timestamp?.toISOString(),
                index
            }
        }))
    };
}

// frontend/script.js (Complete Fix)

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // UPDATED: Using the new access token you provided.
    const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoiam9zaGlhZGl0aTI5IiwiYSI6ImNtY3g5YjJxODA0Z3cycnB3a25tNW50aTcifQ.o_G39oljPXd-m3-U8WdFKA';
    const API_BASE_URL = 'http://localhost:3000';

    // --- DOM ELEMENTS ---
    const riskFeed = document.getElementById('risk-feed');
    const systemLog = document.getElementById('system-log');
    
    // --- UI FUNCTIONS ---
    const logMessage = (message, isError = false) => {
        const time = new Date().toLocaleTimeString();
        const logEntry = document.createElement('p');
        if (isError) {
            logEntry.style.color = '#dc3545';
            logEntry.innerHTML = `<span>${time}:</span> <strong>ERROR: ${message}</strong>`;
        } else {
            logEntry.innerHTML = `<span>${time}:</span> ${message}`;
        }
        systemLog.prepend(logEntry);
    };

    const displayRiskEvent = (event, onSimulate) => {
        const eventElement = document.createElement('div');
        eventElement.className = 'risk-item';
        eventElement.innerHTML = `
            <h4>${event.type}: ${event.description}</h4>
            <p>Impacts Shipment: <strong>${event.affectedShipment}</strong></p>
        `;
        eventElement.onclick = () => {
            logMessage(`Operator clicked on risk: ${event.description}`);
            onSimulate(event.affectedShipment, event.location);
            document.querySelectorAll('.risk-item').forEach(item => item.style.backgroundColor = '#fff');
            eventElement.style.backgroundColor = '#e9f5ff';
        };
        riskFeed.appendChild(eventElement);
    };

    // --- MAP FUNCTIONS ---
    const initializeMap = () => {
        if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN.includes('YOUR_TOKEN')) {
            logMessage('Mapbox Access Token is missing or invalid in script.js!', true);
            return null;
        }
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        return new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [-118.2437, 34.0522],
            zoom: 9
        });
    };

    const addMarkers = (map, stores, dcs) => {
        stores.forEach(store => {
            new mapboxgl.Marker({ color: '#007bff' })
              .setLngLat([store.location.lng, store.location.lat])
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>${store.name}</h3>`))
              .addTo(map);
        });
        dcs.forEach(dc => {
            new mapboxgl.Marker({ color: '#ffc107' })
              .setLngLat([dc.location.lng, dc.location.lat])
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>${dc.name}</h3>`))
              .addTo(map);
        });
    };

    const drawRoute = (map, routeId, fromCoords, toCoords, color = '#17a2b8') => {
        const geojson = { type: 'Feature', geometry: { type: 'LineString', coordinates: [fromCoords, toCoords] } };
        if (map.getSource(routeId)) {
            map.getSource(routeId).setData(geojson);
        } else {
            map.addSource(routeId, { type: 'geojson', data: geojson });
            map.addLayer({
                id: routeId,
                type: 'line',
                source: routeId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': color, 'line-width': 4, 'line-opacity': 0.8 }
            });
        }
    };

    const updateRouteLook = (map, routeId, color, dashed = false) => {
        if (map.getLayer(routeId)) {
            map.setPaintProperty(routeId, 'line-color', color);
            if (dashed) map.setPaintProperty(routeId, 'line-dasharray', [2, 2]);
        }
    };

    // --- API FUNCTIONS ---
    const fetchData = async () => {
        try {
            const [stores, dcs, shipments, events] = await Promise.all([
                fetch(`${API_BASE_URL}/stores`).then(res => res.json()),
                fetch(`${API_BASE_URL}/dcs`).then(res => res.json()),
                fetch(`${API_BASE_URL}/shipments`).then(res => res.json()),
                fetch(`${API_BASE_URL}/events`).then(res => res.json())
            ]);
            return { stores, dcs, shipments, events };
        } catch (error) {
            logMessage(`Could not fetch data from backend. Is it running? Details: ${error.message}`, true);
            return null;
        }
    };

    const simulateRisk = async (shipmentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/simulate-risk/${shipmentId}`);
            return await response.json();
        } catch (error) {
            logMessage(`AI simulation request failed: ${error.message}`, true);
            return null;
        }
    };

    // --- MAIN APPLICATION LOGIC ---
    async function main() {
        logMessage('Initializing Walmart Risk Radar...');
        
        const data = await fetchData();
        if (!data) return;
        
        const map = initializeMap();
        if (!map) return;

        map.on('error', (e) => logMessage(`Mapbox error: ${e.error.message}`, true));

        map.on('load', () => {
            logMessage('Map initialized and ready.');
            addMarkers(map, data.stores, data.dcs);

            data.shipments.forEach(shipment => {
                const fromDC = data.dcs.find(dc => dc.id === shipment.from);
                const toStore = data.stores.find(store => store.id === shipment.to);
                if (fromDC && toStore) {
                    drawRoute(map, shipment.id, [fromDC.location.lng, fromDC.location.lat], [toStore.location.lng, toStore.location.lat]);
                }
            });
            logMessage('Live shipment routes displayed.');

            data.events.forEach((event, index) => {
                setTimeout(() => {
                    logMessage(`New risk detected: ${event.description}`);
                    displayRiskEvent(event, handleRiskSimulation);
                }, (index + 1) * 4000);
            });
        });

        async function handleRiskSimulation(shipmentId, riskLocation) {
            logMessage(`Analyzing risk for shipment ${shipmentId}...`);
            new mapboxgl.Marker({ color: '#dc3545' }).setLngLat([riskLocation.lng, riskLocation.lat]).addTo(map);
            const result = await simulateRisk(shipmentId);
            if (result) {
                logMessage(`AI Recommendation: ${result.message}`);
                updateRouteLook(map, result.originalShipmentId, '#6c757d', true);
                const fromDC = data.dcs.find(dc => dc.id === result.newRoute.from);
                const toStore = data.stores.find(store => store.id === result.newRoute.to);
                if(fromDC && toStore) {
                    drawRoute(map, `new-${result.originalShipmentId}`, [fromDC.location.lng, fromDC.location.lat], [toStore.location.lng, toStore.location.lat], result.newRoute.color);
                    logMessage('Optimal new route has been dispatched.');
                }
            }
        }
    }

    main();
});

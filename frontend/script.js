// frontend/script.js

// IMPORTANT: Paste your Mapbox Access Token here
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaGlhZGl0aTI5IiwiYSI6ImNtY3g5YjJxODA0Z3cycnB3a25tNW50aTcifQ.o_G39oljPXd-m3-U8WdFKA';

// --- Global Variables ---
const backendUrl = 'http://localhost:3000';
let map;
let allData; // To store data from the backend

// --- Map Initialization ---
map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-82.5, 32.0],
    zoom: 6
});

// --- Main Function to Run on Page Load ---
map.on('load', () => {
    fetchInitialState();
});

// --- Helper Functions ---

async function fetchInitialState() {
    try {
        const response = await fetch(`${backendUrl}/api/initial-state`);
        allData = await response.json();
        addMarkers();
        drawInitialRoutes();
    } catch (error) {
        console.error("Error fetching initial state:", error);
    }
}

function addMarkers() {
    allData.dcs.forEach(dc => {
        // NEW: Using default markers with color
        new mapboxgl.Marker({ color: '#0071ce' }) // Blue for DCs
            .setLngLat([dc.longitude, dc.latitude])
            .setPopup(new mapboxgl.Popup().setText(dc.dc_name))
            .addTo(map);
    });

    allData.stores.forEach(store => {
        // NEW: Using default markers with color
        new mapboxgl.Marker({ color: '#d9534f' }) // Red for Stores
            .setLngLat([store.longitude, store.latitude])
            .setPopup(new mapboxgl.Popup().setText(store.store_name))
            .addTo(map);
    });
}

function drawInitialRoutes() {
    allData.shipments.forEach(shipment => {
        drawRoute(shipment, '#0071ce', true); // Draw initial routes in blue and dashed
    });
}

// NEW, GENERALIZED FUNCTION TO DRAW ANY ROUTE
function drawRoute(shipment, color, isDashed) {
    const origin = allData.dcs.find(d => d.dc_id === shipment.origin_dc_id);
    const destination = allData.stores.find(s => s.store_id === shipment.destination_store_id);
    const routeId = `route-${shipment.shipment_id}`;

    // Don't draw if it already exists
    if (map.getSource(routeId)) return;

    // Create a rich GeoJSON feature with properties for the popup
    const route = {
        type: 'Feature',
        properties: {
            shipment_id: shipment.shipment_id,
            origin_name: origin.dc_name,
            destination_name: destination.store_name,
            cargo: shipment.cargo_type,
            status: shipment.status,
            details: `General: ${shipment.cargo_details.general_units || 0} units, Grocery: ${shipment.cargo_details.grocery_units || 0} units`
        },
        geometry: {
            type: 'LineString',
            coordinates: [
                [origin.longitude, origin.latitude],
                [destination.longitude, destination.latitude]
            ]
        }
    };

    map.addSource(routeId, { type: 'geojson', data: route });
    map.addLayer({
        id: routeId,
        type: 'line',
        source: routeId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': color,
            'line-width': 3,
            'line-dasharray': isDashed ? [2, 2] : [] // Apply dash if needed
        }
    });

    // MAKE THE ROUTE CLICKABLE
    map.on('click', routeId, (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
                <h4>Shipment #${props.shipment_id}</h4>
                <p><strong>From:</strong> ${props.origin_name}</p>
                <p><strong>To:</strong> ${props.destination_name}</p>
                <p><strong>Cargo:</strong> ${props.cargo}</p>
                <p><strong>Details:</strong> ${props.details}</p>
                <p><strong>Status:</strong> ${props.status}</p>
            `)
            .addTo(map);
    });
}


function updateLog(message) {
    const logList = document.getElementById('log-list');
    const newLogItem = document.createElement('li');
    newLogItem.textContent = message;
    logList.prepend(newLogItem);
}

// --- Event Listeners ---

// For the main trigger button
document.getElementById('trigger-btn').addEventListener('click', async () => {
    const scenario = document.getElementById('scenario-select').value;
    try {
        const response = await fetch(`${backendUrl}/api/trigger-disruption`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario: scenario }) // Send the selected scenario
        });
        const result = await response.json();
        visualizeDisruption(result);
    } catch (error) {
        console.error("Error triggering disruption:", error);
    }
});

// For closing the decision card
document.getElementById('close-card-btn').addEventListener('click', () => {
    document.getElementById('decision-card').classList.add('hidden');
});


// --- The Core Visualization Function ---
function visualizeDisruption(result) {
    const { decision, impacted_shipment_id, log, decision_card, details } = result;

    // Log the events
    log.forEach(item => updateLog(`${item.time} ${item.message}`));

    // Show the decision card
    const card = document.getElementById('decision-card');
    document.getElementById('decision-title').textContent = decision_card.title;
    document.getElementById('decision-option-a').textContent = decision_card.optionA;
    document.getElementById('decision-option-b').textContent = decision_card.optionB;
    document.getElementById('decision-result').textContent = decision_card.result;
    card.classList.remove('hidden');

    // Turn the original route red to show it's impacted
    map.setPaintProperty(`route-${impacted_shipment_id}`, 'line-color', '#d9534f');
    map.setPaintProperty(`route-${impacted_shipment_id}`, 'line-dasharray', []);

    // Visualize based on the decision
    setTimeout(() => {
        // Remove the impacted route line after a moment
        if (decision !== 'REROUTE') { // For reroute, the line stays but path would change
            map.removeLayer(`route-${impacted_shipment_id}`);
            map.removeSource(`route-${impacted_shipment_id}`);
        }

        if (decision === 'REROUTE') {
            // In a real app, we'd draw a new winding path. Here, we'll make it green.
            map.setPaintProperty(`route-${impacted_shipment_id}`, 'line-color', '#28a745'); // Green
        } else if (decision === 'RESOURCE') {
            const newShipment = {
                shipment_id: `new-${impacted_shipment_id}`,
                origin_dc_id: details.new_dc,
                destination_store_id: details.destination_store,
                cargo_type: "General", // Assuming general for this scenario
                cargo_details: {},
                status: "Resourced"
            };
            drawRoute(newShipment, '#28a745', false); // Draw new solid green route
        } else if (decision === 'SPLIT') {
            const groceryShipment = { shipment_id: `new-g-${impacted_shipment_id}`, origin_dc_id: details.new_grocery_dc, destination_store_id: details.destination_store, cargo_type: "Grocery", cargo_details: {}, status: "Split" };
            const generalShipment = { shipment_id: `new-m-${impacted_shipment_id}`, origin_dc_id: details.new_general_dc, destination_store_id: details.destination_store, cargo_type: "General", cargo_details: {}, status: "Split" };
            drawRoute(groceryShipment, '#28a745', false); // Green for high-priority
            drawRoute(generalShipment, '#fd7e14', false); // Orange for medium-priority
        }
    }, 1500); // Delay for dramatic effect
}
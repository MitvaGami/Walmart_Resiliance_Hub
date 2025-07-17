// frontend/script.js

// IMPORTANT: Paste your Mapbox Access Token here
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaGlhZGl0aTI5IiwiYSI6ImNtY3g5YjJxODA0Z3cycnB3a25tNW50aTcifQ.o_G39oljPXd-m3-U8WdFKA';

const backendUrl = 'http://localhost:3000';
let map;
let allData;
let isSimulating = false; // Prevents multiple clicks during a simulation

// --- Sound Helpers ---
const playAlertSound = () => document.getElementById('alert-sound')?.play();
const playDecisionSound = () => document.getElementById('decision-sound')?.play();

// --- Map Initialization ---
map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-82.5, 32.0],
    zoom: 6
});

map.on('load', fetchInitialState);

// --- Core Functions ---
async function fetchInitialState() {
    try {
        const response = await fetch(`${backendUrl}/api/initial-state`);
        allData = await response.json();
        if (!allData || !allData.dcs) {
            console.error("Failed to load initial data from backend.");
            return;
        }
        addMarkers();
        drawInitialRoutes();
        displayRisksSequentially(allData.riskEvents);
    } catch (error) {
        console.error("CRITICAL ERROR in fetchInitialState:", error);
    }
}

function displayRisksSequentially(risks, index = 0) {
    const riskList = document.getElementById('risk-list');
    if (!riskList) return;
    if (index === 0) riskList.innerHTML = '';
    if (!risks || index >= risks.length) return;

    playAlertSound(); // Play sound for each new alert
    const risk = risks[index];
    const riskItem = document.createElement('li');
    riskItem.className = 'risk-card risk-card-hidden';
    riskItem.dataset.scenario = risk.scenarioId;
    riskItem.dataset.shipmentId = risk.affected_shipment_id;
    riskItem.dataset.riskLat = risk.latitude;
    riskItem.dataset.riskLon = risk.longitude;
    riskItem.innerHTML = `<h4>${risk.title}</h4><p>Location: ${risk.location_name}</p><p>Source: ${risk.source}</p>`;
    riskItem.addEventListener('click', handleRiskClick);
    riskList.appendChild(riskItem);

    setTimeout(() => riskItem.classList.remove('risk-card-hidden'), 50);

    const delayBetweenRisks = 4000; // 4 seconds between new alerts
    setTimeout(() => displayRisksSequentially(risks, index + 1), delayBetweenRisks);
}

async function handleRiskClick(event) {
    if (isSimulating) return; // Prevent new simulation while one is running
    isSimulating = true;

    const riskCard = event.currentTarget;
    const { scenario, shipmentId, riskLat, riskLon } = riskCard.dataset;
    
    // Visually manage risk cards
    document.querySelectorAll('.risk-card').forEach(card => card.classList.add('inactive'));
    riskCard.classList.add('active');
    riskCard.classList.remove('inactive');

    // Add disruption marker
    const el = document.createElement('div');
    el.className = 'disruption-marker';
    new mapboxgl.Marker(el)
        .setLngLat([parseFloat(riskLon), parseFloat(riskLat)])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Disruption Point'))
        .addTo(map);

    // Highlight the affected route
    const routeId = `route-${shipmentId}`;
    if (map.getLayer(routeId)) {
        map.setPaintProperty(routeId, 'line-color', '#d9534f');
        map.setPaintProperty(routeId, 'line-width', 5);
        // Add a class to the map container to trigger CSS animation
        map.getCanvasContainer().classList.add('analyzing-route');
    }
    
    try {
        const response = await fetch(`${backendUrl}/api/trigger-disruption`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario })
        });
        const result = await response.json();
        await processDisruption(result); // Hand off to the sequential processor
    } catch (error) {
        console.error("Error triggering disruption:", error);
    } finally {
        // Cleanup after simulation is fully complete
        isSimulating = false;
        map.getCanvasContainer().classList.remove('analyzing-route');
        document.querySelectorAll('.risk-card').forEach(card => {
            card.classList.remove('inactive', 'active');
        });
    }
}

async function processDisruption(result) {
    const { decision, impacted_shipment_id, log, decision_card, details } = result;

    // 1. Process log messages sequentially
    for (const item of log) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5s between logs
        updateLog(`${item.time} ${item.message}`);
    }

    // 2. Show the decision
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before showing card
    playDecisionSound();
    const card = document.getElementById('decision-card');
    document.getElementById('decision-title').textContent = decision_card.title;
    document.getElementById('decision-option-a').textContent = decision_card.optionA;
    document.getElementById('decision-option-b').textContent = decision_card.optionB;
    document.getElementById('decision-result').textContent = decision_card.result;
    card.classList.remove('hidden');

    // 3. Update the original route to "Cancelled"
    const originalRouteId = `route-${impacted_shipment_id}`;
    if (map.getLayer(originalRouteId)) {
        map.setPaintProperty(originalRouteId, 'line-color', '#6c757d');
        map.setPaintProperty(originalRouteId, 'line-width', 2);
        map.setPaintProperty(originalRouteId, 'line-dasharray', [2, 2]);
        updateRouteStatus(originalRouteId, 'Cancelled');
    }
    
    // 4. Draw new routes after a delay
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before drawing new routes
    const originalShipment = allData.shipments.find(s => s.shipment_id === impacted_shipment_id);
    if (!originalShipment) return;

    if (decision === 'REROUTE') {
        const reroutedShipment = { ...originalShipment, shipment_id: `rerouted-${impacted_shipment_id}`, status: "Rerouted" };
        drawRoute(reroutedShipment, '#28a745', false);
    } else if (decision === 'RESOURCE') {
        const newShipment = { ...originalShipment, shipment_id: `new-${impacted_shipment_id}`, origin_dc_id: details.new_dc, status: "Resourced" };
        drawRoute(newShipment, '#28a745', false);
    } else if (decision === 'SPLIT') {
        const groceryShipment = { ...originalShipment, shipment_id: `new-g-${impacted_shipment_id}`, origin_dc_id: details.new_grocery_dc, status: "Split (Grocery)", cargo_type: "Grocery", cargo_details: { general_units: 0, grocery_units: originalShipment.cargo_details.grocery_units } };
        const generalShipment = { ...originalShipment, shipment_id: `new-m-${impacted_shipment_id}`, origin_dc_id: details.new_general_dc, status: "Split (General)", cargo_type: "General", cargo_details: { general_units: originalShipment.cargo_details.general_units, grocery_units: 0 } };
        drawRoute(groceryShipment, '#28a745', false);
        drawRoute(generalShipment, '#fd7e14', false);
    }
}

// --- UI & Map Drawing Helpers (Mostly Unchanged) ---
function updateLog(message) {
    const logList = document.getElementById('log-list');
    const allItems = logList.querySelectorAll('li');
    allItems.forEach(item => item.style.backgroundColor = 'transparent'); // Reset old highlights
    const newLogItem = document.createElement('li');
    newLogItem.textContent = message;
    logList.prepend(newLogItem);
}

document.getElementById('close-card-btn').addEventListener('click', () => {
    document.getElementById('decision-card').classList.add('hidden');
});

function addMarkers() {
    allData.dcs.forEach(dc => new mapboxgl.Marker({ color: '#0071ce' }).setLngLat([dc.longitude, dc.latitude]).setPopup(new mapboxgl.Popup().setHTML(`<div style="font-family: sans-serif; font-size: 14px;"><h4 style="margin: 0 0 5px 0; color: #0071ce;">Distribution Center</h4><p style="margin: 0 0 5px 0;"><strong>Name:</strong> ${dc.dc_name}</p><p style="margin: 0;"><strong>Type:</strong> ${dc.dc_type}</p></div>`)).addTo(map));
    allData.stores.forEach(store => new mapboxgl.Marker({ color: '#d9534f' }).setLngLat([store.longitude, store.latitude]).setPopup(new mapboxgl.Popup().setHTML(`<div style="font-family: sans-serif; font-size: 14px;"><h4 style="margin: 0 0 5px 0; color: #d9534f;">Walmart Supercenter</h4><p style="margin: 0;"><strong>Location:</strong> ${store.store_name}</p></div>`)).addTo(map));
}

function drawInitialRoutes() {
    allData.shipments.forEach(shipment => drawRoute(shipment, '#0071ce', true));
}

function drawRoute(shipment, color, isDashed) {
    const origin = allData.dcs.find(d => d.dc_id === shipment.origin_dc_id);
    const destination = allData.stores.find(s => s.store_id === shipment.destination_store_id);
    if (!origin || !destination) return;
    const routeId = `route-${shipment.shipment_id}`;
    if (map.getSource(routeId)) { map.removeLayer(routeId); map.removeSource(routeId); }
    const route = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: [[origin.longitude, origin.latitude], [destination.longitude, destination.latitude]] }
    };
    map.addSource(routeId, { type: 'geojson', data: route });
    map.addLayer({
        id: routeId, type: 'line', source: routeId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': color, 'line-width': 3, 'line-dasharray': isDashed ? [2, 2] : [] }
    });
    // Add click popups after the layer is added
    addRoutePopup(routeId, shipment);
}

function updateRouteStatus(routeId, newStatus) {
    const source = map.getSource(routeId);
    if (source && source._data) {
        // We need to re-find the shipment to update its properties
        const id = routeId.split('-').pop();
        let shipment = allData.shipments.find(s => s.shipment_id == id);
        if (shipment) {
            shipment.status = newStatus;
            map.off('click', routeId); // Remove old listener
            addRoutePopup(routeId, shipment); // Add new listener with updated status
        }
    }
}

function addRoutePopup(routeId, shipment) {
    const origin = allData.dcs.find(d => d.dc_id === shipment.origin_dc_id);
    const destination = allData.stores.find(s => s.store_id === shipment.destination_store_id);
    const truck = allData.trucks.find(t => t.truck_id === shipment.truck_id);

    map.on('click', routeId, (e) => {
        new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(
            `<div style="font-family: sans-serif; font-size: 14px; max-width: 250px;">
                <h4 style="margin: 0 0 10px 0;">Shipment #${shipment.shipment_id}</h4>
                <p style="margin: 2px 0;"><strong>Status:</strong> <span style="font-weight: bold; color: ${shipment.status === 'Cancelled' ? '#d9534f' : '#28a745'};">${shipment.status}</span></p>
                <p style="margin: 2px 0;"><strong>Driver:</strong> ${truck?.driver_name || 'N/A'} (Truck #${truck?.truck_id || 'N/A'})</p>
                <p style="margin: 2px 0;"><strong>Scheduled:</strong> ${shipment.scheduled_departure_time || 'N/A'}</p>
                <hr style="margin: 8px 0;">
                <p style="margin: 2px 0;"><strong>From:</strong> ${origin.dc_name}</p>
                <p style="margin: 2px 0;"><strong>To:</strong> ${destination.store_name}</p>
                <p style="margin: 2px 0;"><strong>Cargo:</strong> ${shipment.cargo_type}</p>
                <p style="margin: 2px 0;"><strong>Details:</strong> General: ${shipment.cargo_details.general_units || 0}, Grocery: ${shipment.cargo_details.grocery_units || 0}</p>
            </div>`
        ).addTo(map);
    });
}
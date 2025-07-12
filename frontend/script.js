// frontend/script.js

// IMPORTANT: Paste your Mapbox Access Token here
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaGlhZGl0aTI5IiwiYSI6ImNtY3g5YjJxODA0Z3cycnB3a25tNW50aTcifQ.o_G39oljPXd-m3-U8WdFKA';

const backendUrl = 'http://localhost:3000';
let map;
let allData;

map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-82.5, 32.0],
    zoom: 6
});

map.on('load', () => {
    fetchInitialState();
});

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
        displayRisks();
    } catch (error) {
        console.error("CRITICAL ERROR in fetchInitialState:", error);
    }
}

function displayRisks() {
    const risks = allData.riskEvents;
    const riskList = document.getElementById('risk-list');
    if (!riskList) {
        console.error("Fatal Error: Could not find the 'risk-list' element in the HTML.");
        return;
    }
    riskList.innerHTML = '';
    if (!risks) return;

    risks.forEach(risk => {
        const riskItem = document.createElement('li');
        riskItem.className = 'risk-card';
        riskItem.dataset.scenario = risk.scenarioId;
        riskItem.dataset.shipmentId = risk.affected_shipment_id;
        riskItem.dataset.riskLat = risk.latitude;
        riskItem.dataset.riskLon = risk.longitude;
        riskItem.innerHTML = `<h4>${risk.title}</h4><p>Location: ${risk.location_name}</p><p>Source: ${risk.source}</p>`;
        riskItem.addEventListener('click', handleRiskClick);
        riskList.appendChild(riskItem);
    });
}

async function handleRiskClick(event) {
    const riskCard = event.currentTarget;
    const { scenario, shipmentId, riskLat, riskLon } = riskCard.dataset;
    if (!scenario || !shipmentId || !riskLat || !riskLon) {
        console.error("Could not read risk data from the clicked card.", riskCard.dataset);
        return;
    }
    const el = document.createElement('div');
    el.className = 'disruption-marker';
    el.innerText = 'X';
    new mapboxgl.Marker(el)
        .setLngLat([parseFloat(riskLon), parseFloat(riskLat)])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Disruption Point'))
        .addTo(map);

    try {
        const response = await fetch(`${backendUrl}/api/trigger-disruption`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario: scenario })
        });
        const result = await response.json();
        visualizeDisruption(result);
    } catch (error) {
        console.error("Error triggering disruption:", error);
    }
}

document.getElementById('close-card-btn').addEventListener('click', () => {
    document.getElementById('decision-card').classList.add('hidden');
});

function addMarkers() {
    allData.dcs.forEach(dc => {
        const dcPopupContent = `<div style="font-family: sans-serif; font-size: 14px;"><h4 style="margin: 0 0 5px 0; color: #0071ce;">Distribution Center</h4><p style="margin: 0 0 5px 0;"><strong>Name:</strong> ${dc.dc_name}</p><p style="margin: 0;"><strong>Type:</strong> ${dc.dc_type}</p></div>`;
        new mapboxgl.Marker({ color: '#0071ce' }).setLngLat([dc.longitude, dc.latitude]).setPopup(new mapboxgl.Popup().setHTML(dcPopupContent)).addTo(map);
    });
    allData.stores.forEach(store => {
        const storePopupContent = `<div style="font-family: sans-serif; font-size: 14px;"><h4 style="margin: 0 0 5px 0; color: #d9534f;">Walmart Supercenter</h4><p style="margin: 0;"><strong>Location:</strong> ${store.store_name}</p></div>`;
        new mapboxgl.Marker({ color: '#d9534f' }).setLngLat([store.longitude, store.latitude]).setPopup(new mapboxgl.Popup().setHTML(storePopupContent)).addTo(map);
    });
}

function drawInitialRoutes() {
    allData.shipments.forEach(shipment => {
        drawRoute(shipment, '#0071ce', true);
    });
}

function drawRoute(shipment, color, isDashed) {
    const origin = allData.dcs.find(d => d.dc_id === shipment.origin_dc_id);
    const destination = allData.stores.find(s => s.store_id === shipment.destination_store_id);
    const truck = allData.trucks.find(t => t.truck_id === shipment.truck_id);
    if (!origin || !destination) return;
    const routeId = `route-${shipment.shipment_id}`;
    if (map.getSource(routeId)) { map.removeLayer(routeId); map.removeSource(routeId); }
    const route = {
        type: 'Feature',
        properties: {
            shipment_id: shipment.shipment_id, origin_name: origin.dc_name, destination_name: destination.store_name, cargo: shipment.cargo_type, status: shipment.status,
            details: `General: ${shipment.cargo_details.general_units || 0} units, Grocery: ${shipment.cargo_details.grocery_units || 0} units`,
            truck_id: truck ? truck.truck_id : 'N/A', driver_name: truck ? truck.driver_name : 'N/A', scheduled_time: shipment.scheduled_departure_time || 'N/A'
        },
        geometry: { type: 'LineString', coordinates: [[origin.longitude, origin.latitude], [destination.longitude, destination.latitude]] }
    };
    map.addSource(routeId, { type: 'geojson', data: route });
    map.addLayer({
        id: routeId, type: 'line', source: routeId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': color, 'line-width': 3, 'line-dasharray': isDashed ? [2, 2] : [] }
    });
    map.on('click', routeId, (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(
            `<div style="font-family: sans-serif; font-size: 14px; max-width: 250px;"><h4 style="margin: 0 0 10px 0;">Shipment #${props.shipment_id}</h4><p style="margin: 2px 0;"><strong>Status:</strong> ${props.status}</p><p style="margin: 2px 0;"><strong>Driver:</strong> ${props.driver_name} (Truck #${props.truck_id})</p><p style="margin: 2px 0;"><strong>Scheduled:</strong> ${props.scheduled_time}</p><hr style="margin: 8px 0;"><p style="margin: 2px 0;"><strong>From:</strong> ${props.origin_name}</p><p style="margin: 2px 0;"><strong>To:</strong> ${props.destination_name}</p><p style="margin: 2px 0;"><strong>Cargo:</strong> ${props.cargo}</p><p style="margin: 2px 0;"><strong>Details:</strong> ${props.details}</p></div>`
        ).addTo(map);
    });
}

function updateLog(message) {
    const logList = document.getElementById('log-list');
    if (logList.innerHTML.includes('System ready.')) {
        logList.innerHTML = '';
    }
    const newLogItem = document.createElement('li');
    newLogItem.textContent = message;
    logList.prepend(newLogItem);
}

function visualizeDisruption(result) {
    const { decision, impacted_shipment_id, log, decision_card, details } = result;
    const originalShipment = allData.shipments.find(s => s.shipment_id === impacted_shipment_id);
    if (!originalShipment) return;
    log.forEach(item => updateLog(`${item.time} ${item.message}`));
    const card = document.getElementById('decision-card');
    document.getElementById('decision-title').textContent = decision_card.title;
    document.getElementById('decision-option-a').textContent = decision_card.optionA;
    document.getElementById('decision-option-b').textContent = decision_card.optionB;
    document.getElementById('decision-result').textContent = decision_card.result;
    card.classList.remove('hidden');
    const routeId = `route-${impacted_shipment_id}`;
    if (map.getLayer(routeId)) {
        map.setPaintProperty(routeId, 'line-color', '#343a40');
        map.setPaintProperty(routeId, 'line-dasharray', [2, 2]);
        map.setPaintProperty(routeId, 'line-opacity', 0.6);
        updateRouteStatus(routeId, 'Cancelled');
    }
    setTimeout(() => {
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
    }, 1500);
}

function updateRouteStatus(routeId, newStatus) {
    const source = map.getSource(routeId);
    if (source && source._data && source._data.properties) {
        source._data.properties.status = newStatus;
        map.getSource(routeId).setData(source._data);
    }
}
// backend/database.js

const dcs = [
    { dc_id: 1, dc_name: "Atlanta, GA GM", dc_type: "General", latitude: 33.74, longitude: -84.38 },
    { dc_id: 2, dc_name: "Macon, GA Combined", dc_type: "Combined", latitude: 32.84, longitude: -83.63 },
    { dc_id: 3, dc_name: "Columbia, SC GM", dc_type: "General", latitude: 34.00, longitude: -81.03 },
    { dc_id: 4, dc_name: "Orlando, FL Grocery", dc_type: "Grocery", latitude: 28.53, longitude: -81.37 }
];

const stores = [
    { store_id: 501, store_name: "Savannah, GA Store", latitude: 32.08, longitude: -81.09 },
    { store_id: 502, store_name: "Augusta, GA Store", latitude: 33.47, longitude: -81.97 },
    { store_id: 503, store_name: "Jacksonville, FL Store", latitude: 30.33, longitude: -81.65 }
];

const shipments = [
    {
        shipment_id: 1001,
        origin_dc_id: 2, // Macon, GA Combined
        destination_store_id: 501, // Savannah, GA
        cargo_type: "Combined",
        cargo_details: { general_units: 30, grocery_units: 15 },
        status: "Scheduled"
    },
    {
        shipment_id: 1002,
        origin_dc_id: 4, // Orlando, FL Grocery
        destination_store_id: 503, // Jacksonville, FL
        cargo_type: "Grocery",
        cargo_details: { grocery_units: 50 },
        status: "Scheduled"
    },
    // NEW SHIPMENT TO MAKE THE MAP MORE ALIVE
    {
        shipment_id: 1003,
        origin_dc_id: 3, // Columbia, SC GM
        destination_store_id: 502, // Augusta, GA Store
        cargo_type: "General",
        cargo_details: { general_units: 100 },
        status: "Scheduled"
    }
];

const riskEvents = [
    {
        id: 1,
        title: "Bridge Collapse on I-16 Disrupts Major Freight Corridor",
        location: "Walmart DC, Macon, GA",
        source: "Associated Press",
        scenarioId: "split" // This links to our 'split' logic
    },
    {
        id: 2,
        title: "Fuel Spill Causes Multi-Hour Closure of I-20 Westbound",
        location: "Walmart DC, Columbia, SC",
        source: "Reuters",
        scenarioId: "resource" // This links to our 'resource' logic
    },
    {
        id: 3,
        title: "Flash Flooding Makes I-95 Impassable Near Jacksonville",
        location: "Walmart DC, Orlando, FL",
        source: "The Weather Channel",
        scenarioId: "reroute" // This links to our 'reroute' logic
    }
];

module.exports = { dcs, stores, shipments, riskEvents };
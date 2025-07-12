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

const trucks = [
    { truck_id: 1, driver_name: "John Doe", status: "Idle" },
    { truck_id: 2, driver_name: "Jane Smith", status: "Idle" },
    { truck_id: 3, driver_name: "Mike Ross", status: "Idle" }
];

const shipments = [
    {
        shipment_id: 1001, origin_dc_id: 2, destination_store_id: 501, truck_id: 1,
        scheduled_departure_time: "2025-07-12 10:00:00", cargo_type: "Combined",
        cargo_details: { general_units: 30, grocery_units: 15 }, status: "Scheduled"
    },
    {
        shipment_id: 1002, origin_dc_id: 4, destination_store_id: 503, truck_id: 2,
        scheduled_departure_time: "2025-07-12 11:00:00", cargo_type: "Grocery",
        cargo_details: { grocery_units: 50 }, status: "Scheduled"
    },
    {
        shipment_id: 1003, origin_dc_id: 3, destination_store_id: 502, truck_id: 3,
        scheduled_departure_time: "2025-07-12 09:30:00", cargo_type: "General",
        cargo_details: { general_units: 100 }, status: "Scheduled"
    }
];

const riskEvents = [
    {
        id: 1,
        title: "Bridge Collapse on I-16 Disrupts Major Freight Corridor",
        location_name: "I-16, near Metter, GA", // Display-friendly name
        source: "Associated Press",
        scenarioId: "split",
        affected_shipment_id: 1001, // Directly links to a shipment
        latitude: 32.39,            // Specific coordinates of the disruption
        longitude: -82.06
    },
    {
        id: 2,
        title: "Fuel Spill Causes Multi-Hour Closure of I-20 Westbound",
        location_name: "I-20, between Columbia & Augusta",
        source: "Reuters",
        scenarioId: "resource",
        affected_shipment_id: 1003,
        latitude: 33.74,
        longitude: -81.55
    },
    {
        id: 3,
        title: "Flash Flooding Makes I-95 Impassable Near Jacksonville",
        location_name: "I-95, north of Jacksonville, FL",
        source: "The Weather Channel",
        scenarioId: "reroute",
        affected_shipment_id: 1002,
        latitude: 30.52,
        longitude: -81.65
    }
];

module.exports = { dcs, stores, trucks, shipments, riskEvents };
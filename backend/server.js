// backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- API Endpoints ---

app.get('/api/initial-state', (req, res) => {
    res.json({
        dcs: db.dcs,
        stores: db.stores,
        shipments: db.shipments
    });
});

app.post('/api/trigger-disruption', (req, res) => {
    // The frontend will now send the chosen scenario
    const { scenario } = req.body;
    console.log(`Disruption triggered for scenario: ${scenario}`);

    let response = {};

    switch (scenario) {
        // --- CASE 1: Simple Reroute ---
        case 'reroute':
            // We'll disrupt shipment #1002 (Orlando -> Jacksonville)
            response = {
                decision: 'REROUTE',
                impacted_shipment_id: 1002,
                log: [
                    { time: "11:01 AM", message: "[ALERT] Accident detected on I-95. Analyzing Shipment #1002." },
                    { time: "11:02 AM", message: "[ANALYSIS] Truck has already departed. Rerouting is the only option." },
                    { time: "11:03 AM", message: "[DECISION] Rerouting truck. New ETA calculated." }
                ],
                details: {
                    new_route_origin_dc: 4, // Orlando
                    destination_store: 503 // Jacksonville
                },
                decision_card: {
                    title: "System Recommendation: Reroute Shipment #1002",
                    optionA: `Continue on original path: Severe Delay`,
                    optionB: `Reroute immediately: +45 min delay`,
                    result: "ACTION: Rerouting in-transit truck to new path."
                }
            };
            break;

        // --- CASE 2: Resource from new DC ---
        case 'resource':
            // We'll disrupt shipment #1003 (Columbia -> Augusta)
            response = {
                decision: 'RESOURCE',
                impacted_shipment_id: 1003,
                log: [
                    { time: "09:30 AM", message: "[ALERT] Major road closure near Columbia. Analyzing Shipment #1003." },
                    { time: "09:31 AM", message: "[ANALYSIS] Rerouting from Columbia would cause a 2-hour delay." },
                    { time: "09:32 AM", message: "[ANALYSIS] Checking alternate DCs. Atlanta GM is available." },
                    { time: "09:33 AM", message: "[DECISION] Optimal solution: Resourcing from Atlanta. Delay is only 30 mins." }
                ],
                details: {
                    original_dc: 3, // Columbia
                    new_dc: 1, // Atlanta
                    destination_store: 502 // Augusta
                },
                decision_card: {
                    title: "System Recommendation: Resource Shipment #1003",
                    optionA: `Reroute from Columbia: ~2 hour delay`,
                    optionB: `Resource from Atlanta: ~30 min delay`,
                    result: "ACTION: Cancelling original shipment and creating new one from Atlanta DC."
                }
            };
            break;

        // --- CASE 3: Split Shipment (your original scenario) ---
        case 'split':
        default:
            response = {
                decision: 'SPLIT',
                impacted_shipment_id: 1001,
                log: [
                    { time: "10:01 AM", message: "[ALERT] Bridge Collapse on I-16. Analyzing Shipment #1001." },
                    { time: "10:02 AM", message: "[ANALYSIS] Rerouting from Macon would cause a 4-hour delay." },
                    { time: "10:03 AM", message: "[ANALYSIS] No single DC can fulfill. Evaluating split-shipment options." },
                    { time: "10:04 AM", message: "[DECISION] Optimal solution: SPLIT. Sourcing groceries from Orlando and general from Atlanta." }
                ],
                details: {
                    original_dc: 2, // Macon
                    new_grocery_dc: 4, // Orlando
                    new_general_dc: 1, // Atlanta
                    destination_store: 501, // Savannah
                },
                decision_card: {
                    title: "System Recommendation: Split Shipment #1001",
                    optionA: `Reroute from Macon: ~4 hour delay`,
                    optionB: `Split Shipment: Groceries in ~1.5 hrs, General in ~2 hrs`,
                    result: "ACTION: Splitting shipment across two specialized DCs."
                }
            };
            break;
    }

    res.json(response);
});


app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

app.get('/api/risk-feed', (req, res) => {
    res.json(db.riskEvents);
});

// The '/api/trigger-disruption' endpoint remains exactly the same.
// It will be called by the frontend when a risk is clicked.
app.post('/api/trigger-disruption', (req, res) => {
    // ... (This entire block of code stays the same) ...
});


// backend/server.js (Final)

const jsonServer = require('json-server');
const cors = require('cors'); // Import cors
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = 3000;

// Use CORS to allow requests from your frontend
server.use(cors()); 

// Set default middlewares (logger, static, etc.)
server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser.
// This is not needed for our GET request but is good practice to include.
server.use(jsonServer.bodyParser);

// --- Custom AI Simulation Route ---
// This is the special route that our frontend calls.
server.get('/simulate-risk/:shipmentId', (req, res) => {
  const { shipmentId } = req.params;
  const db = router.db.getState(); // Get the current state of the database

  const shipment = db.shipments.find(s => s.id === shipmentId);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const hasHighPriorityGoods = shipment.cargo.some(item => item.priority === 'high');

  if (hasHighPriorityGoods) {
    // AI Decision: High-priority goods are at risk. It's faster to resource from a closer DC.
    res.status(200).json({
      decision: 'STRATEGIC_RESOURCING',
      message: 'AI recommends resourcing high-priority goods from a closer DC to minimize delay.',
      newRoute: {
        from: 'DC-002', // The alternative DC
        to: shipment.to,
        color: '#28a745' // Green for the new, efficient route
      },
      originalShipmentId: shipment.id
    });
  } else {
    // AI Decision: Low-priority goods. A simple reroute is the most cost-effective solution.
    res.status(200).json({
      decision: 'SIMPLE_REROUTE',
      message: 'AI recommends a simple reroute for this low-priority shipment.',
      newRoute: {
        from: shipment.from,
        to: shipment.to,
        color: '#fd7e14' // Orange for a standard reroute
      },
      originalShipmentId: shipment.id
    });
  }
});

// Use the default json-server router for all other routes (/stores, /dcs, etc.)
server.use(router);

server.listen(port, () => {
  console.log(`✅ Custom JSON Server is running on http://localhost:${port}`);
  console.log('You can now view your frontend.');
});

**Walmart Risk Radar: Proactive Supply Chain Resilience (MVP)**

**🚀 The Vision**

The Walmart Risk Radar is a high-fidelity prototype of a real-time
command center designed to transform Walmart\'s supply chain from a
reactive to a **proactive** model. By simulating real-world disruptions
and leveraging an AI-powered decision engine, this dashboard provides
logistics operators with immediate, data-driven solutions to ensure
goods get to stores with minimal delay.

**✨ Core Features (MVP)**

- **Live Interactive Map**: A dynamic Mapbox map displaying all
  Distribution Centers (DCs), stores, and planned shipment routes in
  real-time.

- **Simulated Live Risk Feed**: The left sidebar displays a feed of
  simulated real-world events (accidents, weather alerts) that could
  impact the supply chain, appearing sequentially to mimic a live
  environment.

- **Automated AI Decision Engine**: When a risk is identified and
  clicked, our backend logic instantly simulates an AI\'s analysis and
  determines the optimal solution:

<!-- -->

- **Strategic Resourcing**: For high-priority cargo, the system can
  recommend sourcing the shipment from an entirely different, closer DC.

<!-- -->

- **Simple Reroute**: For lower-priority goods, a standard rerouting is
  suggested to balance cost and time.

<!-- -->

- **Dynamic Route Visualization**:

<!-- -->

- Original routes are shown in blue.

<!-- -->

- When a risk is addressed, the canceled route fades to a **gray, dashed
  line**.

<!-- -->

- The new, AI-recommended route is drawn in **green** (for high-priority
  resourcing) or **orange** (for a standard reroute).

<!-- -->

- **Real-time System Log**: The right sidebar provides a detailed,
  timestamped log that explains every step of the system\'s analysis and
  decision-making process, giving operators full visibility.

**🎯 The Full Vision (Beyond the MVP)**

While the current version is a powerful MVP, the ultimate goal is to
integrate a true, predictive AI engine with more sophisticated
capabilities:

- **Predictive Risk Analysis**: Move from reacting to simulated events
  to proactively forecasting disruptions. A machine learning model
  trained on historical weather, traffic, and news data would predict
  the *probability* of a future delay, allowing for intervention before
  a problem even occurs.

- **Advanced AI Optimization**: The decision engine would evolve from
  simple rules to a powerful optimization engine (e.g., using Google
  OR-Tools). It would analyze thousands of potential solutions in
  seconds, considering variables like fuel costs, driver
  hours-of-service, inventory levels at all DCs, and the real-time sales
  impact of a potential stock-out.

- **Dynamic Split Shipments**: For mixed-cargo shipments, the AI could
  make the complex decision to split the order. High-priority goods
  (like fresh groceries) could be dispatched from a nearby DC, while
  lower-priority items are sent on a slower, more cost-effective route,
  ensuring critical products always reach the shelves.

- **NLP-Powered Risk Ingestion**: The \"Live Risk Feed\" would be
  automated by a Natural Language Processing (NLP) model that scans news
  articles, social media, and driver communications to automatically
  identify, categorize, and geolocate potential supply chain risks
  without human intervention.

**🛠️ Technology Stack**

| **Category**     | **Technology**                                |
|------------------|-----------------------------------------------|
| **Frontend**     | HTML5, CSS3, Vanilla JavaScript, Mapbox GL JS |
| **Backend**      | Node.js                                       |
| **API/Database** | json-server (for rapid prototyping)           |
| **Dev Tools**    | VS Code, Git, GitHub, serve CLI               |

**⚙️ Running the Project**

To run this project, you will need two command prompts (one for the
backend and one for the frontend).

**1. Backend Setup**

First, navigate to the backend directory:

cd path/to/your/project/Walmart_Resiliance_Hub/backend

If this is your first time, install the necessary packages:

npm install

Then, start the backend server:

node server.js

You should see a confirmation message: ✅ Custom JSON Server is running
on http://localhost:3000. Leave this command prompt running.

**2. Frontend Setup**

Open a **new** command prompt and navigate to the frontend directory:

cd path/to/your/project/Walmart_Resiliance_Hub/frontend

You need a simple web server to run the site. We recommend serve. If you
don\'t have it installed, run this command once:

npm install -g serve

Now, start the frontend server:

serve

It will give you an address to open in your web browser (usually
http://localhost:3000 or a similar port). Open that URL to see the
application live.

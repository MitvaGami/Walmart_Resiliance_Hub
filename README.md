## 🚀 The Problem

In a supply chain as vast as Walmart's, even small, localized disruptions can have significant downstream effects. A traffic accident, a sudden flood, or a road closure can delay critical shipments, leading to:
*   **Out-of-stock items** on store shelves, resulting in lost sales and poor customer experience.
*   **Increased operational costs** due to idle trucks, wasted fuel, and inefficient rerouting.
*   **Reactive decision-making**, where problems are often addressed only after the delay has already occurred.

Current solutions often rely on drivers reacting to issues in real-time, but this lacks centralized oversight and strategic planning.

## ✨ Our Solution: The Risk Radar

The **Walmart Risk Radar** is a real-time command center dashboard designed to transform the supply chain from a reactive to a **proactive** model.

Our system continuously monitors for potential risk events and automatically analyzes their impact on the logistics network *before* trucks have even left the distribution center. It provides logistics operators with immediate, data-driven solutions to ensure goods get to stores with minimal delay.

*   **Live Risk Feed:** Ingests real-world events (simulated via a live feed) that could impact the supply chain, such as accidents, weather events, or road closures.
*   **Interactive Map Visualization:** A dynamic map displaying all Distribution Centers (DCs), stores, and planned shipment routes for a clear, at-a-glance view of the network.
*   **Automated Decision Engine:** When a risk impacts a scheduled shipment, our backend logic instantly calculates and compares potential solutions:
    1.  **Simple Reroute:** Calculates the delay if the current truck takes a different path.
    2.  **Strategic Resourcing:** Determines if sourcing the shipment from an entirely different, closer DC is faster.
    3.  **Dynamic Split Shipment:** For mixed-cargo shipments, it can intelligently split the order, sending high-priority goods (like groceries) from one DC and lower-priority goods from another to optimize delivery times.
*   **Real-time System Log:** A detailed log that explains every step of the system's analysis and decision-making process, providing full transparency.
*   **Clickable Route Details:** Users can click on any shipment route on the map to get detailed information about its cargo, origin, destination, and status.

## 🛠️ Technology Stack

| Category      | Technology                                    |
|---------------|-----------------------------------------------|
| **Frontend**  | HTML5, CSS3, Vanilla JavaScript, Mapbox GL JS |
| **Backend**   | Node.js, Express.js                           |
| **Database**  | In-Memory JSON (for hackathon speed)          |
| **Dev Tools** | VS Code, Git, GitHub, `serve` CLI             |

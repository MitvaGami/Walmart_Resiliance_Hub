# Walmart Risk Radar
### A High-Fidelity Prototype for Proactive Supply Chain Resilience

---

## 🚀 The Problem

In a supply chain as vast as Walmart's, even small, localized disruptions can have significant downstream effects. A traffic accident, a sudden flood, or a road closure can delay critical shipments, leading to:
*   **Out-of-stock items** on store shelves, resulting in lost sales and poor customer experience.
*   **Increased operational costs** due to idle trucks, wasted fuel, and inefficient rerouting.
*   **Reactive decision-making**, where problems are often addressed only after the delay has already occurred.

Current solutions often rely on drivers reacting to issues in real-time, but this lacks centralized oversight and strategic planning.

## ✨ Our Solution: The Risk Radar

The **Walmart Risk Radar** is a real-time command center dashboard designed to transform the supply chain from a reactive to a **proactive** model.

Our system continuously monitors for potential risk events and automatically analyzes their impact on the logistics network. It provides logistics operators with immediate, data-driven solutions to ensure goods get to stores with minimal delay.

*   **Live Risk Feed:** The left sidebar displays a feed of real-world events that could impact the supply chain. Each risk is directly tied to a specific geographic location and an affected shipment.
*   **Interactive Map & Disruption Markers:** A dynamic map displaying all Distribution Centers (DCs), stores, and planned shipments. When a risk is selected, a prominent **'X' marker** is placed on the map at the exact point of disruption.
*   **Automated Decision Engine:** When a risk impacts a scheduled shipment, our backend logic instantly calculates and compares potential solutions:
    1.  **Simple Reroute:** Calculates the delay if the current truck takes a different path.
    2.  **Strategic Resourcing:** Determines if sourcing the shipment from an entirely different, closer DC is faster.
    3.  **Dynamic Split Shipment:** For mixed-cargo shipments, it can intelligently split the order, sending high-priority goods (like groceries) from one DC and lower-priority goods from another to optimize delivery times.
*   **Rich, Detailed Popups:** Clicking on any map element provides detailed, context-aware information:
    *   **Routes:** Show shipment ID, status, cargo details, scheduled departure, and assigned **truck & driver**.
    *   **DCs & Stores:** Show names, types, and locations.
*   **Sophisticated State Visualization:** Canceled routes fade to a gray, dashed line, providing a clear visual history of the decisions made. New routes are color-coded by priority (green for high-priority/resourced, orange for secondary).
*   **Real-time System Log:** The right sidebar provides a detailed, timestamped log that explains every step of the system's analysis and decision-making process.

## 🛠️ Technology Stack

| Category      | Technology                                    |
|---------------|-----------------------------------------------|
| **Frontend**  | HTML5, CSS3, Vanilla JavaScript, Mapbox GL JS |
| **Backend**   | Node.js, Express.js                           |
| **Database**  | In-Memory JSON (for hackathon speed)          |
| **Dev Tools** | VS Code, Git, GitHub, `serve` CLI             |

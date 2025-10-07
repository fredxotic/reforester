# 🌳 ReForester — AI-Powered Reforestation Assistant

### 🧠 Built by Fred Kaloki  

---

## 🌍 Overview

**ReForester** is an AI-driven web application that helps environmental teams, policymakers, and sustainability enthusiasts analyze **reforestation potential** anywhere on Earth.  
By combining **real-world soil, climate, and geospatial data** with **AI-powered reasoning**, it generates site-specific tree-species recommendations and ecosystem restoration insights.  

---

## 🚀 Key Features

- 🗺 **Interactive Map Interface** – Click any location to begin analysis using Leaflet.js  
- 🌱 **AI-Generated Reforestation Insights** – Context-aware species suggestions based on soil composition and climate  
- ☁️ **Real Environmental Data** – Uses **SoilGrids API** and **Open-Meteo API**  
- 🧩 **Intelligent Fallback System** – Works seamlessly offline using biome-based simulations  
- 🧠 **Claude AI Integration** – For real-time ecological reasoning (with mock fallback)  
- 📊 **Environmental Data Display** – Clear presentation of soil and weather analysis  
- 🎨 **Beautiful UI** – Responsive Tailwind CSS design with modern components  
- ⚡ **Fast Development** – Built with React + Vite frontend and Node.js + Express backend  

---

## 🏗 Project Structure

```
reforester/
├── backend/
│   ├── server.js               # Express entrypoint
│   ├── routes/reforest.js      # Reforestation analysis endpoint
│   ├── services/
│   │   ├── soil.js            # SoilGrids API integration
│   │   ├── meteo.js           # Open-Meteo weather data
│   │   └── claude.js          # AI recommendation service
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── MapPicker.jsx   # Interactive Leaflet map
    │   │   ├── ResultsPanel.jsx # Analysis results display
    │   │   └── Loader.jsx      # Loading animations
    │   ├── services/
    │   │   └── api.js          # Backend communication
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    └── package.json
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone and Navigate

```bash
git clone https://github.com/fredxotic/reforecaster.git
cd reforester
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```bash
PORT=5000
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx  # optional
```

Run the server:

```bash
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

### 4️⃣ Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔧 APIs Used

| Data Type | Source | Description |
|-----------|---------|-------------|
| Soil Data | [ISRIC SoilGrids](https://soilgrids.org/) | Provides soil composition (clay, sand, silt percentages) |
| Weather Data | [Open-Meteo](https://open-meteo.com/) | Retrieves temperature, precipitation, and climate data |
| AI Reasoning | Claude AI / Mock Intelligence | Generates ecological restoration recommendations |

---

## 🧠 AI Prompt Architecture

The system constructs structured ecological reasoning prompts:

```
You are an environmental AI assistant called ReForecaster.

Given the following real environmental data:
- Coordinates: (${lat}, ${lon})
- Soil Composition: clay ${soil.clay}%, sand ${soil.sand}%, silt ${soil.silt}%
- Current Weather: temperature ${weather.temperature}°C, precipitation ${weather.precipitation}mm

Please provide a comprehensive reforestation strategy including:
1. Recommended Native Tree Species
2. Planting Strategy
3. Soil Preparation
4. Water Management
5. Maintenance Plan
6. Expected Benefits
```

Fallbacks are intelligently generated when API keys or live data are unavailable, providing region-specific recommendations.

---

## 🎯 Usage

1. **Open** the application at `http://localhost:3000`
2. **Click** anywhere on the interactive map
3. **View** real-time analysis of:
   - Soil composition (clay, sand, silt percentages)
   - Weather conditions and climate data
   - AI-powered reforestation recommendations
4. **Explore** different geographic regions to see varying strategies

---

## 🧩 Future Enhancements

- 🔭 **Satellite NDVI Overlay** – Detect vegetation cover via satellite imagery APIs  
- 🗃️ **Supabase Integration** – Save and share analyses publicly  
- 🧬 **Local AI Fallback** – Integrate with Ollama or DeepSeek for offline inference  
- 📡 **Multi-point Batch Analysis** – For NGOs and land restoration teams  

---

## 🏆 Impact

ReForester contributes to **UN SDG 15 — Life on Land**, enabling data-driven restoration decisions and sustainable land management in regions facing degradation and desertification. The tool empowers communities, conservationists, and policymakers with accessible reforestation intelligence.

---

## 🐛 Troubleshooting

- **API Timeouts**: The app uses intelligent fallback data when external services are unavailable
- **No Claude API Key**: Mock AI provides realistic, region-specific recommendations
- **Connection Issues**: Ensure backend is running on port 5000 and frontend on port 3000

---

## 👨🏽‍💻 Author

👨🏽‍💻 **Fred Kaloki** · 📍 Egerton University, Kenya  
📧 [charlesfred285@gmail.com](mailto:charlesfred285@gmail.com)  
[💻 GitHub](https://github.com/fredxotic) • [💼 LinkedIn](https://www.linkedin.com/in/fred-kaloki)

---

*Built with passion for environmental conservation and sustainable technology* 🌱💚

# 🌳 ReForester — AI-Powered Reforestation Platform

## 🌍 Overview

**ReForester** is a comprehensive AI-driven platform that empowers environmental teams, policymakers, and sustainability enthusiasts to **plan, manage, and track reforestation projects** worldwide. By combining **real-world environmental data** with **AI-powered analytics**, it provides end-to-end solutions for ecosystem restoration from planning to long-term monitoring.

---

## 🚀 Live Deployment & 🎤 Pitch Deck

### 📱 Access the Platform

1. **Visit** [https://reforester.vercel.app](https://reforester.vercel.app)
2. **Register** a new account or use **Google OAuth**
3. **Start analyzing** locations and managing reforestation projects

A visual summary of ReForester’s mission, architecture, and impact is available as a 10-slide presentation:

[https://www.canva.com/design/DAG1gswniX8/FjQAHAF3k7ZHxKl0G5wWcg/edit?utm_content=DAG1gswniX8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton](https://www.canva.com/design/DAG1gswniX8/FjQAHAF3k7ZHxKl0G5wWcg/edit?utm_content=DAG1gswniX8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

---

## 🚀 Key Features

### 🌱 Core Analysis

- 🗺 **Interactive Map Analysis** – Click any location for instant environmental assessment using Leaflet.js
- 🌿 **AI-Generated Reforestation Insights** – Context-aware species recommendations based on soil, climate, and location data
- ☁️ **Real Environmental Data** – Integrates **SoilGrids API** and **Open-Meteo API** for accurate analysis
- 📄 **Exportable Reports** – Generate detailed PDF analysis reports for documentation and planning

### 👥 User Management

- 🔐 **Secure Authentication** – JWT-based user registration, login, and profile management
- 👤 **Role-based Access** – Project owners, managers, and contributors with appropriate permissions
- 🌐 **Social Login** – Google OAuth integration for seamless access

### 📊 Project Management

- 🎯 **Project Creation** – Convert location analyses into full reforestation projects
- 📅 **Milestone Tracking** – Set and monitor project milestones with progress tracking
- 💰 **Budget Management** – Track estimated vs. actual costs and funding sources

### 📈 Advanced Analytics

- 📊 **Growth Projections** – 20-year tree growth and carbon sequestration forecasts
- 🌍 **Environmental Impact** – Carbon timeline, biodiversity scoring, and oxygen production estimates
- 💸 **Financial Analytics** – ROI calculations, cost efficiency, and budget utilization
- 📋 **Comparative Analysis** – Compare performance across multiple projects

### 🌿 Species Database

- 🔍 **Smart Species Search** – GBIF API integration with Wikipedia enrichment
- 📚 **Popular Species Library** – Curated collection of commonly used reforestation species
- 🖼 **Rich Media Content** – High-quality images and detailed species information

---

## 🏗 Project Architecture

```
reforester/
├── backend/
│   ├── server.js               # Express server with CORS & middleware
│   ├── config/database.js      # MongoDB connection with caching
│   ├── middleware/auth.js      # JWT authentication
│   ├── models/                 # MongoDB models (User, Project, etc.)
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── projects.js        # Project CRUD & management
│   │   ├── analytics.js       # Growth & impact analytics
│   │   ├── reforest.js        # Location analysis engine
│   │   └── species.js         # Species database API
│   └── services/
│       ├── soil.js            # SoilGrids API integration
│       ├── meteo.js           # Open-Meteo weather data
│       ├── claude.js          # AI recommendation service
│       └── pdfGenerator.js    # PDF report generation
│
└── frontend/
    ├── src/
    │   ├── components/         # React components
    │   │   ├── auth/          # Authentication forms
    │   │   ├── projects/      # Project management
    │   │   ├── analytics/     # Data visualization
    │   │   ├── map/           # Interactive mapping
    │   │   └── common/        # Shared UI components
    │   ├── contexts/          # React contexts (Auth, Projects)
    │   ├── services/          # API communication layer
    │   │   ├── api.js         # Axios instance & interceptors
│   │   │   ├── authApi.js     # Authentication endpoints
│   │   │   ├── projectApi.js  # Project management
│   │   │   ├── analyticsApi.js # Analytics data
│   │   │   └── speciesApi.js  # Species database
    │   ├── hooks/             # Custom React hooks
    │   └── utils/             # Helper functions
    ├── public/
    └── package.json
```

---

## 🔧 Technology Stack

### Backend

- **Node.js** + **Express.js** – Server runtime and API framework
- **MongoDB** + **Mongoose** – Database and ODM
- **JWT** – Authentication tokens
- **bcryptjs** – Password hashing
- **CORS** – Cross-origin resource sharing

### Frontend

- **React** + **Vite** – UI framework and build tool
- **Tailwind CSS** – Styling and responsive design
- **Axios** – HTTP client for API calls
- **Leaflet** + **React-Leaflet** – Interactive maps
- **React Router** – Client-side routing

### External APIs

- **SoilGrids API** – Soil composition data
- **Open-Meteo API** – Weather and climate data
- **GBIF API** – Species database
- **Wikipedia API** – Species information enrichment
- **Claude AI** – Ecological reasoning (with fallback)

### Deployment & Infrastructure

- **Vercel** – Frontend and backend hosting
- **MongoDB Atlas** – Cloud database
- **GitHub** – Version control and CI/CD

---

## 🎯 Platform Usage

### 1. **User Authentication**

- Register new account or login with Google OAuth
- Secure JWT-based session management
- Password reset and email verification

### 2. **Location Analysis**

- Click any location on the interactive map
- View real-time soil composition and weather data
- Receive AI-powered reforestation recommendations
- Export detailed PDF analysis reports

### 3. **Project Management**

- Convert analyses into full reforestation projects
- Set project timelines, budgets, and milestones
- Invite team members and assign roles
- Track progress with visual indicators

### 4. **Species Selection**

- Browse popular reforestation species
- Search comprehensive species database
- View detailed species information with images
- Select appropriate species for your projects

### 5. **Analytics & Monitoring**

- View growth projections and carbon sequestration timelines
- Monitor biodiversity impact and environmental benefits
- Track financial performance and ROI
- Compare multiple projects with comparative analytics

---

## 📊 Analytics Features

### Environmental Impact

- **Carbon Sequestration** – Annual and cumulative carbon capture projections
- **Biodiversity Scoring** – Species diversity and ecosystem health metrics
- **Oxygen Production** – Estimated oxygen output based on tree count
- **Soil Conservation** – Erosion prevention and soil health improvements

### Financial Analytics

- **Cost Efficiency** – Cost per tree and cost per ton of carbon
- **ROI Calculation** – Carbon credit value and financial returns
- **Budget Tracking** – Estimated vs. actual cost monitoring
- **Funding Optimization** – Grant and funding opportunity recommendations

### Growth Projections

- **20-Year Forecasts** – Tree survival, height growth, and canopy coverage
- **Species Performance** – Individual species growth rates and survival
- **Environmental Factors** – Climate and soil impact on growth patterns

---

## 🧠 AI Integration

The platform uses structured ecological reasoning with Claude AI:

```javascript
// AI Prompt Structure
const prompt = `
As ReForester AI, analyze this location for reforestation:

Location: ${lat}, ${lon}
Soil: ${soil.clay}% clay, ${soil.sand}% sand, ${soil.silt}% silt
Climate: ${weather.temperature}°C, ${weather.precipitation}mm rain

Provide:
1. Suitable native species
2. Planting strategy
3. Soil preparation
4. Maintenance plan
5. Risk assessment
6. Expected environmental impact
`;
```

**Intelligent Fallback System**: When external APIs are unavailable, the system provides biome-based recommendations using latitude analysis and ecological best practices.

---

## 🏆 Impact & Sustainability

ReForester directly supports **UN Sustainable Development Goals**:

- **SDG 13** – Climate Action (carbon sequestration)
- **SDG 15** – Life on Land (ecosystem restoration)
- **SDG 11** – Sustainable Cities (urban greening)
- **SDG 17** – Partnerships (collaborative conservation)

The platform enables data-driven decisions for:

- 🌳 **Reforestation NGOs** – Project planning and impact tracking
- 🏛️ **Government Agencies** – Policy development and monitoring
- 🏢 **Corporate Sustainability** – CSR initiatives and carbon offsetting
- 👥 **Community Groups** – Local restoration projects

---

## 🔮 Future Roadmap

- **🚀 Satellite Integration** – NDVI analysis and deforestation detection
- **🤖 Local AI Models** – Ollama integration for offline capabilities
- **📱 Mobile App** – React Native for field data collection
- **🌐 Multi-language** – Support for local languages in target regions
- **🔗 Blockchain** – Transparent carbon credit tracking
- **🤝 Community Features** – Project sharing and collaboration tools
- **📊 Advanced GIS** – Watershed analysis and erosion modeling

---

## 👨🏽‍💻 Author

👨🏽‍💻 **Fred Kaloki**  
📍 Egerton University, Kenya  
📧 [charlesfred285@gmail.com](mailto:charlesfred285@gmail.com)  
[💻 GitHub](https://github.com/fredxotic) • [💼 LinkedIn](https://www.linkedin.com/in/fred-kaloki)

---

*Empowering global reforestation through technology and collaboration* 🌱💚

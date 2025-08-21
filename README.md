# Real Estate Market Analyzer - Data Engineering Portfolio Project

This project demonstrates a complete, end-to-end ELT (Extract, Load, Transform) data pipeline. It covers the entire data lifecycle, from scraping data from a public website to orchestration, cloud storage, transformation, and finally, visualization in an interactive web dashboard.

**Live Demo:** [https://storia-dashboard.vercel.app/](https://storia-dashboard.vercel.app/) 

---

## Project Overview

The project automatically scrapes daily real estate listings for Bucharest from the [Storia.ro](https://www.storia.ro/) portal, processes them, and presents the insights in an interactive dashboard. Users can explore aggregated data through various charts and filter the detailed list of properties based on multiple criteria.

![Dashboard Screenshot](ss3.PNG) 
---

## System Architecture

The project is built on a modern data stack, clearly separating the responsibilities of each component within an ELT workflow.

![Architecture Diagram](diagrama.svg) 

**The data flows as follows:**

1.  **Orchestration (Airflow):** A DAG (Directed Acyclic Graph) in Apache Airflow, running inside Docker, is scheduled to execute daily.
2.  **Extraction (Python):** The Airflow task runs a Python script that scrapes new real estate listings from `storia.ro` using `requests` and `BeautifulSoup`.
3.  **Cloud Ingestion (Azure):** The Python script uploads the raw data as daily CSV files to an **Azure Blob Storage** container, which acts as a staging area/Data Lake.
4.  **Data Warehouse Loading (Snowflake):** The raw data from the CSV files is loaded (using the `COPY INTO` command) into a raw data table (`RAW_STORIA_LISTINGS`) in **Snowflake**.
5.  **Transformation (dbt):** **dbt (data build tool)** is used to transform the raw data. SQL models clean the data (extracting numbers from text, standardizing categories), cast data types, and add calculated columns (e.g., price/sqm), materializing the final, clean results into a new table (`dim_listings`).
6.  **Backend API (Node.js):** A RESTful API built with **Node.js** and **Express** connects to Snowflake, queries the clean and aggregated data, and exposes it through various endpoints. A **caching layer** is implemented to optimize performance and reduce query costs.
7.  **Frontend Dashboard (React):** A single-page application built with **React** and **TypeScript** consumes the data from the Node.js API and presents it to the user through interactive components (KPI cards, charts, a filterable table), styled with **Tailwind CSS**.

---

## Technology Stack

**Orchestration & Ingestion**
*   **Apache Airflow:** For scheduling and orchestrating the entire pipeline.
*   **Docker:** To run the Airflow environment in a containerized, reproducible way.
*   **Python:** The core language for the data scraping scripts.
    *   *Key Libraries: `requests`, `beautifulsoup4`, `azure-storage-blob`.*

**Storage & Data Warehouse**
*   **Microsoft Azure Blob Storage:** For raw data storage (Data Lake / Staging Area).
*   **Snowflake:** A modern Cloud Data Warehouse for storing structured data and performing fast analytical queries.

**Transformation**
*   **dbt (data build tool):** To model and transform data directly within Snowflake using SQL.

**API & Dashboard**
*   **Backend:** **Node.js** with **Express.js**.
*   **Frontend:** **React** with **TypeScript** and **Vite**.
*   **Data Visualization:** **Chart.js** (`react-chartjs-2`).
*   **Styling:** **Tailwind CSS**.

---

## Technical Challenges & Solutions

During development, several interesting challenges were addressed:

*   **Anti-Scraping Measures:** An initial attempt on a different real estate portal failed due to advanced anti-bot protections (CAPTCHA). The solution was to **pivot** to a more accessible data source (`storia.ro`) and implement **delays between requests** to mimic human behavior and avoid IP blocking.
*   **Secrets Management in Airflow:** Passing the Azure Connection String securely to a `BashOperator` proved problematic due to environment-specific issues. The final solution was to use a `Generic` Airflow connection and inject the secret stored in the `password` field directly into the `bash` command, bypassing the compatibility issues of specialized operators.
*   **Performance Optimization:** Repeatedly querying Snowflake from the frontend for every filter change was slow. An **in-memory caching layer** was implemented in the Node.js API using `node-cache`, drastically reducing response times for frequent requests from several seconds to milliseconds and minimizing warehouse costs.

---

## How to Run Locally

The project is divided into several components. To run the entire system locally, follow the steps below.

### Prerequisites
*   Docker Desktop
*   Node.js (recommended via `nvm`)
*   Python
*   Active accounts on Microsoft Azure and Snowflake

### 1. Backend API
```bash
cd backend_api
# Create a .env file and add your Snowflake credentials
npm install
npm run dev
```

### 2. Frontend Dashboard
```bash
cd frontend_dashboard
# Create a .env file and add VITE_API_BASE_URL=http://localhost:3001
yarn install
yarn dev
```

### 3. Data Pipeline (Airflow)
```bash
cd proiect-airflow
# Make sure Docker Desktop is running
docker-compose up
```
*Access `http://localhost:8080` and manually trigger the `storia_daily_data_ingestion` DAG.*

### 4. Transformations (dbt)
```bash
cd imobiliare_transforms
# Make sure your ~/.dbt/profiles.yml file is configured correctly
dbt run
```

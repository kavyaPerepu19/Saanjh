# Saanjh Sahayak

## Overview
Saanjh Sahayak is a clinical decision support system designed for Saanjh, a home for the elderly. The application helps track health records of elderly residents and predict disease risks using LLM technology. It serves as a comprehensive healthcare management solution for caregivers, doctors, and administrators.

## Problem Statement
Saanjh, the elderly care home, needs assistance in tracking health records of residents and predicting potential disease risks. This application addresses this need by implementing a clinical decision support system and disease risk prediction functionality using an existing LLM model.

## Solution Modules
The application is divided into three key modules:

1. **Clinical Decision Management System**
   - Manages and analyzes clinical data
   - Tracks health records
   - Facilitates healthcare decision-making

2. **Disease Prediction and Diagnosis Using LLM**
   - Utilizes Large Language Models for disease risk assessment
   - Analyzes patient data to predict potential health risks
   - Provides diagnostic insights

3. **Data Retrieval Chatbot**
   - Interactive interface for querying patient data
   - Simplifies access to health records
   - Supports healthcare staff with information access

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Flask
- Ollama (LLM integration)

### Frontend
- React.js

## User Roles

### Caretaker
- Register patients
- Upload medical reports (PDF)
- View report analysis
- Access predictions

### Doctor
- View reports
- Use chatbot for data queries
- Add medical notes
- Create diet plans

### Admin
- System management
- User registration approval
- Overall system administration

## Architecture

The system architecture follows a modular approach:
- **Frontend**: React.js based user interface
- **Backend**: Express.js server with Node.js
- **Database**: MongoDB for data storage
- **LLM Integration**: Ollama for predictions and analysis
- **Report Processing**: PDF to JSON conversion for analysis
- **Prediction Engine**: Flask server for LLM interactions

## Data Flow
1. Reports uploaded as PDFs are converted to JSON format
2. JSON data is processed and stored in MongoDB
3. When predictions are requested, data is sent to the LLM model
4. The LLM generates predictions which are returned to the frontend
5. Reports and predictions are presented to users based on their roles

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Python 3.8+ (for Flask)
- npm or yarn

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yourusername/saanjh-sahayak.git
   cd saanjh-sahayak
   ```

2. Install backend dependencies
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```
   cd ../frontend
   npm install
   ```

4. Set up the Flask server
   ```
   cd ../OllamaTesting
   pip install -r requirements.txt
   ```

5. Configure environment variables
   - Create `.env` files in both backend and flask-server directories
   - Add necessary configuration variables (MongoDB URI, API keys, etc.)

### Running the Application
1. Start the MongoDB service
   ```
   mongod
   ```

2. Start the backend server
   ```
   cd backend
   npm start
   ```

3. Start the Flask server
   ```
   cd flask-server
   python app.py
   ```

4. Start the frontend application
   ```
   cd frontend
   npm start
   ```

5. Access the application at `http://localhost:3000`

## Project Status
This project was developed by P. Kavya Sri (22BD1A0519) as part of PS2-2.

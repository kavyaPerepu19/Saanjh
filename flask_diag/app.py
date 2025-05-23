from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables or .env file")

genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name="models/gemini-1.5-pro-latest")

@app.route('/diagnose', methods=['POST'])
def diagnose():
    data = request.json

    if not data or 'content' not in data:
        return jsonify({'error': 'Invalid input data'}), 400

    prompt = (
        "You are a medical AI assistant. The user will provide a medical report. "
        "Your task is to diagnose the condition described in the report and estimate the risk percentage. "
        f"\n\nMedical Report:\n{data['content']}\n\n"
        "Please provide:\n1. A brief diagnosis.\n2. Estimated risk percentage."
    )

    try:
        response = model.generate_content(prompt)
        return jsonify({'diagnosis': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)

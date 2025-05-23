from flask import Flask, request, jsonify
import google.generativeai as genai
from PyPDF2 import PdfReader
import os

app = Flask(__name__)

# Replace with your Gemini API key
GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"
genai.configure(api_key=GOOGLE_API_KEY)

# Load PDF content once at the start or on upload
PDF_PATH = "output.pdf"
pdf_text = ""

def extract_pdf_text(path):
    try:
        reader = PdfReader(path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        return str(e)

@app.route('/upload', methods=['POST'])
def upload_pdf():
    global pdf_text
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    save_path = os.path.join("uploads", file.filename)
    os.makedirs("uploads", exist_ok=True)
    file.save(save_path)

    pdf_text = extract_pdf_text(save_path)
    return jsonify({'message': 'PDF uploaded and processed successfully.'})

@app.route('/ask', methods=['POST'])
def ask():
    if not pdf_text:
        return jsonify({"error": "No PDF uploaded or text extracted."}), 400

    data = request.get_json()
    question = data.get("question")
    if not question:
        return jsonify({"error": "No question provided."}), 400

    prompt = f"""
Use the patient report provided below to answer the question. 
Only respond if the answer is in the text. Otherwise, say "I don't know".
Always end the answer with "Thanks for asking!".

Patient Report:
{pdf_text}

Question: {question}
Answer:
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(prompt)
        return jsonify({"answer": response.text.strip()})
    except Exception as e:
        print(f"Error generating response: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)

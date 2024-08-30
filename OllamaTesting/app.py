from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/diagnose', methods=['POST'])
def diagnose():
    data = request.json
    
    if not data or 'content' not in data:
        return jsonify({'error': 'Invalid input data'}), 400
    
    msgs = [
        {"role": "system", "content": "The user will give you a medical report, give a diagnosis for the text report provided and generate risk percentage of the report."},
        {"role": "user", "content": data['content']}
    ]
    
    try:
        output = ollama.chat(model="llama2", messages=msgs)
        diagnosis = output['message']['content']
        return jsonify({'diagnosis': diagnosis})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True,port=5002)


# below code is fully working code

# from flask import Flask, request, jsonify
# import ollama

# app = Flask(__name__)

# @app.route('/diagnose', methods=['POST'])
# def diagnose():
#     data = request.json
    
#     if not data or 'content' not in data:
#         return jsonify({'error': 'Invalid input data'}), 400
    
#     msgs = [
#         {"role": "system", "content": "The user will give you a medical report, give a diagnosis for the text report provided."},
#         {"role": "user", "content": data['content']}
#     ]
    
#     try:
#         output = ollama.chat(model="cniongolo/biomistral", messages=msgs)
#         diagnosis = output['message']['content']
#         return jsonify({'diagnosis': diagnosis})
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True)


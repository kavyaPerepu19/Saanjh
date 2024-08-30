from flask import Flask, request, jsonify
from pathlib import Path as p

from langchain import PromptTemplate
from langchain.chains import RetrievalQA
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

app = Flask(__name__)

# Initialize model and embeddings
GOOGLE_API_KEY = "AIzaSyAOrJc0CyugZqXKXCAvZTFkTBKTqH5fq4A"
model = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY, temperature=0.2, convert_system_message_to_human=True)
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)

def create_qa_chain(pdf_path):
    pdf_loader = PyPDFLoader(pdf_path)
    pages = pdf_loader.load_and_split()
    context = "\n\n".join(str(p.page_content) for p in pages)
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    texts = text_splitter.split_text(context)
    
    vector_index = Chroma.from_texts(texts, embeddings).as_retriever(search_kwargs={"k": 5})
    
    template = """Use the given pdf and answer the question asked based on the information in the pdf. It consists of patient details, so make sure you give answers based on the patient name. If you don't know the answer, just say that you don't know, don't try to make up an answer. Keep the answer as concise as possible. Always say "thanks for asking!" at the end of the answer.
    {context}
    Question: {question}
    Helpful Answer:"""
    QA_CHAIN_PROMPT = PromptTemplate.from_template(template)
    
    return RetrievalQA.from_chain_type(
        model,
        retriever=vector_index,
        return_source_documents=True,
        chain_type_kwargs={"prompt": QA_CHAIN_PROMPT}
    )

# Set the path to your PDF file here
PDF_PATH = 'output.pdf'

# Initialize QA chain with the provided PDF
qa_chain = create_qa_chain(PDF_PATH)

@app.route('/ask', methods=['POST'])
def ask_question():
    question = request.json.get('question')
    if not question:
        return jsonify({"error": "No question provided"}), 400
    
    result = qa_chain({"query": question})
    return jsonify({"answer": result["result"]}), 200

if __name__ == '__main__':
    app.run(debug=True,port=5001)
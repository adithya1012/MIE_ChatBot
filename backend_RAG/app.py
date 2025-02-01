from flask import Flask, request, jsonify
from Retrive import ask_llm
import subprocess

app = Flask(__name__)

# Mock function to simulate interaction with the RAG model
def query_rag_model(question):
    answer = ask_llm(question)
    # Here you would invoke your RAG model, possibly via an API call or a direct function call
    # For simplicity, let's assume the RAG model is a script that takes a question as input and returns an answer
    # You can replace this with the actual logic to interact with your RAG model
    # result = subprocess.run(['python', 'rag_model.py', question], capture_output=True, text=True)
    # return result.stdout
    # print(question)
    return answer

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    question = data.get('question')
    
    if not question:
        return jsonify({"error": "No question provided"}), 400
    
    # Query the RAG model
    print("QUESTION SENT BY UI", str(question))
    answer = query_rag_model(str(question))
    
    return jsonify({"question": question, "answer": answer})

# def initialize_rag_model():
#     create_retriver()

if __name__ == '__main__':
    # initialize_rag_model()  # Initialize the RAG model
    app.run(host='0.0.0.0', port=5000)
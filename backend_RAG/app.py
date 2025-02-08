from flask import Flask, request, jsonify
from Retrive import ask_llm
import subprocess

app = Flask(__name__)

def query_rag_model(question):
    answer = ask_llm(question)
    return answer

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    question = data.get('question')
    
    if not question:
        return jsonify({"error": "No question provided"}), 400
    
    print("QUESTION SENT BY UI", str(question))
    answer = query_rag_model(str(question))
    
    return jsonify({"question": question, "answer": answer})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
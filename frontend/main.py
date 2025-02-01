import requests

def ask_question(question):
    url = 'http://backend:5000/ask'
    payload = {'question': question}
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to get a response from the server"}
    # return {"answer": "This is a HELLO answer"}

if __name__ == '__main__':
    input("You: ")
    print("Welcome to the RAG-based assistant! Type 'exit' or 'quit' to end the conversation.")
    while True:
        question = input("You: ")
        if question.lower() in ['exit', 'quit']:
            break
        response = ask_question(question)
        print(f"Assistant: {response.get('answer', 'No answer provided')}")
    print("Goodbye!")


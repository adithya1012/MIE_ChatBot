import requests
import os
import curses
import time

def ask_question(question):
    url = 'http://backend:5000/ask'
    payload = {'question': question}
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to get a response from the server"}
    # return {"answer": "This is a HELLO answer"}


def clear_console():
    os.system('cls' if os.name == 'nt' else 'clear')

def animate_mie():
    frames = [
        """
  M   M  III  EEEEE        A      SSSS  SSSS  III  SSSS  TTTTT
  MM MM   I   E           A A     S     S      I   S       T  
  M M M   I   EEEE       AAAAA    SSSS  SSSS   I   SSSS    T  
  M   M   I   E         A     A      S     S   I      S    T  
  M   M  III  EEEEE    A       A  SSSS  SSSS  III  SSSS    T  
        """,
        """
  M   M  III  EEEEE        A      SSSS  SSSS  III  SSSS  TTTTT
  MM MM   I   E           A A     S     S      I   S       T  
  M M M   I   EEEE       AAAAA    SSSS  SSSS   I   SSSS    T  
  M   M   I   E         A     A      S     S   I      S    T  
  M   M  III  EEEEE    A       A  SSSS  SSSS  III  SSSS    T  
        """
    ]
    start_time = time.time()
    frame_index = 0
    
    while time.time() - start_time < 2:  # Run for 2 seconds
        clear_console()
        print(frames[frame_index])
        time.sleep(0.5)
        frame_index = (frame_index + 1) % len(frames)

if __name__ == '__main__':
    animate_mie()
    print("Welcome to the RAG-based assistant! Type 'exit' or 'quit' to end the conversation.")
    while True:
        question = input("You: ")
        if question.lower() in ['exit', 'quit']:
            break
        response = ask_question(question)
        print(f"Assistant: {response.get('answer', 'No answer provided')}")
    print("Goodbye!")


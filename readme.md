# Medical Chatbot for Doctors - RAG

This is a prototype for a Medical Assistant chatbot, **DoctBot**, built using the **Retrieval-Augmented Generation (RAG) architecture**. This chatbot will have all the relevant information about the patient a doctor is consulting and will answer patient-related questions. Doctors can ask **general** questions, such as a patient summary, or **specific** queries, like a patient's allergies. The chatbot will generate responses based on the patient's medical history.

## Architecture

In this prototype, I have created **two containers**: **frontend** and **backend**, connected via a network. The entire setup is managed using **Docker Compose**.

### **Backend:**

- A **Python Flask application** that listens for requests from the frontend container.
- The backend receives a question from the frontend as a string.
- The question is passed to a **retriever** to fetch relevant documents.
- The retrieved document and the question are sent to the **LLM** (Large Language Model).
- The LLM generates a response, which is then sent back to the frontend.

### **Frontend:**

- A **simple Python script** that communicates with the backend container via the command prompt.

## **Requirements**

- Docker
- Git

## **Steps to Run**

```sh
git clone https://github.com/adithya1012/RAG_Medical_ChatBot
cd RAG_Medical_ChatBot
docker-compose build --no-cache
docker-compose up
```

At this point, both containers will be running, but we **cannot** directly provide input through the command prompt, as Flask occupies the terminal. To interact with the chatbot, we need to **enter the frontend container** and run the program. Open a **new terminal** and execute the following commands:

```sh
docker exec -it frontend bash
source venv/bin/activate
python3 main.py
```

## **Future Work**

- Currently, patient data is **read from PDFs**. This will be replaced with **company-specific databases** for real-time access to patient records.
- No **validation** mechanisms are in place at the moment. In the future, **RAG-based guardrails (RAGGas)** will be added to detect **hallucinations** in LLM-generated responses.

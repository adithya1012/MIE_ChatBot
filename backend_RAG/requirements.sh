#!/bin/bash
source /app/venv/bin/activate

# Install necessary packages
pip install "unstructured[all-docs]"
pip install -qU langchain-google-vertexai
pip install PyPDF2
pip install langchain
pip install -U langchain-google-genai
pip install langchain_community tiktoken langchain-openai langchainhub chromadb langchain
pip install langsmith
pip install scikit-learn
pip install Flask==2.0.1
pip install requests==2.26.0

# Verify installation
pip show langchain-google-vertexai
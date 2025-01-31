# Use the official Ubuntu 24.04 image as the base image
FROM ubuntu:24.04

# Set the working directory inside the container
WORKDIR /app

# Install Python, Bash, and other necessary system dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-venv python3-pip bash && \
    apt-get install -y poppler-utils tesseract-ocr libtesseract-dev libgl1 && \
    apt-get clean

# Create a virtual environment
RUN python3 -m venv /app/venv

# Copy the requirements.sh script into the container
COPY requirements.sh /app/requirements.sh

# Give execute permission to the requirements.sh file
RUN chmod +x /app/requirements.sh

# Run the requirements.sh script using Bash and activate the virtual environment
RUN /bin/bash -c "source /app/venv/bin/activate && /app/requirements.sh"

# Copy the rest of the application code
COPY . .

# Environment variable for Google credentials (adjust the path as needed)
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/Google-service-account-credential.json

# Run the script using the virtual environment's Python interpreter
CMD ["/app/venv/bin/python3", "Retrive.py"]
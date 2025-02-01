FROM ubuntu:24.04

# Set the working directory
WORKDIR /app

# Install Python and dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-venv python3-pip bash

# Copy the application code
COPY . .

# Create virtual environment after copying files
RUN python3 -m venv /app/venv

# Install Python dependencies
RUN /app/venv/bin/pip install requests

# Run the application
CMD ["/app/venv/bin/python3", "main.py"]

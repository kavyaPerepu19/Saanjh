# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements files and app code
COPY . .

# Install dependencies
RUN pip install --no-cache-dir flask flask-cors python-dotenv google-generativeai

# Expose the port the app runs on
EXPOSE 5002

# Define environment variable
ENV FLASK_APP=app.py
ENV FLASK_RUN_PORT=5002

# Run the application
CMD ["flask", "run", "--host=0.0.0.0"]

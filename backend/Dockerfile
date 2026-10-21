FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install packages into the container
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

EXPOSE 8000
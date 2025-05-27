FROM python:3.12.3

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt update && apt install -y \
    build-essential libpq-dev gcc libssl-dev libffi-dev \
    python3-dev libxml2-dev libxslt1-dev zlib1g-dev libjpeg-dev \
    libblas-dev liblapack-dev gfortran \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt ./requirements.txt

COPY ./setup.sh ./setup.sh
RUN chmod +x ./setup.sh

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY . ./backend


FROM python:3.9.10-slim

ENV PYTHONUNBUFFERED 1

EXPOSE 3000
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends netcat build-essential && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY poetry.lock pyproject.toml ./
RUN pip install poetry==1.1 && \
    poetry config virtualenvs.in-project false && \
    poetry install

COPY . ./

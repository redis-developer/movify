FROM python:3.8

WORKDIR /app

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY ./ ./

ENTRYPOINT uvicorn main:app --host 0.0.0.0 --port 8000 --root-path /api

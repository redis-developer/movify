FROM python:3.8

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY ./ ./

CMD uvicorn main:app --host 0.0.0.0 --root-path /api

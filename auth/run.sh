# openssl rand -hex 32 > secret_key
export secret_key=$(cat secret_key)

uvicorn main:app --reload

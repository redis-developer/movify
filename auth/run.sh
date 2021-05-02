[ -f .env ] && uvicorn main:app --reload \
	|| cat <<EOF
pls create a .env file containing

GOOGLE_CLIENT_ID=378316070364-3ef899lco4oaltu7s1agcq109igsset4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET= go to https://console.cloud.google.com/apis/credentials
SECRET_KEY= generate with openssl rand -hex 32
EOF

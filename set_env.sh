gcloud config configurations activate redis || \
	gcloud init

root=$(git rev-parse --show-toplevel)
export GOOGLE_APPLICATION_CREDENTIALS=$root/secrets/redishacks-56d3a4cacdc7.json


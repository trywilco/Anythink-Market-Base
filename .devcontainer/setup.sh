WILCO_ID="`cat .wilco`"
ENGINE_EVENT_ENDPOINT="${ENGINE_BASE_URL}/users/${WILCO_ID}/event"
CODESPACE_BACKEND_HOST="${CODESPACE_NAME}-3000.githubpreview.dev"
CODESPACE_BACKEND_URL="https://${CODESPACE_BACKEND_HOST}"

# Update engine that codespace started for user
curl -L -X POST "${ENGINE_EVENT_ENDPOINT}" -H "Content-Type: application/json" --data-raw "{ \"event\": \"github_codespace_started\" }"

# Export backend envs when in codespaces
echo "export CODESPACE_BACKEND_HOST=\"${CODESPACE_BACKEND_HOST}\"" >> ~/.bashrc
echo "export CODESPACE_BACKEND_URL=\"${CODESPACE_BACKEND_URL}\"" >> ~/.bashrc

# Export welcome prompt in bash:
echo "echo \"\"" >> ~/.bashrc
echo "echo \"---------------------------------------------\"" >> ~/.bashrc
echo "echo \"\"" >> ~/.bashrc
echo "echo \"🖥️  Anythink: develop in the cloud! Type: \\\`docker-compose up\\\` to run the project.\"" >> ~/.bashrc
echo "echo \"🏃 Once docker-compose is up and running, you can access the frontend and backend urls here:\"" >> ~/.bashrc
echo "echo \"\"" >> ~/.bashrc
echo "gh codespace ports -c $CODESPACE_NAME" >> ~/.bashrc

# Change backend port visibility to public
echo "(&>/dev/null .devcontainer/open_port.sh &)" >> ~/.bashrc

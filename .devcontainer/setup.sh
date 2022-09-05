# Update engine that codespace started for user
WILCO_ID="`cat .wilco`"

if [[ "${GITHUB_REPOSITORY}" =~ "Staging-" ]]
  then
    ENGINE_URL="https://engine-staging.wilco.gg/users/$WILCO_ID/event"
  else
    ENGINE_URL="https://engine.wilco.gg/users/$WILCO_ID/event"
fi

curl -L -X POST "$ENGINE_URL" -H "Content-Type: application/json" --data-raw "{
    \"event\": \"github_codespace_started\"
}"

# Export backend url
echo "export CODESPACE_BACKEND_URL=\"https://${CODESPACE_NAME}-3000.githubpreview.dev\"" >> ~/.bashrc

# Change backend port visibility to public
echo "(&>/dev/null .devcontainer/open_port.sh &)" >> ~/.bashrc

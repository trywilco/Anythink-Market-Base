# Welcome to Parts Unlimited repo

To make the app work locally install MongoDB and make sure it's up and running

To install app's dependencies, please use:

```
yarn install
cd frontend && yarn install && cd ..
cd backend && yarn install && cd ..
```

Set those env vars in your local .env machine:
backend/.env:

```
MONGODB_URI=mongodb://localhost/conduit
```

frontend/.env:

```
PORT=3001
```

To start the app use:
`yarn start`

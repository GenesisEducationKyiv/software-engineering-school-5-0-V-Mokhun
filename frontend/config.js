const config = {
  development: {
    API_URL: "http://localhost:8000",
  },
  production: {
    API_URL: "https://software-school-genesis.onrender.com",
  },
};

const env =
  window.location.protocol === "http:" ? "development" : "production";

window.API_CONFIG = config[env];

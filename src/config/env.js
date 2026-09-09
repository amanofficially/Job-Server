// Fails fast on boot if critical configuration is missing, instead of letting
// the app start in a broken state (e.g. silently issuing invalid JWTs, or
// crashing later on the first database query).
const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    console.error("Copy .env.example to .env and fill in the values before starting the server.");
    process.exit(1);
  }
};

export default validateEnv;

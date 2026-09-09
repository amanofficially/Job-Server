import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use(mongoSanitize());

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", generalLimiter);

// Stricter limit on top of the general one, specifically for the endpoints
// that actually send email on the user's behalf.
const emailLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30 });
app.use("/api/email", emailLimiter);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;

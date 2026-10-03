require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { getPool } = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

const candidateRoutes = require("./routes/candidateRoutes");
const iqRoutes = require("./routes/iqRoutes");
const eqRoutes = require("./routes/eqRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";
const SERVER_IP = process.env.SERVER_IP || "172.20.245.27";

/* ==========================================
   CORS
========================================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5000",

  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",
  "http://127.0.0.1:5000",

  `http://${SERVER_IP}`,
  `http://${SERVER_IP}:5000`,
  `http://${SERVER_IP}:5173`,
  `http://${SERVER_IP}:5174`,
  `http://${SERVER_IP}:5175`,
  `http://${SERVER_IP}:5176`,
];

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header include browser navigation,
      // Postman, curl, and server-to-server requests.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked request from: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ==========================================
   REQUEST PARSERS
========================================== */

app.use(express.json({ limit: "2mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

/* ==========================================
   REQUEST LOGGER
========================================== */

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
  );
  next();
});

/* ==========================================
   HEALTH CHECK
========================================== */

app.get("/api/health", async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        'Connected' AS DatabaseStatus,
        GETDATE() AS ServerDateTime
    `);

    return res.status(200).json({
      success: true,
      message: "IQ-EQ backend is running",
      database: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
});

/* ==========================================
   API ROUTES
========================================== */

app.use("/api/candidates", candidateRoutes);
app.use("/api/iq", iqRoutes);
app.use("/api/eq", eqRoutes);
app.use("/api/admin", adminRoutes);

/* ==========================================
   API ROUTE NOT FOUND
========================================== */

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route was not found.",
    method: req.method,
    path: req.originalUrl,
  });
});

/* ==========================================
   FRONTEND PRODUCTION BUILD
========================================== */

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));

  // React SPA fallback:
  // all non-API browser routes return frontend/index.html.
  app.use((req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    return res.sendFile(frontendIndexPath);
  });
} else {
  console.warn(
    "Frontend build was not found. Run `npm run build` inside the frontend folder."
  );
}

/* ==========================================
   GENERAL ROUTE NOT FOUND
========================================== */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Requested resource was not found.",
    method: req.method,
    path: req.originalUrl,
  });
});

/* ==========================================
   ERROR HANDLER
========================================== */

app.use(errorHandler);

/* ==========================================
   START SERVER
========================================== */

async function startServer() {
  try {
    await getPool();

    app.listen(PORT, HOST, () => {
      console.log("==============================================");
      console.log("IQ-EQ application started successfully");
      console.log(`Local dashboard:  http://localhost:${PORT}`);
      console.log(`Network dashboard: http://${SERVER_IP}:${PORT}`);
      console.log(
        `Health check:      http://${SERVER_IP}:${PORT}/api/health`
      );
      console.log("==============================================");
    });
  } catch (error) {
    console.error(
      "Backend could not start because SQL Server connection failed:"
    );
    console.error(error.message);
    process.exit(1);
  }
}

startServer();

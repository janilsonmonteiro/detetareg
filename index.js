const express = require("express");
const axios = require("axios");

const app = express();

app.set("trust proxy", true);

// 🔥 CORS global (CORRETO)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.get("/check-country", async (req, res) => {
  try {
    // 🔥 IP correto (pega primeiro da lista)
    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0] ||
      req.socket.remoteAddress;

    // ❌ proteção localhost
    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      return res.json({
        result: false,
        country: "unknown",
        ip,
      });
    }

    const response = await axios.get(
      `http://ip-api.com/json/${ip}?fields=status,country`
    );

    if (response.data.status !== "success") {
      return res.status(500).json({
        error: "Não foi possível identificar o país",
      });
    }

    const country = response.data.country;

    return res.json({
      result: country === "Cape Verde",
      country,
      ip,
    });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

export default app;

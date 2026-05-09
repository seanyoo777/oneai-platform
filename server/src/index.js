const express = require("express");
const cors = require("cors");
const { createRouter } = require("./router");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api", createRouter());

app.get("/health", (_, res) => {
  res.json({
    ok: true,
    service: "oneai-server",
    userStorage: process.env.DATABASE_URL ? "postgresql" : "file"
  });
});

app.listen(port, () => {
  console.log(`OneAI server running on http://localhost:${port}`);
});

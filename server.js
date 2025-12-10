const express = require("express");
const app = express();

app.use(express.json());

let todos = ["Learn DevOps", "Setup CI/CD"];

app.get("/", (req, res) => {
  res.send("🚀 Webhook is working! CI/CD from GitHub → Jenkins → Docker → Azure!");
});

app.get("/todos", (req, res) => {
  res.json({ todos });
});

app.post("/todos", (req, res) => {
  const { item } = req.body;
  if (!item) return res.status(400).json({ error: "item is required" });
  todos.push(item);
  res.json({ todos });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

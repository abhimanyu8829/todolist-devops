const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let todos = [
  { id: 1, title: "Learn DevOps", completed: false, createdAt: new Date() },
  { id: 2, title: "Setup CI/CD", completed: false, createdAt: new Date() }
];

let nextId = 3;

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Get all todos
app.get("/api/todos", (req, res) => {
  res.json({ todos: todos.sort((a, b) => b.id - a.id) });
});

// Create a new todo
app.post("/api/todos", (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }
  const newTodo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date()
  };
  todos.push(newTodo);
  res.status(201).json({ todo: newTodo });
});

// Update a todo
app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const todo = todos.find(t => t.id === parseInt(id));
  
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  
  if (title !== undefined) todo.title = title.trim();
  if (completed !== undefined) todo.completed = completed;
  
  res.json({ todo });
});

// Delete a todo
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(t => t.id === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }
  
  const deletedTodo = todos.splice(index, 1);
  res.json({ message: "Todo deleted", todo: deletedTodo[0] });
});

// Toggle todo completion
app.patch("/api/todos/:id/toggle", (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === parseInt(id));
  
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  
  todo.completed = !todo.completed;
  res.json({ todo });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 Todo Server running on port ${PORT}`));
}

module.exports = app;

const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const USER_NOT_FOUND = "User not found!";

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).send({ error: USER_NOT_FOUND });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (users.length > 0 && users.some((user) => user.username === username)) {
    return response.status(400).send({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };
  console.log(user);
  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  if (!title || !deadline) {
    return response
      .status(404)
      .send({ error: "Title and Deadline is required!" });
  }

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  if (!title || !deadline) {
    return response
      .status(404)
      .send({ error: "Title and Deadline is required!" });
  }

  let editingTodo = user.todos.find((todo) => todo.id === id);

  if (!editingTodo) {
    return response.status(404).send({ error: USER_NOT_FOUND });
  }

  editingTodo.title = title;
  editingTodo.deadline = new Date(deadline);
  return response.json(editingTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let editingTodo = user.todos.find((todo) => todo.id === id);

  if (!editingTodo) {
    return response.status(404).send({ error: USER_NOT_FOUND });
  }

  editingTodo.done = true;
  return response.json(editingTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexTodo = user.todos.findIndex((todo) => todo.id === id);

  if (indexTodo === -1) {
    return response.status(404).send({ error: USER_NOT_FOUND });
  }
  user.todos.splice(indexTodo, 1);

  return response.status(204).send();
});

module.exports = app;

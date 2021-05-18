const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find(user => user.username === username)

  if(!user) return response.status(404).json({error: "User not found!"})

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const {username, name} = request.body

  const UsernameExists = users.some(user => user.username === username)

  if(UsernameExists) {
    return response.status(400).json({error: "User Already Exists"})}

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).json(users.find(user => user.username === username))
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {user} = request

    return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  })

  return response.status(201).json(user.todos.find(todo => todo.title === title))
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  const {title, deadline} = request.body

  const todoUser = user.todos.find(todo => todo.id === id)

  if(!todoUser) return response.status(404).json({error: "To-Do not found!"})

  todoUser.title = title
  todoUser.deadline = new Date(deadline)

  return response.status(200).json(todoUser)
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todoUser = user.todos.find(todo => todo.id === id)

  if(!todoUser) return response.status(404).json({error: "To-Do not found!"})

  todoUser.done = true

  return response.status(200).json(todoUser)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todoUser = user.todos.findIndex(todo => todo.id === id)

  if(todoUser === -1) return response.status(404).json({error: "To-Do not found!"})

  user.todos.splice(todoUser, 1)

  return response.status(204).send()
});

module.exports = app;
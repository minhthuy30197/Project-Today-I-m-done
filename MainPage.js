require('dotenv').config()

let express = require('express')
let Task = require('./models/task')
let bodyParser = require('body-parser')

let app = new express()
let json_body_parser = bodyParser.json()
let urlencoded_body_parser = bodyParser.urlencoded({extended: true})
app.use(json_body_parser)
app.use(urlencoded_body_parser)
app.use(express.static(__dirname + '/public'))

app.set('view engine', 'ejs')
app.set('port', process.env.WEB_PORT)

let tasks = getTasksFromDatabase()

app.post('/delete', function (req, res) {
  let obj = req.body
  pos = findTask(obj['id'])
  tasks.splice(pos, 1)
  res.status(200).send({result: 'success'})
})

app.post('/done', function (req, res) {
  let obj = req.body
  pos = findTask(obj['id'])
  tasks[pos].setDone(true)
  res.status(200).send({result: 'success', name: tasks[pos].getName()})
})

app.get('/pomo', function (req, res) {
  let id = req.param('id')
  res.status(200).send(id)
})

app.get('/fix', function (req, res) {
  let id = req.param('id')
  res.status(200).send(id)
})

app.post('/reset', function (req, res) {
  let obj = req.body
  pos = findTask(obj['id'])
  tasks[pos].setDone(false)
  res.status(200).send({result: 'success'})
})

app.post('/insert', function (req, res) {
  let obj = req.body
  let newtask = new Task(obj['name'], tasks.length + 1)
  tasks.push(newtask)
  res.status(200).send({result: 'success', id: newtask.getID()})
})

app.post('/changetask', function (req, res) {
  let obj = req.body
  console.log(obj['name'])
  let task = tasks[findTask(obj['id'])]
  task.setName(obj['name'])
  res.status(200).send({result: 'success'})
})

app.get('/task', function (req, res) {
  let id = req.param('id')
  let task = tasks[findTask(id)]
  let obj = {'name': task.getName(), 'id': task.getID()}
  res.status(200).send(JSON.stringify(obj))
})

app.get('/gettask', function (req, res) {
  let arr = []
  let objarr = {tasks: arr}
  let i = 0
  while (i < tasks.length) {
    arr[i] = {'name' : tasks[i].getName(), 'id' : tasks[i].getID(), 'done' : tasks[i].getDone()}
    i++
  }
  console.log(objarr)
  res.status(200).send(JSON.stringify(objarr))
})

app.get('/', function (req, res) {
  let view = 'MainPage'
  let params = {
    tasks: tasks,
  }
  res.status(200).render(view, params)
})

app.listen(app.get('port'), function () {
  console.log('Server running at http://localhost:' + app.get('port'))
})

function getTasksFromDatabase () {
  let task01 = new Task('commit my works', 1)
  let task02 = new Task('fix #6', 2)
  let task03 = new Task('implement feature #5', 3)
  return [task01, task02, task03]
}

function findTask (id) {
  i = 0
  while (i < tasks.length) {
    if (tasks[i].getID() == id) {
      return i
    }
    i++
  }
}

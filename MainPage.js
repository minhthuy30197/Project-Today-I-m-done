require('dotenv').config()

let express = require('express')
let Task = require('./models/task')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false})

let app = new express()

app.use(express.static(__dirname+'/public'))

app.set('view engine','ejs')

const port = process.env.WEB_PORT

let tasks = getTasksFromDatabase()

app.get('/delete',function (req,res) {
  let id = req.param('id')
  pos = findTask(id)
  tasks.splice(pos, 1)
  res.status(302).redirect('/')
})

app.get('/done',function (req,res) {
  let id = req.param('id')
  pos = findTask(id)
  tasks[pos].setDone(true)
  res.status(302).redirect('/')
})

app.get('/pomo',function (req,res) {
  let id = req.param('id')
  res.status(200).send(id)
})

app.get('/fix',function (req,res) {
  let id = req.param('id')
  res.status(200).send(id)
})

app.get('/reset',function (req,res) {
  let id = req.param('id')
  pos = findTask(id)
  tasks[pos].setDone(false)
  res.status(302).redirect('/')
})

app.post('/insert', urlencodedParser,function (req,res) {
  console.log(req.body.newtask)
  let newtask = new Task(req.body.newtask, tasks[tasks.length - 1] + 1)
  tasks.push(newtask)
  res.status(302).redirect('/')
})

app.get('/',function (req,res) {
  let view = 'MainPage'
  let params = {
    tasks: tasks
  }
  res.status(200).render(view, params)
})

app.listen(app.get('port'), function () {
  console.log(`Server running at http://localhost:${port}`)
})

function getTasksFromDatabase () {
  let task01 = new Task("commit my works", 1)
  let task02 = new Task("fix #6", 2)
  let task03 = new Task("implement feature #5", 3)
  return [task01, task02, task03]
}

function findTask (id) {
  i = 0;
  while (i < tasks.length) {
    if (tasks[i].getID() == id) {
      return i
    }
    i++;
  }
}


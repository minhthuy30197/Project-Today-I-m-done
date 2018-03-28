require('dotenv').config()

let express = require('express')
let Task = require('./models/task')
var bodyParser = require('body-parser')
//var urlencodedParser = bodyParser.urlencoded({ extended: false})

let app = new express()
//app.use(bodyParser.json())
var json_body_parser = bodyParser.json();
var urlencoded_body_parser = bodyParser.urlencoded({ extended: true });
app.use(json_body_parser);
app.use(urlencoded_body_parser);
app.use(express.static(__dirname+'/public'))

app.set('view engine', 'ejs')
app.set('port', process.env.WEB_PORT)

let tasks = getTasksFromDatabase()

app.get('/delete', function (req, res) {
  let id = req.param('id')
  pos = findTask(id)
  tasks.splice(pos, 1)
  res.status(302).redirect('/')
})

app.get('/done', function (req, res) {
  let id = req.param('id')
  pos = findTask(id)
  tasks[pos].setDone(true)
  res.status(302).redirect('/')
})

app.get('/pomo', function (req, res) {
  let id = req.param('id')
  res.status(200).send(id)
})

app.get('/fix', function (req, res) {
  let id = req.param('id')
  res.status(200).send(id)
})

app.get('/reset', function (req, res) {
  let id = req.param('id')
  pos = findTask(id)
  tasks[pos].setDone(false)
  console.log(tasks[pos])
  res.status(302).redirect('/')
})

app.post('/insert', urlencoded_body_parser,function (req,res) {
  console.log(req.body.newtask)
  let newtask = new Task(req.body.newtask, tasks.length+1)
  console.log(newtask.getID())
  tasks.push(newtask)
  res.status(302).redirect('/')
})

app.get('/', function (req, res) {
  let view = 'MainPage'
  let params = {
    tasks: tasks
  }
  res.status(200).render(view, params)
})

app.get('/task',function (req,res) {
  let id = req.param('id')
  let task = tasks[findTask(id)]
  var obj = { "name": task.getName(), "id": task.getID() }
  res.status(200).send(JSON.stringify(obj))
})

app.listen(app.get('port'), function () {
  console.log('Server running at http://localhost:' + app.get('port'))
})

app.post('/changetask',function (req, res) {
  let obj = req.body
  console.log(obj['name'])
  let task = tasks[findTask(obj['id'])]
  task.setName(obj['name'])
  res.status(200).send({result:"success"})
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

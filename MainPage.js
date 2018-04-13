require('dotenv').config()

let express = require('express')
let bodyParser = require('body-parser')
let cookie_parse = require('cookie-parser')

const mongoose = require('mongoose')
const taskSchema = mongoose.Schema({
  name: {type: String, default: 'an awesome task'},
  done: {type: Boolean, default: false},
  due: {type: Date}
})
let Task = mongoose.model('Task', taskSchema)
mongoose.connect('mongodb://binhsonnguyen.com:8000/today')

let app = new express()
app.use(cookie_parse());
let json_body_parser = bodyParser.json()
let urlencoded_body_parser = bodyParser.urlencoded({extended: true})
app.use(json_body_parser)
app.use(urlencoded_body_parser)
app.use(express.static(__dirname + '/public'))

app.set('view engine', 'ejs')
app.set('port', process.env.WEB_PORT)

let login = false

app.post('/delete', function (req, res) {
  let obj = req.body
  if (login == false) {
    let id = obj['id']
    let tasks = JSON.parse(req.cookies.tasks)
    let pos = 0
    while (pos < tasks.length) {
      if (tasks[pos].id == id) break
      pos++
    }
    console.log(tasks[pos].id)
    tasks.splice(pos, 1)
    console.log(tasks)
    res.clearCookie('tasks')
    res.cookie('tasks', JSON.stringify(tasks), { maxAge: calTimeExpired(), httpOnly: true })
    res.status(200).send({result: 'success'})
  }
  else {
    Task.deleteOne({_id: obj['id']}, function(err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      res.status(200).send({result: 'success'})
    })
  }
})

app.post('/done', function (req, res) {
  let obj = req.body
  if (login == false) {
    let id = obj['id']
    let tasks = JSON.parse(req.cookies.tasks)
    let pos = 0
    while (pos < tasks.length) {
      if (tasks[pos].id == id) break
      pos++
    }
    tasks[pos].done = true
    res.clearCookie('tasks')
    res.cookie('tasks', JSON.stringify(tasks),{ maxAge: calTimeExpired(), httpOnly: true })
    res.status(200).send({result: 'success', name: tasks[pos].name})
  }
  else {
    let myquery = { _id: obj['id'] }
    let newvalues = {$set: {done: true} }
    Task.updateOne(myquery, newvalues, function(err, respone) {
      if (err) throw err;
      else {
        console.log("1 document updated");
        Task.findOne({ '_id': obj['id'] }, 'name', function (err, task) {
          if (err) return handleError(err)
          else {
            res.status(200).send({result: 'success', name: task.name})
          }
        });
      }
    });
  }
})

app.post('/reset', function (req, res) {
  let obj = req.body
  if (login == false) {
    let id = obj['id']
    let tasks = JSON.parse(req.cookies.tasks)
    let pos = 0
    while (pos < tasks.length) {
      if (tasks[pos].id == id) break
      pos++
    }
    tasks[pos].done = false
    res.clearCookie('tasks')
    res.cookie('tasks', JSON.stringify(tasks), { maxAge: calTimeExpired(), httpOnly: true })
    res.status(200).send({result: 'success', name: tasks[pos].name})
  }
  else {
    let myquery = { _id: obj['id'] }
    let newvalues = {$set: {done: false} }
    Task.updateOne(myquery, newvalues, function(err, respone) {
      if (err) throw err;
      else {
        console.log("1 document updated");
        Task.findOne({ '_id': obj['id'] }, 'name', function (err, task) {
          if (err) return handleError(err)
          else {
            res.status(200).send({result: 'success', name: task.name})
          }
        });
      }
    });
  }
})

app.post('/insert', function (req, res) {
  let obj = req.body
  if (login == false) {
    if (req.cookies.tasks == undefined || JSON.parse(req.cookies.tasks).length == 0) {
      let id = 0
      res.cookie('tasks' , JSON.stringify([{name: obj['name'], done: false, id: id}]), { maxAge: calTimeExpired(), httpOnly: true })
      res.status(200).send({result: 'success', id: id});
    }
    else {
      let tasks = JSON.parse(req.cookies.tasks)
      let id = tasks[tasks.length-1].id + 1
      tasks.push({name: obj['name'], done:false, id: id})
      res.clearCookie('tasks')
      res.cookie('tasks', JSON.stringify(tasks), { maxAge: calTimeExpired(), httpOnly: true })
      res.status(200).send({result: 'success', id: id})
    }
  }
  else {
    let myobj = new Task({ name: obj['name'], due: new Date(2018, 2, 19, 17, 0, 0) })
    myobj.save(function (err, results) {
      if (err) throw err;
      res.status(200).send({result: 'success', id: results._id})
    })
  }
})

app.post('/changetask', function (req, res) {
  let obj = req.body
  if (login == false) {
    let id = obj['id']
    let tasks = JSON.parse(req.cookies.tasks)
    let pos = 0
    while (pos < tasks.length) {
      if (tasks[pos].id == id) break
      pos++
    }
    tasks[pos].name = obj['name']
    res.clearCookie('tasks')
    res.cookie('tasks', JSON.stringify(tasks), { maxAge: calTimeExpired(), httpOnly: true })
    res.status(200).send({result: 'success'})
  }
  else {
    let myquery = { _id: obj['id'] }
    let newvalues = {$set: {name: obj['name']} }
    Task.updateOne(myquery, newvalues, function(err, respone) {
      if (err) throw err;
      console.log("1 document updated");
      res.status(200).send({result: 'success'})
    });
  }
})

app.get('/task', function (req, res) {
  let id = req.param('id')
  if (login == false) {
    let tasks = JSON.parse(req.cookies.tasks)
    let pos = 0
    while (pos < tasks.length) {
      if (tasks[pos].id == id) break
      pos++
    }
    let obj = {'name':tasks[pos].name, 'id': id}
    res.status(200).send(JSON.stringify(obj))
  }
  else {
    Task.findOne({ '_id': id }, 'name', function (err, task) {
      if (err) return handleError(err)
      else {
        let obj = {'name': task.name, 'id': task.id}
        res.status(200).send(JSON.stringify(obj))
      }
    });
  }
})

app.get('/gettask', function (req, res) {
  let arr = []
  let objarr = {tasks: arr}
  if (login == false) {
    if (req.cookies.tasks !== undefined){
      let tasks = JSON.parse(req.cookies.tasks)
      tasks.forEach(function(task, pos) {
        arr[pos] = {'name' : task.name, 'id' : task.id, 'done' : task.done}
      });
      console.log(objarr)
    }
  }
  else {
    Task.find({}, function(err, tasks) {
      if (err) return handleError(err)
      else {
        tasks.forEach(function(task, pos) {
          arr[pos] = {'name' : task.name, 'id' : task.id, 'done' : task.done}
        })
        console.log(objarr)
      }
    })
  }
  res.status(200).send(JSON.stringify(objarr))
})

app.post('/close', function (req, res) {
  let pomo = {elapsedtime: req.body['elapsedtime'], isBreak: req.body['isBreak'], breakTime: req.body['breakTime'], totTime: req.body['totTime'], isPause: req.body['isPause'], nowTime: req.body['nowTime']}
  console.log(pomo)
  res.clearCookie('pomodoro')
  res.cookie('pomodoro', JSON.stringify(pomo), { maxAge: calTimeExpired(), httpOnly: true })
  res.status(200).send({result: 'success'})
})

app.get('/getpomo', function (req,res) {
  if (req.cookies.pomodoro == undefined) {
    res.status(200).send(JSON.stringify({elapsedtime: 0, isBreak: 'false', breakTime: 1, totTime: 2, isPause: true}))
  }
  else {
    let pomo = JSON.parse(req.cookies.pomodoro)
    res.clearCookie('pomodoro')
    if (pomo.isPause == 'true')  {
      res.status(200).send(JSON.stringify({'elapsedtime': pomo.elapsedtime, 'isBreak': pomo.isBreak, 'breakTime': pomo.breakTime, 'totTime': pomo.totTime, 'isPause': true}))
    }
    else {
      res.status(200).send(JSON.stringify({'elapsedtime': pomo.elapsedtime, 'isBreak': pomo.isBreak, 'breakTime': pomo.breakTime, 'totTime': pomo.totTime, 'isPause': false, 'nowTime': pomo.nowTime}))
    }
  }
})
app.get('/getslogan', function (req, res) {
  if (req.cookies.slogan == undefined) res.status(200).send({title: 'Today I will...'})
  else res.status(200).send({title: req.cookies.slogan})
})
app.post('/setslogan', function (req, res) {
  res.clearCookie('slogan')
  res.cookie('slogan', req.body.title, { maxAge: calTimeExpired(), httpOnly: true })
  res.status(200).send({result: 'success'})
})

function calTimeExpired () {
  var d1 = new Date()
  var d2 = new Date()
  d2.setHours(24,0,0,0);
  return d2.getTime() - d1.getTime()
}

app.get('/', function (req, res) {
  let view = 'MainPage'
  let params = {
  }
  res.status(200).render(view, params)
})

app.listen(app.get('port'), function () {
  console.log('Server running at http://localhost:' + app.get('port'))
})


require('dotenv').config()

let express = require('express')
let bodyParser = require('body-parser')

const mongoose = require('mongoose')
const taskSchema = mongoose.Schema({
  name: {type: String, default: 'an awesome task'},
  done: {type: Boolean, default: false},
  due: {type: Date}
})
let Task = mongoose.model('Task', taskSchema)
mongoose.connect('mongodb://binhsonnguyen.com:8000/today')

let app = new express()
let json_body_parser = bodyParser.json()
let urlencoded_body_parser = bodyParser.urlencoded({extended: true})
app.use(json_body_parser)
app.use(urlencoded_body_parser)
app.use(express.static(__dirname + '/public'))

app.set('view engine', 'ejs')
app.set('port', process.env.WEB_PORT)

app.post('/delete', function (req, res) {
  let obj = req.body
  Task.deleteOne({_id: obj['id']}, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.status(200).send({result: 'success'})
  })
})

app.post('/done', function (req, res) {
  let obj = req.body
  console.log(obj['id'])
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
})

app.post('/reset', function (req, res) {
  let obj = req.body
  console.log(obj['id'])
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
})

app.post('/insert', function (req, res) {
  let obj = req.body
  let myobj = new Task({ name: obj['name'], due: new Date(2018, 2, 19, 17, 0, 0) })
  myobj.save(function (err, results) {
    if (err) throw err;
    res.status(200).send({result: 'success', id: results._id})
  })
})

app.post('/changetask', function (req, res) {
  let obj = req.body
  let myquery = { _id: obj['id'] }
  let newvalues = {$set: {name: obj['name']} }
  Task.updateOne(myquery, newvalues, function(err, respone) {
    if (err) throw err;
    console.log("1 document updated");
    res.status(200).send({result: 'success'})
  });
})

app.get('/task', function (req, res) {
  let id = req.param('id')
  console.log(id)
  Task.findOne({ '_id': id }, 'name', function (err, task) {
    if (err) return handleError(err)
    else {
      let obj = {'name': task.name, 'id': task.id}
      res.status(200).send(JSON.stringify(obj))
    }
  });
})

app.get('/gettask', function (req, res) {
  Task.find({}, function(err, tasks) {
    if (err) return handleError(err)
    else {
      let arr = []
      let objarr = {tasks: arr}
      tasks.forEach(function(task, pos) {
        arr[pos] = {'name' : task.name, 'id' : task.id, 'done' : task.done}
      })
      console.log(objarr)
      res.status(200).send(JSON.stringify(objarr))
    }
  })
})

app.get('/', function (req, res) {
  let view = 'MainPage'
  let params = {
  }
  res.status(200).render(view, params)
})

app.listen(app.get('port'), function () {
  console.log('Server running at http://localhost:' + app.get('port'))
})


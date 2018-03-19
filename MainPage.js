require('dotenv').config()

let express = require('express')
let Task = require('./models/task')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false})

let app = new express()

app.use(express.static(__dirname+'/public'))

app.set('view engine','ejs')
app.set('port', process.env.WEB_PORT)

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
  pos = pomodoroClock ()
  res.status(302).redirect('/')
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
  console.log('Server running at http://localhost:' + app.get('port'))
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
function pomodoroClock () {
var pomodoro = {
  started : false,
  minutes : 0,
  seconds : 0,
  fillerHeight : 0,
  fillerIncrement : 0,
  interval : null,
  minutesDom : null,
  secondsDom : null,
  fillerDom : null,
  init : function(){
    var self = this;
    this.minutesDom = document.querySelector('#minutes');
    this.secondsDom = document.querySelector('#seconds');
    this.fillerDom = document.querySelector('#filler');
    this.interval = setInterval(function(){
      self.intervalCallback.apply(self);
    }, 1000);
    document.querySelector('#work').onclick = function(){
      self.startWork.apply(self);
    };
    document.querySelector('#stop').onclick = function(){
      self.stopTimer.apply(self);
    };
  },
  resetVariables : function(mins, secs, started){
    this.minutes = mins;
    this.seconds = secs;
    this.started = started;
    this.fillerIncrement = 200/(this.minutes*60);
    this.fillerHeight = 0;
  },
  startWork: function() {
    this.resetVariables(25, 0, true);
  },
  stopTimer : function(){
    this.resetVariables(25, 0, false);
    this.updateDom();
  },
  toDoubleDigit : function(num){
    if(num < 10) {
      return "0" + parseInt(num, 10);
    }
    return num;
  },
  updateDom : function(){
    this.minutesDom.innerHTML = this.toDoubleDigit(this.minutes);
    this.secondsDom.innerHTML = this.toDoubleDigit(this.seconds);
    this.fillerHeight = this.fillerHeight + this.fillerIncrement;
    this.fillerDom.style.height = this.fillerHeight + 'px';
  },
  intervalCallback : function(){
    if(!this.started) return false;
    if(this.seconds == 0) {
      if(this.minutes == 0) {
        this.timerComplete();
        return;
      }
      this.seconds = 59;
      this.minutes--;
    } else {
      this.seconds--;
    }
    this.updateDom();
  },
  timerComplete : function(){
    this.started = false;
    this.fillerHeight = 0;
  }
};
window.onload = function(){
  pomodoro.init();
};
}
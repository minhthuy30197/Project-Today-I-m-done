let timer = new Timer(25 * 60 * 1000);
$(document).ready(function() {
  $("#startstop").on("click", function() {
    $(".settings").css({"color": "lightgrey"})
    if ($("#startstop").text() == "Start") {
      startTimer(timer);
      $("#startstop").removeClass('btn-primary')
      $("#startstop").text("Pause").addClass('btn-warning');
    }
    else {
      timer.stop();
      $("#startstop").removeClass('btn-warning')
      $("#startstop").text("Start").addClass('btn-primary');
    }
  });

  $("#reset").on("click", function() {
    $(".settings").css({"color": "black"})
    $("#startstop").removeClass('btn-warning')
    $("#startstop").text("Start").addClass('btn-primary');
    timer.reset();
  });

  $("#breakSub").on("click", function() {
    if (timer.elapsed != 0) alert("You can only modify the Break Time when pomodoro doesn't work.\nPlease press RESET.")
    else setNewTime($("#breakTime"), -1);
  });
  $("#breakAdd").on("click", function() {
    if (timer.elapsed != 0) alert("You can only modify the Break Time when pomodoro doesn't work.\nPlease press RESET.")
    else setNewTime($("#breakTime"), 1);
  });
  $("#totSub").on("click", function() {
    if (timer.elapsed != 0) alert("You can only modify the Time when pomodoro doesn't work.\nPlease press RESET.")
    else setNewTime($("#totTime"), -1);
  });
  $("#totAdd").on("click", function() {
    if (timer.elapsed != 0) alert("You can only modify the Time when pomodoro doesn't work.\nPlease press RESET.")
    else setNewTime($("#totTime"), 1);
  });
});

$(window).on('beforeunload', function() {
  let isBreak = ($("#break-text").css("visibility") == "visible")
  let isPause = true
  if (timer.paused == false) isPause = false
  timer.stop()
  $.ajax({
    type: 'POST',
    url: '/close',
    data: {'elapsedtime': timer.getElapsed(), 'isBreak': isBreak, 'breakTime': $("#breakTime").text(), 'totTime': $("#totTime").text(), 'isPause': isPause, 'nowTime': (new Date()).getTime()},
    dataType: 'json',
    async: false
  });
});

function setNewTime(element, diff) {
  var newTime = parseInt(element.text()) + diff;
  if (newTime < 1) {
    newTime = 1;
  } else if (newTime > 60) {
    newTime = 60;
  }
  element.text(newTime);
}

function startAnimation() {
  var leftBall = document.getElementById("leftBall");
  leftBall.className += " leftMove";

  var rightBall = document.getElementById("rightBall");
  rightBall.className += " rightMove";
}

function stopAnimation() {
  var leftBall = document.getElementById("leftBall");
  leftBall.className = "cord";

  var rightBall = document.getElementById("rightBall");
  rightBall.className = "cord";
}

function degToRad(degrees) {
  var factor = Math.PI / 180;
  return degrees * factor;
}

function Timer(duration) {
  this.previousTime;
  this.paused = true;
  this.elapsed = 0;
  this.duration = duration + 300;
  this.updateRate = 100;
  this.onTimeUp = function() {
    this.stop();
    stopAnimation();
    changePhase(this);
  };
  this.onTimeUpdate = function() {
    var timeLeft = this.duration - this.elapsed;
    this.displayTime();
  }
  this.getElapsed = function() {
    return this.elapsed;
  }
}

Timer.prototype.start = function() {
  playNotification();
  this.paused = false;
  this.previousTime = new Date().getTime();
  this.keepCounting();
  startAnimation();
}

Timer.prototype.start1 = function(elapsedtime) {
  playNotification();
  this.paused = false;
  this.elapsed = parseInt(elapsedtime);
  this.previousTime = new Date().getTime();
  this.keepCounting();
  startAnimation();
}

Timer.prototype.setStopTime = function(elapsedtime) {
  this.elapsed = parseInt(elapsedtime);
  this.onTimeUpdate();
}

Timer.prototype.displayTime = function() {
  var timeLeft = this.duration - this.elapsed;
  var minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  var seconds = Math.floor((timeLeft / 1000) % 60);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  var formattedTime = minutes + ":" + seconds;
  $("#time-display").text(formattedTime);
}

Timer.prototype.keepCounting = function() {
  if (this.paused) {
    return true;
  }

  var now = new Date().getTime();
  var diff = (now - this.previousTime);
  this.elapsed = this.elapsed + diff;
  this.previousTime = now;
  this.onTimeUpdate();
  if (this.elapsed >= this.duration) {
    this.stop();
    this.onTimeUp();
    return true;
  }
  var that = this;
  setTimeout(function() {
    that.keepCounting();
  }, this.updateRate);
};

Timer.prototype.stop = function() {
  this.paused = true;
  stopAnimation();
}

Timer.prototype.reset = function() {
  this.stop();
  this.elapsed = 0;
  this.displayTime();
}

Timer.prototype.setDuration = function(duration) {
  this.duration = duration + 300;
}

function changePhase(timer) {
  var isBreak = ($("#break-text").css("visibility") == "visible")
  if (isBreak) {
    timer.setDuration($("#totTime").text() * 60 * 1000);
    $("#break-text").css("visibility", "hidden");
  } else {
    timer.setDuration($("#breakTime").text() * 60 * 1000);
    $("#break-text").css("visibility", "visible");
  }
  timer.reset();
  timer.start();
  playNotification();
}

function playNotification(){
  document.getElementById("notify").play();
}

function startTimer(timer){
  var isBreak = ($("#break-text").css("visibility") == "visible");
  if (isBreak) {
    timer.setDuration($("#breakTime").text() * 60 * 1000);
  } else {
    timer.setDuration($("#totTime").text() * 60 * 1000);
  }
  timer.start();
}

function continueTimer (timer, elapsedtime, isBreak) {
  if (isBreak == 'true') {
    $('#break-text').css({'visibility': 'visible'})
    timer.setDuration($("#breakTime").text() * 60 * 1000);
  } else {
    $('#break-text').css({'visibility': 'hidden'})
    timer.setDuration($("#totTime").text() * 60 * 1000);
  }
  timer.start1(elapsedtime);
}

function continueStop (timer, elapsedtime, duration) {
  timer.setDuration(parseInt(duration) * 60 * 1000)
  timer.setStopTime(elapsedtime);
}

function isEditTable () {
  if (timer.getElapsed() == 0) return true
  else return false
}
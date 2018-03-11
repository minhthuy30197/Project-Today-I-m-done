let Task = function(name, id) {
  let _name = name;
  let _id = id;
  let done = false;

  this.getName = function () {
    return _name;
  }

  this.getID = function () {
    return _id;
  }

  this.getDone = function () {
    return done;
  }

  this.setName = function (name) {
    _name = name;
  }

  this.setDone = function (state) {
    done = state;
  }
};

module.exports = Task

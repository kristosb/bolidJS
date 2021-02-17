/* Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

/** Create a new stepper instance */
function StepperMotor(obj) {
  this.pins = obj.pins;
  this.pattern = obj.pattern || [0b0001,0b0010,0b0100,0b1000];
  this.offpattern = obj.offpattern || 0;
  this.pos = 0;
  this.stepsPerSec = obj.stepsPerSec || 100;
  this.onstep = obj.onstep || 0;
  this.newPos = 0;
  this.interval = undefined;
  this.idle = false;
  this.msg = 'idle';
  this.endStopLeft = obj.endStopLeft;
  this.endStopRight = obj.endStopRight;
  pinMode(this.endStopLeft, 'input_pullup');
  pinMode(this.endStopRight, 'input_pullup');
  pinMode(this.pins[0], 'output');
  pinMode(this.pins[1], 'output');
  pinMode(this.pins[2], 'output');
  pinMode(this.pins[3], 'output');
  //this.leftEnd = undefined;
  //this.rightEnd = undefined;
}


/** Set the current position to be home (0) */
StepperMotor.prototype.setHome = function() {
  this.pos = 0;
};

/** Get the current position */
StepperMotor.prototype.getPosition = function() {
  return this.pos;
};

/** Stop movement, and if `turnOff` is true turn off the coils */
StepperMotor.prototype.stop = function(turnOff) {
  if (this.interval) {
    clearInterval(this.interval);
    this.interval = undefined;
  }
  if (turnOff)
    digitalWrite(this.pins, this.offpattern);
};

/** Move to a specific position in the time given. If no time
is given, it will be calculated based on this.stepsPerSec.
`callback` will be called when the movement is complete,
and if `turnOff` is true the coils will be turned off */
StepperMotor.prototype.moveTo = function(pos, milliseconds, callback, turnOff) {
  pos = 0|pos; // to int
  if (milliseconds===undefined)
    milliseconds = Math.abs(pos-this.pos)*1000/this.stepsPerSec;
  this.stop(turnOff);
  if (pos != this.pos) {
    var stepper = this;
    var step = function() {
      // remove interval if needed
      if (stepper.pos == pos) {
        stepper.stop(turnOff);
        if (callback)
          callback();
      } else {
        // move onwards
        stepper.pos += (pos < stepper.pos) ? -1 : 1;
        // now do step
        digitalWrite(stepper.pins, stepper.pattern[ stepper.pos & (stepper.pattern.length-1) ]);
      }
      if (stepper.onstep) stepper.onstep(stepper.pos);
    };
    this.interval = setInterval(step, milliseconds / Math.abs(pos-this.pos));
    step();
  } else {
    if (callback)
      setTimeout(callback, milliseconds);
  }
};
////////////////////////
/*
StepperMotor.prototype.endStopSetup = function() {
  this.leftEnd = setWatch(function(e) {
    
  }, this.endStopLeft , { repeat: true, edge: 'falling', debounce: 1 });
  this.rightEnd = undefined;
};*/
StepperMotor.prototype.posUpdate = function(pos) {
  this.newPos = 0|pos; // to int
};
/*set up timer checking for new position*/
StepperMotor.prototype.timerSet = function(milliseconds) {
  var stepper = this;
  var step = function() {
    // stop
    if (stepper.pos == stepper.newPos) {
      if (!stepper.idle){ 
        digitalWrite(stepper.pins, stepper.offpattern);
        stepper.emit(stepper.msg, stepper.pos);
        stepper.msg = 'idle';
      }
      stepper.idle = true;
    } else {
      // move onwards
      var step = ( stepper.newPos < stepper.pos) ? -digitalRead(stepper.endStopRight) : digitalRead(stepper.endStopLeft); //+1, -1 or 0 if any end points toggled
      stepper.pos += step;
      // now do step
      digitalWrite(stepper.pins, stepper.pattern[ stepper.pos & (stepper.pattern.length-1) ]);
      stepper.idle = false;
      if(!step) {
        stepper.newPos = stepper.pos;
        stepper.msg = 'limit';
      }
    }
  };
  this.interval = setInterval(step, milliseconds);
};
/** Set the current position to be home (0) */
StepperMotor.prototype.setZero = function() {
  this.newPos =0;
  this.pos = 0;
};
exports = StepperMotor;
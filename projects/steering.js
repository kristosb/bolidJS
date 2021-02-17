var StepperMotor = require("StepperMotorContinous");

//pinMode(D25, 'input_pullup');
/*pinMode(D3, 'output');
pinMode(D4, 'output');
pinMode(D5, 'output');
pinMode(D11, 'output');
pinMode(D6, 'output');
pinMode(D29, 'input_pullup');
pinMode(D31, 'input_pullup');*/

var motor = new StepperMotor({
  pins:[D6,D3,D11,D4],
  pattern :  [0b0011,0b0110,0b1100,0b1001],  // high torque full
  endStopLeft : D29,
  endStopRight : D31
  //pins:[D5,D11,D4,D3], //different config for full wave
  //pattern :  [0b0001,0b0010,0b0100,0b1000] //org wave
  //pattern :  [0b1001,0b0101,0b0110,0b1010]  // high torque full
  //pattern :  [0b0001,0b0101,0b0100,0b0110,0b0010,0b1010,0b1000,0b1001] //half step
  //stepsPerSec: 500
});

//var next_state = 1;
/*var state= 0;
function lightsOn(lights){ 
  digitalWrite(lights,1);
  return;
  }

function lightsOff(lights){ 
  digitalWrite(lights,0);
  return;
  }

var toggleLights = function(){
  state ? lightsOn(D5) : lightsOff(D5);
  state = !state;
  return;
};*/

motor.setHome();
motor.timerSet(0.01);
var steeringSpan = 0;
var steeringCalMax = 800;
var spanMiddle =0;
var calOffset = 20;
//var callCheck;
/*function steeringCalibrate(){
  steeringSpan =0;
  motor.setZero();
  motor.posUpdate(steeringCalMax);
  var leftEnd = setWatch(function(e) {
    steeringSpan = motor.getPosition();
    motor.posUpdate(-steeringCalMax);
    console.log("Button 29 pressed");
    console.log(steeringSpan);
  }, D29, { repeat: false, edge: 'falling' });

  var rightEnd = setWatch(function(e) {  
    steeringSpan =steeringSpan - motor.getPosition();
    spanMiddle = Math.floor(motor.getPosition() + steeringSpan/2);
    motor.posUpdate(spanMiddle+calOffset);
    console.log("Button 31 pressed");
    console.log(motor.getPosition());
    console.log(steeringSpan);
    console.log(spanMiddle);
    motor.emit('finished','done');
  }, D31, { repeat: false, edge: 'falling' });
  
  motor.on('finished', val => { console.log(val);
                                //clearWatch(leftEnd);
                                //clearWatch(rightEnd);
                                 motor.removeAllListeners('finished');
                              });
  motor.on('idle', val => {
    console.log(val);   
    motor.setZero();
    console.log('calibration finished'); 
    motor.removeAllListeners('idle');
                               });

}*/

//motor.posUpdate(100);
function move(){
  console.log(motor.getPosition());
  if(motor.getPosition() >= 0)
    motor.posUpdate(-100);
  else
    motor.posUpdate(100);
}
//move(100);
//motor.posUpdate(100);
//setTimeout(move,2000);
//setTimeout(move,6000);
//setInterval(move,3000);
console.log("test");

var span = {
  max: undefined,
  min: undefined,
  middle: function(){
    return Math.floor((this.min == undefined || this.max ==undefined) ? 0 : ((this.max - this.min)/2)-this.max);
  },
  reset: function(){
    this.min = undefined;
    this.max = undefined;
  },
  done: function(){
    return (this.min != undefined && this.max !=undefined);
  }
};

motor.on('idle', val => {
  console.log('idle');
  console.log(val);   
  console.log(span.middle());
  //motor.removeAllListeners('idle');
    });
motor.on('limit', val => {
  console.log('limit');
  console.log(val);   
  if (val>0) 
    span.max = val;
  else 
    span.min = val;
  if(span.done()) {
    motor.pos = motor.pos + span.middle(); 
    motor.posUpdate(motor.pos); 
    console.log(span.middle());
    span.reset();
    console.log('done');
  }
    });
//motor.posUpdate(steeringCalMax);
//steeringCalibrate();
//setTimeout(move(100),10); setTimeout(move(-100),1000);
//motor.posUpdate(10);
/*function swap() {
  LED1.write(next_state);
  next_state = !next_state;
}

function swap_on_down() {
  if (digitalRead(D25) == 1) swap();
}
  //setWatch(swap_on_down, D25, true);
  setWatch(function() {
  motor.moveTo(motor.getPosition()+100, 100, function() {
      console.log("Done!");
  },true);
}, D25, {repeat:true, edge:"rising", debounce:50});
*/
//motor.moveTo(motor.getPosition()-100,true);

/*motor.moveTo(motor.getPosition()+200, 100, 
  function(){
    console.log("xDone!");
  },true);
*/

/*setInterval(function() 
      {
      motor.moveTo(motor.getPosition()-200, 100, 
        function(){
          console.log("xDone!");
        },true);
      }
      , 5000);*/

  /*var finished = function calibFinished(){
    if(spanComplete){
        console.log('span complete');
        console.log(motor.getPosition());
        if (motor.getPosition() == spanMiddle ){
          motor.setHome();
          spanMiddle = 0;
          //clearWatch(leftEnd);
          //clearWatch(rightEnd);
          console.log('cal complete');
          console.log(motor.getPosition());
          spanComplete = false;
        }
    }
  };*/
  //callCheck = setInterval(finished, 500);
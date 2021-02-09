var StepperMotor = require("StepperMotorContinous");

//pinMode(D25, 'input_pullup');
pinMode(D3, 'output');
pinMode(D4, 'output');
pinMode(D5, 'output');
pinMode(D11, 'output');
pinMode(D6, 'output');
pinMode(D29, 'input_pullup');
pinMode(D31, 'input_pullup');

var motor = new StepperMotor({
  pins:[D6,D3,D11,D4],
  pattern :  [0b0011,0b0110,0b1100,0b1001]  // high torque full
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
var steeringCalMax = 500;
var spanComplete = false;
var spanMiddle =0;
function steeringCalibrate(){
  steeringSpan =0;
  motor.posUpdate(steeringCalMax);
  var leftEnd = setWatch(function(e) {
    console.log("Button 29 pressed");
    steeringSpan = motor.getPosition();
    motor.posUpdate(-steeringCalMax);
    console.log(steeringSpan);
  }, D29, { repeat: false, edge: 'falling', debounce: 1 });

  var rightEnd = setWatch(function(e) {
    console.log("Button 31 pressed");
    steeringSpan =steeringSpan - motor.getPosition();
    console.log(motor.getPosition());
    console.log(steeringSpan);
    spanMiddle = Math.floor(motor.getPosition() + steeringSpan/2);
    console.log(spanMiddle);
    motor.posUpdate(spanMiddle);
    spanComplete = true;
  }, D31, { repeat: false, edge: 'falling', debounce: 1 });
  
  var finished = function calibFinished(){
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
  };
  setInterval(finished, 500);
}

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
steeringCalibrate();
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
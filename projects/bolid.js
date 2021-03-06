var motRear = require("motors").connect({pin1: D18,pin2: D19},0);
var motFront = require("motors").connect({pin1: D26,pin2: D27},0);
var StepperMotor = require("StepperMotorContinous");

motRear.motorConfig();
motRear.decayModeSet(motRear.decay.COAST);
motFront.motorConfig();
motFront.decayModeSet(motRear.decay.COAST);
motRear.dcMotorControl(motRear.dir.FWD, 0);
motFront.dcMotorControl(motRear.dir.FWD,0);

var motor = new StepperMotor({
  pins:[D6,D3,D11,D4],
  pattern :  [0b0011,0b0110,0b1100,0b1001],  // high torque full
  endStopLeft : D29,
  endStopRight : D31
  //stepsPerSec: 500
  //offpattern : 0b1111
});

var headLights = [D25,D28];
var rearLights = [D16,D17];
var heartBeat = 0;
var heartBeatPrevious = 0;

function lightsOn(lights){ 
  digitalWrite(lights,0b11);
  return;
  }

function lightsOff(lights){ 
  digitalWrite(lights,0b00);
  return;
  }
var FuelLevel = 0;
function getBatteryLevel() {
  var val = analogRead(D30); // read voltage
  // voltage = 6.52*adc+0.11
  val = 6.52*val + 0.11;
  FuelLevel = (val- 3.3)*180;//210
  FuelLevel = Math.floor(E.clip(FuelLevel, 0, 255));
}
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
//setup pins driving lights
pinMode(headLights[0], 'output');
pinMode(headLights[1], 'output');
pinMode(rearLights[0], 'output');
pinMode(rearLights[1], 'output');

motor.setHome();
motor.timerSet(0.01);

//var zeroPos = motor.getPosition();
/* home position calibration on limit events */
motor.on('limit', val => {
  //console.log('limit');
  //console.log(val);   
  if (val>0) 
    span.max = val;
  else 
    span.min = val;
  if(span.done()) {
    motor.pos = motor.pos + span.middle(); 
    motor.posUpdate(motor.pos); 
    //console.log(span.middle());
    span.reset();
    //console.log('done');
  }
});
function toggleLights(){
  //if(state) lightsOn(headLights); else lightsOff(headLights);
  //state = !state;
  lightsOn(headLights);
  setTimeout(function () {
    lightsOff(headLights);
  }, 50);
  return;
}
function checkHeartbeat(){
  if (heartBeat == heartBeatPrevious){
    motRear.dcMotorControl(motRear.dir.FWD, 0);
    motFront.dcMotorControl(motRear.dir.FWD,0);
    toggleLights();
  }
  heartBeatPrevious = heartBeat;
}

function bolidControl(event){
  var direction = motRear.dir.FWD;
  var speed =0;
  //headlights
  if(event.data[1]&0x01) lightsOn(headLights); else lightsOff(headLights);
  //break
  if(event.data[1]&0x02){
    motRear.decayModeSet(motRear.decay.FAST);
    motFront.decayModeSet(motRear.decay.FAST);
    lightsOn(rearLights); 
  }
  else {
    motRear.decayModeSet(motRear.decay.COAST);
    motFront.decayModeSet(motRear.decay.COAST);
    lightsOff(rearLights);
  }
  // gear and break check  
  switch(event.data[3]) {
        case 0:
            speed = 0;
            break;
        case 1:
            speed = event.data[4]/255;
            direction = motRear.dir.BKW;
            break;
        case 2:
            speed = event.data[4]/255;
            direction = motRear.dir.FWD;
            break;
        default:
  }
  //acceleration
    //if (event.data[4] <= 255 && event.data[4]>=0){
  motRear.dcMotorControl(direction, speed);
  motFront.dcMotorControl(direction,speed);
    //}
  //steering
  //if (event.data[5] <= 255 && event.data[5]>=0){
  var position = ((event.data[5]-127)*3)+ event.data[2]-127;
  motor.posUpdate(position);
  //heartbeat
  heartBeatPrevious = heartBeat;
  heartBeat = event.data[0];
  //}
}

NRF.setServices({
  0xBCDE : {
    0xABCD : {
      value : [0,0,0,0,0,0],
      writable : true,
      onWrite : function(evt) {
        bolidControl(evt);    
      }
    },
    0xABCE: { // fuel
      readable : true,
      value : [FuelLevel,0xAA]
    }
  }
},{ advertise: [ 'BCDE' ] });

function bolidRdUpdate(){
NRF.updateServices({
  0xBCDE : {
    0xABCE : {
      value : [FuelLevel,0xAA]
    }
  }
});
}
getBatteryLevel();
setInterval( checkHeartbeat, 500);
setInterval(getBatteryLevel,1000);
setInterval( bolidRdUpdate, 1000);


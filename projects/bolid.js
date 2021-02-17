motRear = require("motors").connect({pin1: D18,pin2: D19},0);
motFront = require("motors").connect({pin1: D26,pin2: D27},0);
var StepperMotor = require("StepperMotorContinous");
/*pinMode(D3, 'output');
pinMode(D4, 'output');
pinMode(D11, 'output');
pinMode(D6, 'output');
pinMode(D29, 'input_pullup');
pinMode(D31, 'input_pullup');*/
var motor = new StepperMotor({
  pins:[D6,D3,D11,D4],
  pattern :  [0b0011,0b0110,0b1100,0b1001],  // high torque full
  endStopLeft : D29,
  endStopRight : D31
  //stepsPerSec: 500
  //offpattern : 0b1111
});

var head_lights = [D25,D28];
var rear_lights = [D16,D17];

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
pinMode(head_lights[0], 'output');
pinMode(head_lights[1], 'output');
pinMode(rear_lights[0], 'output');
pinMode(rear_lights[1], 'output');

motor.setHome();
motor.timerSet(0.01);
motRear.motorConfig();
motFront.motorConfig();
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

function bolidControl(event){
  //headlights
  event.data[1] ? lightsOn(head_lights) : lightsOff(head_lights);
  //acceleration
  if (event.data[4] <= 255 && event.data[4]>=0){
    motRear.dcMotorControl(motRear.dir.FWD,event.data[4]/255);
    motFront.dcMotorControl(motFront.dir.FWD,event.data[4]/255);
  }
  //steering
  if (event.data[5] <= 255 && event.data[5]>=0){
    var position = ((event.data[5]-127)*2)+ event.data[2]-127;
    motor.posUpdate(position);
  }
}
setInterval(getBatteryLevel,1000);
getBatteryLevel();

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
setInterval( bolidRdUpdate, 1000);


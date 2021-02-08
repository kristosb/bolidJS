mot = require("motors").connect({pin1: D18,pin2: D19},0);
motFront = require("motors").connect({pin1: D26,pin2: D27},0);
var StepperMotor = require("StepperMotorContinous");

var motor = new StepperMotor({
  pins:[D6,D3,D11,D4],
  pattern :  [0b0011,0b0110,0b1100,0b1001],  // high torque full
  //stepsPerSec: 500
  offpattern : 0b1111
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
  //console.log(FuelLevel);
}

//setup pins driving lights
pinMode(head_lights[0], 'output');
pinMode(head_lights[1], 'output');
pinMode(rear_lights[0], 'output');
pinMode(rear_lights[1], 'output');

motor.setHome();
motor.timerSet(0.1);
mot.motorConfig();
motFront.motorConfig();
var zeroPos = motor.getPosition();
//mot.dcMotorControl(mot.dir.FWD,0.05);

function bolidControl(event){
  //headlights
  event.data[1] ? lightsOn(head_lights) : lightsOff(head_lights);
  //acceleration
  if (event.data[4] <= 255 && event.data[4]>=0){
    mot.dcMotorControl(mot.dir.FWD,event.data[4]/255);
    motFront.dcMotorControl(mot.dir.FWD,event.data[4]/255);
  }
  //steering
  if (event.data[5] <= 255 && event.data[5]>=0){
    var position = zeroPos +((event.data[5]-127)*2);
    motor.posUpdate(position);
    //motor.stop(true);
    //motor.moveTo(position ,true);
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


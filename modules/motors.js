
const direction = 
{
FWD: 0,
BKW: 1
} 

const decay = 
{
FAST: 0,
COAST: 1
}

function pinSwap(dir, pins, decmode)
{
return (dir^decmode ? { pin1 : pins.pin1, pin2: pins.pin2 } : { pin1: pins.pin2, pin2: pins.pin1 } );
}

function motors(pins) {
  this.pins = pins;
  this.dir = direction;
  this.decay = decay;
  this.decmode = decay.FAST;
  this.frequency = 20;
  console.log("motor initialized");
}
motors.prototype.decayModeSet = function (dec)
{
  this.decmode = dec;
}
motors.prototype.frequencySet = function (freq)
{
  this.frequency = freq;
}
motors.prototype.motorConfig = function ()
{
  pinMode(this.pins.pin1, 'analog');
  pinMode(this.pins.pin2, 'analog');
}

motors.prototype.dcMotorControl = function ( dir, speed)
{
  console.log(dir);	
  var pinorder = pinSwap(dir, this.pins, this.decmode)
  var pwm = Math.abs(speed - this.decmode);
  console.log(pwm);
  analogWrite(pinorder.pin1, this.decmode, {freq:this.frequency});
  analogWrite(pinorder.pin2, pwm, {freq:this.frequency} );
}

exports.connect = function (pins) {
  return new motors(pins);
};
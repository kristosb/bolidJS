mot = require("motors").connect({pin1: D18,pin2: D19},0);
mot.motorConfig();
mot.dcMotorControl(mot.dir.FWD,0.05);
//var next_state = 1;
//var ADCPIN = D29;

/*function swap() {
  LED1.write(next_state);
  next_state = !next_state;
}

function swap_on_down() {
  if (digitalRead(D25) == 1) swap();
}

function getPot() {
  var val = analogRead(ADCPIN); // read voltage
  return val; // and return the temperature
}

function checkPot() {
 var temp = getPot();
 //console.log("pot val = "+temp );//+" pwm = " + pwm);
 setServo(D11, temp);
}

function setServo(pin,pos) {
 if (pos<0) pos=0;
 if (pos>1) pos=1;
 analogWrite(pin, (1+pos) / 10, {freq:100});
}

function potToServo(pot)
{
  var pwm = (pot*5+5)/100;
  return pwm;
}*/

//pinMode(D25, 'input_pullup');
//pinMode(ADCPIN, 'analog');

//setWatch(swap_on_down, D25, true);
//setInterval(checkPot, 50);


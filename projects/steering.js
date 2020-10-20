var StepperMotor = require("StepperMotor");

pinMode(D25, 'input_pullup');
//pinMode(D3, 'analog');
//pinMode(D4, 'analog');
//pinMode(D26, 'analog');
//pinMode(D27, 'analog');

var motor = new StepperMotor({
  //pins:[D26,D3,D27,D4],
  pins:[D3,D4,D26,D27],
  pattern :  [0b1001,0b0101,0b0110,0b1010]
});

var next_state = 1;


function swap() {
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



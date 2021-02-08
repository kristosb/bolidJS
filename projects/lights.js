var head_lights = [D25,D28];
var rear_lights = [D16,D17];
var state = true;
var toggle_front = 0;
var toggle_rear = 0;

pinMode(head_lights[0], 'output');
pinMode(head_lights[1], 'output');
pinMode(rear_lights[0], 'output');
pinMode(rear_lights[1], 'output');



function lightsOn(lights){ 
  digitalWrite(lights,0b11);
  return;
  }

function lightsOff(lights){ 
  digitalWrite(lights,0b00);
  return;
  }

var toggleLights = function(){
  state ? lightsOn(head_lights) : lightsOff(head_lights);
  state ? lightsOff(rear_lights) : lightsOn(rear_lights);
  state = !state;
  return;
};

var testLights = function(){
  toggle_front ? lightsOn(head_lights) : lightsOff(head_lights);
  toggle_rear ?  lightsOn(rear_lights) : lightsOff(rear_lights);
  return;
};

//setInterval(testLights, 200);
NRF.setServices({
  0xBCDE : {
    0xABCD : {
      value : [0,0,0,0,0,0],
      writable : true,
      onWrite : function(evt) {
        evt.data[1] ? lightsOn(head_lights) : lightsOff(head_lights);
      }
    }
  }
},{ advertise: [ 'BCDE' ] });
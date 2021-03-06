const LBL_CONNECT = "Connect";
const LBL_DISCONNECT = "Disconnect";
const LBL_DISCONNECTING = "Disconnecting";
const LBL_CONNECTING = "Connetting";
const LBL_RESET = "Reset";
const LBL_RESETTING = "Resetting";
const LBL_STOP = "Stop";
const LBL_CV = "CV";
const LBL_CCV = "CCV";
const LBL_STOPPING = "Stopping";


var headingDegrees, sv_heading=0;

function init(url) {
  websocket = new WebSocket(url);

  websocket.onopen = function() {
      outputMessage("CONNECTED",false);
      var btn = document.getElementById("btnConnect");
      btn.value = LBL_DISCONNECT;
      btn.className = "button";
      document.getElementById("btnStop").className="button buttonWarn";
      document.getElementById("btnReset").className="button";
  };

// getting responses from server (nodemcu)
  websocket.onmessage = function(evt) {
      var obj = JSON.parse(evt.data);


      switch(obj.c) {

          case "getCompass":
              document.gauges.forEach(function(gauge) {
                    gauge.value = parseFloat(obj.v) || 0;
                    gauge.update({ valueText: parseDir(obj.r)});
              });
          break;

          case "setRotator":
              break;

          case "stopRotator":
              break;

          default:
      }
  };

  websocket.onerror = function(evt) {
      outputMessage("ERROR: " + evt.data,true);
      var btn = document.getElementById("btnConnect");
      btn.value = LBL_CONNECT;
      btn.className = "button";
    };
  }

  function outputMessage (msg,error) {
  	var elem = document.getElementById("output");
    msg=(new Date).toTimeString().slice(0,8)+" "+msg;

  	if (error==true) {
  	  	elem.innerHTML += "<P class  = 'error' >"+msg+"</P>";
  	} else {
  			elem.innerHTML += "<P>" +msg+"</P>";
  	}
  }


  function getCompass() {
      message='{"c":"getCompass","v":"","r":""}'
      websocket.send(message);
  }

  function setRotator(degree) {
    message='{"c":"setRotator","v":"'+degree+'","r":""}'
    console.log(message);
    websocket.send(message);
  }

  function reset() {
    message='{"c":"reset","v":"","r":""}'
    console.log(message);
    websocket.send(message);
  }


  function sendMessage(message) {

    outputMessage("SENT: " + message,false);
    websocket.send(message);
  }

  function wait(ms)  {
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
  }

  //managing connection button
  function btnConnectFunc() {
    var btnReset = document.getElementById("btnReset");
    var btnStop= document.getElementById("btnStop");
    var btnConnect = document.getElementById("btnConnect");
    if (btnConnect.className != "button buttonPressed" && btnConnect.className != "button buttonDisabled"  ) {
      btnConnect.className = "button buttonPressed";
      if (btnConnect.value == LBL_CONNECT) {
        btnConnect.value = LBL_CONNECTING;
        init(document.getElementById("connectionString").value);
      }  else {
        btnConnect.value = LBL_DISCONNECTING;
        websocket.close();
        outputMessage("DISCONNECTED",false);
        document.gauges.forEach(function(gauge) {
              gauge.value = 0;
        });
        wait(1000);
        btnConnect.className = "button";
        btnConnect.value = LBL_CONNECT;

        btnStop.className="button buttonDisabled";
        btnStop.value=LBL_STOP;

        btnReset.className="button buttonDisabled";
        btnReset.value=LBL_RESET;
      }

    }
  }

  //managing reset button
  function btnResetFunc() {
    var btnReset = document.getElementById("btnReset");
    var btnStop= document.getElementById("btnStop");
    var btnConnect = document.getElementById("btnConnect");
    if (btnReset.className != "button buttonPressed" && btnReset.className != "button buttonDisabled"  ) {

      btnReset.value = LBL_RESETTING;
      btnReset.className = "button buttonPressed";

      btnStop.className="button buttonDisabled";
      btnStop.value=LBL_STOP;

      btnConnect.className="button buttonDisabled";
      btnConnect.value=LBL_CONNECT;

      reset();

      websocket.close();
      document.gauges.forEach(function(gauge) {
            gauge.value = 0;
      });

      wait(6000);

      btnReset.value = LBL_RESET;
      btnReset.className = "button buttonDisabled";
      btnConnect.className = "button";
    }
  }

//managing stop button
function btnStopFunc() {
  var btn = document.getElementById("btnStop");
  if (btn.className != "button buttonPressed" && btn.className != "button buttonDisabled"  ) {
    btn.value = LBL_STOPPING;
    btn.className = "button buttonPressed";
    //TODO: implement
  }
}

// get heading of mousePointer
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

//open window on the same window
function redirect(url){
   var url = "#openModal";
    window.open(url, '_top');
}

function parseDir(dir){
  if (dir == 0) {
    return LBL_STOP;
  } else if (dir == -1) {
    return LBL_CCV;
  }
  return LBL_CV;
}

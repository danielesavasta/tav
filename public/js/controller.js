let _ws = null;
var section="";
var view="";
/*var slider = document.getElementById("myRange");*/
var artistsList = document.getElementById("artistsList");
var typeList = document.getElementById("typeList");
var themeList = document.getElementById("themeList");
var timelineList = document.getElementById("timelineList");
var materialList = document.getElementById("materialList");
var techniqueList = document.getElementById("techniqueList");

init();
function init() {
    _ws = new WebSocket(`ws://${window.location.host}/comm`);
    _ws.onmessage = (message) => {
        message = JSON.parse(message.data).message;
        if(message[0]=='w')
          setWhole(message.substring(5))
          console.log(message.substring(5));
      };
}

//https://codepen.io/Erigone/pen/nJOjmo
(function ($) {
  var v, up = 0, down = 0, i = 0, whole=1
    , $idir = $("div.idir")
    , $ival = $("div.ival")
    , incr = function () { i++; if(i>whole) i=whole; $idir.show().html("+").fadeOut(); $ival.html(i); }
    , decr = function () { i--; if (i < 0) i = 0;  $idir.show().html("-").fadeOut(); $ival.html(i); }
  //, setWheel = function (val) { i=val; $ival.html(i); }
  function resetWheel() {
    while(i>0)
      decr();
  }
  function setWhole(val) {
    console.log(val)
    whole=val;
  }
  window.myResetFunction = resetWheel;
  window.setWhole = setWhole;

  $("input.infinite").knob(
    {
      min: 0
      , max: 3000
      , stopper: true
      , change: function () {
        if (v > this.cv) {
          if (up) {
            decr();
            up = 0;
          } else { up = 1; down = 0; }
        } else {
          if (v < this.cv) {
            if (down) {
              incr();
              down = 0;
            } else { down = 1; up = 0; }
          }
        }
        v = this.cv;
        callGrouper(i);
      }
    });
})(jQuery);

function openthis(sub){
  view=sub;
  hideEverything();
  console.log(sub);
  window.myResetFunction();
  
  //givemeawheel();
  switch(sub){
    case 'gallery': window.setWhole(2292); break;
    case 'artists': artistsList.classList.remove("hidden"); break;
    case 'type': typeList.classList.remove("hidden"); break;
    case 'technique': techniqueList.classList.remove("hidden"); break;
    case 'material': materialList.classList.remove("hidden");  break;
    case 'theme': themeList.classList.remove("hidden"); break;
    case 'timeline': timelineList.classList.remove("hidden"); break;
  }
    _ws.send(JSON.stringify({
        message: sub
    }));
}

function opensection(sub){
  window.myResetFunction();
  window.setWhole(100);
  _ws.send(JSON.stringify({
    message: view +":"+sub
}));
  section=sub;
}

function hideEverything(){
  artistsList.classList.add("hidden");
  typeList.classList.add("hidden");
  techniqueList.classList.add("hidden");
  materialList.classList.add("hidden");
  themeList.classList.add("hidden");
  timelineList.classList.add("hidden");
}

hideEverything();

function callGrouper(val){
  let esmes=view+":"+section+":"+ val;
  console.log(esmes);
  _ws.send(JSON.stringify({
    message: esmes
  }));
}

//console.log(techniques.sort(turkcesiralama));
// Update the current slider value (each time you drag the slider handle)
/*
slider.oninput = function() {
  let esmes=section+":"+ this.value;
  console.log(esmes);
  _ws.send(JSON.stringify({
    message: esmes
}));
}
*/

function populateArtists(){
  let artistslistlist=`<div id="controllerArtistWindow"></div><ul id="controllerArtistList">`;
  _.forEach(artists, function(artist) {
        let name=artist.name;
        artistslistlist+=`<li id="${artist.id}">${name}</li>`;
    });
    artistslistlist+=`</ul>`;
    artistsList.innerHTML=artistslistlist;
}
populateArtists();

/*
var carousel = document.querySelector('#controllerArtistList');
//var indicator = document.querySelector('#indicator');
var elements = document.querySelectorAll('#controllerArtistList > *');
var currentIndex = 0;

var observer = new IntersectionObserver(function(entries, observer) {
    // find the entry with the largest intersection ratio
    var activated = entries.reduce(function (max, entry) {
      return (entry.intersectionRatio > max.intersectionRatio) ? entry : max;
    });
    if (activated.intersectionRatio > 0) {
      currentIndex = elementIndices[activated.target.getAttribute("id")];
      //renderIndicator();
      console.log(currentIndex);
      _ws.send(JSON.stringify({
        message: "londdex: "+currentIndex
      }));
    }
  }, {
    root:carousel, threshold:0.5
  });

  var elementIndices = {};
  for (var i = 0; i < elements.length; i++) {
    elementIndices[elements[i].getAttribute("id")] = i;
    observer.observe(elements[i]);
  }*/
/*
  onscrollend = (event) => {
    console.log("here");
  }*//*
  controllerArtistList.addEventListener("wheel", (event) => {
    _ws.send(JSON.stringify({
      message: "londdex: "
    }));
  });
  controllerArtistList.addEventListener("scrollend", (event) => {
   console.log("Scrollend event fired!");
   console.log(event);
   _ws.send(JSON.stringify({
    message: "londdex: "
  }));
  });*/
  controllerArtistList.onscroll = function() {
    //console.log("Scrolled!");
    const scrollP = parseInt(this.scrollTop/33);
    /*console.log(scrollP);
    const namP=document.getElementById("controllerArtistList").childNodes[scrollP].id;
    console.log(namP);*/
    section=(scrollP+1);
    _ws.send(JSON.stringify({
      message: view +":"+section // + " of "+ namP
    }));
    // Your code to handle scrolling
  };
  /*
  .addEventListener("touchmove", (event) => {
    console.log("move");
    ws.send(JSON.stringify({
      message: "londdex: "
    }));
  });*/

  window.ontouchstart = function(event) {
    if (event.touches.length>1) { //If there is more than one touch
        event.preventDefault();
    }
}
  //var rect = element.getBoundingClientRect();


  function turkcesiralama(a, b){
    var atitle = a.title;
    var btitle = b.title;
    var alfabe = "AaBbCcÇçDdEeFfGgĞğHhIıİiJjKkLlMmNnOoÖöPpQqRrSsŞşTtUuÜüVvWwXxYyZz0123456789";
    if (atitle.length === 0 || btitle.length === 0) {
        return atitle.length - btitle.length;
    }
    for(var i=0;i<atitle.length && i<btitle.length;i++){
        var ai = alfabe.indexOf(atitle[i]);
        var bi = alfabe.indexOf(btitle[i]);
        if (ai !== bi) {
            return ai - bi;
        }
    }
} 
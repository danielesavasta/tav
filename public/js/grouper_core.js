/*------------------------------------------------------------------------*/
var db,
  dba,
  dbKeysList = [],
  snapshot,
  selectedCol,
  iCont;
var selector = [];
const fullDir="/full/";
const sDir="/thumbs/";
/*const alphabetTR="abcçdefgğhiıjklmnoöprsştuüvyz"*/
const alphabetTR="ABCÇDEFGHIİJKLMNOÖPRSŞTUÜVWYZ";

const metadataCategories = [];
let foundItemID = 0;
let indexcardIsOn = false;

const scope = document.querySelector("body");
let contextMenu;

const main = document.getElementsByTagName("main")[0];
var dbLength, itemsCount;

var galleryOverUnlocked = true;
var overID = -1;
var root = document.querySelector(":root");
let scale = 2;
let _ws = null;
var selectedID;

/*function init() {
  _ws = new WebSocket(`ws://${window.location.host}/comm`);
  _ws.onmessage = (message) => {
      message = JSON.parse(message.data);
      console.log(message);
      openthis(message.message);
  };
}
// initiation of connection with client
// init(); 

/* ---------------------------------- inactivityTime :: lazy console.log ---------------------------------- */

var inactivityTime = function () {
  var time;
  window.onload = resetTimer;
  // DOM Events
  // replace with message

  /*document.onmousemove = resetTimer;
  document.onkeydown = resetTimer;
*/

  function resetTimer(t) {
      clearTimeout(time);
      time = setTimeout(moveSomething, t)
      //setInterval(function () {moveSomething()}, 1000);
      // 1000 milliseconds = 1 second
  }
  return { // Return an object with the public method
    resetTimer: resetTimer
  };
};
// initiator of inactivity time
// var inactivity = inactivityTime();

function moveSomething(){
  console.log("should move!");
  inactivity.resetTimer(5000);
  selectArtist(["",getRandomInt(1048)]);
}


function openthis(msg){
  //log("we are here")
  inactivity.resetTimer(20000);
  switch (msg){
    case 'gallery': 
                  window.open("/gallery","_self")
                  log("open the gallery view"); break;
    case 'artists': 
                  window.open("/gallery/artists","_self")
                  log("open the artists view"); break;
    case 'timeline': 
                  window.open("/timeline","_self")
                  log("open the timeline view"); break;
    case 'type': 
                  window.open("/gallery/type","_self")
                  log("open the type view"); break;                
    case 'technique': 
                  window.open("/groups/technique","_self")
                  log("open the technique view"); break; 
    case 'material': 
                  window.open("/gallery/material","_self")
                  log("open the material view"); break;
    case 'theme': 
                  window.open("/gallery/theme","_self")
                  log("open the theme view"); break;  
                }
    if(msg[0]=='t') {
      const groupString = msg.split(':');
      //console.log("itsragroup");
      getAgroup(groupString);
    } else 
    if(msg[0]=='a') {
      let isArtist=msg.split(":");
      //console.log(isArtist[1]);
      selectArtist(isArtist);
      
      if(isArtist[2]!=undefined)
        console.log(isArtist[2]);
    }if(msg[0]=='g') {
      let isGallery=msg.split(":");
      gotoid(isGallery[2])
    } else {
      if(msg[0]==':') {
        gotoid(msg.substring(1))
      }

    }
}

function selectArtist(artist) {
  const index=artist[1];
  const cont=document.querySelector("#imagesContainer");
  const geesEls=document.querySelectorAll("figure");
  console.log("sonoqua: "+geesEls.length); //all artworks
  
  _.forEach(geesEls, function(g) {g.classList.remove("hover");});
  
  const groupA = document.getElementsByClassName("groupA");
  _.forEach(groupA, function(g) {g.classList.remove("selected");g.classList.remove("hover");});
  
  const selEment=document.querySelector(".g"+index);
  _ws.send(JSON.stringify({message: "whole"+selEment.childElementCount}));
  cont.classList.add("hover");
  selEment.classList.add("selected");
  scrollToElement(cont.parentElement,selEment)
  let artwork=1;
  if(artist[2]!=undefined) artwork=artist[2];
  
  
  //const geesEl=selEment.childNodes[artwork];
  emulateImgOver(selEment, artwork)
  //geesEl.classList.add("hover");
}

function gotoid(index) {
  //const cont=document.querySelector("#imagesContainer");
  emulateImgOver(document.getElementById(iCont),index);
}

function getAgroup(gees) {
  //log(gees);
  const groupS = document.getElementsByClassName("groupS");
  _.forEach(groupS, function(g) {g.classList.add("noshow");g.classList.remove("supershow");g.classList.remove("hover");});

  const getSection=document.getElementsByClassName(gees[1]);
  getSection[0].classList.remove("noshow");
  getSection[0].classList.add("supershow");
  log("sono qui>"+getSection[0].childElementCount)

  _ws.send(JSON.stringify({message: "whole"+getSection[0].childElementCount}));

  getSection[0].childElementCount
  if(gees[2]!=undefined) {
    //log(gees[1])
    const geesEls=getSection[0].childNodes;
    const geesEl=getSection[0].childNodes[gees[2]];//[gees[1]].id;
    const geesId=geesEl.firstElementChild.id;
    //geesId.classList.add("hover");
    
    _.forEach(geesEls, function(g) {g.classList.remove("hover");});
    log(geesId);
    imgOver("",geesId);
    document.getElementById(iCont).classList.add("hover");
    geesEl.classList.add("hover");
    
  }
  /*console.log(getSection[0]);*/
  //imgOver();
}

function emulateImgOver(container, index){
  const elIndex=container.childNodes[index];
  const elId=elIndex.firstElementChild.id;
  _.forEach(container.childNodes, function(g) {g.classList.remove("hover");});
  imgOver("",elId);
  container.classList.add("hover");
  elIndex.classList.add("hover");
  //$("#sidebar").animate({ scrollTop: $("#sidebar").scrollTop()+elem.offset().top }, { duration: 'medium', easing: 'swing' }); 
  scrollToElement(container.parentElement,elIndex)
}

function scrollToLetter(sidebarElement, targetElement) {
  if(targetElement=="all") {
    
    const nothighlightedItems = document.querySelectorAll(sidebarElement+" > div");
    nothighlightedItems.forEach((userItem) => {
      userItem.classList.remove("notHigh");
    });
  }
  else scrollToElement(sidebarElement, targetElement,true);
  
}

function scrollToElement(sidebarElement, targetElement, isLetter) {
  // Get the current scroll position of the sidebar
  let sidebarName, targetName;
  if (typeof sidebarElement === "string") {
    sidebarName = sidebarElement;
    sidebarElement = document.querySelector(sidebarElement);
  }
  if (typeof targetElement === "string") {
    targetName = targetElement;
    targetElement = document.querySelector(targetElement);
  }
  // Get the offset of the target element relative to the document
  const currentScrollTop = sidebarElement.scrollTop;
  const targetOffsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;

  // Calculate the new scroll position to bring the target element into view
  const newScrollTop = currentScrollTop + targetOffsetTop - 110;
  log("goto:" + newScrollTop + ":" + targetOffsetTop);

  // Animate the scroll smoothly
  sidebarElement.scrollTo({
    top: newScrollTop,
    behavior: "smooth",
  });
  if ((sidebarName!=null)&&(isLetter)) {
    const nothighlightedItems = document.querySelectorAll(sidebarName+" > div");
    //log(nothighlightedItems)
    //sidebarElement.getElementsByClassName("div").style.opacity = "0.75";
    nothighlightedItems.forEach((userItem) => {
      userItem.classList.add("notHigh");
    });
    targetElement.classList.remove("notHigh");
  } 
}

function datatableV() {
  datatable(main, db, dbKeys[settings.collection1]);
}

function groupsV() {
  populateGroups(main, db, dba, groups, settings.imageField, groupsfieldname);
}

async function searchV(dbLen) {
  /*--------------------- ARTISTS FOUND -------------------------------- */
  const artistView = createEl(
    "section",
    "galleryView",
    "view viewGroups",
    "<legend id='ina'>Images not associated<legend>",
    main
  ); // Creating the view container
  /*const galleryView = createEl(
    "section",
    "",
    "",
    "<legend id='ina'>Images not associated<legend>",
    main
  );*/
  let images = "";
  let imagesByGroups = {};
  //log(findWorks)
  //log(dbLen)

  _.forEach(findArtists, function(artista){
   // console.log(findArtists)
    //console.log(db)
   // console.log(artista)
    imagesByGroups[artista.name]=_.filter(findArtistsWorks, function(o) { return o.artist_id===artista.id });
    imagesByGroups[artista.name].id=artista.id;
    images+=`<section class="groupB"><div class="groupAH"><h3>${artista.name}</h3><h4>${imagesByGroups[artista.name].length}</h4></div>`;
    log("-----------------------------------");
    log(artista.name);
    log(artista.id);
    log("-----------------------------------");
    _.forEach(imagesByGroups[artista.name], function(work){
      images += prepareIMG(work._id,"imageThumb",work[settings.imageField]);
    });
    images+=`</section>`;
  });

  //log("imagesbygroup: "+imagesByGroups)
  //let alphabetNav=`<div id="alphabetNav"><a onclick='scrollToLetter("#imagesContainer","all")'>#</a>`;
  //for (i = 0; i < alphabetTR.length; i++) {
    //let letr=alphabetTR[i];
    //log(letr);
    //const authorsInThisGroup=_.filter(imagesByGroups,function(works,artist){ 
      // if(artist[0] == letr) {
      //images+=`<section class="groupA g${works.id}"><div class="groupAH"><h3>${artist}</h3><h4>${imagesByGroups[artist].length}</h4></div>`;
      /*_.forEach(imagesByGroups[artist], function(work){
        images += prepareIMG(work._id,"imageThumb",work[imKey]);
      });*/
      //images+=`</section>`;
      //return }});
    //images+=`</div>`;
    //alphabetNav+= `<a onclick='scrollToLetter("#imagesContainer","#${letr}")'>${letr}</a>`;
  //}
  let galleryViewContent='<section id="artworkDescription"></section><div id="imagesSupContainer">';
  /*if(!settings.exhibitionMode) {
    galleryViewContent+='<div class="tool"><input onclick="lockClick()" type="checkbox" id="galleryOverUnlocked" name="galleryOverUnlocked"><label for="galleryOverUnlocked">lock item</label> <input type="range" min="5" max="100" value="50" class="linear_slider" id="imgSize"></input></div>';
  }*/
  galleryViewContent+=`<div id="imagesArtContainer" >${images}</div></div>`;
  artistView.innerHTML =galleryViewContent;

  miniPopulateImages(document.querySelector("#imagesArtContainer"), findWorks, findWorksArtists, settings.imageField);

  let imagesContainer=document.querySelector("#imagesArtContainer");
  if(dbLen<25) {imagesContainer.classList.add("images25")} else
  if(dbLen<50) {imagesContainer.classList.add("images50")} else
  if(dbLen<100) {imagesContainer.classList.add("images100")}
  iCont="imagesArtContainer";
  containerControl();

  //loadRandomCard();
}

function galleryV() {
  if(groupsfieldname!="")
    if(groupsfieldname=="artists")
      populateArtists(main, db, dba, settings.imageField);
    else
      populateImagesInGroups(main, db, dba, groups, settings.imageField, groupsfieldname);
  else
    populateImages(main, db, dba, settings.imageField,false);
  //db.sort((a,b) => a.title?.localeCompare(b.title));
  loadRandomCard(db);
}

function loadRandomCard(db){
  let randomID=Math.floor((Math.random()*db.length)).toString();
  console.log("randomid: "+randomID);
  console.log("_id: "+db[randomID]._id);
  loadCardinContainer(db[randomID]._id,iCont);
  //gotoid(iCont, db[randomID]._id);
}

async function timelineV() {
  //db.sort((a,b) => a.date?.localeCompare(b.date));
  const result = await Object.groupBy(db, ({ date }) => date);
  populateTimeline(main, result, settings.imageField);
}

function showFieldVisibility() {
  let keys = dbKeys[settings.collection1];
  let showFieldVisibility = document.getElementById("showFields");

  let k = 0,
    klen = keys.length;
  while (k < klen) {
    const checkField = createEl("input","k" + keys[k].id,"checkField","",showFieldVisibility);
    checkField.setAttribute("type", "checkbox");
    checkField.setAttribute("name", keys[k].id);
    checkField.setAttribute("value", keys[k].name);
    if (keys[k].display) checkField.checked = true;

    const checkFieldL = createEl(
      "label",
      "",
      "",
      keys[k].name,
      showFieldVisibility
    );
    checkFieldL.setAttribute("for", "k" + keys[k].id);
    k++;
  }
  const applyFieldsFilter = createEl("a","","but_confirm","apply",showFieldVisibility);
  applyFieldsFilter.setAttribute("onclick", "setFieldVisibility()");
}

/* ---------------------------------- analysis :: count lines of db, keys ---------------------------------- */
function analysis(container) {
  dbLength = db.length;
  itemsCount = db.length;

  let i = 0,
    len = dbKeys[settings.collection1].length;
  while (i < len) {
    dbKeysList.push(dbKeys[settings.collection1][i].name);
    i++;
  }

  let st =`<section id="analysis"><h3>Analysis</h3><div>Visualizing<br><b id="itemsCount">${itemsCount}</b>${dbLength} items</div><div><h4>Unique keys</h4><ul><li>${dbKeysList.join("</li><li>")}</li></ul></div><div><h4>Count Collections</h4>${countTags("5")}</div><div><h4>Count Years</h4>${countString("11")}</div></section>`;
  if(imageSelector) st+='<section id="selector"><h3>Selector</h3><div id="dw_button" class="but_confirm" onclick="downloadSearch()">Download Search Artifacts</div><div id="ds_button" class="but_confirm" onclick="downloadSelect()">Download Selected Artifacts</div></section>';
  container.innerHTML += st;

  // generateID();
}

function countTags(field) {
  let i = 0,
    len = dbLength,
    tags = [],
    tagsCount = [];
  while (i < len) {
    if (db[i][field]) {
      let k = 0,
        lenk = db[i][field].length;
      while (k < lenk) {
        let j = 0,
          lenj = tags.length,
          f = false;
        while (j < lenj) {
          if (tags[j] == db[i][field][k]) {
            tagsCount[j]++;
            f = true;
          }
          j++;
        }
        if (!f) {
          tags.push(db[i][field][k]);
          tagsCount[j] = 1;
        }

        k++;
      }
    }
    i++;
  }
  //log(tags);
  //log(tagsCount);
  let returnTags = Array(tags.length);
  (i = 0), (len = tags.length);
  while (i < len) {
    returnTags[i] = new Array(2);
    returnTags[i][0] = tags[i];
    returnTags[i][1] = tagsCount[i];
    i++;
  }
  returnTags.sort(sortFunction);
  log(returnTags);

  (i = 0), (len = returnTags.length);
  let returnStringTags = "";
  while (i < len) {
    returnStringTags +=
      "<a onclick='filterByTag(\""+field+"\",\""+returnTags[i][0]+"\")'><b>" +
      returnTags[i][0] +
      "</b><span>" +
      returnTags[i][1] +
      "</span></a>";
    i++;
  }

  return returnStringTags;
}

/*--------------------------- filterByTag---------------------*/
 function filterByTag(field,tag){
  let i=0;len=db.length, found=[];
  while(i<len) {
    log(db[i][field])
    if(db[i][field]!== undefined) {
    let j=0,jlen=db[i][field].length;
    while(j<jlen) {
    if(db[i][field][j]==tag) {
      let newObj= '{"_id":"'+db[i]._id.toString()+'"}';
      found.push(newObj);
    }
    j++;
    }}
    i++;
  }
  log(found.toString());
  datatableFilter("["+found.toString()+"]");
}

function countString(field) {
  let i = 0,
    len = dbLength,
    tags = [],
    tagsCount = [];
  while (i < len) {
    if (db[i][field]) {
      let j = 0,
        lenj = tags.length,
        f = false;
      while (j < lenj) {
        if (tags[j] == db[i][field]) {
          tagsCount[j]++;
          f = true;
        }
        j++;
      }
      if (!f) {
        tags.push(db[i][field]);
        tagsCount[j] = 1;
      }
    }
    i++;
  }
  let returnTags = Array(tags.length);
  (i = 0), (len = tags.length);
  while (i < len) {
    returnTags[i] = new Array(2);
    returnTags[i][0] = tags[i];
    returnTags[i][1] = tagsCount[i];
    i++;
  }
  returnTags.sort(sortFunction);
  log(returnTags);

  (i = 0), (len = returnTags.length);
  let returnStringTags = "";
  while (i < len) {
    returnStringTags +=
      "<div><b>" +
      returnTags[i][0] +
      "</b><span>" +
      returnTags[i][1] +
      "</span></div>";
    i++;
  }

  return returnStringTags;
}

function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] < b[0] ? -1 : 1;
  }
}

/* ---------------------------------- rawJSON :: print of all json lines ---------------------------------- */
function rawJSON(what, where) {
  let lines = readItemsJson(what);
  where.innerHTML += "<section>";
  where.innerHTML += "<div>" + lines.join("</div><div>");
  where.innerHTML += "</div></section>";
}

/* ---------------------------------- readItemsJson :: list all items in json db ---------------------------------- */
function readItemsJson(objs) {
  let lines = [];
  let i = 0,
    len = objs.length;
  while (i < len) {
    let j = 0,
      jlen = objs[i].length;
    while (j < jlen) {
      let line = j + ": " + objs[i][j];
      lines.push(line);
    }

    return lines;
  }
}

/* ========================================================================================================================================================================================================================================
                                                        DATA TABLE
   ======================================================================================================================================================================================================================================== */

function datatable(container, database, keys) {
  populateContextMenu();

  const datatableview = createEl("section", "datatableView", "view", "", ""); // Creating the view container
  const datatablebody = createEl(
    "div",
    "datatableBody",
    "viewBody",
    "",
    datatableview
  ); // Create the body

  // Create the data table
  const tbl = createEl("table", "datatable", "", "", datatablebody);

  // --- header
  const h_row = document.createElement("thead");
  tbl.appendChild(h_row);
  const trh_row = document.createElement("tr");
  h_row.appendChild(trh_row);

  let k = 0,
    klen = keys.length;
  while (k < klen) {
    let value = keys[k].name;
    if (keys[k].display) {
      const t_cell = createEl("th", "th_" + keys[k].id, "", value, trh_row);
      t_cell.setAttribute("onclick", 'selectCol("th_' + keys[k].id + '");');
      t_cell.setAttribute("oncontextmenu", "onRightClick(this,event);");
    }
    k++;
  }
  // --- body
  let tbody = createEl("tbody", "tblBody", "", "", tbl);

  let j = 0,
    rows = database.length;
  while (j < rows) {
    let elem = database[j];

    let t_row = document.createElement("tr");
    t_row.setAttribute("id", "tr" + elem._id);
    t_row.setAttribute("onclick", "selectID(" + elem._id + ")");
    t_row.setAttribute("oncontextmenu", "onRightClickRow(this,event);");
    tbody.appendChild(t_row);

    let i = 0,
      len = keys.length;
    while (i < len) {
      if (keys[i].display) {
        let keyvalue = keys[i].id;
        let td_cell = document.createElement("td");

        if (elem[keyvalue] != null) {
          switch (keys[i].type) {
            case "link":
              td_cell.innerHTML =`<a target='_blank' href='${elem[keyvalue]}'>${decodeURI(/[^/]*$/.exec(elem[keyvalue]))}</a>`;
              break;
            case "tags":
              let j = 0,
                lenj = elem[keyvalue].length;
              while (j < lenj) {
                td_cell.innerHTML +=`<div class='chipsVal'>${elem[keyvalue][j]}</div>`;
                j++;
              }
              break;
            case "images":
              let h = 0,
                lenh = elem[keyvalue].length;
              while (h < lenh) {
                td_cell.innerHTML += `<img class='chipsVal' src='"+ settings.imagePath+"${sDir}${elem[keyvalue][h]}.webp'/>`;
                h++;
              }
              break;
            case "date":
              if (elem[keyvalue].length != 4) td_cell.classList.add("error");
            default:
              if (!isNumeric(elem[keyvalue]))
                td_cell.innerHTML = elem[keyvalue].replace(/\n/g, "<br />");
              else td_cell.innerHTML = elem[keyvalue];
          }
        }

        if (keys[i].editable) {
          log(keys[i].editable)
          td_cell.addEventListener("dblclick", modifyCellContent);
        }
        td_cell.setAttribute("k", keyvalue);
        td_cell.setAttribute("i", elem._id);
        t_row.appendChild(td_cell);
      }
      i++;
    }
    j++;
  }

  // --- footer
  let footer = createEl(
    "div",
    "datatableFooter",
    "viewFooter",
    "<div class='editProperty'></div>",
    datatableview
  );
  container.appendChild(datatableview);
}

function setFieldVisibility(keys = dbKeys[settings.collection1]) {
  const showFieldVisibility = document.getElementById("showFields");

  let checkboxes = showFieldVisibility.getElementsByTagName("input");

  let i = 0,
    len = checkboxes.length;
  while (i < len) {
    keys[i].display = checkboxes[i].checked;
    i++;
  }
  datatable(main, db, dbKeys[settings.collection1]);
}

/* ---------------------------------- selectID :: select item and highlight in the datatable  ---------------------------------- */
function selectID(id) {
  let tb = document.getElementById("tblBody").children;
  for (let i = 0; i < tb.length; i++) {
    tb[i].classList.remove("selectedID");
  }
  selectedIDvalue = id;
  foundItemID = db.findIndex((item) => item.id == id);

  document.getElementById("tr" + id).classList.add("selectedID");
  if (indexcardIsOn) indexcard();
}
/* ---------------------------------- sortByTh :: sort table view by column header ---------------------------------- */
function sortByTh() {
  contextMenu.classList.remove("visible");
  log("sorting " + selectedCol);
  let e = document.getElementById("th_" + selectedCol).cellIndex;
  sortGrid(e);
}


async function scrollToAndBack(v) {
 // let scrolly=document.getElementById("objectData").scrollHeight;

  const currentScrollTop = document.querySelector("#artworkDescription").scrollTop;
  const targetOffsetTop = document.querySelector("#artworkDescription").getBoundingClientRect().top + window.pageYOffset;

  // Calculate the new scroll position to bring the target element into view
  const newScrollTop = currentScrollTop + targetOffsetTop - 110;


  log("scrolly "+currentScrollTop + " - " + targetOffsetTop+ " - " +  newScrollTop)
  if(newScrollTop>0)
    { 
      await scrollToElement("#artworkDescription","#imgSlider");
      document.querySelector("#readmore").classList.remove("up");
      //log("it was clicked "+newScrollTop)
      //document.getElementById("readmore").onclick=scrollToAndBack(1);
    } else {
      await scrollToElement("#artworkDescription","#objectData");
      document.querySelector("#readmore").classList.add("up");
      //log("it should go up clicked "+newScrollTop)
    }
    /*
    else {
      scrollToElement("#artworkDescription","#imgSlider") 
      document.getElementById("readmore").onclick=scrollToAndBack(0);
    }*/
}

function returnCardContent(foundItem,foundArtist){
  let carousel = '';
  //if(!settings.exhibitionMode) carousel+=`<article id="addToSelector" class="tool" onclick="addToSelector()">+</div>`;
      carousel += `<div class="imgslider" id="imgSlider"><div class="slides">`;
      if(settings.imageArray) {
      let i = 0,
        len = foundItem[imKey].length;
      while (i < len) {
        carousel +=`<div id="slide-${i}"><img src="${settings.imagePath}${fullDir}${foundItem[imKey][i]}.webp"></div>`;
        i++;
      }
      }
      else carousel +=`<div id="slide-0"><img src="${settings.imagePath}${fullDir}${foundItem[imKey]}.webp"></div>`;
      carousel += `</div></div>`;
      let metadata = `<div class="label">`;

      log(foundArtist);
      let title=((lang=="tr") ? foundItem.title_tr : (foundItem.title_en==undefined) ? foundItem.title_tr : foundItem.title_en);
      metadata += `<h2 aria-label="Artwork Title">${title}</h2>`;
      if(foundItem.date!=undefined) metadata += `<time aria-label="Date" datetime=${foundItem.date}">${foundItem.date}</time>`;
      
      if(foundArtist.name!=undefined) {
      metadata += `<a rel="author"><b>${foundArtist.name}</b> (`
      if(exValue(foundArtist,"birthplace")) metadata +=`<span aria-label="Nationality">${tag("birthplace",foundArtist.birthplace)}</span>, `;
      if(exValue(foundArtist,"birthyear")) metadata +=`<time aria-label="Birthyear" datetime="${foundArtist.birthyear}">${foundArtist.birthyear}</time>`;
      if(exValue(foundArtist,"deathyear")) metadata +=` — <time aria-label="Deathyear" datetime="${foundArtist.deathyear}">${foundArtist.deathyear}</time>)</a>`;
      else metadata += `)</a>`;
    }

      metadata += `<a onclick='scrollToAndBack(0)' id="readmore"></a><div id="objectData"><h4>${tag("card",0)}</h4><dl>
                   <dt>${tag("card",1)}</dt><dd>TK-${foundItem.id.toString().padStart(5, '0')}</dd>
                   <dt>${tag("card",2)}</dt><dd>${foundItem.title_tr}</dd>
                   <dt>${tag("card",3)}</dt><dd>${foundItem.title_en}</dd>
                   <dt>${tag("card",4)}</dt><dd>${tag("type",foundItem.type)}</dd>
                   <dt>${tag("card",5)}</dt><dd>${foundItem.date}</dd>
                   </dl>
                   <h4>${tag("card",6)}</h4><dl>
                   <dt>${tag("card",7)}</dt><dd>${foundArtist.name}</dd>
                   <dt>${tag("card",8)}</dt><dd>${tag("birthplace",foundArtist.birthplace)}</dd>
                   <dt>${tag("card",9)}</dt><dd>${foundArtist.birthyear}`
      if(exValue(foundArtist,"deathyear")) metadata += ` - ${foundArtist.deathyear}`;
      metadata +=  `</dd></dl>
                   <h4>${tag("card",10)}</h4><dl>
                   <dt>${tag("card",11)}</dt><dd>${foundItem.material}</dd>
                   <dt>${tag("card",12)}</dt><dd>${foundItem.technique}</dd>
                   <dt>${tag("card",13)}</dt><dd>${foundItem.dimensions}</dd>
                   </dl>
                   <h4>${tag("card",14)}</h4><dl>
                   <dt>${tag("card",15)}</dt><dd>${tag("themes",foundItem.theme)}</dd>
                   <dt>${tag("card",16)}</dt><dd>${foundItem.label_tr}</dd>
                   <dt>${tag("card",17)}</dt><dd>${foundItem.label_en}</dd>
                   </dl>
                   <h4>${tag("card",18)}</h4><dl>
                   <!-- <dt>${tag("card",19)}</dt><dd>${foundItem.provenance}</dd> -->
                   <dt>${tag("card",20)}</dt><dd>${foundItem.acquisition_date}</dd>
                   <dt>${tag("card",21)}</dt><dd>${tag("period",foundItem.period)}</dd>
                   </dl>
                   <h4>${tag("card",22)}</h4><dl>
                   <dt>${tag("card",23)}</dt><dd class="tag">${tag("extheme",foundItem.extheme)}</dd>
                   <dt>${tag("card",24)}</dt><dd class="tag">${tag("exhall",foundItem.exhall)}</dd>
                   </dl>
                   </div></article>`;
  return carousel + metadata;
}

function tag(label,id){
  //log("accessing tag: "+label+" > " + id+" > " +lang);
  //log(tags)
  return dict[label][id];
}

function exValue(row,item){
  if(row[item]!=undefined && row[item]!=0)
    return true;
  else return false;
}

function getValue(db,row,item){

}

function zoom(event) {
  event.preventDefault();
  scale += event.deltaY * -0.001;
  // Restrict scale
  scale = Math.min(Math.max(0.165, scale), 10);
  // Apply scale transform
  event.target.parentElement.style.fontSize = scale + "em";
  if (scale < 0.5) root.style.setProperty("--imgThumbScale", "20");
  else if (scale < 1) root.style.setProperty("--imgThumbScale", "10");
  else root.style.setProperty("--imgThumbScale", "5");
}

function populateImages(container, database, databasetwo, imKey) {
  const galleryView = createEl(
    "section",
    "galleryView",
    "view simplegalleryView",
    "<legend id='ina'>Images not associated<legend>",
    container
  ); // Creating the view container

  let images = "";
  log("dblength: "+database.length);
  let i = 0, len = database.length;
  //if(database[i][imKey].length)
  while (i < len) {
    if(settings.imageArray) {
    let j = 0,
      lenj = database[i][imKey].length;
    while (j < lenj) {
      images += prepareIMG(database[i]._id,"imageThumb",database[i][imKey][j]);
      j++;
    }}
    else {
      images += prepareIMG(database[i]._id,"imageThumb",database[i][imKey]);
    }
    i++;
  }
  let galleryViewContent='<section id="artworkDescription"></section><div id="imagesSupContainer">';
  /*if(!settings.exhibitionMode) {
    galleryViewContent+='<div class="tool"><input onclick="lockClick()" type="checkbox" id="galleryOverUnlocked" name="galleryOverUnlocked"><label for="galleryOverUnlocked">lock item</label> <input type="range" min="5" max="100" value="50" class="linear_slider" id="imgSize"></input></div>';
  }*/
  galleryViewContent+=`<div id="imagesContainer" >${images}</div></div>`;
  galleryView.innerHTML =galleryViewContent;
  iCont="imagesContainer";
  containerControl();
  /*
  imagesContainer.oncontextmenu = imgRightClick;*/
/*
  let slider = document.getElementById("imgSize");

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function () {
    scale = this.value * 0.015;
    imagesContainer.style.fontSize = scale + "em";
  };*/
}

async function miniPopulateImages(container, database, databasetwo, imKey) {
  const galleryView = createEl(
    "section",
    "searchGallery",
    "groupB",
    "<legend id='ina'>Images not associated<legend>",
    container
  ); // Creating the view container

  let images = "";
  log("dblength: "+database.length);
  let i = 0, len = database.length;
  //if(database[i][imKey].length)
  while (i < len) {
    if(settings.imageArray) {
    let j = 0,
      lenj = database[i][imKey].length;
    while (j < lenj) {
      images += prepareIMG(database[i]._id,"imageThumb",database[i][imKey][j]);
      j++;
    }}
    else {
      images += prepareIMG(database[i]._id,"imageThumb",database[i][imKey]);
    }
    i++;
  }
  //let galleryViewContent='<section id="artworkDescription"></section><div id="imagesSupContainer">';
  /*if(!settings.exhibitionMode) {
    galleryViewContent+='<div class="tool"><input onclick="lockClick()" type="checkbox" id="galleryOverUnlocked" name="galleryOverUnlocked"><label for="galleryOverUnlocked">lock item</label> <input type="range" min="5" max="100" value="50" class="linear_slider" id="imgSize"></input></div>';
  }*/
  //let galleryViewContent=`<div id="imagesContainer" >${images}</div>`;
  galleryView.innerHTML = images;

//  containerControl("imagesContainer");
}

function imgRelease(event) {
  log("mousedown")
  //galleryOverUnlocked = true;
  //document.getElementById("galleryOverUnlocked").checked = false;
}

function imgClick(event) {
  let tid=event.target.id;
  /*log("mouseup");
  log("mup selectedID: "+selectedID);
  log("thisid: "+tid);
  */if(galleryLock) {
    if(tid!=selectedID) {
      loadCardinContainer(tid,iCont);
      galleryLock=true;
    } else galleryLock=false;
  } else galleryLock=true;
}
let galleryLock=false;

function imgOver(event,id) {
  overID=id;
  if(!galleryLock) {
    if(id==undefined) {
      id=event.target.id;
      //log(event.target)
    }
    let idv = id;
    if (idv != iCont && idv.length > 2) {
      loadCardinContainer(idv,iCont);
    }
  }
}

function loadCardinContainer(id,iC){
  imKey = settings.imageField;
  imKey = imKey.toString();
  log("loadCardinContainerdb: "+db.toString());
  log("loadCardinContainerdb: "+dba.toString());
  log("loadCardinContainer: "+id);
  let container = document.getElementById("artworkDescription");

  foundItemID = db.findIndex((item) => item._id == id);
  log("foundItemID: "+foundItemID);
  let foundItem=db[foundItemID];
  log("foundItem: "+foundItem);
  let foundArtistID=dba.findIndex((item) => item.id == foundItem.artist_id);
  let foundArtist=dba[foundArtistID];
  selectedID=id;
  const imgContainer=document.getElementById(iC);
  
  _.forEach(imgContainer.getElementsByTagName('figure'), function(g) {g.classList.remove("highlight");});
  document.getElementById(selectedID).parentNode.classList.add("highlight");
  container.innerHTML = returnCardContent(foundItem,foundArtist);
}

function containerControl(){
  let imagesContainer = document.getElementById(iCont);
  //log(imagesContainer);
  imagesContainer.onmouseover = imgOver;
  //imagesContainer.onmousedown = imgRelease;
  imagesContainer.onmouseup = imgClick;
}


function populateGroups(container, database, databasetwo, groups, imKey, fieldname) {
  const galleryView = createEl(
    "section",
    "galleryView",
    "view viewGroups galleryTags",
    "<legend id='ina'>Images not associated<legend>",
    container
  ); // Creating the view container

  let images = "";
  let imagesTags = "";
  let imagesByGroups = [];

  // this shoud happen server side
  let j = 0,
    lenj = groups.length;
  while(j<lenj) {
    let one=groups[j].split(",");
 
  // this shoud be a _.fiter()
  _.forEach(one, function(thisone) {
     let newItem=thisone.trim().toLowerCase();
     imagesByGroups.indexOf(newItem) === -1 ? imagesByGroups.push(newItem) : console.log("This item already exists");
    });
    j++;
  }
  
  //log(imagesByGroups);
  imagesTags+=`<div id="tags"><h2>${fieldname}</h2>`;
  _.forEach(imagesByGroups, function (arrayItem) {
    //var x = arrayItem.prop1 + 2;
    let trim=arrayItem.replace(/\s/g, "_");
    imagesTags+=`<h6 id="${trim}" onclick=hideOthersThumbs("${trim}")>${arrayItem}</h6>`;
    //console.log(x);
  });
  imagesTags+=`</div>`;

  //let i = 0, len = database.length;
  _.forEach(database, function(item) {
    if(!settings.imageArray) {
      let classes = item[fieldname];
      if(classes!=undefined)
        classes=classes.trim().toLowerCase().replace(/\s/g, "_");//.split(",");

      images += prepareIMG(item._id,"imageThumb "+classes,item[imKey]);
    } else {
      _.forEach(item[imKey], function(imageItem) {
        images += prepareIMG(item._id,"imageThumb",imageItem);
      });
    }
  });

  let galleryViewContent=`<section id="artworkDescription"></section>${imagesTags}<div id="imagesSupContainer">`;
  /*if(!settings.exhibitionMode) {
    galleryViewContent+='<div class="tool"><input onclick="lockClick()" type="checkbox" id="galleryOverUnlocked" name="galleryOverUnlocked"><label for="galleryOverUnlocked">lock item</label> <input type="range" min="5" max="100" value="50" class="linear_slider" id="imgSize"></input></div>';
  }*/
  galleryViewContent+=`<div id="imagesContainer" >${images}</div></div>`;
  galleryView.innerHTML =galleryViewContent;
  iCont="imagesContainer"
  containerControl();
}

function hideOthersThumbs(thisClass){
  log("thisclass: "+thisClass)
  let thumbs=document.getElementsByClassName("imageThumb");
  for (var i = 0; i < thumbs.length; i++) {
    thumbs[i].classList.add('hide');
  } 
  let thisClassElements=document.getElementsByClassName(thisClass);
  for (var i = 0; i < thisClassElements.length; i++) {
    thisClassElements[i].classList.remove('hide');
  } 
}

function populateImagesInGroups(container, database, databasetwo, groups, imKey, fieldname) {
  const galleryView = createEl(
    "section",
    "galleryView",
    "view viewGroups",
    "<legend id='ina'>Images not associated<legend>",
    container
  ); // Creating the view container

  let images = "";
  let imagesByGroups = {};
  //groups = groups.split(",");
  log("fieldgroup: "+fieldname);
  let j = 0,
    lenj = groups.length;
  while(j<lenj) {
    //log("this is groupj:"+groups[j]);
    if(groups[j]!="false"){
      var groupTrim=String(groups[j]).replace(/\s/g, "");
      imagesByGroups[groupTrim]=[];
      let i = 0,
      len = database.length;
      while (i < len) {
        //log(groups[j]);
        //log(database[i][fieldname]);
        if(String(database[i][fieldname]).replace(/\s/g, "")==groupTrim)
        imagesByGroups[groupTrim].push(database[i]);
        i++;
      }}
    j++;
  }
  //log(typeof(imagesByGroups));
  //imagesByGroups.sort((a,b) => a.length - b.length);
  log(imagesByGroups);
  /*let s=[];
  for(group in imagesByGroups) {
    s.push([imagesByGroups[group],imagesByGroups[group].length])
    }
    s.sort(function(a,b) {return a[1] - b[1]})
    */
    let sortedGroups = Object.entries(imagesByGroups)
    .map(([key, value]) => [key, value.length])
    .sort((a, b) => a[1] - b[1]);
  log(sortedGroups);
 /* Object.entries(imagesByGroups).forEach(([key, value]) => {
    var keyTrim="";
    if((key!=undefined)&&(key!="false")) {
      keyTrim=key.replace(/\s/g, "");
    //log("this is key "+keyTrim);
    images+=`<section class="groupS g${keyTrim}"><div class="groupH"><h3>${tag(fieldname,key)}</h3><h4>${imagesByGroups[keyTrim].length}</h4></div>`;
      let i = 0,
      len = value.length;
      while (i < len) {
          images += prepareIMG(imagesByGroups[keyTrim][i]._id,"imageThumb",imagesByGroups[keyTrim][i][imKey]);
          i++;
      }
      images+="</section>"}
  })*/
  
      for(let [key, value] of sortedGroups) {
        let keyTrim = key.trim();
        if(key != 'undefined' && key != 'false') {
            images += `<section class="groupS g${keyTrim}"><div class="groupH"><h3>${tag(fieldname, key)}</h3><h4>${imagesByGroups[keyTrim].length}</h4></div>`;
            log("value: "+value);
            let i = 0, len = value;
            while (i < len) {
                log(imagesByGroups[keyTrim][i]._id);
                images += prepareIMG(imagesByGroups[keyTrim][i]._id,"imageThumb",imagesByGroups[keyTrim][i][imKey]);
                i++;
            }
            images += "</section>";
        }
    }

  let galleryViewContent='<section id="artworkDescription"></section><div id="imagesSupContainer">';
  /*if(!settings.exhibitionMode) {
    galleryViewContent+='<div class="tool"><input onclick="lockClick()" type="checkbox" id="galleryOverUnlocked" name="galleryOverUnlocked"><label for="galleryOverUnlocked">lock item</label> <input type="range" min="5" max="100" value="50" class="linear_slider" id="imgSize"></input></div>';
  }*/
  galleryViewContent+=`<div id="imagesContainer">${images}</div></div>`;
  galleryView.innerHTML =galleryViewContent;
  iCont="imagesContainer";
  containerControl();
}

function populateArtists(container, database, databasetwo, imKey) {
  const galleryView = createEl(
    "section",
    "galleryView",
    "view viewGroups",
    "<legend id='ina'>Images not associated<legend>",
    container
  ); // Creating the view container

  let images = "";
  let imagesByGroups = {};

  _.forEach(databasetwo, function(artista){
    imagesByGroups[artista.name]=_.filter(database, function(o) { return o.artist_id===artista.id });
    imagesByGroups[artista.name].id=artista.id;
  });
  log("imagesbygroup: "+imagesByGroups)
  let alphabetNav=`<div id="alphabetNav"><a onclick='scrollToLetter("#imagesContainer","all")'>#</a>`;
  for (i = 0; i < alphabetTR.length; i++) {
    let letr=alphabetTR[i];
    log(letr);
    images+=`<div id="${letr}">`;
    const authorsInThisGroup=_.filter(imagesByGroups,function(works,artist){ 
      if(artist[0] == letr) {
      images+=`<section class="groupA g${works.id}"><div class="groupAH"><h3>${artist}</h3><h4>${imagesByGroups[artist].length}</h4></div>`;
      _.forEach(imagesByGroups[artist], function(work){
        images += prepareIMG(work._id,"imageThumb",work[imKey]);
      });
      images+=`</section>`;
      return }});
    images+=`</div>`;
    alphabetNav+= `<a onclick='scrollToLetter("#imagesContainer","#${letr}")'>${letr}</a>`;
  }

  let galleryViewContent=`<section id="artworkDescription"></section><div id="imagesSupContainer">`;
  galleryViewContent+=`<div id="imagesContainer">${images}</div></div>${alphabetNav}</div></div>`;
  galleryView.innerHTML =galleryViewContent;
  iCont="imagesContainer"
  containerControl();
}

function populateTimeline(container, database, imKey) {
  const galleryView = createEl("section","timelineView","view","<legend id='ina'>Images not associated<legend>",container); // Creating the view container

  let images = "";
    Object.keys(database).forEach(key => {
      const value = database[key];
      images+='<section><h3>'+ key +'</h3><div>';
      
      Object.keys(value).forEach(key => {
        const valu = value[key];
        if(valu.id!=undefined) {
          images+='<div class="imgCon">';
          images+=prepareIMG(valu.id,"imageThumb",valu.id);
          images+='</div>'
        }
      });
      images+='</div></section>';
  });
  let galleryViewContent='<section id="artworkDescription"></section><div id="timelineSupContainer">';
  /*if(!settings.exhibitionMode) {
    galleryViewContent+='<div class="tool"><input onclick="lockClick()" type="checkbox" id="galleryOverUnlocked" name="galleryOverUnlocked"><label for="galleryOverUnlocked">lock item</label> <input type="range" min="5" max="100" value="50" class="linear_slider" id="imgSize"></input></div>';
  }*/
  galleryViewContent+=`<div id="timelineContainer">${images}</div></div>`;
  galleryView.innerHTML =galleryViewContent;
  iCont="timelineContainer";
  containerControl();
}

function prepareIMG(id, classes, src) {
  return (s =
    '<figure><img src="'+ settings.imagePath +
    sDir +
    src +
    '.webp" id="' +
    id +
    '" class="' +
    classes +
    '" loading="lazy" decoding="asynchronous" /></figure>');
}

/*
function searchNow(){
  let input = document.getElementById("searchKey").value;
  if (input != "") {
    log("searchNow: "+input);
  }
}
*/

async function searchButton(){
  let input = document.getElementById("searchKey").value;
  if (input != "") {
    log("searchNow: "+input);
    window.location.href="/search/"+input;
    //let found = (db.some(db => db.includes(input)));

    //= await findIds("*" + input + "*");
    //log("I found this:"+found);
  }
}

/* ---------------------------------- searchFor :: sort table view by column header ---------------------------------- */
async function searchFor() {
  let input = document.getElementById("searchKey").value;
  if (input != "") {
    let found = await findIds("*" + input + "*");
    if (found !== "undefined") {
      datatableFilter(found);
      document.getElementById("dw_button").classList.add("show");
    }
  } else {
    let tb = document.getElementById("tblBody").children;
    for (let i = 0; i < tb.length; i++) {
      tb[i].classList.remove("hide");
    }
    document.getElementById("dw_button").classList.remove("show");
  }
}


/* ---------------------------------- createEl :: facilitate the creation of HTML elements adding type, id, class, html ---------------------------------- */
function createEl(type, id, classes, html, par) {
  let el = document.createElement(type);
  if (id) el.id = id;
  if (classes) {
    let c = classes.split(" ");
    for (let i = 0; i < c.length; i++) el.classList.add(c[i]);
  }
  if (html) el.innerHTML = html;
  if (par) par.appendChild(el);
  return el;
}

/* ---------------------------------- datatableFilter :: hide entries not responding to the filter ---------------------------------- */
function datatableFilter(found) {
  let tb;
  if (document.getElementById("tblBody")) {
    tb = document.getElementById("tblBody").children;
  } else {
    log("thats a gallery");
    tb = document.getElementById(iCont).children;
  }

  for (let i = 0; i < tb.length; i++) {
    tb[i].classList.add("hide");
  }
  found = JSON.parse(found);
  log(found[0]);
  updateItemsCount(found.length);
  for (const elem of found) {
    log("found this " + elem);

    if (document.getElementById("tr" + elem._id))
      document.getElementById("tr" + elem._id).classList.remove("hide");
    else document.getElementById(elem._id).classList.remove("hide");
  }
}

///////////////////// SUPPORT FUNCTIONS /////////////////////

function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

// de-duplicate an array
// source: https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items

Array.prototype.unique = function () {
  var a = this.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) a.splice(j--, 1);
    }
  }

  return a;
};

/* ---------------------------------- sortGrid :: sort table according to selected column key ---------------------------------- */
/* weird results are given if a column contains a mix of numbers and strings */
function sortGrid(colNum) {
  let tbody = document.querySelector("#tblBody");
  let rowsArray = Array.from(tbody.rows);
  let compare;
  compare = function (rowA, rowB) {
    if (isNumeric(rowA.cells[colNum].innerHTML))
      return rowA.cells[colNum].innerHTML - rowB.cells[colNum].innerHTML;
    else
      return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML
        ? 1
        : -1;
  };
  // sort
  rowsArray.sort(compare);
  tbody.append(...rowsArray);
}

/* ---------------------------------- isNumeric :: verify if string contains a number ---------------------------------- */
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/* ---------------------------------- getRandomInt :: get a random number ---------------------------------- */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/* ---------------------------------- toggleShow :: toggle a show class ---------------------------------- */
function toggleShow(elem) {
  document.getElementById(elem).classList.toggle("show");
}

/* ---------------------------------- log :: lazy console.log ---------------------------------- */
function log(val) {
  if (settings.verbose) {
    console.log(val);
  }
}


/* ---------------------------------- toggleShow :: toggle a show class ---------------------------------- */

/*
document.addEventListener('DOMContentLoaded', function() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(function(anchor) {
    anchor.addEventListener('click', function(event) {
      event.preventDefault();
      const target = anchor.getAttribute('href').substring(1);
      smoothScroll(target);
    });
  });
});*/

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
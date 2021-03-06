// NOTE: include utilities.js before this

// Create a new connection using socket.io (imported in index.html)

let socket = io();

// define the function that will be called on a new newConnection
socket.on("connect", function () {
  console.log("your id:", socket.id);
  //emit welcome information
  let message = {
    room: "street",
    side: getUserType[canSee],
  };
  socket.emit("welcome", message);
});

socket.on("start", setOtherId);

function setOtherId(id) {
  if (canSee) {
    speaker.speak("Click on the map to guide the blind person!");
  }
  else {
    speaker.speak("The assistant will guide you with a beep sound, use the arrows to move!");
  }
  otherId = id;
  preLobby = false;
  console.log(otherId);
  console.log("START "+getUserType[canSee]+"!!!!");
}



socket.on("warning", function () {
  speaker.speak("Connection lost");
  if (canSee) {
    setTimeout(function(){window.location="warning_assistant.html";}, 3000);
  }
  else {
    setTimeout(function(){window.location="warning_blind.html";}, 3000);
  }
});

socket.on("pingInfo", function (info) {
  mousePointingInteraction(info.x,info.y);
});

socket.on("frameCountInfo", function (info) {
  frameCount = info.count;
  accident = info.accidentCount;
  success = info.successCount;
});

socket.on("entityInfo", function (info) {
  if(info.name == "main") {
    main.updateTile(info.gridPos, info.pos);
  }

});


function preload(){
  trafficNoise = createAudio('assets/sounds/city_traffic.ogg');
  accidentNoise = loadSound('assets/sounds/crash_metal_sweetener_distant.ogg');
  carHorn = loadSound('assets/sounds/car_horn.ogg');
  cowBell = loadSound('assets/sounds/cartoon_cowbell.ogg');
  mapImage = loadImage("assets/street/map.png");
  mapTiles2Load.forEach((colname, i) => {
    if (mapGridImages[colname] === undefined) {
      //print(curTile.mapColorName);
      let path = "assets/street/"+colname+".png";
      mapGridImages[colname] = new mapImageLoader(path);// loadImage(path);
    }
  });

  entityImages["carL"] = new mapImageLoader("assets/entities/CarLeft.png");
  entityImages["tramL"] = new mapImageLoader("assets/entities/TramLeft.png");
  entityImages["carR"] = new mapImageLoader("assets/entities/CarRight.png");
  entityImages["tramR"] = new mapImageLoader("assets/entities/TramRight.png");

  randomSeed(420);

  [5,8,11].forEach((yt, iyt) => {
    let xt = 5;
    while (xt<mapW) {
      entities.push(new Entity("car",entityImages["carL"],[xt,yt],[-yt*20,0]));
      xt += round(random(8,6+yt*3));
    }
  });

  let xt = 10, yt = 18;
  while (xt<mapW) {
    entities.push(new Entity("tram",entityImages["tramL"],[xt,yt],[-300,0],[10,2]));
    xt += round(random(20,32));
  }

  xt = mapW-10;
  yt = 21;
  while (xt>0) {
    entities.push(new Entity("tram",entityImages["tramR"],[xt,yt],[300,0],[10,2]));
    xt -= round(random(20,32));
  }


  [28,31,34].forEach((yt, iyt) => {
    let xt =  mapW-5;
    while (xt>0) {
      entities.push(new Entity("car",entityImages["carR"],[xt,yt],[(39-yt)*30,0]));
      xt -= round(random(8,6+(39-yt)*3));
    }
  });

  main = new character("assets/sprites");
  pinSound = loadSound("assets/sounds/pin.mp3");
}

function setup() {
  // Loads map tiles
  for (let x = 0; x < mapImage.width; x++) {
    let hline = [];
    for (let y = 0; y < mapImage.height; y++) {
      let curTile = new GridTile(x,y,mapImage.get(x,y));
      hline.push(curTile);
    }
    mapBoard.push(hline);
  }

  if (canSee) {
    mapTiles2Load.forEach((colname, i) => {
      mapGridImages[colname].i.filter(INVERT);
    });
    for (var i = 0; i < 4; i++) {
      main.front[i].filter(INVERT);
      main.back[i].filter(INVERT);
      main.left[i].filter(INVERT);
      main.right[i].filter(INVERT);
      main.pImage = main.front;
    }
  }

  createCanvas(windowWidth,windowHeight);
  frameRate(fps);
  if (canSee) {
    sightedCol = 255;
  }
}

function draw() {

  if (preLobby) {
    if (frameCount == 1) {
      speaker.speak("Waiting for someone else to connect!");
      background(sightedCol);
      noStroke();
      fill(255-sightedCol);
      textFont('latin');
      textAlign(CENTER);
      textSize(16);
      text('Waiting for someone else to connect!', windowWidth/2, windowHeight*3/4);
    }
    push();
    noStroke();
    translate(windowWidth/2,windowHeight/2);/*
    fill(sightedCol);
    ellipse(0,0,50);
    fill(255,0,0);
    ellipse(0,0,50*sin(2*PI*frameCount/fps));
    fill(sightedCol,sightedCol,sightedCol,100/fps);
    ellipse(0,0,windowWidth*sin(2*PI*frameCount/fps));
    stroke(255-sightedCol);
    fill(255-sightedCol,255-sightedCol,255-sightedCol,100/fps);
    strokeWeight(1);
    ellipse(100*cos(2*PI*frameCount/fps/7),100*sin(2*PI*frameCount/fps/7),sin(2*PI*frameCount/fps/5)**2*200,cos(2*PI*frameCount/fps/4)**2*200);
    */
    fill(255-sightedCol);
    ellipse(0,0,100+10*sin(frameCount/fps*PI));
    fill(sightedCol);
    ellipse(0,0,100-10*sin(frameCount/fps*PI));

    pop();
    /*let gifWidth=windowDiagonal/3;
    let gifHeight=gifWidth/gif_loading.width*gif_loading.height;
    gif_loading.size(gifWidth,gifHeight);
    gif_loading.position((windowWidth-gif_loading.width)/2, (windowHeight-gif_loading.height)/2);*/


  }
  else {

  if (canSee){
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW) || (mouseX<windowWidth/5)) {
      if (camPos[0] > -windowWidth/4)
        camPos[0]-=200/fps;
    }
    if (keyIsDown(87) || keyIsDown(UP_ARROW) || (mouseY<windowHeight/5)) {
      if (camPos[1] > -windowHeight/4)
        camPos[1]-=200/fps;
    }
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW) || (mouseX>windowWidth*4/5)) {
      if (camPos[0] < mapBoard.length*tileSize+windowWidth/4)
        camPos[0]+=200/fps;
    }
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW) || (mouseY>windowHeight*4/5)) {
      if (camPos[0] < mapBoard[0].length*tileSize+windowHeight/4)
        camPos[1]+=200/fps;
    }
  }
  else {
    if (frameCount % round(fps) == 1) { // every second updates frameCount
      let message = {
        count : frameCount,
        accidentCount: accident,
        successCount: success,
        recipient : otherId
      }
      socket.emit("forwardFrameCount", message);
    }
  }


  background(sightedCol);

  //image(mapImage,0,0);
  //main.display();
  main.move();
  entities.forEach((en, ien) => {
    en.move();
  });
  let todel = -1;
  do {
    let todel = -1;
    entities.forEach((en, ien) => {
      if (en.toDel)
        todel = ien;
    });
    if (todel != -1)
      entities.splice(todel,1);
  } while (todel != -1);


  drawMap();

  push();
  fill(sightedCol);
  noStroke();
  if (camPos[0]<0) {
    rect(0,0,-camPos[0],windowHeight);
  }
  if (camPos[1]<0) {
    //rect(0,0,windowWidth,-camPos[1])
  }
  if (camPos[0]+windowWidth>(mapBoard.length-8)*tileSize) {
    rect((mapBoard.length-8)*tileSize-camPos[0],0,camPos[0]+windowWidth-(mapBoard.length-8)*tileSize,windowHeight);
  }
  if (camPos[1]+windowHeight>mapBoard[0].length*tileSize) {
    rect(0,mapBoard[0].length*tileSize-camPos[1],windowWidth,camPos[1]+windowHeight-mapBoard[0].length*tileSize);
  }
  pop();

  let shift = -1;
  mousePointing.forEach((mp, i) => {
    mp.display();
    let mainGP = gridFromPos(main.pos);
    let pinGP = gridFromPos(mp.pos);
    if ((mainGP[0] == pinGP[0] && mainGP[1] == pinGP[1]) || this.t > 20) {
      shift = i;
      cowBell.play();
    }
  });
  if(shift>=0) mousePointing.splice(shift,1);

  if(success >= 0) {
    if (success == 0) {
      speaker.speak("Success: you reached the end of the experience!");
    }
    else if (success >= 5) {
      socket.emit("finished");
      if (canSee) {
        window.open('assistant/finale.html', '_self');
      }
      else {
        window.open('blind/finale.html', '_self');
      }
      success = 0.1;
    }

    success += 1/fps;
    push();
    fill(255,255,255,100);
    rect(0,0,windowWidth,windowHeight);
    pop();
    for (var i = 0; i < 100; i++) {
        push();
        fill(0);
        translate(windowWidth/2, windowHeight/2);
        rotate((success%10+i)*PI);
        rect(noise(i)*sin(success*PI/4)*windowWidth*cos((noise(i)-0.5)*(frameCount/fps)*PI),noise(i)*sin(success*PI/4)*windowHeight*sin((noise(i)-0.5)*(frameCount/fps)*PI),10,4);
        pop();
    }
  }
  else if(accident>=0){
    if (accident == 0) {
      speaker.speak("You have been run over, retry!");
    }
    accident += 1/fps;
    push();
    fill(255,0,0,max(100-accident*10,0));
    rect(0,0,windowWidth,windowHeight);
    pop();
    if (accident >= 5 && !canSee) {
      frameCount = 0;
      accident = -1;
      main.gridPos = [[7,1]]; // position on the grid
      main.pos = [(main.gridPos[0][0]+0.5)*tileSize,(main.gridPos[0][1]+0.5)*tileSize]; // center of grid tile
      main.moveTile([1,0]);
    }
  }
  else if (!canSee)
    hole(main.pos[0]-camPos[0],main.pos[1]-camPos[1],tileSize*1.5);
  }
}

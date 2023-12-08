import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("frontends"));
//fetch("frontends/Data/lowerThirdFacts.json").then((response) => response.json()).then((json) => console.log(json));
import playerData from "./frontends/Data/PlayerData.json" assert {type: "json"};
var timeOutId = null;

function getTime() {
  let date = new Date();
  let secs = fillup(date.getSeconds());
  let mins = fillup(date.getMinutes());
  let hs = fillup(date.getHours());
  return `${hs}:${mins}:${secs}`;

  function fillup(time) {
    return time.toString().length > 1 ? time : `0${time}`
  }
}


io.on("connection", (socket) => {
  
  const IP_ADRESS = socket.request.socket.remoteAddress;
  console.log(`Client connected with Address: ${IP_ADRESS} at ${getTime()}`);

  sendData();

  socket.on("disconnect", () => {
    console.log(`${IP_ADRESS} disconnected at ${getTime()}`);
  });

  socket.on("pick_player", (player, position, streamer_id) => {
    if (data.picked_positions.length == 0){
      data.pick_order = initializePickOrder(streamer_id);
    }
    console.log(data.pick_order);
    if (streamer_id == data.pick_order[data.picked_positions.length]) {
      pickPlayer(position, player, streamer_id);
    }

  });

  function initializePickOrder(streamer_id){

    let pick_order = ["A", "B", "B", "A", "A", "B", "B", "A", "A", "B"];
    //let pick_order = ["A", "B","A", "B","A", "B","A", "B","A", "B"];


    if (streamer_id == "B")
      pick_order = reversePickingOrder(pick_order);

    return pick_order;

    function reversePickingOrder(pick_order){
      let reversePickingOrder = []
      for (var element of pick_order){
        reversePickingOrder.push(element == "A" ? "B" : "A");
      }
      return reversePickingOrder;
    }
  }

  function pickPlayer(pos, pla, streamer_id) {
    const position = data.positions[pos];
    const player = data.players[pla];

    if (player.picked == false && position.picked == false) {
        position.setPosition(position.org_right, position.org_top);
        position.player = player;
        player.position = position.position;
        position.picked = true;
        position.player.picked = true;
        position.player.pickedBy = streamer_id;

        data.picked_positions.push(position.position);

        data.turnplayer = streamer_id == "A" ? "B" : "A";
        showLowerThird(pla, data.turnplayer);
        timeOutId = setTimeout(hideLowerThird, 7000);
        sendData();
    }
  }

  socket.on("undo", (index, streamer_id) => {
    if (streamer_id == data.pick_order[data.picked_positions.length-1]) {
        var player = data.players[index];
        var position = data.positions[player.position];
        player.picked = false;
        position.picked = false;
        player.position = null;
        data.turnplayer = data.turnplayer == "A" ? "B" : "A";
        position.moveToRandomLocation();
        //remove position from picked positions
        data.picked_positions = data.picked_positions.filter(
          (pos) => pos != position.position
        );

        
        hideLowerThird();
        sendData();
    }


  });

  socket.on("reset", () => {
    initialize();
    sendData();
  });
});

class Player {
  constructor(name, img_path, lowerThirdFacts) {
    this.name = name;
    this.image_path = img_path;
    this.picked = false;
    this.pickedBy = "";
    this.position = null;
    this.lowerThirdFacts = lowerThirdFacts;
    this.alt = name;
  }
}

class Position {
  constructor(position_index, right, top, width = 150) {
    this.position = position_index;
    this.right = right;
    this.top = top;
    this.org_right = right;
    this.org_top = top;
    this.width = width;
    this.alt = position_index;
    this.player = new Player("default", {
      black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
    });
    this.picked = false;
  }

  setPosition(x, y) {
    this.right = x;
    this.top = y;
  }
  getRandomNumber() {
    return Math.floor(Math.floor(Math.random() * 400));
  }

  plusOrMinus() {
    return Math.random() < 0.5 ? 1 : -1;
  }
  moveToRandomLocation() {
    let random_x = this.getRandomNumber();
    this.setPosition(
      this.right + this.plusOrMinus() * random_x,
      this.top - 1000
    );
  }
}

var data = {};
initialize();

function initialize() {
  data = {
    positions: [
      new Position(0, 1650, 570),
      new Position(1, 1400, 450),
      new Position(2, 1100, 450),
      new Position(3, 1400, 800),
      new Position(4, 1100, 800),
      new Position(5, 50, 570),
      new Position(6, 700, 450),
      new Position(7, 400, 450),
      new Position(8, 700, 800),
      new Position(9, 400, 800),
    ],

    players: initializePlayers(),

    options: [
      "Goalkeeper",
      "Defender left",
      "Striker left",
      "Defender right",
      "Striker right",
    ],

    picked_positions: [],

    turnplayer: "",
    captains: { A: "Esfand", B: "Zweback" },
    colors: {A: "#2d46b9", B: "#cdf564"},
    pick_order: [],
  };

  data.positions.forEach((pos) => {
    pos.moveToRandomLocation();
  });
}

function initializePlayers() {
  let players = [];
  Object.entries(playerData).forEach((player)=>{
    players.push(new Player(player[0], getImagePaths(player[0]), player[1]['facts']));
  });

  return players;
}

function getImagePaths(player_name) {
  let image_paths = {
    black: `Players/black/${player_name}.png`,
    blue: `Players/blue/${player_name}.png`,
    yellow: `Players/yellow/${player_name}.png`,
  };
  return image_paths;
}

function sendData() {
  io.sockets.emit("send_data", data);
}

function showLowerThird(player, turnplayer) {
  io.sockets.emit("showLowerThird", player, turnplayer, data);
}

function hideLowerThird() {
  clearTimeout(timeOutId);
  timeOutId = null;
  io.sockets.emit("hideLowerThird");
}

server.listen(3000, () => {
  console.log("listening on *:3000");
});

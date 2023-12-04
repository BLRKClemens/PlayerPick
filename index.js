import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("frontends"));
//fetch("frontends/Data/lowerThirdFacts.json").then((response) => response.json()).then((json) => console.log(json));
import lowerThirdData from "./frontends/Data/lowerThirdFacts.json" assert {type: "json"};
var timeOutId = null;

io.on("connection", (socket) => {
  const IP_ADRESS = socket.request.socket.remoteAddress;
  console.log(`Client connected with Address: ${IP_ADRESS}`);

  sendData();

  socket.on("disconnect", () => {
    console.log(`${IP_ADRESS} disconnected`);
  });

  socket.on("pick_player", (player, position, streamer_id) => {
    if (streamer_id == data.turnplayer || data.picked_positions.length == 0) {
      pickPlayer(position, player, streamer_id);
    }
  });
  function pickPlayer(pos, pla, streamer_id) {
    const position = data.positions[pos];
    const player = data.players[pla];

    if (player.picked == false && position.picked == false) 
      if (timeOutId == null){
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
    if (streamer_id != data.turnplayer) {
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

    players: [
      new Player("Spieler 1", {
        black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
      },
      lowerThirdData["Spieler 1"]),
      new Player("Spieler 2", {
        black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
      },
      lowerThirdData["Spieler 2"]),
      new Player("Spieler 3", {
        black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
      },
      lowerThirdData["Spieler 3"]),
      new Player("Spieler 4", {
        black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
      },
      lowerThirdData["Spieler 4"]),
      new Player("Spieler 5", {
        black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
      },
      lowerThirdData["Spieler 5"]),
      new Player("Spieler 6", {
        black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
      },
      lowerThirdData["Spieler 6"]),
      new Player("Spieler 7", {
        black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
      },
      lowerThirdData["Spieler 7"]),
      new Player("Spieler 8", {
        black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
      },
      lowerThirdData["Spieler 8"]),
      new Player("Spieler 9", {
        black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
      },
      lowerThirdData["Spieler 9"]),
      new Player("Spieler 10", {
        black: "Players/player-C.png",
        blue: "Players/player-A.png",
        yellow: "Players/player-B.png",
      },
      lowerThirdData["Spieler 10"]),
    ],

    options: [
      "Goalkeeper",
      "Defender left",
      "Striker left",
      "Defender right",
      "Striker right",
    ],

    picked_positions: [],

    A_open: true,
    B_open: true,

    turnplayer: "",
    captains: { A: "A", B: "B" },
    colors: {A: "#2d46b9", B: "#cdf564"},
  };

  data.positions.forEach((pos) => {
    pos.moveToRandomLocation();
  });
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

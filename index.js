import express from "express"
import http from "http"
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('frontends'));

io.on('connection', (socket) => {
  const IP_ADRESS = socket.request.socket.remoteAddress;
  console.log(`Client connected with Address: ${IP_ADRESS}`);

  sendData();

  socket.on('disconnect', () => {
    console.log(`${IP_ADRESS} disconnected`);
  });

  socket.on('pick_player', (player, position, streamer_id) =>{
    switch (streamer_id) {
      case "A":
        if (data.A_open){
        pickPlayer(data.side_A[position], player, streamer_id);
        }
        break;
      case "B":
        if (data.B_open){
        pickPlayer(data.side_B[position], player, streamer_id);
        }
      default:
        console.log('no valid streamer id');
        break;
    };

    sendData();
  });

  function pickPlayer(position, index, streamer_id){
    var player = data.players[index];

    if(player.picked == false && position.picked == false){
      position.setImagePath(player.image_path);
      player.picked = true;
      position.picked = true;
      player.position = position;
      player.pickedBy = streamer_id;
      data.A_open = streamer_id == 'A' ? false : true;
      data.B_open = streamer_id == 'B' ? false : true;

      
      if(streamer_id == 'A'){
        let i = data.options_A.indexOf(position.position);
        data.options_A.splice(i, 1);
      }
      if(streamer_id == 'B'){
        console.log(position);
        let i = data.options_B.indexOf(position.position);
        data.options_B.splice(i, 1);
      }
    }
  };



  socket.on('undo', (index, streamer_id) =>{
    if((!data.A_open && streamer_id == 'A' )|| 
    (!data.B_open && streamer_id == 'B' )){
      var player = data.players[index];

      player.picked = false;
      player.position.picked = false;
      data.A_open = streamer_id == 'A' ? true : false;
      data.B_open = streamer_id == 'B' ? true : false;
  
      sendData();
    }
    
    
  });

});

class Player{
  constructor(name, img_path){
    this.name = name;
    this.image_path = img_path;
    this.picked = false;
    this.position = "";
    this.pickedBy = "";
  };
};

class Position{
  constructor(position, right, top, width = 150){
    this.position = position;
    this.right = right;
    this.top = top;
    this.width = width;
    this.player_name = "";
    this.img = "Players/player-A.png";
    this.alt = position;
    this.picked = false;
  };

  setImagePath(src) {
    console.log(src);
    this.img = src;
  }

  setPicked(picked){
    this.picked = picked;
  }
};

var data = {
  players: [
  new Player('Spieler 1', 'Players/player-A.png'),
  new Player('Spieler 2', 'Players/player-A.png'),
  new Player('Spieler 3', 'Players/player-A.png'),
  new Player('Spieler 4', 'Players/player-A.png'),
  new Player('Spieler 5', 'Players/player-A.png'),
  new Player('Spieler 6', 'Players/player-B.png'),
  new Player('Spieler 7', 'Players/player-B.png'),
  new Player('Spieler 8', 'Players/player-B.png'),
  new Player('Spieler 9', 'Players/player-B.png'),
  new Player('Spieler 10', 'Players/player-B.png'),
  ],

  side_A: [
  new Position('goalkeep', 1650, 570),
  new Position('topleft', 1400, 450),
  new Position('topright', 1100, 450),
  new Position('bottomleft', 1400, 800),
  new Position('bottomright', 1100, 800),
  ],

  side_B: [
  new Position('goalkeep', 50, 570),
  new Position('topleft', 700, 450),
  new Position('topright', 400, 450),
  new Position('bottomleft', 700, 800),
  new Position('bottomright', 400, 800),
  ],

  options_A: ['goalkeep', 'topleft', 'topright', 'bottomleft', 'bottomright'],
  options_B: ['goalkeep', 'topleft', 'topright', 'bottomleft', 'bottomright'],


  A_open: true,
  B_open: true,
};

function sendData(){
  io.sockets.emit('send_data', data);
};

server.listen(3000, () => {
  console.log('listening on *:3000');
});
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
// Express APIs
const api = require('./controllers/user.ctrl')


/* connexion bd */
const url = mongoose  /* mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1 */
  .connect("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1  ")/* mongodb+srv://odia221:odia221@cluster0.4sxdb68.mongodb.net/serre_automatisee?retryWrites=true&w=majority */
  .then((x) => {
    console.log(`Vous êtes connecté à la base de donnée : "${x.connections[0].name}"`)
  })
  .catch((err, client) => {
    console.error('Erreur de connexion à mongo', err.reason)
  })


// Express settings
const app = express()
/* cors */
app.use(cors());


/* encoding urls */
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//formatage datas 
/* app.use(bodyParser.json()) */
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
)






  
// Serve static resources
app.use('/api', api)

// Error favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204))

// Define PORT
const port = process.env.PORT || 5000

const servers = require('http').createServer(app)
 servers.listen(port, () => {
  console.log('Écoute sur le port : ' + port)
})

// Express error handling
app.use((req, res, next) => {
  setImmediate(() => {
    next(new Error('Une Erreur serser est constatée'))
  })
})

app.use(function (err, req, res, next) {
  console.error(err.message)
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).send(err.message)

})


////////////////////// 2 Socket //////////////


io = require('socket.io')(servers,
  {
      cors:
      {
          origin: "*",
          methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
          credentials: false
      }
  });

  


  const SerialPort = require('serialport');
  const port2 = new SerialPort('/dev/ttyUSB0', { baudRate: 115200} )
  const { ReadlineParser } = require('@serialport/parser-readline');
  const parser = port2.pipe(new ReadlineParser({ delimiter: '\r\n' }))


  io.on('connection', (socket) => {
    console.log('Client connecté');
  
    // Écouter l'événement 'message'
    socket.on('message', (data) => {
      console.log(`Données reçues : ${JSON.stringify(data)}`);
      port2.write(data.message);
    });
  });


  parser.on("data", (data) => {
    // console.log(data);
    var humsol = data.split("/")[1];
    var lum = data.split("/")[0];
    var temp = data.split("/")[2];
    var hum = data.split("/")[3];

    io.emit("data", {humsol: humsol, lum: lum, temp: temp, hum: hum});
    let tempon = data.split('/')
    let etatPorte = tempon[0]
    let etatInsecte = tempon[1]
    let codeRfid = tempon[2]
    let etatFenetre = tempon[3]
    let etatPompe
     //console.log(data.CodeRFID);
     console.log(tempon[0], '  ',tempon[1], ' ',tempon[2], ' ',tempon[3] );
     if(codeRfid === '1130050397'){
      let jwtToken = jwt.sign(
        {
          
          codeRfid: '1130050397',
        },
        'token-pour-se-connecter',
        {
          expiresIn: '1h',
        },
      )
     
      //console.log(humsol); 
      io.emit('rfid',jwtToken);
      //console.log(jwtToken);
     }else{
      
      io.emit('rfid', 'Badge non autorisé');
     }
     //console.log(CodeRFID);

///////////////////// présence insecte ///////////
     if(etatInsecte == 'presence_insecte'){
      
      io.emit('insecte', 'Present');
     }else if (etatInsecte == 'absence_insecte') {
   
      io.emit('insecte', 'Absent');
     }
  ///////////////////////////// porte ////////////////
      if(etatPorte == 'ouverte'){
  
      io.emit('porte', 'ouverte')
     }else if(etatPorte == 'fermee'){
      
      io.emit('porte', 'fermee')
     }
  ///////////////////////////// Fenêtre ////////////////
  if(etatFenetre == 'ouverte'){
  
    io.emit('fenetre', 'ouverte')
   }else if(etatFenetre == 'fermee'){
    
    io.emit('fenetre', 'fermee')
   }

///////////////////////////// Arrosage ////////////////
if(etatPompe == 'ouverte'){
  
  io.emit('Pompe', 'ouverte')
 }else if(etatPompe == 'fermee'){
  
  io.emit('Pompe', 'fermee')
 }
  });
  

  



    



 /*  io.on("arrosage", (data) => {
    console.log(data);
    port.write(data)
  }); */
 
   

  

 







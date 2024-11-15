let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
var fs = require('fs');
var https = require('https');

let app = express();
const session = require('express-session');
let apiRoutes = require("./api-routes");

var port = process.env.PORT || 443;// 443;

var randtoken = require('rand-token'); 

mongoose.connect('mongodb://ngleader.app:27017/LeaderJournal', { useNewUrlParser: true,useUnifiedTopology:true, user:'ng-leader-gc',pass:'n20G_lea19Der'});
//mongoose.connect('mongodb://localhost/LeaderJournal', { useNewUrlParser: true, user:'ng-leader-gc',pass:'n20G_lea19Der'});

var db = mongoose.connection;



var privateKey = fs.readFileSync('crt/generated-private-key.key').toString();
var certificate = fs.readFileSync('crt/b4ee02c1426231e5.crt' );
var caBundle = fs.readFileSync('crt/gd_bundle-g2-g1.crt');




app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({
    secret: randtoken.generate(25),
    //name:randtoken.generate(25),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 3600*1000*2},  //2 days max- session variables
    
  }))

app.get ('/',(req,res)=>res.send('NG Leader APP'));

//open access to userpics in a folder next to backend folder
app.use('/usrpics',express.static('../usrpics/'));


app.use('/api',apiRoutes);

https.createServer({
    key: privateKey,
    cert: certificate,
    ca: caBundle
}, app).listen(port);



//app.listen(port,function(){console.log("running on port"+port)});

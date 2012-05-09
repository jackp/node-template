/*************************************************************
  Module Dependencies
*************************************************************/
var express = require('express')
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongodb')
  , http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

/*************************************************************
  App Configuration
*************************************************************/
// Global Config
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({ store: new MongoStore({ url: 'mongodb://localhost/test', collection: 'sessions' })}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// Dev Config Only
app.configure('development', function(){
  app.use(express.errorHandler());
  mongoose.connect('mongodb://localhost/test');
});

// Prod Config Only
app.configure('production', function(){
  mongoose.connect('mongodb://YOUR-DB-HERE');
});

/*************************************************************
  Socket.io Configuration
*************************************************************/
io.configure('development', function(){
  io.set('log level', 2);
});

io.configure('production', function(){
  io.enable('browser client minification'); // send minified client
  io.enable('browser client etag');         // apply etag caching logic based on version number
  io.enable('browser client gzip');         // gzip the file
  io.set('log level', 1);                   // reduce logging
  io.set('transports', [                    // enable all transports
    'websocket',
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling'
  ]);
});

/*************************************************************
  Mongoose Models
*************************************************************/
var Users = require('./models').Users;

/*************************************************************
  Routes
*************************************************************/
app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});

/*************************************************************
  Socket.io Events
*************************************************************/
io.sockets.on('connection', function(socket){
  socket.on('test', function(){
    console.log('test event');
  });
});

/*************************************************************
  Startup
*************************************************************/
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

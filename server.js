var express = require('express'),
    path = require("path"),
    app = express(),
    http = require('http').Server(app),
    bodyParser = require('body-parser'),
    expressSession = require('express-session'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
	  indico = require('indico.io'),
    Twitter = require('twitter'),
    _ = require('underscore'),
    io = require('socket.io')(http),
    Chance = require('chance');

var indico_settings = {
    "api_key": "04ad709a428e213f86e226d9610b2e86"
};

app.use(expressSession({secret:'whatever'}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new TwitterStrategy({
    consumerKey: "1n20OYq3cIpIUkp4EEq3d8Nbp",
    consumerSecret: "8ZTnyTgFT7pvVckbaHHJdOPylqz8jxKyZdrbrNfobrnytt8F0l",
    callbackURL: "http://localhost:3000/auth/twitter/callback"
}, function(token, tokenSecret, profile, done) {
    done(null, { id: profile.id, screen_name: profile.screen_name, token: token, secret: tokenSecret });
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/#/waitingRoom', failureRedirect: '/login' }));


app.get('/tweets', function(req, res) {
    var client = new Twitter({
        consumer_key: '1n20OYq3cIpIUkp4EEq3d8Nbp',
        consumer_secret: '8ZTnyTgFT7pvVckbaHHJdOPylqz8jxKyZdrbrNfobrnytt8F0l',
        access_token_key: req.user.token,
        access_token_secret: req.user.secret
    });

    var params = {screen_name: req.user.screen_name};
    client.get('statuses/user_timeline', params, function(error, tweets, response){
      var retObj = {};
      retObj.tweets = [];
      if (!error) {
        for(i = 0; i < tweets.length; i++){
            retObj.tweets.push(tweets[i].text);
        }
        retObj.uid = req.user.id;
        getPoliticalAlignment(retObj.tweets, retObj.uid, storeUserPoliticalAlignmentPair);
        res.send(retObj);
        }
    });
});
var UserPoliticalAlignmentPair = [];
var storeUserPoliticalAlignmentPair = function(uid, objArr) {
  var newUserObj = {},
      hash_table = {},
      objects = objArr,
      topPoliticalResult;

    // Loop through the objects, each object contains a a number of key value pairs
  for(var i = 0; i < objects.length; i++) {
    // For each key value pair
    for(var key in objects[i]) {
      // If our hash table already contains the key, add to its value
      if(hash_table.hasOwnProperty(key)) {
        hash_table[key] += objects[i][key];
      // Otherwise, set the value
      } else {
        hash_table[key] = objects[i][key];
      }
    }
  }

  var party = "conservative";
  var max = 0;
  console.log(hash_table);
  // Take the result and average it
  for(var key in hash_table) {
    hash_table[key] /= objects.length;
    if(hash_table[key] > max){
      party = key;
      max = hash_table[key];
    }
  }
  // console.log(party);
  newUserObj[uid] = party;
  UserPoliticalAlignmentPair.push(newUserObj);
  console.log(UserPoliticalAlignmentPair);
}
var getPoliticalAlignment = function(strArr, uid, cb) {
  indico.batchPolitical(strArr, indico_settings)
    .then(function(res) {
      cb(uid, res);
    }).catch(function(err) {
      console.warn(err);
    });
}

app.get('/tags', function(request, response) {
    console.log(request.query);
    response.end("hello");
});

http.listen(process.env.PORT || 3000, function() {
	console.log('listening on port 3000');
});

var batch = [
    "Finally here! Eric Schmidt being the first keynote speaker.",
    "This is a second tweet",
    "This is a third tweet"
];

var getMaxTen = function(obj) {
  var topTen = [];
  for (var i = 0; i < 10; i++) {
    var maxVal = _.max(obj);
    topTen.push(maxVal);
    console.log(maxVal);
    delete obj[_.keys(maxVal)[0]];
  };
  console.log(_.allKeys(topTen));
}

// Currently takes in a batch of strings and averages the values into a javascript object
// Can also use indico.batchTextTags
app.get('/interests', function(req, res1) {
  indico.batchTextTags(req.query.body, indico_settings)
    .then(function(res) {
      var objects = res;
      var hash_table = {};

      // Loop through the objects, each object contains a a number of key value pairs
      for(var i = 0; i < objects.length; i++) {
        // For each key value pair
        for(var key in objects[i]) {
          // If our hash table already contains the key, add to its value
          if(hash_table.hasOwnProperty(key)) {
            hash_table[key] += objects[i][key];
          // Otherwise, set the value
          } else {
            hash_table[key] = objects[i][key];
          }
        }
      }

      // Take the result and average it
      for(var key in hash_table) {
        hash_table[key] /= objects.length;
      }
      // Result is a hash table of averaged values from indico
      res1.send({interests: hash_table});
    }).catch(function(err) {
      console.warn(err);
    });
});

// =============== CHAT ROOM W/ SOCKET.IO ==================
// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['room1','room2','room3'];

var users = [],
    usercount = 0;

io.sockets.on('connection', function (socket) {

  // Enable the chat room button when there's more than 2 users on our site
    socket.on('user auth', function(uid) {
      console.log('Authenticated user');
      usercount++;
      users.push(uid);
      console.log('uid:'+uid+' '+'count:'+usercount);
      if (usercount>1) {
        socket.emit('enable start button');
      }
    });

    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function(){

        // Generate a random username for the user
        var chance = new Chance();
        var username = chance.name();

        socket.username = username;
        // Update the client to let him to know he/she joined
        socket.emit('client_joined_waiting_room', username);
        // Update only the new user with the other people waiting in the chat room
        socket.emit('get_other_users_in_waiting_room', usernames); 
        // Update all the other users (excluding the client) with the new user
        socket.broadcast.emit('user_joined_waiting_room', username);

        // Add the username to a global list
        usernames[username] = username;

        // store the room name in the socket session for this client
        socket.room = 'room1';
        // send client to room 1
        socket.join('room1');
        // echo to client they've connected
        socket.emit('updatechat', 'SERVER', 'you have connected to room1');
        // echo to room 1 that a person has connected to their room
        socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
        socket.emit('updaterooms', rooms, 'room1');
    });

    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
    });

    socket.on('switchRoom', function(newroom){
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
        // sent message to OLD room
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
        // update socket session room title
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function(){
        // Update all of the other users in the waiting room to show the user left
        socket.broadcast.emit('user_left_waiting_room', socket.username);
        // remove the username from global usernames list
        delete usernames[socket.username];
        // update list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});

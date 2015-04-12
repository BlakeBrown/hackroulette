var express = require('express'),
    path	= require("path"),
	app 	= express(),
	http 	= require('http').Server(app),
	bodyParser = require('body-parser'),
    expressSession = require('express-session'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
	indico = require('indico.io'),
    Twitter = require('twitter'), 
    io = require('socket.io')(http);


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
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/tweets', failureRedirect: '/login' }));

app.get('/tweets', function(req, res) {
    if(!req.user) { return res.redirect('/'); }
    var client = new Twitter({
        consumer_key: '1n20OYq3cIpIUkp4EEq3d8Nbp',
        consumer_secret: '8ZTnyTgFT7pvVckbaHHJdOPylqz8jxKyZdrbrNfobrnytt8F0l',
        access_token_key: req.user.token,
        access_token_secret: req.user.secret
    });

    var params = {screen_name: req.user.screen_name };
    client.get('statuses/user_timeline', params, function(error, tweets, response){
        if (!error) {
            var words = [];
            for(i = 0; i < tweets.length; i++){
                words.push(tweets[i].text);
            }
            res.send(words);
            console.log(words.length);
            //res.send(tweets);
        }
    });
});

app.get('/tags', function(request, response) {
    console.log(request.query);
    response.end("hello");
});

http.listen(process.env.PORT || 3000, function() {
	console.log('listening on port 3000');
});

var single = "Blog posts about Android tech make better journalism than most news outlets.";
indico.textTags(single, indico_settings)
  .then(function(res) {
    //console.log(res);
  }).catch(function(err) {
    console.warn(err);
  });

var batch = [
    "Finally here! Eric Schmidt being the first keynote speaker.",
    "This is a second tweet",
    "This is a third tweet"
];

// Currently takes in a batch of strings and averages the values into a javascript object
// Can also use indico.batchTextTags
indico.batchPolitical(batch, indico_settings)
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
    console.log(hash_table);
  }).catch(function(err) {
    console.warn(err);
  });

// =============== CHAT ROOM W/ SOCKET.IO ==================

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['room1','room2','room3'];

io.sockets.on('connection', function (socket) {
    
    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function(username){
        // store the username in the socket session for this client
        socket.username = username;
        // store the room name in the socket session for this client
        socket.room = 'room1';
        // add the client's username to the global list
        usernames[username] = username;
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
        // remove the username from global usernames list
        delete usernames[socket.username];
        // update list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});

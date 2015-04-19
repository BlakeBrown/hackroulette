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
    callbackURL: "/auth/twitter/callback"
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

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/views/index.html');
});

app.get('/waiting-room', function (req, res) {
  res.sendFile(__dirname + '/public/views/waiting-room.html');
});

app.get('/chat', function (req, res) {
  res.sendFile(__dirname + '/public/views/chat.html');
});

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/waiting-room', failureRedirect: '/login' }));


app.get('/tweets', function(req, res) {

    var client = new Twitter({
        consumer_key: '1n20OYq3cIpIUkp4EEq3d8Nbp',
        consumer_secret: '8ZTnyTgFT7pvVckbaHHJdOPylqz8jxKyZdrbrNfobrnytt8F0l',
        access_token_key: req.user.token,
        access_token_secret: req.user.secret
    });

    // Store the user token from the request
    var client_id = req.user.token;

    var params = {screen_name: req.user.screen_name};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
      var retObj = {};
      retObj.tweets = [];
      if (!error) {
        for(i = 0; i < tweets.length; i++){
            retObj.tweets.push(tweets[i].text);
        }

        addClientToApplication(client_id);
        // getPoliticalAlignment(retObj.tweets, retObj.uid, storeUserPoliticalAlignmentPair);
        res.send(retObj);
        }
    });
});

// Get a user who has authenticated with twitter
app.get('/user', function(req, res) {

    if(req.user) {    

        var user_id = req.user.token;

        // Find the user
        for(var i = 0; i < users.length; i++) {
            if(users[i].user_id == user_id) {
                console.log("found user");
                io.sockets.on('connection', function (socket) {
                    socket.emit('adduser', users[i]);
                });
                // Reply back to the client with the user
                res.send(users[i]);
            }
        }
    } else {
        res.send("Could not find user");
    }
});

// Global array of users who have authenticated
var users = [];

// Takes in a client id and generates a new user, adding them to the global array
var addClientToApplication = function(user_id) {

    // Check if the user already exists before creating a new one
    for(var i = 0; i < users.length; i++) {
        if(users[i].user_id == user_id) {
            return;
        }
    }

    // Generate a random username for the user
    var chance = new Chance();
    var username = chance.name();

    // Construct the user object
    var user = {
        user_id: user_id,
        user_name: username
    }

    // Push the user to the global array
    users.push(user);
}

app.get('/tags', function(request, response) {
    console.log(request.query);
    response.end("hello");
});

http.listen(process.env.PORT || 3000, function() {
    console.log('listening on port 3000');
});

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

// =============== SOCKET.IO ==================
// Global array of users who are connected and are either in the waiting room or chat room
var connected_users = [];
var user_count = 0;

// rooms which are currently available in chat
var rooms = ['room1','room2','room3'];

io.sockets.on('connection', function (socket) {

    // Takes in a user object and adds them to the waiting list + waiting room
    socket.on('add_client_to_waiting_room', function(user) {
        // Give the user an unique index identifier (since if the same person opens two tabs, we want to consider them as two users even though they have the same authentication ID)
        user.user_index = user_count; 
        user_count++;
        // Update the user status to "waiting" (in the waiting room)
        user.status = "waiting";
        // Store the user in the current connection
        socket.user = user;

        // Update the client to let him to know he/she joined
        socket.emit('client_joined_waiting_room', user);
        // Update the client with the other people in the waiting room
        socket.emit('get_other_users_in_waiting_room', connected_users); 
        // Update all the other users (excluding the client) with the new user
        socket.broadcast.emit('user_joined_waiting_room', user);

        // Add the user to the global waiting room list
        connected_users.push(user);
    });

    // Takes in a user object and adds them to the chat
    socket.on('add_client_to_chat', function(user) {

        // Give the user an unique index identifier (since if the same person opens two tabs, we want to consider them as two users even though they have the same authentication ID)
        user.user_index = user_count; 
        user_count++;
        // Update the user status to "chat" (in the chat room)
        user.status = "chat";
        // Store the user in the socket session
        socket.user = user;

        // Add the user to the global chat room list
        connected_users.push(user);

        // Store the room name in the socket session
        socket.room = 'room1';
        // Send the client to room 1
        socket.join('room1');
        // Tell the client they've connected
        socket.emit('send_server_message', 'you have connected to room1');
        // Store the user client side
        socket.emit('store_connected_user', user);
        // Tell other users in the room that another user has connected
        socket.broadcast.to('room1').emit('send_server_message', user.user_name + ' has connected to this room');
        socket.emit('updaterooms', rooms, 'room1');
    });

    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.in(socket.room).emit('send_message', socket.user, data);
    });

    socket.on('switchRoom', function(newroom){
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('send_server_message', 'you have connected to ' + newroom);
        // sent message to OLD room
        socket.broadcast.to(socket.room).emit('send_server_message', socket.user.user_name + ' has left this room');
        // update socket session room title
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('send_server_message', socket.user.user_name +' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });

    // Called when the client disconnects, removes the client from the application
    socket.on('disconnect', function() {
        if(socket.user) {
            console.log("user left the " + socket.user.status + "room");
            // If the user is in the waiting room, update the other users to show they left
            if(socket.user.status == "waiting") {
                socket.broadcast.emit('user_left_waiting_room', socket.user.user_index);
            } else {
                // Otherwise the client is in the chat room, update the other users to show they left
                socket.broadcast.emit('send_server_message', socket.user.user_name + ' has left this room'); 
            }

            // Remove the user from the global array
            for(var i = 0; i < connected_users.length; i++) {
                if(connected_users[i].user_index == socket.user.user_index) {
                   connected_users.splice(i, 1);
                }
            }
            socket.leave(socket.room);
        } else {
            console.log("Could not find user who disconnected");
        }
    });
});

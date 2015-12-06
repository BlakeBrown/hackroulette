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

// Gets all of a users tweets
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
        client.get('favorites/list', params, function(error2, favs, response2) {
            if(!error2){
                for(i = 0; i < favs.length; i++){
                    retObj.tweets.push(favs[i].text);
                }
            }
            addClientToApplication(client_id);
            res.send(retObj);
        });
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

http.listen(3001, function() {
    console.log('Hackroulette listening on port 3001');
});

// Gets a users interests from indico's API (for waiting room)
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

// Stores the top 5 interests from indico's API (for chat room)
app.get('/interests-for-chat', function(req, res1) {
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

        // Take the top 5 results
        var list = hash_table;
        var interests = [];
        for(var i = 0; i < 5; i++) {
            var max = 0;
            for(var key in list){
                if(list[key] > max){
                    interests[i] = key;
                    max = list[key];
                }
            }
            delete list[interests[i]];
        }

        // Result is the clients top 5 interests
        res1.send({interests: interests});
    }).catch(function(err) {
      console.warn(err);
    });
});

// ======================================================================================
// =============================== SOCKET.IO ============================================
// ======================= Welcome to websocket land ====================================
// ======================================================================================

// Global array of users who are connected and are either in the waiting room or chat room
var connected_users = [];
var user_count = 0;

// Start the server with one empty room
var socket_rooms = [{room: "room1", users: []}];

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
        
        // Store the user client side
        socket.emit('store_connected_user', user);
        // Add the user to the global waiting room list
        connected_users.push(user);

        // Update the client with all the users in the waiting room
        socket.emit('get_users_in_waiting_room', connected_users); 
        // Update all the other users (excluding the client) with the new user
        socket.broadcast.emit('user_joined_waiting_room', user);

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

        var room_joined;

        // Join a room if one is available
        for(var i = 0; i < socket_rooms.length; i++) {
            // If there are less than 2 people in the room
            if(socket_rooms[i].users.length < 2) {
                // Join the room and break from the loop 
                socket_rooms[i].users.push(user);
                room_joined = socket_rooms[i].room;
                break;
            }
        }

        // If the user didn't join a room (none were available)
        if(!room_joined) {
            // Create a new room and put the user in it
            var new_room = {room: "room" + (socket_rooms.length + 1), users: [user]};
            socket_rooms.push(new_room);
            room_joined = new_room.room;
        }

        // Store the room name in the socket session
        socket.room = room_joined;
        // Send the client to room 1
        socket.join(room_joined);
        // Tell the client they've connected
        socket.emit('send_server_message', 'you have connected to room ' + room_joined.substring(4));
        // Store the user client side
        socket.emit('store_connected_user', user);
        // Tell other users in the room that another user has connected
        socket.broadcast.to(room_joined).emit('send_server_message', user.user_name + ' has connected to this room');
        console.log(connected_users);
    });

    socket.on('store_interests', function(user) {
        // Store the users interests
        for(var i = 0; i < connected_users.length; i++) {
            if(connected_users[i].user_index == user.user_index) {
                connected_users[i].interests = user.interests;
            }
        }
        // Check if there's two users in the chat (so we can emit their common interests)
        for(var i = 0; i < socket_rooms.length; i++) {
            if(socket_rooms[i].room == socket.room) {
                if(socket_rooms[i].users.length == 2) {
                    io.sockets.in(socket.room).emit('show_common_interests', socket_rooms[i].users);
                }
            }
        }
    });

    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.in(socket.room).emit('send_message', socket.user, data);
    });

    // Called when the client disconnects, removes the client from the application
    socket.on('disconnect', function() {
        if(socket.user) {
            console.log("User left the " + socket.user.status + " room");
            // If the user is in the waiting room, update the other users to show they left
            if(socket.user.status == "waiting") {
                socket.broadcast.emit('user_left_waiting_room', socket.user.user_index);
            } else {
                // Otherwise the client is in the chat room, update the other users to show they left
                io.sockets.in(socket.room).emit('send_server_message', socket.user.user_name + ' has left this room'); 
                // Also remove the user from the room
                for(var i = 0; i < socket_rooms.length; i++) {
                    // Find the room the user was in
                    if(socket_rooms[i].room == socket.room) {
                        // Find the user 
                        for(var j = 0; j < socket_rooms[i].users.length; j++) {
                            if(socket_rooms[i].users[j].user_index == socket.user.user_index) {
                                // Remove the user
                                socket_rooms[i].users.splice(j, 1);
                                io.sockets.in(socket.room).emit('user_left_room');
                                console.log("User removed from " + socket_rooms[i].room);
                            }
                        }
                    }
                }
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

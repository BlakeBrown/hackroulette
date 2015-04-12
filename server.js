var express = require('express'),
	path	= require("path"),
	app 	= express(),
	http 	= require('http').Server(app),
	bodyParser = require('body-parser'),
    OAuth   = require('oauth').OAuth,
    expressSession = require('express-session'),
    cookieParser = require('cookie-parser'),
	indico = require('indico.io');

var indico_settings = {
  "api_key": "04ad709a428e213f86e226d9610b2e86"
};

var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "1n20OYq3cIpIUkp4EEq3d8Nbp",
    "8ZTnyTgFT7pvVckbaHHJdOPylqz8jxKyZdrbrNfobrnytt8F0l",
    "1.0",
    "https://twitter.com",
    "HMAC-SHA1"
);

app.use(cookieParser());
app.use(expressSession({secret:'whatever'}));

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/auth/twitter', function(req, res){
    oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
        if(error) {
            console.log(error);
            res.send("twitter authentication failed :/");
        }
        else {
            req.session.oauth = {};
            req.session.oauth.token = oauth_token;
            console.log('oauth.token: ' + req.session.oauth.token);
            req.session.oauth.token_secret = oauth_token_secret;
            console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token);
        }
    });
});

app.get('/auth/twitter/callback', function(req, res, next){
    if (req.session.oauth) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        var oauth = req.session.oauth;

        oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
        function(error, oauth_access_token, oauth_access_token_secret, results){
            if (error){
                console.log(error);
                res.send("yeah something broke.");
            } else {
                req.session.oauth.access_token = oauth_access_token;
                req.session.oauth.access_token_secret = oauth_access_token_secret;
                console.log(results);
                res.send("worked. nice one.");
            }
        });
    } else {
        next(new Error("you're not supposed to be here."));
    }
});

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

    for(var key in hash_table) {
      hash_table[key] /= objects.length;
    }

    console.log(hash_table);
  }).catch(function(err) {
    console.warn(err);
  });

// indico.batchTextTags(batch, indico_settings)
//   .then(function(res) {
    
//     var objects = res;

//     var hash_table = {};

//     // Loop through the objects, each object contains a a number of key value pairs
//     for(var i = 0; i < objects.length; i++) {
//       // For each key value pair
//       for(var key in objects[i]) {

//         // If our hash table already contains the key, add to its value
//         if(hash_table.hasOwnProperty(key)) {
//           hash_table[key] += objects[i][key];
//         // Otherwise, set the value
//         } else {
//           hash_table[key] = objects[i][key];
//         }
//       }
//     }

//     for(var key in hash_table) {
//       hash_table[key] /= objects.length;
//     }

//     console.log(hash_table);
//   }).catch(function(err) {
//     console.warn(err);
//   });
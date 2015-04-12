var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: '1n20OYq3cIpIUkp4EEq3d8Nbp',
    consumer_secret: '8ZTnyTgFT7pvVckbaHHJdOPylqz8jxKyZdrbrNfobrnytt8F0l',
    access_token_key: '335674662-O67t82w3K4kFksL0JHTvOQViBCnxkEoFT7Z2KWTX',
    access_token_secret: 'uNqwFoRhUuEoWu6WY0p5Y0sRH0AQZKydvelWxqCBVMoz6'
});

var params = {screen_name: 'nodejs'};
client.get('statuses/user_timeline', params, function(error, tweets, response){
    if (!error) {
        console.log(tweets);
    }
});

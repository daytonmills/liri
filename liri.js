const keys = require('./keys.json');
const handles = require('./handles.js');

const twitter = require('twitter');
const chalk = require('chalk');
const log = console.log;

var twitterClient = new twitter({
  consumer_key: keys.consumer_key,
  consumer_secret: keys.consumer_secret,
  access_token_key: keys.access_token_key,
  access_token_secret: keys.access_token_secret
});

//Create the liri object
var liri = {
    commands : {
        twitter : function() {
            twitterClient.get('statuses/user_timeline', 'daytonmills', function(error, tweets, response) {
                if (!error) {
                    for (let tweet of tweets) {
                        var tweetWords = tweet.text.split(' ');
                        var handles = [];
                        var newWords = [];

                        for(let word of tweetWords) {
                            if(word.includes('@')) {
                                handles.push(word);
                            }
                            else {
                                newWords.push(word);
                                var newTweet = newWords.join(' ');
                                for(let handle of handles) {
                                    if(handle + ' ' + newTweet === tweet.text) {
                                        //This tweet is a direct reply
                                        log(chalk.gray(tweet.) + ' ' + chalk.cyan(handle) + ' ' + chalk.white(newTweet));
                                    }
                                }
                            }
                        }
                    }
                }
            });
        },

        spotify: function()
        {

        },

        movie: function()
        {

        },

        simon: function()
        {

        }
    }
}

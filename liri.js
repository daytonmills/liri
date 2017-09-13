const keys = require('./keys.json');
const handles = require('./handles.js');

const twitter = require('twitter');
const moment = require('moment');
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
            //Fetch the latest tweets from an account
            twitterClient.get('statuses/user_timeline', 'lirib0t', function(error, tweets, response)
            {
                if (!error)
                {
                    log(chalk.cyan.underline.bold('\nHere are the latest tweets for @lirib0t!'));
                    //For each tweet that is returned
                    for (let [index, tweet] of tweets.entries())
                    {
                        //Initialize tweet variables
                        var tweetWords = tweet.text.split(' ');
                        var tweetDates = moment(tweet.created_at,'dd MMM DD HH:mm:ss ZZ YYYY').format('MM/DD/YYYY');
                        var handles = [];
                        var newWords = [];
                        var newTweet;

                        //For every word within a tweet
                        for(let word of tweetWords)
                        {
                            //If the word is a handle
                            if(word.includes('@'))
                            {
                                //Separate handle from the rest of tweet
                                handles.push(word);
                            }
                            else
                            {
                                //Push all of the other words into a string
                                newWords.push(word);
                                newTweet = newWords.join(' ');

                                //When all words are together, print the tweet
                                if(newTweet === tweet.text)
                                {
                                    printTweet('status', tweetDates, tweet.text);
                                }
                            }
                        }

                        //For every handle within a tweet
                        for(let handle of handles)
                        {
                            //Verify the the tweet is a reply and print the tweet
                            if(handle + ' ' + newTweet === tweet.text)
                            {
                                printTweet('reply', tweetDates, newTweet, handle);
                            }
                        }
                    }
                }
            });

            //Print tweets in console with or without handles
            function printTweet(type, date, tweet, handle) {
                switch(type) {
                    case 'reply':
                        log(
                            chalk.gray(date) +
                            ' ' +
                            chalk.cyan(handle) +
                            ' ' +
                            chalk.white(tweet)
                        );
                        break;
                    case 'status':
                        log(
                            chalk.gray(date) +
                            ' ' +
                            chalk.white(tweet)
                        );
                        break;
                }
            }
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

liri.commands.twitter();

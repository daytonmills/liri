const keys = require('./keys.json');
const handles = require('./handles.js');

const twitter = require('twitter');
const spotify = require('node-spotify-api');
const inquirer = require('inquirer');
const moment = require('moment');
const chalk = require('chalk');

const log = console.log;

//Create the liri object
var liri = {
    commands : {
        twitter : function() {
            var twitterApi = new twitter({
              consumer_key: keys.twitter.consumer_key,
              consumer_secret: keys.twitter.consumer_secret,
              access_token_key: keys.twitter.access_token_key,
              access_token_secret: keys.twitter.access_token_secret
            });

            //Fetch the latest tweets from an account
            twitterApi.get('statuses/user_timeline', 'lirib0t', function(error, tweets, response)
            {
                if (!error)
                {
                    log(chalk.cyan.underline.bold('\nHere are the latest tweets for @lirib0t!'));
                    //For each tweet that is returned
                    for (let [index, tweet] of tweets.entries())
                    {
                        //Initialize tweet variables
                        var tweetWords = tweet.text.split(' ');
                        var tweetDates = moment(tweet.created_at,'dd MMM DD HH:mm:ss ZZ YYYY').format('MM/DD/YYYY hh:mm');
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
                            ' > ' +
                            chalk.cyan(handle) +
                            ' ' +
                            chalk.white(tweet)
                        );
                        break;
                    case 'status':
                        log(
                            chalk.gray(date) +
                            ' > ' +
                            chalk.white(tweet)
                        );
                        break;
                }
            }
        },

        spotify: function()
        {
            var spotifyApi = new spotify({
              id: keys.spotify.id,
              secret: keys.spotify.secret
            });

            spotifyApi.search({ type: 'track', query: 'All the small things', limit: 10  }, function(err, data)
            {
                if (err)
                {
                    return console.log('Error occurred: ' + err);
                }

                var tracks = [];

                let trackFetcher = new Promise((resolve, reject) => {
                    for(let track of data.tracks.items)
                    {
                        var trackData = {
                            name : track.name + " by: " + track.artists[0].name,
                            value : {
                                name: track.name,
                                album: track.album.name,
                                artist: track.artists[0].name,
                                url: track.external_urls.spotify,
                            }
                        }

                        tracks.push(trackData);
                        resolve(tracks);
                    }
                });

                trackFetcher.then((tracks) => {
                    //Have user select their choice
                    console.log(tracks);
                    inquirer.prompt([
                        {
                          type: 'list',
                          message: 'Select a track from the list',
                          choices: tracks,
                          name: "track"
                      }]).then(function(selected) {
                          console.log(selected);
                    });
                });
            });
        },

        movie: function()
        {

        },

        simon: function()
        {

        }
    }
}

liri.commands.spotify();

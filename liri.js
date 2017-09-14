const keys = require('./keys.json');
const handles = require('./handles.js');

const twitter = require('twitter');
const spotify = require('node-spotify-api');
const inquirer = require('inquirer');
const moment = require('moment');
const chalk = require('chalk');

const log = console.log;

var liri = {
    commands : {
        twitter : function() {
            var twitterApi = new twitter({
              consumer_key: keys.twitter.consumer_key,
              consumer_secret: keys.twitter.consumer_secret,
              access_token_key: keys.twitter.access_token_key,
              access_token_secret: keys.twitter.access_token_secret
            });

            twitterApi.get('statuses/user_timeline', 'lirib0t', function(error, tweets, response)
            {
                if (!error)
                {
                    log(chalk.cyan.bold('\nTwitter: ')+chalk.gray('\n>----------------------------------------------------<'));

                    for (let [index, tweet] of tweets.entries())
                    {
                        var tweetWords = tweet.text.split(' ');
                        var tweetDates = moment(tweet.created_at,'dd MMM DD HH:mm:ss ZZ YYYY').format('MM/DD/YYYY hh:mm');
                        var handles = [];
                        var newWords = [];
                        var newTweet;

                        for(let word of tweetWords)
                        {
                            if(word.includes('@'))
                            {
                                handles.push(word);
                            }
                            else
                            {
                                newWords.push(word);
                                newTweet = newWords.join(' ');

                                if(newTweet === tweet.text)
                                {
                                    printTweet('status', tweetDates, tweet.text);
                                }
                            }
                        }

                        for(let handle of handles)
                        {
                            if(handle + ' ' + newTweet === tweet.text)
                            {
                                printTweet('reply', tweetDates, newTweet, handle);
                            }
                        }
                    }
                }
            });

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
                    inquirer.prompt([
                        {
                          type: 'list',
                          message: 'Select a track from the results',
                          choices: tracks,
                          name: "track"
                      }]).then(function(selected) {
                          log(
                              chalk.green.bold('\nSpotify: ') +
                              chalk.gray('\n>----------------------------------------------------<') +
                              chalk.white.bold('\nTrack: ') +
                              chalk.green(selected.track.name) +
                              ' by: ' +
                              chalk.green(selected.track.artist) +
                              '\n' +
                              chalk.white.bold('Album: ') +
                              chalk.green(selected.track.album) +
                              '\n' +
                              chalk.white.bold('Listen: ') +
                              chalk.green.underline(selected.track.url)
                          );
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

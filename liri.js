const keys = require('./keys.json');
const handles = require('./handles.js');
const twitter = require('twitter');
const spotify = require('node-spotify-api');
const request = require('request');
const inquirer = require('inquirer');
const moment = require('moment');
const chalk = require('chalk');
const fs = require('fs');
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
                    log(
                        chalk.cyan.bold('\nTwitter: ')+
                        chalk.gray('\n>----------------------------------------------------<')
                    );

                    for (let [index, tweet] of tweets.entries())
                    {
                        var tweetWords = tweet.text.split(' ');
                        var tweetDay = moment(tweet.created_at,'dd MMM DD HH:mm:ss ZZ YYYY').format('MM/DD/YYYY hh:mm');
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
                                    printTweet('status', tweetDay, tweet.text);
                                }
                            }
                        }

                        for(let handle of handles)
                        {
                            if(handle + ' ' + newTweet === tweet.text)
                            {
                                printTweet('reply', tweetDay, newTweet, handle);
                            }
                        }
                    }
                }
            });

            function printTweet(type, date, tweet, handle) {
                switch(type) {
                    case 'reply':
                        log(
                            chalk.cyanBright(date + ': ') +
                            chalk.cyan(handle + ' ') +
                            chalk.white(tweet)
                        );
                        break;
                    case 'status':
                        log(
                            chalk.cyanBright(date + ': ') +
                            chalk.white(tweet)
                        );
                        break;
                }
            }
        },

        spotify: function(query)
        {
            var spotifyApi = new spotify({
              id: keys.spotify.id,
              secret: keys.spotify.secret
            });

            spotifyApi.search({ type: 'track', query: query, limit: 10  }, function(error, data)
            {
                if(!error)
                {
                    var tracks = [];

                    let trackFetcher = new Promise((resolve, reject) => {
                        for(let track of data.tracks.items)
                        {
                            var trackData = {
                                name : track.name + ' by: ' + track.artists[0].name,
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

                                  chalk.greenBright.bold('\nTrack: ') +
                                  chalk.white(selected.track.name) +
                                  '\n' +
                                  chalk.greenBright.bold('Artist: ') +
                                  chalk.white(selected.track.artist) +
                                  '\n' +
                                  chalk.greenBright.bold('Album: ') +
                                  chalk.white(selected.track.album) +
                                  '\n' +
                                  chalk.greenBright.bold('Listen: ') +
                                  chalk.white.underline(selected.track.url)
                              );
                        });
                    });
                }
            });
        },

        movie: function(query)
        {
            request('https://www.omdbapi.com/?apikey='+keys.omdb.key+'&t='+query+'', function (error, response, body) {
                if(!error)
                {
                    var movie = JSON.parse(body);
                    log(
                        chalk.yellow.bold('\nMovie: ') +
                        chalk.gray('\n>----------------------------------------------------<') +
                        chalk.yellow.bold('\nName: ') +
                        chalk.white(movie.Title) +
                        chalk.yellow.bold('\nPlot: ') +
                        chalk.white(movie.Plot) +
                        chalk.yellow.bold('\nYear: ') +
                        chalk.white(movie.Year) +
                        chalk.yellow.bold('\nCast: ') +
                        chalk.white(movie.Actors) +
                        chalk.yellow.bold('\nCountries: ') +
                        chalk.white(movie.Country) +
                        chalk.yellow.bold('\nLanguages: ') +
                        chalk.white(movie.Language) +
                        chalk.yellow.bold('\nIMDB Ratings: ') +
                        chalk.white(movie.Ratings[0].Value) +
                        chalk.yellow.bold('\nRotten Tomatos: ') +
                        chalk.white(movie.Ratings[1].Value)
                    );
                }
            });
        },

        simon: function()
        {
            fs.readFile('random.txt', 'utf8', (err, data) =>
            {
                data = data.split(',');
                eval('liri.commands.'+ data[0] +'('+ data[1] +')');
            });
        }
    }
}

switch(process.argv[2])
{
    case "spotify":
        if(!process.argv[3]) {
            liri.commands.spotify("The Sign");
        } else {
            liri.commands.spotify(process.argv[3]);
        }
        break;

    case "twitter":
        liri.commands.twitter();
        break;

    case "movie":
        if(!process.argv[3]) {
            liri.commands.movie('Mr. Nobody');
        } else {
            liri.commands.movie(process.argv[3]);
        }
        break;

    case "simon":
        liri.commands.simon();
        break;
}

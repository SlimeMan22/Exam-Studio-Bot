var discord = require('discord.js');
var roblox = require('roblox-js');

var fs = require('fs');
var blacklist = JSON.parse(fs.readFileSync('./storage.json'));
function UpdateBlacklist() {
    fs.writeFileSync('./storage.json', JSON.stringify(blacklist));
}

var bot = new discord.Client();

roblox.login('ExamStudioModeration', process.env.ACCOUNT_PASS);

function LogError(message, err) {
    var author = '<@'+message.author.id+'>';
    message.channel.send(author, 
        {embed: {
            color: 0xff0000,
            title: 'An unexpected error occured',
            description: '```'+err.message+'```',
            footer: {
                text: "ExamBot written by SlimeMan22 for Aorda's Exam Studio"
            }
        }}
    );
}

function getIdFromName(message, name) {
    var id;
    roblox.getIdFromUsername(name).then(function(ID) {
        id = ID;
    }).catch(function(err) {
        LogError(message, err);
    })
    return id;
}

var commands = {
    help: function(message, msg) {
        message.channel.send('<@'+message.author.id+'> here is my command list:\n```•help\n•ping\n•exile\n•setrank\n•promote\n•demote\n•post\n•shout\n•ban\n•unban\n•cleanmembers```');
    },
    ping: function(message, msg) {
        var author = '<@'+message.author.id+'>';
        message.channel.send(author+' pong ('+Math.floor(bot.ping*100)/100+' MS)');
    },
    exile: function(message, msg) {
        var params = msg.split(' ');
        var target = params[0];
        var deleteAllPosts = (params[1] == 'true') || false;
        roblox.getIdFromUsername(target).then(function(id) {
            roblox.exile(2704232, id, deleteAllPosts).then(function() {
                message.channel.send('<@'+message.author.id+'> successfully exiled '+target);
            }).catch(function(err){LogError(message, err)})
        }).catch(function(err){LogError(message, err)});
    },
    setrank: function(message, msg) {
        var params = msg.split(' ');
        var target = params[0];
        var newRole = params[1];
        roblox.getIdFromUsername(target).then(function(id) {
            roblox.setRank(2704232, id, newRole).then(function() {
                message.channel.send('<@'+message.author.id+'> successfully set role of '+target+' to '+newRole);
            }).catch(function(err) {
                LogError(message, err);
            });
        }).catch(function(err){LogError(message, err)});
    },
    promote: function(message, msg) {
        var target = msg;
        roblox.getIdFromUsername(target).then(function(id) {
            roblox.promote(2704232, id).then(function() {
                message.channel.send('<@'+message.author.id+'> successfully promoted '+target);
            }).catch(function(err) {
                LogError(message, err);
            })
        }).catch(function(err){LogError(message, err)})
    },
    demote: function(message, msg) {
        var target = msg;
        roblox.getIdFromUsername(target).then(function(id) {
            roblox.demote(2704232, id).then(function() {
                message.channel.send('<@'+message.author.id+'> successfully demoted '+target);
            }).catch(function(err) {
                LogError(message, err);
            })
        }).catch(function(err){LogError(message, err)})
    },
    unfollow: function(message, msg) { //strictly for testing purposes to make sure roblox-js is working.
        var target = msg;
        roblox.getIdFromUsername(target).then(function(id) {
            roblox.unfollow(id).then(function() {
                message.channel.send('<@'+message.author.id+'> successfully unfollowed '+target);
            }).catch(function(err){LogError(message, err)});
        }).catch(function(err){LogError(message, err)})
    },
    follow: function(message, msg) { //same as above; only for testing purposes.
        var target = msg;
        roblox.getIdFromUsername(target).then(function(id) {
            roblox.follow(id).then(function() {
                message.channel.send('<@'+message.author.id+'> successfully followed '+target);
            }).catch(function(err){LogError(message, err)});
        }).catch(function(err){LogError(message, err)})
    },
    post: function(message, msg) {
        roblox.post(2704232, msg).then(function() {
            message.channel.send('<@'+message.author.id+'> sucessfully posted message to group wall');
        }).catch(function(err){LogError(message, err)})
    },
    shout: function(message, msg) {
        roblox.shout(2704232, msg).then(function() {
            message.channel.send('<@'+message.author.id+'> sucessfully updated group shout');
        }).catch(function(err){LogError(message, err)})
    },
    ban: function(message, msg) {
        var target = msg;
        roblox.getIdFromUsername(target).then(function(id){
            var found = false;
            for(var i = 0; i < blacklist.length; i++) {
                found = found || (blacklist[i] == id);
            }
            if (!found) {
                blacklist.push(id);
            }
            UpdateBlacklist();
            message.channel.send('<@'+message.author.id+'> '+target+' successfully banned');
            roblox.exile(2704232, id).then(function() {
                message.channel.send('<@'+message.author.id+'> '+target+' was found in the group, so we exiled them');
            }).catch(function(){});
        }).catch(function(err){LogError(message, err)})
    },
    unban: function(message, msg) {
        var target = msg;
        roblox.getIdFromUsername(target).then(function(id){
            var removedIndex;
            for(var i = 0; i < blacklist.length; i++) {
                if (blacklist[i] == id) {
                    blacklist[i] = null
                }
            }
            UpdateBlacklist();
            message.channel.send('<@'+message.author.id+'> '+target+' successfully unbanned');
        }).catch(function(err){LogError(message, err)})
    },
    cleanmembers: function(message, msg) {
        message.channel.send('Searching through all group members; this may take a while.');
        roblox.getPlayers(2704232).then(function(group){
            var players = group.players;
            var sc = 0;
            var fc = 0;
            for(var i = 0; i<players.length; i++) {
                var id = players[i].id;
                if (blacklist.includes(id)) {
                    roblox.exile(2704232, id).then(function(){sc++}).catch(function(err) {
                        LogError(message, err);
                        fc++;
                    })
                }
            }
            message.channel.send('<@'+message.author.id+'> successfully kicked '+sc+' banned members, failed to kick '+fc+' banned members');
        }).catch(function(err){LogError(message, err)})
    },
    readblacklist: function(message, msg) {
        message.channel.send('This feature is currently broken; It will be fixed later.');
        /*message.channel.send('Searching through all blacklisted members; this may take a while.');
        var list = '';
        var bug;
        for (var i = 0; i<blacklist.length; i++) {
            roblox.getUsernameFromId(parseInt(blacklist[i])).then(function(name) {
                list += name+', ';
            }).catch(function(err){bug=err});
        }
        if (!bug) {
            message.channel.send('<@'+message.author.id+'> banned members:\n'+list);
        } else {
            LogError(message, bug);
        }*/
    }
}

bot.on('message', message => {
    if (message.guild.id == '277179671123329024' || message.guild.id == '278252492951650304') {
        if (message.author.id == '206094926793015297' || message.member.roles.find('name', 'Moderator') || message.member.roles.find('name', 'Director')) {
            var msg = message.content;
            if(msg.startsWith('!')) {
                msg = msg.replace('!', '');
                var cmd = msg.split(' ')[0];
                var params = msg.replace(cmd+' ', '');
                if (commands[cmd]) {
                    commands[cmd](message, params);
                }
            }
        }
    }
});

bot.login(process.env.BOT_TOKEN);

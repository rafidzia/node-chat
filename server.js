var express = require('express');
var app     = express();
var http    = require("http").Server(app);
var io      = require("socket.io")(http);
var route   = require("./route");

app.use('/assets', express.static('assets'));

var totalUser = 0;
var activeUser = [];
var typingUser = [];

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
    io.on('connection' , function(socket){
        socket.on('newUser', function(usr){
            if(activeUser.indexOf(usr) >= 0){    
                socket.emit('userDec');
            }else{
                socket.emit('userAcc',usr);
                ++totalUser;
                activeUser.push(usr);
                console.log(activeUser);
                console.log(usr + " Connected");
                io.emit('usersOl', activeUser);
                io.emit('notifUserConnect', {
                    newUsr  : usr,
                    ttlUsr : totalUser
                });
                socket.on('newMessage', function(msg){
                    io.emit('showMessage', msg);
                    for(let i = 0; i < route.length; i++){
                        if(msg.match(route[i].q)){
                            console.log(route[i].a);
                            setTimeout(function(){
                             io.emit("showMessage", "botTest : " + route[i].a);
                            }, 700);
                            break;
                        }
                    }
                 });
                socket.on("typing", function(){
                    if(typingUser.indexOf(usr) < 0){
                        typingUser.push(usr);
                        io.emit("typeRes", typingUser);
                    }
                });
                socket.on("unTyping", function(){
                    if(typingUser.indexOf(usr) >= 0){
                        var typeIndex = typingUser.indexOf(usr);
                        typingUser.splice(typeIndex, 1);
                        io.emit("typeRes", typingUser);
                    }
                });
                
                socket.on('disconnect', function(){
                    --totalUser;
                    var userindex = activeUser.indexOf(usr);
                    activeUser.splice(userindex, 1);
                    console.log(activeUser);
                    console.log(usr + ' Disconnected');
                    io.emit('usersOl', activeUser);
                    io.emit('notifUserDisconnect', {
                        lostUsr  : usr,
                        ttlUsr : totalUser
                    });
                });
                
            }
        });
        
    }); 
});






var port = 4000;
http.listen(port, function(){
    console.log('Server listen port ' + port);
});

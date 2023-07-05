function modal(){
    var list = document.getElementById('list');
    var back = document.getElementById('modalback');
        if(list.className == 'hide'){
            list.className = 'show';
        }else{
            list.className = 'hide';
        }
    }


function fade(ket, node, time = 500){
    var interval = time / 100; // 100 /100 = 10
    var point = 0;
    for(let i = 0; i < time; i+=interval){
        setTimeout(function(){
            point += interval / time;
            if(ket == "in"){
                node.style.opacity = 0 + point;
            }else if(ket == "out"){
                node.style.opacity = 1 - point;
            }
            if(point > 1){
                if(ket == "in"){
                    node.style.display = "block";
                }else if(ket == "out"){
                    node.style.display = "none";
                }    
            }
            console.log(point);
        }, i);
    }
}


var socket = io();
var username;
    var login = document.getElementById("form_login");
    login.onsubmit = function(e){
        e.preventDefault();
        var inputName = document.getElementById("nama_user").value;
        socket.emit('newUser', inputName);
        socket.on('userAcc', function(data){
            fade("out", document.getElementById('login'));
            // document.getElementById('login').style.display = "none";
            fade("in", document.getElementById('chat'));
            // document.getElementById('chat').style.display = "block";
            username = data;
        })
        socket.on('userDec', function(){
            document.getElementById("warn").style.display = "block";
        })
        return false;
    }

    var chat = document.getElementById("form_chat");
    chat.onsubmit = function(e){
        e.preventDefault();
        var textBox = document.getElementById('text_box');
        socket.emit('newMessage', username + " : " + textBox.value);
        textBox.value = "";
        return false;
    }
    function prependChat(classLi, msg){
        var cont = document.getElementById("messages");
        var ori = cont.innerHTML;
        cont.innerHTML = 
        "<li class="+ classLi +">"+ msg +"</li>" + ori;
    }
    socket.on("showMessage", function(msg){
        var onDate = new Date();
        var time = onDate.getHours() + " : " + onDate.getMinutes() + " : " + onDate.getSeconds();
        prependChat("chat"  ,msg + " <span class='time'> | " + time + "</span>");
    })
            
    socket.on('notifUserConnect', function(data){
        prependChat("status", data.newUsr + " Ikutan gabung, Sekarang ada " + data.ttlUsr + " Orang");
    });
    socket.on('notifUserDisconnect', function(data){
        if(data.ttlUsr == 0){
            prependChat('status', data.lostUsr + " Keluar, Sekarang tidak ada Orang");   
        }else{
            prependChat('status', data.lostUsr + " Keluar, Sekarang tinggal " + data.ttlUsr + " Orang");
        }
    })
            
    var replace = function(rep){
        var ex = rep.join("</li><li>");
        ex = "<li>"+ex+"</li>";
        var ul1 = document.getElementById('ullist');
        var ul2 = document.createElement('ul');
        ul2.id = 'ullist';
        ul2.innerHTML = ex;
        ul1.parentNode.replaceChild(ul2,ul1);
    }
    socket.on('usersOl', function(asd){
        replace(asd);
    });

    var text = document.getElementById("text_box");
    text.onkeyup =  function(){
        if(this.value.length > 0){
            socket.emit("typing");
        }else{
            socket.emit("unTyping");
        }
    };
    text.onkeydown = function(){
        if(this.value.length > 0){
            socket.emit("typing");
        }else{
            socket.emit("unTyping");
        }
    }

    function removeElements(node){
        node.parentNode.removeChild(node);
    }

    socket.on("typeRes", function(usr){
        var typing = document.getElementsByClassName('typing')[0];
        if(typing != null) removeElements(typing);
                
        var tyUsrCount = usr.length;
        if(tyUsrCount == 1){
            prependChat("typing", usr[0] + " lagi nulis...");
        }else if(tyUsrCount > 1){
            prependChat("typing", tyUsrCount.toString() + " orang lagi nulis...");
        }
        // else{
        //     removeElements(typing);
        // }
    });

            
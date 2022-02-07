let socket = io();

window.setInterval(function() {
    let elem = document.getElementById('chat-history');
    elem.scrollTop = elem.scrollHeight;
}, 500);

document.getElementById("form-messages").addEventListener("submit", (e) => {
    e.preventDefault();
    const messageText = document.getElementById("input-messages").value;
    const acknowledgements = (errors) => {
        if (errors) {
            return alert("message is invalid");
        }
        console.log("message sent successfully");
    };
    socket.emit(
        "send message from client to server",
        messageText,
        acknowledgements
    );
});

socket.on("send message from server to client", (messageText) => {
    console.log("messageText : ", messageText);
    const {createAt, message, username} = messageText;
    const messageContent = document.getElementById('app-messages').innerHTML;
    let messageHtml = `
                        <li class="clearfix">
                            <div class="message-data">
                                <span class="message-data-time">${username}<span
                                        style="color: #a3a3a3" class="ml-2">${createAt}</span></span>
                            </div>
                            <div class="message my-message">${message}</div>
                        </li>
    `;
    let contentRender = messageContent + messageHtml;
    document.getElementById('app-messages').innerHTML = contentRender;

    // clear input
    document.getElementById('input-messages').value = '';
});

// share location
document.getElementById("btn-share-location").addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("The browser you are using does not support finding wallets");
    }
    navigator.geolocation.getCurrentPosition((position) => {
        console.log("position : ", position);
        const {latitude, longitude} = position.coords;
        socket.emit("share location from client to server", {
            latitude,
            longitude,
        });
    });
});

socket.on("share location from server to client", (data) => {
    const {createAt, message, username} = data;
    const messageContent = document.getElementById('app-messages').innerHTML;
    let messageHtml = `
            <li class="clearfix">
                <div class="message-data">
                    <span class="message-data-time">${username}<span style="color: #a3a3a3" class="ml-2">${createAt}</span></span>
                </div>
                <div class="message my-message">
                  <p class="mb-0">
                      <a href="${message}" target="_blank">
                         Location of ${username}             
                      </a>
                  </p>
                </div>
            </li>
    `;
    let contentRender = messageContent + messageHtml;
    document.getElementById('app-messages').innerHTML = contentRender;
});

// query string
const queryString = location.search;

const params = Qs.parse(queryString, {
    ignoreQueryPrefix: true,
});
console.log('params', params);

const {room, username} = params;

socket.emit("join room from client to server", {room, username});

document.getElementById('app-title').innerHTML = room;

// show users to UI
socket.on("send user list from server to client", (userList) => {
    console.log(userList);
    let contentHtml = '';
    userList.map(user => {
        contentHtml += `
                <li class="clearfix">
                    <div class="about">
                        <div class="name">${user.username}</div>
                   <!-- <div class="status"> <i class="fa fa-circle offline"></i> left 7 mins ago </div>-->
                    </div>
                </li>
        `
    })
    document.getElementById("app-list-user").innerHTML = contentHtml;
});

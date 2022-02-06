// yếu cầu server kết nối với client
var socket = io();

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
    const messageContent = document.getElementById('app__messages').innerHTML;
    let messageHtml = `
          <div class="message-item">
            <div class="message__row1">
              <p class="message__name">${username}</p>
              <p class="message__date">${createAt}</p>
            </div>
            <div class="message__row2">
              <p class="message__content">
                ${message}
              </p>
            </div>
          </div>
    `;
    let contentRender = messageContent + messageHtml;
    document.getElementById('app__messages').innerHTML = contentRender;
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
    // console.log("linkLocation : ", linkLocation);
    const messageContent = document.getElementById('app__messages').innerHTML;
    let messageHtml = `
          <div class="message-item">
            <div class="message__row1">
              <p class="message__name">${username}</p>
              <p class="message__date">${createAt}</p>
            </div>
            <div class="message__row2">
              <p class="message__content">
                  <a href="${message}" target="_blank">
                     Location of ${username}             
                  </a>
              </p>
            </div>
          </div>
    `;
    let contentRender = messageContent + messageHtml;
    document.getElementById('app__messages').innerHTML = contentRender;
});

// query string
const queryString = location.search;

const params = Qs.parse(queryString, {
    ignoreQueryPrefix: true,
});
console.log('params', params);

const {room, username} = params;

socket.emit("join room from client to server", {room, username});

document.getElementById('app__title').innerHTML = room;

// show user to UI
socket.on("send user list from server to client", (userList) => {
    console.log(userList);
    let contentHtml = '';
    userList.map(user => {
        contentHtml += `
        <li class="app__item-user">
            ${user.username}
        </li>
        `
    })
    document.getElementById("app__list-user--content").innerHTML = contentHtml;
});

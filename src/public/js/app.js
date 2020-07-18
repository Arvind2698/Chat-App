const socket = io();

const messageForm = document.querySelector("#form1");
const formInput = messageForm.querySelector("#message");
const formButton = messageForm.querySelector("#submit");
const locationButton = document.querySelector("#location");
const messageDisplay = document.querySelector("#message-display");
//const locationDisplay = document.querySelector("#location-display");
const sidebar = document.querySelector("#sidebar")

//TEMPLATES
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#user-location-template").innerHTML;
const sidebarTemplate = document.querySelector("#side-bar-template").innerHTML;

//OPTIONS
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const autoscroll = () => {
    const newMessage = messageDisplay.lastElementChild;

    const newMessageStyle = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = messageDisplay.offsetHeight;

    const containerHeight = messageDisplay.scrollHeight;

    const scrollOffset = messageDisplay.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messageDisplay.scrollTop = messageDisplay.scrollHeight;
    }

}


socket.on('welcome', (msg) => {
    console.log(msg);
});

socket.on('userslist', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    sidebar.innerHTML = html;
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

socket.on('display_msg', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.message,
        createdAt: moment(message.timestamp).format("ddd, h:mm A")
    });
    messageDisplay.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationLink', (data) => {
    const html = Mustache.render(locationTemplate, {
        username: data.username,
        location: data.message,
        createdAt: moment(message.timestamp).format("ddd, h:mm A")
    });
    messageDisplay.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    formButton.setAttribute('disabled', 'disabled');

    const input = formInput.value;

    socket.emit('incoming_msg', input, (error) => {
        if (error) {
            alert(error);
        }
    });
    formButton.removeAttribute('disabled');
    formInput.value = "";
    formInput.focus();

});

locationButton.addEventListener("click", () => {

    locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const lang = position.coords.longitude;
        const lat = position.coords.latitude;

        socket.emit('sendLocation', {
            lang,
            lat
        }, (error) => {
            locationButton.removeAttribute('disabled');
            if (error) {
                alert(error);
            }
        });
    });
});
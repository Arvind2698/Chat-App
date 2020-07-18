let users = [];

const addUser = ({ id, username, room }) => {

    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: "Username and Room are required"
        }
    }
    const isValidUser = users.find((user) => {
        return user.username === username && user.room === room;
    });

    if (isValidUser) {
        return {
            error: "Username already taken"
        }
    }

    const newUser = {
        id,
        username,
        room
    };

    users.push(newUser);

    return newUser;
}

const removeUser = ({ id }) => {

    const user = users.filter((user) => {
        return user.id === id;
    });

    if (user.length == 0) {
        return {
            error: "User not found"
        }
    }

    users = users.filter((user) => {
        return user.id !== id;
    });

    return user[0];
}

const getUser = ({ id }) => {
    const user = users.filter((user) => {
        return user.id === id;
    });

    if (user.length === 0) {
        return {
            error: "User not found"
        }
    }

    return user[0];
}

const getUserInRoom = ({ room }) => {
    const userInRoom = users.filter((user) => {
        return user.room === room;
    });

    return userInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
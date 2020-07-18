const sendMessage = (username, message) => {
    return {
        username,
        message: message,
        timestamp: new Date().getTime()
    }
}

module.exports = {
    sendMessage
}
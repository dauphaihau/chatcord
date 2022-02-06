const dateFormat = require('date-format');

const createMessages = (message, username) => {
    return {
        message,
        username,
        createAt: dateFormat("dd/MM/yyyy hh:mm:ss", new Date())
    }
};

module.exports = {
    createMessages
};


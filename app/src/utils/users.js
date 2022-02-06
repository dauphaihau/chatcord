let userList = [
    {
        id: 1,
        username: 'John',
        room: 'nodejs'
    },
    {
        id: 2,
        username: 'han',
        room: 'react'
    },
];

const getUserList = (room) => userList.filter(user => user.room === room)

const addUser = (newUser) => userList = [...userList, newUser];

const removeUser = (id) => userList = userList.filter(user => user.id !== id);

const findUser = (id) => userList.find(user => user.id === id);

module.exports = {
    getUserList,
    addUser,
    removeUser,
    findUser
};

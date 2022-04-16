const express = require('express')
const { PythonShell } = require('python-shell');
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
require('./db/mongoose')
const User = require('./model/user')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectorypath = path.join(__dirname, '../public')

app.use(express.static(publicDirectorypath))
//io.on io.to.emit, io.emit, socket.emit, socket.on, socket.join, socket.broadcast, socket.broadcast.to
io.on('connection', (socket) => {

    socket.on('join', async ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        const existingUser = await User.findOne({ username: user.username, room: user.room });
        if (!existingUser) {
            const user_db = new User({ sid: user.id, username: user.username, room: user.room })
            await user_db.save()
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', async (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        const user_db = await User.findOne({ username: user.username, room: user.room })
        user_db.texts = user_db.texts.concat({ text: message })
        await user_db.save()

        let options = {
            mode: 'text',
            pythonOptions: ['-u'],
            args: [user.username]
        };

        PythonShell.run('./predict.py', options, function (err, result) {
            if (err) throw err;
        });

        io.to(user.room).emit('message', generateMessage(user.username, message))

        const user_dep = await User.findOne({ username: user.username, room: user.room })
        if(user_dep.warning == true){
            io.to(user.room).emit('message', generateMessage("Mental health issues are real and your friends and family are here to help you. Please contact 1800-599-0019 helpline number"))
            user_dep.warning = false
            await user_dep.save()
        }
        callback()
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('LocationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log("Server running at port " + port)
})
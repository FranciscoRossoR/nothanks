const debugArea = require('../public/debugArea.js')
const io = require('socket.io')(8080, {
    cors: {
        origin: ["http://localhost:3000"],
    },
});

io.on('connection', (socket) => {
    console.log(socket.id)

    socket.on('addPlayer', (newState) => {
        io.emit('updateState', newState)
    })

    socket.on('callUpdateState', (newState) => {
        io.emit('updateState', newState)
    })
})
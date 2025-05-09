const debugArea = require('../public/debugArea.js')
const io = require('socket.io')(8080, {
    maxHttpBufferSize: 1e8,
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

    socket.on('callUpdatePlayers', (newPlayers) => {
        io.emit('updatePlayers', newPlayers)
    })

    socket.on('callUpdateWhoIsTurn', (newWhoIsTurn) => {
        io.emit('updateWhoIsTurn', newWhoIsTurn)
    })

    socket.on('callUpdateGameStateStatus', (newGameStateStatus) => {
        io.emit('updateGameStateStatus', newGameStateStatus)
    })

    socket.on('callUpdateDeck', (newDeck) => {
        io.emit('updateDeck', newDeck)
    })

    socket.on('callUpdatePool', (newPool) => {
        io.emit('updatePool', newPool)
    })

    socket.on('callUpdateHistory', (newHistory) => {
        io.emit('updateHistory', newHistory)
    })
})
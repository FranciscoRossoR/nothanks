const io = require('socket.io')(8080, {
    cors: {
        origin: ['http://localhost:3000'],
    },
});

io.on('connection', (socket) => {

    console.log(socket.id);

    socket.on('callUpdatePlayers', (newPlayers) => {
        io.emit('updatePlayers', newPlayers);
    })

    socket.on('callUpdateStatus', (newStatus) => {
        io.emit('updateStatus', newStatus);
    })

})
const io = require('socket.io')(8080, {
    cors: {
        origin: ['http://localhost:3000'],
    },
});

const updateTypes = new Map();

io.on('connection', (socket) => {

    console.log(socket.id);

    socket.on('loadUpdateTypes', (types) => {
        for (const [key, value] of Object.entries(types)) {
            updateTypes.set(key, value);
        }
    });

    socket.on('callUpdate', (key, update) => {
        io.emit(updateTypes.get(key), update);
    });

});
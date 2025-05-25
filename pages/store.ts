import { io } from 'socket.io-client';
import NoThanksState from 'src/entities/nothanks/gameState';
import NoThanksPlayer from 'src/entities/nothanks/player';

const socket = io('http://localhost:8080');
socket.on('connect', () => {
    console.log(`You connected with id: ${socket.id}`);
});

const players = [new NoThanksPlayer("Player 1"),
                 new NoThanksPlayer("Player 2"),
                 new NoThanksPlayer("Player 3"),];
const gameState = new NoThanksState(players,[]);

export default gameState;
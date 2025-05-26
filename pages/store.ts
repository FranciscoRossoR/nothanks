import { io } from 'socket.io-client';
import CardHolder from 'src/entities/framework/cardholder';
import { GameStatus } from 'src/entities/framework/gameState';
import OrderedCardHolder from 'src/entities/framework/orderedcardholder';
import Player from 'src/entities/framework/player';
import ResourcesPool from 'src/entities/framework/resourcesPool';
import { Resources } from 'src/entities/nothanks/common';
import NoThanksState from 'src/entities/nothanks/gameState';
import { NoThanksCard } from 'src/entities/nothanks/nothankscard';
import NoThanksPlayer from 'src/entities/nothanks/player';

const socket = io('http://localhost:8080');
socket.on('connect', () => {
    console.log(`You connected with id: ${socket.id}`);
});

var gameState = new NoThanksState();

export default gameState;

export function callUpdatePlayers(emittedPlayers: Player[]) {
    socket.emit('callUpdatePlayers', emittedPlayers);
}

export function callUpdateStatus(
        emittedStatus: GameStatus
        , emittedPlayers: Player[]
    ) {
    socket.emit('callUpdateStatus', emittedStatus);
    socket.emit('callUpdatePlayers', emittedPlayers);
}

export function callUpdateDeck(emittedDeck: CardHolder<NoThanksCard>) {
    socket.emit('callUpdateDeck', emittedDeck);
}

export function callUpdateTurn(
        emittedTurn: number
        , emittedPlayers: Player[]
        , emittedDeck: CardHolder<NoThanksCard>
    ) {
    socket.emit('callUpdateTurn', emittedTurn);
    socket.emit('callUpdatePlayers', emittedPlayers);
    socket.emit('callUpdateDeck', emittedDeck);
}

export function callUpdatePool(
        emittedPool: ResourcesPool<Resources>
        , emittedPlayers: Player[]
        , emittedDeck: CardHolder<NoThanksCard>
    ) {
    socket.emit('callUpdatePool', emittedPool);
    socket.emit('callUpdatePlayers', emittedPlayers);
    socket.emit('callUpdateDeck', emittedDeck);
}


socket.on('updatePlayers', newPlayers => {

    const players = newPlayers.map((playerData: any) => {

        // Create player and set name
        const player = new NoThanksPlayer(playerData.name);
        // Set color
        player.setColor(playerData.color);
        // Set pool
        const pool = new ResourcesPool<Resources>();
        for (const [key, value] of playerData._pool._pool) {
            pool.addResources(key, value);
        }
        player.setPool(pool);
        // Set cards
        const cards = new OrderedCardHolder<NoThanksCard>([], (a, b) =>
            (b.value - a.value));
        for (const card of playerData._cards.cards) {
            const newCard = new NoThanksCard(Math.abs(card.value), card._uid);
            cards.addCard(newCard);
        }
        player.setCards(cards);

        return player;
        
    });

    gameState.setPlayers(players);
    
})

socket.on('updateStatus', newStatus => {
    gameState.setStatus(newStatus);
})

socket.on('updateDeck', newDeck => {
    const deck = new CardHolder<NoThanksCard>();
    for (const card of newDeck.cards) {
        const newCard = new NoThanksCard(Math.abs(card.value), card._uid);
        deck.addCard(newCard);
    }
    gameState.setDeck(deck);
})

socket.on('updateTurn', newTurn => {
    gameState.setWhoisturn(newTurn);
})

socket.on('updatePool', newPool => {
    const pool = new ResourcesPool<Resources>();
    for (const [key, value] of newPool._pool) {
        pool.addResources(key, value);
    }
    gameState.setPool(pool);
})
import { io } from 'socket.io-client';
import CardHolder from 'framework/entities/cardholder';
import { GameStatus } from 'framework/entities/gameState';
import OrderedCardHolder from 'framework/entities/orderedcardholder';
import Player from 'framework/entities/player';
import ResourcesPool from 'framework/entities/resourcesPool';
import { Resources } from 'src/entities/nothanks/common';
import NoThanksState from 'src/entities/nothanks/gameState';
import { NoThanksCard } from 'src/entities/nothanks/nothankscard';
import NoThanksPlayer from 'src/entities/nothanks/player';

const socket = io('http://localhost:8080');
socket.on('connect', () => {
    // Report connection
    console.log(`You connected with id: ${socket.id}`);
    // Load to the server the update types that will be called
    const updateTypes = new Map();
    updateTypes.set('callUpdatePlayers', 'updatePlayers');
    updateTypes.set('callUpdateStatus', 'updateStatus');
    updateTypes.set('callUpdateDeck', 'updateDeck');
    updateTypes.set('callUpdateTurn', 'updateTurn');
    updateTypes.set('callUpdatePool', 'updatePool');
    socket.emit('loadUpdateTypes', Object.fromEntries(updateTypes));
});

var gameState = new NoThanksState();

export default gameState;

function callUpdate(name: String, update: any) {
    socket.emit('callUpdate', name, update);
}

export function callUpdatePlayers(emittedPlayers: Player[]) {
    callUpdate('callUpdatePlayers', emittedPlayers);
}

export function callUpdateStatus(
        emittedStatus: GameStatus
        , emittedPlayers: Player[]
    ) {
    callUpdate('callUpdateStatus', emittedStatus);
    callUpdate('callUpdatePlayers', emittedPlayers);
}

export function callUpdateDeck(emittedDeck: CardHolder<NoThanksCard>) {
    callUpdate('callUpdateDeck', emittedDeck);
}

export function callUpdateTurn(
        emittedTurn: number
        , emittedPlayers: Player[]
        , emittedDeck: CardHolder<NoThanksCard>
    ) {
    callUpdate('callUpdateTurn', emittedTurn);
    callUpdate('callUpdatePlayers', emittedPlayers);
    callUpdate('callUpdateDeck', emittedDeck);
}

export function callUpdatePool(
        emittedPool: ResourcesPool<Resources>
        , emittedPlayers: Player[]
        , emittedDeck: CardHolder<NoThanksCard>
    ) {
    callUpdate('callUpdatePool', emittedPool);
    callUpdate('callUpdatePlayers', emittedPlayers);
    callUpdate('callUpdateDeck', emittedDeck);
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
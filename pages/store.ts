import { on } from 'events';
import { io } from 'socket.io-client';
import CardHolder from 'src/entities/framework/cardholder';
import GameAction from 'src/entities/framework/gameAction';
import GameHistory from 'src/entities/framework/gameHistory';
import { GameStatus } from 'src/entities/framework/gameState';
import OrderedCardHolder from 'src/entities/framework/orderedcardholder';
import Player from 'src/entities/framework/player';
import ResourcesPool from 'src/entities/framework/resourcesPool';
import { Resources } from 'src/entities/nothanks/common';
import NoThanksState from 'src/entities/nothanks/gameState';
import { NoThanksCard } from 'src/entities/nothanks/nothankscard';
import NoThanksPlayer from 'src/entities/nothanks/player';
const debugArea = require('public/debugArea.js');

const socket = io('http://localhost:8080');
socket.on('connect', () => {
    console.log(`You connected with id: ${socket.id}`);
});

var gameState = new NoThanksState();

export default gameState;

export function callUpdateState(emittedState: NoThanksState) {
    socket.emit('callUpdateState', emittedState);
}

export function callUpdatePlayers(emmitedPlayers: Player[]) {
    socket.emit('callUpdatePlayers', emmitedPlayers);
}

export function callUpdateWhoIsTurn(emmitedWhoIsTurn: number,
        emmitedPlayers: Player[],
        emmitedDeck: CardHolder<NoThanksCard>) {
    socket.emit('callUpdateWhoIsTurn', emmitedWhoIsTurn);
    socket.emit('callUpdatePlayers', emmitedPlayers);
    socket.emit('callUpdateDeck', emmitedDeck);
}

export function callUpdateGameStateStatus(emmitedStatus: GameStatus, emmitedPlayers: Player[]) {
    socket.emit('callUpdateGameStateStatus', emmitedStatus);
    socket.emit('callUpdatePlayers', emmitedPlayers);
}

export function callUpdateDeck(emmitedDeck: CardHolder<NoThanksCard>) {
    socket.emit('callUpdateDeck', emmitedDeck);
}

export function callUpdatePool(emmitedPool: ResourcesPool<Resources>) {
    socket.emit('callUpdatePool', emmitedPool);
}

export function callUpdateHistory(emmitedHistory: GameHistory) {
    socket.emit('callUpdateHistory', emmitedHistory);
}

export function callAddPlayer(emittedState: NoThanksState) {

    // Testing
    // emittedState.addPlayer("Player " + (emittedState.players.length + 1));
    //

    socket.emit('addPlayer', emittedState);

    // debugArea("EMITTED GAMESTATE TYPE", emittedState.constructor.name);
    // debugArea("EMITTED GAMESTATE", emittedState);
    // debugArea("EMITTED GAMESTATE PLAYERS", emittedState.players);
    // debugArea("EMITTED GAMESTATE DECK", emittedState.deck);
    // debugArea("EMITTED GAMESTATE DECK CARDS", emittedState.deck.cards);
    // debugArea("EMITTED GAMESTATE HISTORY", emittedState.history);
    // debugArea("EMITTED GAMESTATE HISTORY ACTIONS", emittedState.history._actionsHistory);
    // debugArea("EMITTED GAMESTATE HISTORY LOG", emittedState.history.log);
    // debugArea("EMITTED GAMESTATE POOL", emittedState.pool);
    // debugArea("EMITTED GAMESTATE POOL RESOURCE KINDS", emittedState.pool.resourceKinds);

    // debugArea("EMITTED GAMESTATE PLAYER DATA", emittedState.players[0]);
    // debugArea("EMITTED GAMESTATE PLAYER NAME", emittedState.players[0].name);
    // debugArea("EMITTED GAMESTATE PLAYER COLOR", emittedState.players[0].color);
    // debugArea("EMITTED GAMESTATE PLAYER POOL", emittedState.players[0]._pool);
    // debugArea("EMITTED GAMESTATE PLAYER POOL RESOURCE KINDS", emittedState.players[0]._pool.resourceKinds);
    // debugArea("EMITTED GAMESTATE PLAYER CARDS", emittedState.players[0]._cards);
    // debugArea("EMITTED GAMESTATE PLAYER CARDS CARDS", emittedState.players[0]._cards.cards);
    // debugArea("EMITTED GAMESTATE PLAYER CARDS CARDS CARD", emittedState.players[0]._cards.cards[0]);
}

socket.on('updateState', newState => {

    // debugArea("NEW GAMESTATE TYPE", newState.constructor.name);
    // debugArea("NEW GAMESTATE", newState);
    // debugArea("NEW GAMESTATE PLAYERS", newState._players);
    // debugArea("NEW GAMESTATE DECK", newState.deck);
    // debugArea("NEW GAMESTATE DECK CARDS", newState.deck.cards);
    // debugArea("NEW GAMESTATE HISTORY", newState.history);
    // debugArea("NEW GAMESTATE HISTORY ACTIONS", newState.history._actionsHistory);
    // debugArea("NEW GAMESTATE HISTORY LOG", newState.history.log);
    // debugArea("NEW GAMESTATE POOL", newState.pool);
    // debugArea("NEW GAMESTATE POOL RESOURCE KINDS", newState.pool.resourceKinds);

    const updatedState = new NoThanksState();
    // Set players
    const players = newState.players.map((playerData: any) => {

        // debugArea("NEW GAMESTATE PLAYER DATA",playerData);
        // debugArea("NEW GAMESTATE PLAYER NAME", playerData.name);
        // debugArea("NEW GAMESTATE PLAYER COLOR", playerData.color);
        // debugArea("NEW GAMESTATE PLAYER POOL", playerData._pool);
        // debugArea("NEW GAMESTATE PLAYER POOL RESOURCE KINDS", playerData._pool.resourceKinds);
        // debugArea("NEW GAMESTATE PLAYER CARDS", playerData._cards);
        // debugArea("NEW GAMESTATE PLAYER CARDS CARDS", playerData._cards.cards);

        // Create player and set name
        const player = new NoThanksPlayer(playerData.name);
        // Set color
        player.setColor(playerData.color);
        // Set pool
        const pool = new ResourcesPool<Resources>();
        for (const [key, value] of playerData._pool._pool) {
            // debugArea("PLAYER DATA POOL POOL KEY", key);
            // debugArea("PLAYER DATA POOL POOL VALUE", value);
            pool.addResources(key, value);
        }
        player.setPool(pool);
        // Set cards
        const cards = new OrderedCardHolder<NoThanksCard>([], (a,b) => (b.value - a.value));
        for (const card of playerData._cards.cards){
            const newCard = new NoThanksCard(Math.abs(card.value), card._uid);
            cards.addCard(newCard);
        }
        player.setCards(cards);
        return player;
    });
    updatedState.setPlayers(players);
    // Set status
    updatedState.setStatus(newState.status);
    // Set deck
    const deck = new CardHolder<NoThanksCard>();
    for (const card of newState.deck.cards){
        // debugArea("NEW GAMESTATE DECK SINGLE CARD", card);
        const newCard = new NoThanksCard(Math.abs(card.value), card._uid);
        deck.addCard(newCard);
    }
    updatedState.setDeck(deck);
    // Set history (?)
    const history = new GameHistory();
    for (const [key, value] of Object.entries(newState.history)){
        history.addAction(value as GameAction);
    }
    updatedState.setHistory(history);
    //  Set removedCards
    const removedCards = new CardHolder<NoThanksCard>();
    for (const card of newState.removedCards.cards){
        const newCard = new NoThanksCard(Math.abs(card.value), card._uid);
        removedCards.addCard(newCard);
    }
    updatedState.setRemovedCards(removedCards);
    // Set whoisturn
    updatedState.setWhoisturn(newState.whoisturn);
    // Set pool
    const pool = new ResourcesPool<Resources>();
    // debugArea("POOL", newState.pool);
    // debugArea("POOL._POOL", newState.pool._pool);
    // debugArea("POOL._POOL[0]", newState.pool._pool[0]);
    for (const [key, value] of newState.pool._pool){
        // debugArea("POOL KEY", key);
        // debugArea("POOL VALUE", value);
        pool.addResources(key, value);
    }
    updatedState.setPool(pool);

    // Testing
    // gameState.addPlayer("Player " + (gameState.players.length + 1));
    //

    // debugArea("UPDATING GAMESTATE", updatedState);

    // gameState = updatedState;
    // Object.assign(gameState, updatedState);
    gameState.updateState(updatedState);

    // debugArea("CHECKING EQUALS", JSON.stringify(gameState) === JSON.stringify(updatedState));

    // Testing
    // gameState.addPlayer("Player " + (gameState.players.length + 1));
    //

    // Testing | Comprobando si este gameState llega a export
    // gameState.addPlayer("Player " + (gameState.players.length + 1));

    // debugArea("UPDATED GAMESTATE TYPE", gameState.constructor.name);
    // debugArea("UPDATED GAMESTATE", gameState);
    // debugArea("UPDATED GAMESTATE PLAYERS", gameState.players);
    // debugArea("UPDATED GAMESTATE DECK", gameState.deck);
    // debugArea("UPDATED GAMESTATE DECK CARDS", gameState.deck.cards);
    // debugArea("UPDATED GAMESTATE HISTORY", gameState.history);
    // debugArea("UPDATED GAMESTATE HISTORY ACTIONS", gameState.history._actionsHistory);
    // debugArea("UPDATED GAMESTATE HISTORY LOG", gameState.history.log);
    // debugArea("UPDATED GAMESTATE POOL", gameState.pool);
    // debugArea("UPDATED GAMESTATE POOL RESOURCE KINDS", gameState.pool.resourceKinds);

    // debugArea("UPDATED GAMESTATE PLAYER DATA", gameState.players[0]);
    // debugArea("UPDATED GAMESTATE PLAYER NAME", gameState.players[0].name);
    // debugArea("UPDATED GAMESTATE PLAYER COLOR", gameState.players[0].color);
    // debugArea("UPDATED GAMESTATE PLAYER POOL", gameState.players[0]._pool);
    // debugArea("UPDATED GAMESTATE PLAYER POOL RESOURCE KINDS", gameState.players[0]._pool.resourceKinds);
    // debugArea("UPDATED GAMESTATE PLAYER CARDS", gameState.players[0]._cards);
    // debugArea("UPDATED GAMESTATE PLAYER CARDS CARDS", gameState.players[0]._cards.cards);

    // const sampleState = new NoThanksState();
    // sampleState.addPlayer("Player " + (sampleState.players.length + 1));

    // debugArea("SAMPLE GAMESTATE TYPE", sampleState.constructor.name);
    // debugArea("SAMPLE GAMESTATE", sampleState);
    // debugArea("SAMPLE GAMESTATE PLAYERS", sampleState.players);
    // debugArea("SAMPLE GAMESTATE DECK", sampleState.deck);
    // debugArea("SAMPLE GAMESTATE DECK CARDS", sampleState.deck.cards);
    // debugArea("SAMPLE GAMESTATE HISTORY", sampleState.history);
    // debugArea("SAMPLE GAMESTATE HISTORY ACTIONS", sampleState.history._actionsHistory);
    // debugArea("SAMPLE GAMESTATE HISTORY LOG", sampleState.history.log);
    // debugArea("SAMPLE GAMESTATE POOL", sampleState.pool);
    // debugArea("SAMPLE GAMESTATE POOL RESOURCE KINDS", sampleState.pool.resourceKinds);

    // debugArea("SAMPLE GAMESTATE PLAYER DATA", sampleState.players[0]);
    // debugArea("SAMPLE GAMESTATE PLAYER NAME", sampleState.players[0].name);
    // debugArea("SAMPLE GAMESTATE PLAYER COLOR", sampleState.players[0].color);
    // debugArea("SAMPLE GAMESTATE PLAYER POOL", sampleState.players[0]._pool);
    // debugArea("SAMPLE GAMESTATE PLAYER POOL RESOURCE KINDS", sampleState.players[0]._pool.resourceKinds);
    // debugArea("SAMPLE GAMESTATE PLAYER CARDS", sampleState.players[0]._cards);
    // debugArea("SAMPLE GAMESTATE PLAYER CARDS CARDS", sampleState.players[0]._cards.cards);
})

socket.on('updatePlayers', newPlayers => {

    debugArea("NEW PLAYERS", newPlayers);

    const players = newPlayers.map((playerData: any) => {

        // Create player and set name
        const player = new NoThanksPlayer(playerData.name);
        // Set color
        player.setColor(playerData.color);
        // Set pool
        const pool = new ResourcesPool<Resources>();
        for (const [key, value] of playerData._pool._pool) {
            debugArea("PLAYER DATA POOL POOL KEY", key);
            debugArea("PLAYER DATA POOL POOL VALUE", value);
            pool.addResources(key, value);
        }
        player.setPool(pool);
        // Set cards
        const cards = new OrderedCardHolder<NoThanksCard>([], (a,b) => (b.value - a.value));
        for (const card of playerData._cards.cards){
            const newCard = new NoThanksCard(Math.abs(card.value), card._uid);
            cards.addCard(newCard);
        }
        player.setCards(cards);
        return player;
    });

    gameState.setPlayers(players);

})

socket.on('updateWhoIsTurn', newWhoIsTurn => {
    debugArea("NEW WHOISTURN", newWhoIsTurn);
    gameState.setWhoisturn(newWhoIsTurn);
})

socket.on('updateGameStateStatus', newGameStateStatus => {
    gameState.setStatus(newGameStateStatus);
})

socket.on('updateDeck', newDeck => {
    debugArea("NEW DECK", newDeck);
    const deck = new CardHolder<NoThanksCard>();
    for (const card of newDeck.cards){
        const newCard = new NoThanksCard(Math.abs(card.value) , card._uid);
        deck.addCard(newCard);
    }
    gameState.setDeck(deck);
})

socket.on('updatePool', newPool => {
    const pool = new ResourcesPool<Resources>();
    for (const [key, value] of newPool._pool){
        pool.addResources(key, value);
    }
    gameState.setPool(pool);
})

socket.on('updateHistory', newHistory => {
    const history = new GameHistory();
    for (const [key, value] of Object.entries(newHistory)){
        history.addAction(value as GameAction);
    }
})




///
// ORIGINAL EN RESERVA PA PRUEBAS
// import NoThanksState from 'src/entities/nothanks/gameState'
// import NoThanksPlayer from 'src/entities/nothanks/player'
// const players = [new NoThanksPlayer("Player 1"),
//                  new NoThanksPlayer("Player 2"),
//                  new NoThanksPlayer("Player 3"),];
// const gameState = new NoThanksState(players,[]);
// export default gameState;
///
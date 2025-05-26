import { makeObservable, observable, computed, action, override } from "mobx";
import CardHolder from "../framework/cardholder";
import GameAction from "../framework/gameAction";
import UniqueGameElement from "../framework/gameElement";
import GameState, { GameStatus } from "../framework/gameState"
import ResourcesPool from "../framework/resourcesPool";
import ComplexityAnalyst from "../framework/complexityAnalyst";

import { GetCardAction, PassAction } from "./actions";
import { NoThanksCard } from "./nothankscard";
import { Resources, chipType } from "./common";
import NoThanksPlayer from "./player";

export default class NoThanksState extends GameState {
    deck: CardHolder<NoThanksCard>;
    removedCards: CardHolder<NoThanksCard>;
    whoisturn: number;
    pool: ResourcesPool<Resources>;

    public constructor(players?: NoThanksPlayer[], gameElements?: UniqueGameElement[], status?: GameStatus, complexityAnalyst?: ComplexityAnalyst) {
        gameElements = [];
        super(3, 5, players ? players : [] , gameElements, status, complexityAnalyst);
        this.deck = new CardHolder<NoThanksCard>();
        this.removedCards = new CardHolder<NoThanksCard>();
        for (let i = 3; i <= 35; i++) {
            this.deck.addCard(new NoThanksCard(i));
        }
        this.deck.shuffle();
        for (let i = 0; i < 10; i++) {
            this.deck.pop(this.removedCards);
        }
        this.whoisturn = 0;
        this.pool = new ResourcesPool();
        this.pool.addResources(chipType, 0);
        makeObservable(this, {
            availableActions: override,
            status: override,
            gameElements: override,
            history: override,
            deck: observable,
            removedCards: observable,
            whoisturn: observable,
            pool: observable,
            playerHasEnoughChips: computed,
            currentCard: computed,
            passTurn: action,
            revokeTurn: action,
            playerGetsCurrentCard: action,
            addPlayer: action,
            currentPlayer: computed,
            currentWinners: computed,
            addChipToPool: action,
            removeChipFromPool: action,
            setPlayers: action,
            setStatus: action,
            setDeck: action,
            setWhoisturn: action,
            setPool: action,
        });
    }

    protected computeAvailableActions(): GameAction[] {
        const res: GameAction[] = [];
        if (this.status === "playing") {
            if (this.playerHasEnoughChips) {
                res.push(new PassAction());
            }

            // get card action needs the previous chips amount to enable the undo
            const chipsAmount = this.pool.getResources(chipType) || 0;
            const card = this.deck.head;
            res.push(new GetCardAction(card, chipsAmount));
        }
        return res;
    }

    public getPlayer(index: number): NoThanksPlayer {
        return <NoThanksPlayer> this.players[index];
    }

    public get playerHasEnoughChips(): boolean {
        const chips = (<NoThanksPlayer>(this.getPlayer(this.whoisturn)))._pool.getResources(chipType) || 0;
        return (chips > 0);
    }

    public addChipToPool() {
        this.pool.addResources(chipType);
    }

    public removeChipFromPool() {
        this.pool.removeResources(chipType);
    }

    public passTurn(): NoThanksState {
        this.whoisturn++;
        if (this.whoisturn >= this.players.length) {
            this.whoisturn = 0;
        }

        return this;
    }

    public revokeTurn(): NoThanksState {
        this.whoisturn--;
        if (this.whoisturn < 0) {
            this.whoisturn = this.players.length - 1;
        }
        return this;
    }

    public get currentCard(): NoThanksCard {
        return this.deck.head;
    }

    public playerGetsCurrentCard(): NoThanksState {
        this.deck.pop(this.getPlayer(this.whoisturn)._cards);
        const chips = this.pool.removeAllFromResource(chipType);
        this.getPlayer(this.whoisturn)._pool.addResources(chipType, chips);
        if (!this.deck.hasCards) {
            this.status = "finished";
        }
        return this;
    }

    public undoPlayerGetsCurrentCard(card: NoThanksCard, chipsAmount: number): NoThanksState {
        this.getPlayer(this.whoisturn)._cards.removeCard(card);
        this.deck.addCard(card);
        this.pool.addResources(chipType, chipsAmount);
        this.getPlayer(this.whoisturn)._pool.removeResources(chipType, chipsAmount);
        return this;
    }

    public addPlayer(name: string) {
        if (this.status == "open") {
            this.players.push(new NoThanksPlayer(name));
        }
    }

    public get currentPlayer(): NoThanksPlayer {
        return this.getPlayer(this.whoisturn);
    }

    // return the player with the highest score
    public get currentWinners(): NoThanksPlayer[] {
        let winners = [this.getPlayer(0)];
        let score = this.getPlayer(0).score;
        for (let i = 1; i < this.players.length; i++) {
            if (this.getPlayer(i).score > score) {
                winners = [this.getPlayer(i)];
            } else if (this.getPlayer(i).score == score) {
                winners.push(this.getPlayer(i));
            }
        }
        return winners;
    }

    // Setters

    public setPlayers(players: NoThanksPlayer[]) {
        this.players = players;
    }

    public setStatus(status: GameStatus) {
        this.status = status;
    }

    public setDeck(deck: CardHolder<NoThanksCard>) {
        this.deck = deck;
    }

    public setWhoisturn(whoisturn: number) {
        this.whoisturn = whoisturn;
    }

    public setPool(pool: ResourcesPool<Resources>) {
        this.pool = pool;
    }

}
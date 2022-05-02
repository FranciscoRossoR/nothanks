import { makeObservable, observable, computed, action, override } from "mobx";
import CardHolder from "../framework/cardholder";
import { ComplexityAnalyst, GameAction } from "../framework/decision";
import UniqueGameElement from "../framework/gameElement";
import GameState, { GameStatus } from "../framework/gameState"
import ResourcesPool from "../framework/resourcesPool";
import { GetCardAction, PassAction } from "./actions";
import { NoThanksCard } from "./nothankscard";
import { Resources, chipType } from "./common";
import NoThanksPlayer from "./player";

export default class NoThanksState extends GameState {
    deck: CardHolder<NoThanksCard>;
    removedCards: CardHolder<NoThanksCard>;
    whoisturn: number;
    players: NoThanksPlayer[];
    pool: ResourcesPool<Resources>;

    public constructor(players: NoThanksPlayer[], gameElements: UniqueGameElement[], status?: GameStatus, complexityAnalyst?: ComplexityAnalyst) {
        super(players, gameElements, status, complexityAnalyst);
        this.players = players;
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
        makeObservable (this, {
            players: override,
            availableActions: override,
            status: override,
            gameElements: override,
            deck: observable,
            removedCards: observable,
            whoisturn: observable,
            pool: observable,
            playerHasEnoughChips: computed,
            currentCard: computed,
            payChip: action,
            passTurn: action,
            revokeTurn: action,
            playerGetsCurrentCard: action,
            addPlayer: action,
            currentPlayer: computed,
        });
    }

    protected computeAvailableActions(): GameAction[] {
        const res : GameAction[] = [];
        if (this.playerHasEnoughChips) {
            res.push(new PassAction());
        }
        const chipsAmount = this.pool.getResources(chipType) || 0;
        res.push(new GetCardAction(chipsAmount));
        return res;
    }

    public get playerHasEnoughChips(): boolean {
        const chips = this.players[this.whoisturn]._pool.getResources(chipType);
        return (chips !== null && chips > 0);
    }

    public payChip(): NoThanksState {
        if (this.playerHasEnoughChips) {
            this.players[this.whoisturn]._pool.removeResources(chipType);
            this.pool.addResources(chipType);
        }
        return this;
    }

    public unpayChip(): NoThanksState {
        const paidChips = this.pool.getResources(chipType);
        if ( paidChips && paidChips > 0) {
            this.pool.removeResources(chipType);
            this.players[this.whoisturn]._pool.addResources(chipType);
        }
        return this;
    }

    public passTurn(): NoThanksState {
        if (this.playerHasEnoughChips) {
            this.whoisturn++;
            if (this.whoisturn >= this.players.length) {
                this.whoisturn = 0;
            }
        }
        return this;
    }

    public revokeTurn(): NoThanksState {
        this.whoisturn--;
        if (this.whoisturn <= 0) {
            this.whoisturn = this.players.length - 1;
        }
        return this;
    }

    public get currentCard(): NoThanksCard {
        return this.deck.head();
    }

    public playerGetsCurrentCard(): NoThanksState {
        this.deck.pop(this.players[this.whoisturn]._cards);
        const chips = this.pool.removeAllFromResource(chipType);
        this.players[this.whoisturn]._pool.addResources(chipType, chips);
        return this;
    }

    public undoPlayerGetsCurrentCard(chipsAmount: number): NoThanksState {
        this.players[this.whoisturn]._cards.pop(this.deck);
        this.pool.addResources(chipType, chipsAmount);
        this.players[this.whoisturn]._pool.removeResources(chipType, chipsAmount);
        return this;
    }

    public addPlayer(name: string) {
        this.players.push(new NoThanksPlayer(name));
    }

    public get currentPlayer() : NoThanksPlayer {
        return this.players[this.whoisturn];
    }
}
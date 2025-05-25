import Card from "../framework/card"

export class NoThanksCard extends Card {
    readonly value: number;
    public constructor (value: number, uid?: string) {
        super (value.toString(), uid);
        this.value = -value;
    }

    public toString() : string {
        return (-this.value).toString();
    }
}
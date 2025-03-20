import Card from "../framework/card"

export class NoThanksCard extends Card {
    readonly value: number;
    public constructor (value: number, uid?: string) { /// Añadido uid
        super (value.toString(), uid);  /// Añadido uid
        this.value = -value;
    }

    public toString() : string {
        return (-this.value).toString();
    }
}
export class SimpleController {
    constructor(target_temp) {
        this.target_temp = target_temp;
        this.currently_on = true;
    }

    update({ temperature }) {
        if (this.currently_on && temperature > this.target_temp + 0.1) {
            this.currently_on = false;
        } else if (!this.currently_on && temperature < this.target_temp - 0.1) {
            this.currently_on = true;
        }

        return this.currently_on ? 1.0 : 0.0;
    }
}

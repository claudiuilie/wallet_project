
class OutcomeChart {

    constructor(month) {

        this.data = [];
        this.labels = [];

        for (let k in month) {
            if (k.match(/outcome_/gm) && k !== 'outcome_extra') {
                this.labels.push(k.replace("outcome_",""));
                this.data.push(month[k]);
            }
        }

        for (let y in month.outcome_extra) {
            this.labels.push(y);
            this.data.push(parseInt(month.outcome_extra[y]));
        }
    }
}

module.exports = OutcomeChart;
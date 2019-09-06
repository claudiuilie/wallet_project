
class OutcomeChart {

    constructor(month) {
        this.arr = [];
        this.data = [];
        this.labels = [];

        for (let k in month) {

            if (k.match(/outcome_/gm) && k !== 'outcome_extra') {
                this.arr.push([k.replace("outcome_","").replace(/^\w/, c => c.toUpperCase()), month[k]]);
            }
        }

        for (let y in month.outcome_extra) {
            this.arr.push([y , parseInt(month.outcome_extra[y])]);
        }

        this.arr.sort((a, b) => {return a[1] - b[1]} );
        this.arr.forEach((arr) => {
                this.data.push(arr[1]);
                this.labels.push(arr[0]);
        });
    }
}

module.exports = OutcomeChart;


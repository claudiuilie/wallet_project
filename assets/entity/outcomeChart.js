
class OutcomeChart {

    constructor(month) {
        this.arr = [];
        this.data = [];
        this.labels = [];

        for (let y in month.outcome_data) {
            this.arr.push([y , parseInt(month.outcome_data[y])]);
        }

        this.arr.sort((a, b) => {return a[1] - b[1]} );
        this.arr.forEach((arr) => {
                this.data.push(arr[1]);
                this.labels.push(arr[0]);
        });
    }
}

module.exports = OutcomeChart;



class ProgressChart {

    constructor(year) {

        this.data = [];
        this.labels = [];

        year.forEach((arr) => {
            this.data.push(arr.total_income);
            this.labels.push(arr.month_name)
        })

    }
}

module.exports = ProgressChart;
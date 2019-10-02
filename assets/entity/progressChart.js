
class ProgressChart {

    constructor(year) {

        this.data = [];
        this.labels = [];

        year.forEach((arr) => {
            this.data.push(arr.total_income);
            this.labels.push(arr.month_name);
        })
    }

    shortMonths() {
        let allMonths = ["december", "november", "october", "september", "august", "july", "june", "may", "april", "march", "february", "january"];
        this.labels.sort(function(a,b){
            return allMonths.indexOf(a) - allMonths.indexOf(b);
        });
    }
}

module.exports = ProgressChart;
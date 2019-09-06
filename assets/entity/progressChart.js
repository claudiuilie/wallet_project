
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
        let allMonths = ["December", "November", "October", "September", "August", "July", "June", "May", "April", "March", "February", "January"];
        this.labels.sort(function(a,b){
            return allMonths.indexOf(a) - allMonths.indexOf(b);
        });
    }
}

module.exports = ProgressChart;

class PieChart {

    constructor(month) {

        this.data = [month.income,month.total_outcome,month.savings];
        this.labels = [`Income: ${month.income} `,`Outcome: ${month.total_outcome}`,`Savings: ${month.savings}`];
        this.month = month.month;
        this.year = month.year;
    }

}

module.exports = PieChart;



class PieChart {

    constructor(month) {

        this.data = [month.total_income,month.total_outcome,month.savings];
        this.labels = [`Income: ${month.total_income} `,`Outcome: ${month.total_outcome}`,`Savings: ${month.savings}`];
        this.month = month.month_name;
        this.year = month.year;
    }

}

module.exports = PieChart;


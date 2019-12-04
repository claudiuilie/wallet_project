
class Month {

	setMonth(body) {
		this.total_outcome = 0
		this.outcome_data = {};

		for (let k in body) {
			this[k] = body[k]

			if (k.match(/outcome_/g) && (k !== 'outcome_data')) {
				this.total_outcome += parseInt(body[k])
			}
		}

		for (let z in body) {
			if (z.match(/extra_/g) ){
				this.total_outcome += parseInt(body[z])
				this.outcome_data[z.replace("extra_", "").replace(/^\w/, c => c.toUpperCase())] = this[z];
				delete this[z];
			}
		}

		this.outcome_data = JSON.stringify(this.outcome_data);
		this.creation = new Date().toISOString();
		this.income = parseInt(this.income);

	}

	getMonth(data) {

		for (let k in data) {
			this[k] = data[k]
		}

		this.outcome_data = JSON.parse(this.outcome_data);
		this.savings = this.income - this.total_outcome;

	}

}

module.exports = Month;


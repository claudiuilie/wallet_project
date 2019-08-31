
class Month {

	setMonth(body) {
		this.total_outcome = 0
		this.outcome_extra = {};

		for (let k in body) {
			this[k] = body[k]

			if (k.match(/outcome_/g) && (k !== 'outcome_extra')) {
				this.total_outcome += parseInt(body[k])
			}
		}

		for (let z in body) {
			if (z.match(/extra_/g) ){
				this.total_outcome += parseInt(body[z])
				this.outcome_extra[z.replace("extra_", "")] = this[z];
				delete this[z];
			}
		}

		this.outcome_extra = JSON.stringify(this.outcome_extra);
		this.creation = new Date().toISOString();
		this.total_income = parseInt(this.income_claudiu) + parseInt(this.income_frumy);

	}

	getMonth(data) {

		for (let k in data) {
			this[k] = data[k]
		}

		this.outcome_extra = JSON.parse(this.outcome_extra);
		this.savings = this.total_income - this.total_outcome;

	}

}

module.exports = Month;


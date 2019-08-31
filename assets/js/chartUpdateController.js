

function updateData(chartName,labels, body, title) {

    let chartBody = chartName.data.datasets[0].data;

    chartBody.length = 0;
    chartName.options.title.text = title;
    chartName.data.labels = labels;

    body.forEach((bodyData) => {
        chartBody.push(bodyData)
    });

    chartName.update();
}


function updateChart(monthName){
    $('#dropdownMenuButton').html(`${monthName} ${new Date().getFullYear()}`)
    $.ajax({
        url:`/api/income?month_name=${monthName}&year=${new Date().getFullYear()}`,
        type:'get',
        success:function(data){

            let incomeData = data.json[0];
            let outcomeExtra = JSON.parse(incomeData.outcome_extra.replace(/\\/g, ""));
            let pieSavings = incomeData.total_income - incomeData.total_outcome;
            let pieBody = [incomeData.total_income , incomeData.total_outcome, pieSavings];
            let pieLabel = [`Income: ${incomeData.total_income}`, `Outcome: ${incomeData.total_outcome}`, `Savings: ${pieSavings}`];
            let chartLabel = [];
            let chartBody =[];

            for (var y in incomeData) {

                if (y.match(/outcome_/gm) && (y !== 'outcome_extra')) {
                    chartLabel.push(y.replace("outcome_", ""));
                    chartBody.push(incomeData[y]);
                }
            }

            for (var z in outcomeExtra) {
                chartLabel.push(z);
                chartBody.push(outcomeExtra[z]);
            }

            updateData(pieChart,pieLabel,pieBody , `${incomeData.month_name} ${incomeData.year}`)
            updateData(extendedChart,chartLabel,chartBody )
        }
    });
}


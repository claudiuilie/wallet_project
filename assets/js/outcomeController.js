
let date = new Date();
let year = date.getFullYear();

$('#disabledYearInput').val(year);

$('#addExtra').click(function(){
    let details = $('#addExtraOutcomeDetails').val();
    let value = $('#addExtraOutcomeValue').val();

    $(`
        <div class="form-group" id ="${details+value}">
        <label class="text-info" for="extraInput">${details}</label>
          <div class="input-group">
            <input type="number" id="extraInput" class="form-control" value ="${value}" name="extra_${details}" placeholder="${value}">
           <div class="input-group-append">
            <button class="btn btn-danger" type="button" onclick="removeExtra(${details+value})">Remove</button>
           </div>
          </div>
        </div>`
    ).insertBefore( "#addExtraButton" );

    $('#addExtraOutcomeDetails').val('');
    $('#addExtraOutcomeValue').val('');
})

function removeExtra(input) {
    console.log(`${input}`)
    input.remove()
}



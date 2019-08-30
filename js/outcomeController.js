
let date = new Date();
let year = date.getFullYear();

$('#disabledYearInput').val(year);

$('#addExtra').click(function(){

    $(`<label for="extraInput">${$('#addExtraOutcomeDetails').val()}</label>
        <div class="form-group">
          <div class="input-group">
            <input type="number" id="extraInput" class="form-control" value ="${$('#addExtraOutcomeValue').val()}" name="extra_${$('#addExtraOutcomeDetails').val()}" placeholder="${$('#addExtraOutcomeValue').val()}">
           <div class="input-group-append">
            <button class="btn btn-outline-danger" type="button" onclick="removeExtra(this)">Remove</button>
           </div>
          </div>
        </div>`
    ).insertBefore( "#addExtraButton" );

    $('#addExtraOutcomeDetails').val('');
    $('#addExtraOutcomeValue').val('');
})

function removeExtra(input) {
    input.remove()
}



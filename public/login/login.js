function submit() {
    var value = $("#loginName").val();
    var password = $("#password").val();


        
    $.ajax({
        type: 'POST',
        url: '/login',
        data: { value: value, password: password },
        success: function (data, textStatus, request) {
            window.location = '/';
        },
        error: function (request, textStatus, errorThrown) {
            alert('fail');
        }
    });
}


$('#btn-login').click(function(event) {
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    submit();  
})
function submit() {
    var value = $("#loginName").val();
    var password = $("#password").val();

    $.ajax({
        type: 'POST',
        url: '/login',
        data: { value: value, password: password },
        success: function (data, textStatus, request) {
            var res = (request.responseText) ? (JSON.parse(request.responseText)) : {};
            if(res.errorCode == 1 || res.errorCode == 2) {
                console.log('错误信息：', res.message);
            } else {
                window.location = '/';
            }
        },
        error: function (request, textStatus, errorThrown) {
            console.log('textStatus == ', textStatus);
            console.log('errorThrown == ', errorThrown);
            alert('fail');
        }
    });
}


$('#btn-login').click(function(event) {
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    submit();
})


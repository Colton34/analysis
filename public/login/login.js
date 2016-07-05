var isLoggingIn = false;
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
                if (!$('.err-message-ctn').length) {
                    $('.login-yunxiao').append('<div class="err-message-ctn"><p class="err-message">' + res.message + '</p></div>')
                }
                $('#btn-login').removeClass('btn-disabled').addClass('account-submit');
                isLoggingIn = false;
            } else {
                window.location = '/';
                //$('.err-message-ctn').remove();
                //$('#btn-login').removeClass('btn-disabled').addClass('account-submit');
            }
        },
        error: function (request, textStatus, errorThrown) {
            console.log('textStatus == ', textStatus);
            console.log('errorThrown == ', errorThrown);
            $('#btn-login').removeClass('btn-disabled').addClass('account-submit');
            if (!$('.err-message-ctn').length) {
                $('.login-yunxiao').append('<div class="err-message-ctn"><p class="err-message">登录出错</p></div>')
            } else {
                $('.err-message').text('登录出错');
            }
            // isLoggingIn = false; -- TODO:这里需要重置么？
            //alert('fail');
        }
    });
}


$('#btn-login').click(function(event) {
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    if (!isLoggingIn){
        $('#btn-login').removeClass('account-submit').addClass('btn-disabled');
        submit();
        isLoggingIn = true;
    }


})

//'<div class="err-message-ctn"><p class="err-message">密码错误</p></div>'

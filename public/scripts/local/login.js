function init() {
    gapi.load('auth2', () => {
        gapi.auth2.init({
            client_id: '775721000882-s6vgje18ehlb1q65teprvf37cjk3qi6s.apps.googleusercontent.com'
        });
    });
}

function login() {
    // alert('OK');
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn({ scope: 'profile email', prompt: 'select_account' }).then((googleUser) => {
        // var profile = googleUser.getBasicProfile();
        // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        // console.log('Name: ' + profile.getName());
        // console.log('Image URL: ' + profile.getImageUrl());
        // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
        const id_token = googleUser.getAuthResponse().id_token;        
        // console.log(id_token);

        // Send token to server
        $.ajax({
            type: "POST",
            url: "/verifyUser",
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            data: { token: id_token },
            success: (response) => {
                alert(response);
            },
            error: (xhr) => {
                alert(xhr.responseText);
            }
        });
    }).catch((err) => {
        console.log(err);
    });
}
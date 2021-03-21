function init() {
    gapi.load('auth2', () => {
        gapi.auth2.init({
            client_id: '775721000882-s6vgje18ehlb1q65teprvf37cjk3qi6s.apps.googleusercontent.com'
        });
    });
}

function signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
        window.location.replace('/logout');
    });
}
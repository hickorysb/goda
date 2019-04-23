function create() {
    this.socket = io('/adminLogin');

    this.socket.on("Nope", function() {
        document.getElementById('iupwd').style.display = '';
    });

    this.socket.on("AdminKey", function (adminKey) {
        sessionStorage.setItem('AdminKey', adminKey);
        location.href = '/admin/admin.html'
    });
}

function login() {
    document.getElementById('iupwd').style.display = 'none';
    username = document.getElementById('username').value;
    password = document.getElementById('password').value;
    this.socket.emit('Login', username, password);
    console.log('Test');
}
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);
});

document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {
        hoverEnabled: false
    });
});

function create() {
    if (sessionStorage.getItem('AdminKey') == null) {
        location.href = "/admin/index.html";
    }

    this.socket = io('/admin');
    this.socket.emit("CheckAdminKey", sessionStorage.getItem('AdminKey'));

    this.socket.on('CheckedAdminKey', function (valid) {
        if (valid) {
            document.getElementById("loading").style.display = 'none';
            document.getElementById("adminArea").style.display = '';
            var editor = monaco.editor.create(document.getElementById('questionsJSON'), {
                value: [
                    'function x() {',
                    '\tconsole.log("Hello world!");',
                    '}'
                ].join('\n'),
                language: 'json'
            });
            editor.layout();
        } else {
            sessionStorage.removeItem('AdminKey');
            location.replace('/admin/index.html');
        }
    });
}
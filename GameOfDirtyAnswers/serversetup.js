var gauser;
var gapass;
var servport;
const fs = require('fs');
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}


if (process.argv.length == 5) {
    gauser = process.argv[2];
    gapass = process.argv[3];
    servport = process.argv[4];
    if (!isNaN(servport) && servport > 0 && servport < 65536) {
        var gadminkey = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        let config = {
            'AdminUser': gauser,
            'AdminPassword': gapass,
            'ServerPort': servport,
            'AdminKey': gadminkey,
            'ConfigVersion': 1.0
        }
        let data = JSON.stringify(config);
        fs.writeFileSync('./config.json', data);
    } else {
        console.log("Server port must be a number between 1 and 65535.");
    }
} else {
    console.log("Command usage: node serversetup.js [admin username] [admin password] [server port]");
}
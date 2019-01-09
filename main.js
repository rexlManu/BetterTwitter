const {app, BrowserWindow, session} = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let cookiesPath = __dirname + "/cache/cookies.json";

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, '/assets/twitter-64.png'),
        titleBarStyle: "hidden"
    });
    mainWindow.on('closed', function () {
        mainWindow = null;
        session.defaultSession.cookies.get({}, (error, cookies) => {
            if (error) return;
            fs.writeFile(cookiesPath, JSON.stringify(cookies), err => {
                if (err) console.log(err);
            });
        })
    });

    mainWindow.setMenu(null);

    if (fs.existsSync(cookiesPath)) {
        fs.readFile(cookiesPath, "utf-8", (err, data) => {
            const rawCookies = JSON.parse(data);
            rawCookies.forEach(function (rawCookie) {
                session.defaultSession.cookies.set({
                    url: 'https://' + rawCookie.domain,
                    name: rawCookie.name,
                    value: rawCookie.value,
                    domain: rawCookie.domain,
                    hostOnly: rawCookie.hostOnly,
                    path: rawCookie.path,
                    secure: rawCookie.secure,
                    httpOnly: rawCookie.httpOnly,
                    session: rawCookie.session
                }, error => {
                    if (error)
                        console.log(error);

                })
            });
            mainWindow.loadURL("https://twitter.com")
        })
    } else
        mainWindow.loadURL("https://twitter.com/")
}

app.on('ready', createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit()
});
app.on('activate', function () {
    if (mainWindow === null)
        createWindow()
});

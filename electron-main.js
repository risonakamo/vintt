const {app,BrowserWindow,ipcMain}=require("electron");

function main()
{
    var win=new BrowserWindow({
        width:500,
        height:160,
        useContentSize:true,
        webPreferences:{nodeIntegration:true,devTools:true}
    });

    var finalQuit;

    win.on("close",(e)=>{
        if (!finalQuit)
        {
            e.preventDefault();
            win.webContents.send("about-to-close");
        }
    });

    ipcMain.on("resize-req",(e,width,height)=>{
        win.setContentSize(width,height);
    });

    ipcMain.on("open-devtools",()=>{
        win.webContents.openDevTools();
    });

    ipcMain.on("ready-to-quit",()=>{
        finalQuit=1;
        app.quit();
    });

    win.loadURL(`${__dirname}/mainwindow/mainwindow.html`);
}

app.on("ready",main);

// app.on("window-all-closed",()=>{
//     app.quit();
// });
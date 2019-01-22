const {app,BrowserWindow,ipcMain}=require("electron");

function main()
{
    var win=new BrowserWindow({width:500,height:160,useContentSize:true,webPreferences:{nodeIntegration:true}});

    win.on("close",()=>{
        win.webContents.send("about-to-close");
    });

    ipcMain.on("resize-req",(e,width,height)=>{
        win.setContentSize(width,height);
    });

    win.loadURL(`${__dirname}/mainwindow/mainwindow.html`);
}

app.on("ready",main);

app.on("window-all-closed",()=>{
    app.quit();
});
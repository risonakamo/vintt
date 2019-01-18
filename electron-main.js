const {app,BrowserWindow}=require("electron");
const psList=require("ps-list");

function main()
{
    var win=new BrowserWindow({width:500,height:160,useContentSize:true});
    win.loadURL(`${__dirname}/mainwindow/mainwindow.html`);
}

app.on("ready",main);

app.on("window-all-closed",()=>{
    app.quit();
});
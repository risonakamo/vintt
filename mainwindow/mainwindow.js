const {ipcRenderer}=require("electron");
const VinttMainRoot=require("./vinttmain-root.js");

window.onload=main;

function main()
{
    ReactDOM.render(React.createElement(VinttMainRoot),document.querySelector(".top-wrap"));
}

//request main process resizes this main window
function requestResize(width,height)
{
    ipcRenderer.send("resize-req",width,height);
}
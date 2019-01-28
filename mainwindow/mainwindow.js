const {ipcRenderer}=require("electron");
const VinttMainRoot=require("./vinttmain-root.js");

window.onload=main;

function main()
{
    ReactDOM.render(React.createElement(VinttMainRoot),document.querySelector(".top-wrap"));

    window.addEventListener("keydown",(e)=>{
        if (e.key=="I" && e.ctrlKey && e.shiftKey)
        {
            ipcRenderer.send("open-devtools");
        }
    });
}

//request main process resizes this main window
function requestResize(width,height)
{
    ipcRenderer.send("resize-req",width,height);
}
//not working yet
const packager=require("electron-packager");

packager({
    dir:`${__dirname}/..`,
    name:"ViNTT",
    icon:`${__dirname}/icon.ico`,
    ignore:["build",/(.*)\.(jsx|less)$/,".gitignore"]
});
//not working yet
const packager=require("electron-packager");

packager({
    dir:`${__dirname}/..`,

    name:"ViNTT",
    executableName:"vintt",
    icon:`${__dirname}/icon2.ico`,
    electronVersion:"4.0.2",

    ignore:["build",/(.*)\.(jsx|less)$/,".gitignore","ref","ref2","jsconfig.json"]
},(err,path)=>{
    console.log(err);
});
const psList=require("ps-list");
const fs=require("fs");

class TTrack
{
    constructor()
    {
        //set of process names to track
        //later make this loaded from settings file.
        this.trackSet=new Set(["notepad.exe"]);

        //the log file path
        //later maek this configurable
        this.logFile="ttrack.log";

        //wait for running timer function
        //this.waitRunningTimer*;
    }

    //public.
    //begins wait for tracked process loop.
    waitForRunning()
    {
        var foundProcess;

        this.waitRunningTimer=setInterval(()=>{
            psList().then((plist)=>{
                foundProcess=this.isSomethingRunning(plist);
                if (foundProcess)
                {
                    clearInterval(this.waitRunningTimer);
                    this.logProcess(foundProcess);
                }
            }).catch((err)=>{
                if (err)
                {
                    console.log("ttrack: pslist err");
                    console.log(err);
                }
            });
        },2000);
    }

    //give it a processlist object from plist.
    //returns the name of a process that is on the track list,
    //the first one found. or returns null.
    isSomethingRunning(processes)
    {
        for (var x=0,l=processes.length;x<l;x++)
        {
            if (this.trackSet.has(processes[x].name))
            {
                return processes[x].name;
            }
        }

        return null;
    }

    //make a log entry to the log file.
    logProcess(pname)
    {
        var dnow=new Date();
        fs.appendFile(this.logFile,`${dnow.getFullYear()}-${dnow.getMonth()+1}-${dnow.getDate()} ${dnow.toTimeString().slice(0,8)} ${pname}\n`,()=>{});
    }
}

module.exports=new TTrack();
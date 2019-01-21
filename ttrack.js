/*TTrack module, usage:
  var ttrack=require("ttrack");
  ttrack.waitForRunning();

  or any other public functions.
  require returns a working instance of ttrack.
  assigned variable name can be anything.

  EVENTS:
  "found": callback(data)
    event triggers when process is found. callback recieves
    trackSettings data object*/

const psList=require("ps-list");
const fs=require("fs");
const events=require("events");

class TTrack
{
    constructor()
    {
        //set of process names to track
        //later make this loaded from settings file.
        this.trackSet=new Set(["notepad.exe"]);

        //settings/additional info for each tracked program.
        //later make this loaded from a file.
        this.trackSettings={
            "notepad.exe":{
                name:"notepadnotepadnotepadnotepadnotepadnotepadnotepadnotepadnotepadnotepadnotepadnotepadnotepadnotepad",
                img:"test1.png",
                totalTime:128,
                process:"notepad.exe"
            }
        };

        //the log file path
        //later maek this configurable
        this.logFile="ttrack.log";

        //wait for running timer function
        //this.waitRunningTimer*;

        //event system
        this.eventSystem=new events.EventEmitter();
    }

    //public.
    //begins wait for tracked process loop.
    //upon finding a tracked program, ends loop and makes a log entry
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
                    this.eventSystem.emit("found",this.trackSettings[foundProcess]);
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

    //public, event system ON
    on(ename,listener)
    {
        this.eventSystem.on(ename,listener);
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
        fs.appendFile(this.logFile,`${dnow.getFullYear()}-${dnow.getMonth()+1}-${dnow.getDate()} ${dnow.toTimeString().slice(0,8)} ${pname}\r\n`,()=>{});
    }
}

module.exports=new TTrack();
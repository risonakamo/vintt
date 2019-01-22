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

const logFile="ttrack.log"; //the log file path
const tsettingsFile="tsettings.json"; //tsettings file path

class TTrack
{
    constructor()
    {
        //settings/additional info for each tracked program.
        this.trackSettings=JSON.parse(fs.readFileSync(tsettingsFile));

        //set of process names to track
        this.trackSet=new Set(Object.keys(this.trackSettings));

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
                    this.logProcess(this.trackSettings[foundProcess]);
                    this.eventSystem.emit("found",this.trackSettings[foundProcess]);
                }
            }).catch((err)=>{
                if (err)
                {
                    console.log("ttrack: pslist err");
                    console.log(err);
                }
            });
        },1500);
    }

    //public, event system ON
    on(ename,listener)
    {
        this.eventSystem.on(ename,listener);
    }

    //public.
    //make a log entry to the log file.
    //give it a whole TrackSetting object.
    //give it end=true to mark the log entry with Λ for end,
    //otherwise it does V for start. for now, it is so the log
    //file can look visually obvious if something is wrong.
    logProcess(tracksetting,end=0)
    {
        var dnow=new Date();

        if (end)
        {
            end="Λ";
        }

        else
        {
            end="V";
        }

        fs.appendFile(logFile,`${dnow.getFullYear()}-${dnow.getMonth()+1}-${dnow.getDate()} ${dnow.toTimeString().slice(0,8)} ${end} ${tracksetting.process} ${tracksetting.name}\r\n`,()=>{});
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
}

module.exports=new TTrack();
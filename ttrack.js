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
const process=require("process");
const path=require("path");

//path to exe, where config and other folders should be located next to
const exePath=path.relative(".",path.dirname(process.execPath));
const logFile=`${exePath}/config/ttrack.log`; //the log file path
const tsettingsFile=`${exePath}/config/tsettings.json`; //tsettings file path
const timeFile=`${exePath}/config/playtime.json`; //total time file

class TTrack
{
    constructor()
    {
        //sets:
        //this.trackSettings;*
        //this.trackSet;*
        //this.totalTimes;*
        this.loadData();

        //wait for running timer function
        //this.waitRunningTimer*;

        //event system
        this.eventSystem=new events.EventEmitter();

        //when a process is found and starts, this records the start time,
        //so when an end is called the duration can be calculated
        //this.lastFoundTime;*

        //TrackSetting of last found process
        //this.lastProcess;
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

                    this.lastProcess=this.trackSettings[foundProcess];

                    //grab the total time for the current found process and put it into the
                    //track settings.
                    if (this.totalTimes[foundProcess])
                    {
                        this.lastProcess.totalTime=this.totalTimes[foundProcess];
                    }

                    else
                    {
                        this.lastProcess.totalTime=0;
                    }

                    //update image path to be relative to banners folder
                    this.lastProcess.img=`../${exePath}/banners/${this.lastProcess.img}`;

                    //perform inital log
                    this.logProcess(this.lastProcess);

                    //record time the process started
                    this.lastFoundTime=new Date();

                    //emit process found event
                    this.eventSystem.emit("found",this.lastProcess);
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

    //public
    //perform an ending log of the last found process
    logEnd()
    {
        this.updateTotalTime(this.lastProcess);
        this.logProcess(this.lastProcess,1);
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

    //given a track setting, updates the total time object
    updateTotalTime(tracksetting)
    {
        //calculate total time, save as minutes
        var newTotal=Math.round((new Date()-this.lastFoundTime)/60000)+tracksetting.totalTime;
        tracksetting.totalTime=newTotal;
        this.totalTimes[tracksetting.process]=newTotal;

        fs.writeFile(timeFile,JSON.stringify(this.totalTimes),(err)=>{
            if (err)
            {
                console.log("total time file write error");
                console.log(err);
            }
        });
    }

    //do constructor data loading actions
    loadData()
    {
        fs.mkdir(exePath+"/config",(err)=>{});
        fs.mkdir(exePath+"/banners",(err)=>{});

        try
        {
            //settings/additional info for each tracked program.
            this.trackSettings=JSON.parse(fs.readFileSync(tsettingsFile));
        }

        catch(err)
        {
            this.trackSettings={};
        }

        //set of process names to track
        this.trackSet=new Set(Object.keys(this.trackSettings));

        try
        {
            this.totalTimes=JSON.parse(fs.readFileSync(timeFile));
        }

        catch(err)
        {
            this.totalTimes={};
        }
    }
}

module.exports=new TTrack();
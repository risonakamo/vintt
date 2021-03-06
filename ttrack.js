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

const iconv=require("iconv-lite");

const logFile="config/ttrack.log"; //the log file path
const tsettingsFile="config/tsettings.json"; //tsettings file path
const timeFile="config/playtime.json"; //total time file

class TTrack
{
    constructor()
    {
        //sets:
        //this.trackSettings;* //the settings object
        //this.trackSet;* //the set of names of programs to track, for fast detection
                          //when scanning over process names
        //this.totalTimes;* //the total times object that gets written to playtime.json
        //this.readError;* //a flag indicating if something went wrong in this object
        this.loadData(); //perform data load operations

        //wait for running timer function:
        //this.waitRunningTimer*;

        //event system:
        this.eventSystem=new events.EventEmitter();

        //when a process is found and starts, this records the start time,
        //so when an end is called the duration can be calculated:
        //this.lastFoundTime;*

        //TrackSetting of last found process:
        //this.lastProcess;
    }

    //public.
    //begins wait for tracked process loop.
    //upon finding a tracked program, ends loop and makes a log entry
    waitForRunning()
    {
        var foundProcess;

        if (this.waitRunningTimer)
        {
            clearInterval(this.waitRunningTimer);
        }

        this.waitRunningTimer=setInterval(()=>{
            psList().then((plist)=>{
                foundProcess=this.isSomethingRunning(plist);
                if (foundProcess)
                {
                    clearInterval(this.waitRunningTimer);

                    //find the target process in track settings
                    this.lastProcess=this.trackSettings[foundProcess];

                    //if it is a single tracksetting, convert to an array so we can
                    //handle it like an array. if it is already an array obviously do
                    //nothing
                    if (!this.lastProcess.length)
                    {
                        this.lastProcess=[this.lastProcess];
                    }

                    for (var x=0,l=this.lastProcess.length;x<l;x++)
                    {
                        //grab the total time for the current found process and put it into the
                        //track settings.
                        if (this.totalTimes[this.lastProcess[x].name])
                        {
                            this.lastProcess[x].totalTime=this.totalTimes[this.lastProcess[x].name];
                        }

                        //otherwise total time is 0
                        else
                        {
                            this.lastProcess[x].totalTime=0;
                        }

                        //convert the image file name to a relative filename. set a flag to make
                        //sure it doesnt get converted multiple times (not just for speed, the
                        //conversion involves using .img variable which is changed upon conversion,
                        //so converting multiple times would break the path)
                        if (!this.lastProcess[x].imgMadeRelative)
                        {
                            //update image path to be relative to banners folder
                            this.lastProcess[x].img=`../../../banners/${this.lastProcess[x].img}`;
                            this.lastProcess[x].imgMadeRelative=true;
                        }

                        //giving the tracksetting the processname which is the foundProcess key
                        this.lastProcess[x].process=foundProcess;
                    }

                    //perform inital log
                    this.logProcess(this.lastProcess[0]);

                    //record time the process started
                    this.lastFoundTime=new Date();

                    //remove this later when doing something with
                    //array process configs
                    this.lastProcess=this.lastProcess[0];

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
        var name;
        for (var x=0,l=processes.length;x<l;x++)
        {
            name=iconv.decode(iconv.encode(processes[x].name,"binary"),"shiftjis");
            if (this.trackSet.has(name))
            {
                return name;
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
        this.totalTimes[tracksetting.name]=newTotal;

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
        fs.mkdir("config",(err)=>{});
        fs.mkdir("banners",(err)=>{});

        try
        {
            //settings/additional info for each tracked program.
            //error checking for non existant file
            if (fs.existsSync(tsettingsFile))
            {
                this.trackSettings=JSON.parse(fs.readFileSync(tsettingsFile,{encoding:"utf8"}).trim());
            }

            else
            {
                this.trackSettings={};
            }
        }

        //if the file is broken "somehow", DONT default it, instead prevent
        //program operation, as often the file isnt actually broken, and we don't want
        //the non broken file to get overwritten
        catch(err)
        {
            console.log("track settings read error");
            console.log(err);
            this.trackSettings=null;
            this.readError=1;
        }

        //set of process names to track
        this.trackSet=new Set(Object.keys(this.trackSettings));

        try
        {
            //error checking for non existant file
            if (fs.existsSync(timeFile))
            {
                this.totalTimes=JSON.parse(fs.readFileSync(timeFile,{encoding:"utf8"}).trim());
            }

            else
            {
                this.totalTimes={};
            }
        }

        //same error handling behaviour as for tsettings file above
        catch(err)
        {
            console.log("total time file read error");
            console.log(err);
            this.totalTimes=null;
            this.readError=1;
        }
    }
}

module.exports=new TTrack();
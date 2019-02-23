const fs=require("fs");

//configure with path to logfile to regen from
const logfilepath="ttrack.log";

function main()
{
    var logfile=fs.readFileSync(logfilepath).toString();

    regenPlaytimes(logfile);
}

function regenPlaytimes(logfile)
{
    logfile=logfile.split("\n");

    var linematcher=/(.*) (V|Λ) (.*\.exe) (.*)/;
    var linematch; //the match object of the current log entry

    var enterTime; //set to a Date object when encountering a log entry
                   //signifying the start time of a program
    var timeSpent; //calculation of time spent given end time subtracting with begin time

    var lastTime=0; //flag showing whether the previous entry was enter (1) or exit (0)

    var enterExitCounts={enter:0,exit:0};
    var res={};

    for (var x=0,l=logfile.length;x<l;x++)
    {
        linematch=logfile[x].match(linematcher);

        if (!linematch)
        {
            console.warn(`invalid line detected:\n${logfile[x]}`);
            continue;
        }

        if (linematch[2]=="V")
        {
            enterExitCounts.enter++;

            if (lastTime)
            {
                console.warn(`duplicate entry at ${x+1}:\n${logfile[x]}`);
            }

            lastTime=1;

            enterTime=new Date(linematch[1]);
        }

        else if (linematch[2]=="Λ")
        {
            enterExitCounts.exit++;

            //if the previous log entry was also an exit, dont do anything
            if (!lastTime)
            {
                console.warn(`duplicate exit at ${x+1}:\n${logfile[x]}`);
            }

            else
            {
                lastTime=0;

                timeSpent=Math.round((new Date(linematch[1])-enterTime)/60000);
                if (res[linematch[4]])
                {
                    res[linematch[4]]+=timeSpent;
                }

                else
                {
                    res[linematch[4]]=timeSpent;
                }
            }
        }
    }

    console.log(enterExitCounts);
    console.log(res);
    return JSON.stringify(res);
}

main();
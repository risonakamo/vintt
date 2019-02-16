const ttrack=require("../ttrack.js");
const {ipcRenderer}=require("electron");

/*top ui react root of vintt main window.
  VinttMainRoot()*/
class VinttMainRoot extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state={
      waiting:true,
      img:"",
      name:""
    };

    //info section wrap element thing
    this.infoSection=React.createRef();
    this.minuteTimer=React.createRef();
    this.playTimer=React.createRef();
  }

  componentDidMount()
  {
    if (ttrack.readError)
    {
      console.log("read error flag set");
      return;
    }

    ttrack.on("found",(data)=>{
      this.processNowRunning(data);
    });

    ttrack.waitForRunning();

    //key listener for renderer window
    window.addEventListener("keypress",(e)=>{
      if (e.key=="Enter" || e.key==" ")
      {
        this.resetIdle();
      }
    });

    //handle about to close event from electron main
    ipcRenderer.on("about-to-close",()=>{
      this.resetIdle();
    });
  }

  componentDidUpdate()
  {
    this.doResize();
  }

  //recieve a process track info object and set it as the currently running program
  processNowRunning(processData)
  {
    this.minuteTimer.current.startTime();
    this.playTimer.current.startAt(processData.totalTime);
    this.setState({waiting:false,img:processData.img,name:processData.name});
  }

  //go back to idle mode
  resetIdle()
  {
    //only if not already in idle mode
    if (!this.state.waiting)
    {
      this.setState({waiting:true});
      ttrack.logEnd();
      this.minuteTimer.current.endTime();
      ttrack.waitForRunning();
    }
  }

  //resize window to fit things. has to wait for dom to be
  //updated.
  doResize(times=3)
  {
    if (this.infoSection.current && !this.state.waiting)
    {
      setTimeout(()=>{
        times--;
        requestResize(500,this.infoSection.current.clientHeight+40);

        if (times>0)
        {
          this.doResize(times);
        }
      },200);
    }
  }

  render()
  {
    //calculating which section should be shown, depending on if
    //it is waiting for a process to be running
    var waitingClasses;
    if (this.state.waiting)
    {
      waitingClasses=["","inactive"];
    }

    else
    {
      waitingClasses=["inactive",""];
    }

    return (<>
      <div className={`wrap idle ${waitingClasses[0]}`}>
        <p>waiting...</p>
      </div>

      <div className={`wrap ${waitingClasses[1]}`} ref={this.infoSection}>
        <img className="banner-img" src={this.state.img}/>
        <div className="now-playing">
          <h1>{this.state.name}</h1>
          <p>current session: <MinuteTimer ref={this.minuteTimer}/></p>
          <p>total: <MinuteTimer hourMode={true} ref={this.playTimer}/></p>
        </div>
      </div>
    </>);
  }
}

/*auto minute timer display element
  MinuteTimer(bool hourMode=false)*/
class MinuteTimer extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state={
      mins:0
    };

    //minute timer interval function
    //this.minTimer;*
  }

  //being the timer
  startTime()
  {
    this.minTimer=setInterval(()=>{
      this.setState({mins:this.state.mins+1});
    },60000);
  }

  //end the timer and reset the time
  endTime()
  {
    clearInterval(this.minTimer);
    this.setState({mins:0});
  }

  //force the timer to certain mins and start it
  startAt(mins)
  {
    clearInterval(this.minTimer);
    this.setState({mins});
    this.startTime();
  }

  render()
  {
    var displayTime=this.state.mins;
    var timeText="minutes";

    if (displayTime==1)
    {
      timeText="minute";
    }

    if (this.props.hourMode && this.state.mins>=60)
    {
      timeText="hrs";
      displayTime=(displayTime/60).toFixed(1);
    }

    return <>{`${displayTime} ${timeText}`}</>;
  }
}

module.exports=VinttMainRoot;
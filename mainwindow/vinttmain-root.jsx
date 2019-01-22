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

    //this.lastData;* last data object to be recieved

    //info section wrap element thing
    this.infoSection=React.createRef();
    this.minuteTimer=React.createRef();
  }

  componentDidMount()
  {
    ttrack.on("found",(data)=>{
      this.processNowRunning(data);
    });

    ttrack.waitForRunning();

    //key listener for renderer window
    window.addEventListener("keypress",(e)=>{
      if (e.key=="Enter" || e.key==" ")
      {
        console.log(e.key);
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
    if (!this.state.waiting)
    {
      setTimeout(()=>{
        requestResize(500,this.infoSection.current.clientHeight+40);
      },200);
    }
  }

  //recieve a process track info object and set it as the currently running program
  processNowRunning(processData)
  {
    this.lastData=processData;
    this.minuteTimer.current.startTime();
    this.setState({waiting:false,img:processData.img,name:processData.name});
  }

  //go back to idle mode
  resetIdle()
  {
    //only if not already in idle mode
    if (!this.state.waiting)
    {
      this.setState({waiting:true});
      ttrack.logProcess(this.lastData,1);
      this.minuteTimer.current.endTime();
      ttrack.waitForRunning();
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
          <p>total: 12 hours</p>
        </div>
      </div>
    </>);
  }
}

/*auto minute timer display element
  MinuteTimer()*/
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

  render()
  {
    return <>{this.state.mins} minutes</>;
  }
}

module.exports=VinttMainRoot;
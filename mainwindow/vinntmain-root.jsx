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
  }

  //recieve a process track info object and set it as the currently running program
  processNowRunning(processData)
  {
    this.setState({waiting:false,img:processData.img,name:processData.name});
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

      <div className={`wrap ${waitingClasses[1]}`}>
        <img className="banner-img" src={this.state.img}/>
        <div className="now-playing">
          <h1>{this.state.name}</h1>
          <p>current session: 2 hours</p>
          <p>total: 12 hours</p>
        </div>
      </div>
    </>);
  }
}
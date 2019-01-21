class VinttMainRoot extends React.Component
{
  render()
  {
    return (<>
      <div className="wrap idle inactive">
        <p>waiting...</p>
      </div>

      <div className="wrap">
        <img className="banner-img" src="test1.png"/>
        <div className="now-playing">
          <h1>言の葉舞い散る夏の風鈴</h1>
          <p>current session: 2 hours</p>
          <p>total: 12 hours </p>
        </div>
      </div>
    </>);
  }
}
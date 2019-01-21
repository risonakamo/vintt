const ttrack = require("../ttrack.js");

class VinttMainRoot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waiting: true,
      img: "",
      name: ""
    };
  }

  componentDidMount() {
    ttrack.on("found", data => {
      this.processNowRunning(data);
    });
    ttrack.waitForRunning();
  }

  processNowRunning(processData) {
    this.setState({
      waiting: false,
      img: processData.img,
      name: processData.name
    });
  }

  render() {
    var waitingClasses;

    if (this.state.waiting) {
      waitingClasses = ["", "inactive"];
    } else {
      waitingClasses = ["inactive", ""];
    }

    return React.createElement(React.Fragment, null, React.createElement("div", {
      className: `wrap idle ${waitingClasses[0]}`
    }, React.createElement("p", null, "waiting...")), React.createElement("div", {
      className: `wrap ${waitingClasses[1]}`
    }, React.createElement("img", {
      className: "banner-img",
      src: this.state.img
    }), React.createElement("div", {
      className: "now-playing"
    }, React.createElement("h1", null, this.state.name), React.createElement("p", null, "current session: 2 hours"), React.createElement("p", null, "total: 12 hours"))));
  }

}
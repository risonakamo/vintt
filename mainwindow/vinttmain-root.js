const ttrack = require("../ttrack.js");

const {
  ipcRenderer
} = require("electron");

class VinttMainRoot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waiting: true,
      img: "",
      name: ""
    };
    this.infoSection = React.createRef();
    this.minuteTimer = React.createRef();
  }

  componentDidMount() {
    ttrack.on("found", data => {
      this.processNowRunning(data);
    });
    ttrack.waitForRunning();
    window.addEventListener("keypress", e => {
      if (e.key == "Enter" || e.key == " ") {
        this.resetIdle();
      }
    });
    ipcRenderer.on("about-to-close", () => {
      this.resetIdle();
    });
  }

  componentDidUpdate() {
    if (!this.state.waiting) {
      setTimeout(() => {
        requestResize(500, this.infoSection.current.clientHeight + 40);
      }, 200);
    }
  }

  processNowRunning(processData) {
    this.minuteTimer.current.startTime();
    this.setState({
      waiting: false,
      img: processData.img,
      name: processData.name
    });
  }

  resetIdle() {
    if (!this.state.waiting) {
      this.setState({
        waiting: true
      });
      ttrack.logEnd();
      this.minuteTimer.current.endTime();
      ttrack.waitForRunning();
    }
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
      className: `wrap ${waitingClasses[1]}`,
      ref: this.infoSection
    }, React.createElement("img", {
      className: "banner-img",
      src: this.state.img
    }), React.createElement("div", {
      className: "now-playing"
    }, React.createElement("h1", null, this.state.name), React.createElement("p", null, "current session: ", React.createElement(MinuteTimer, {
      ref: this.minuteTimer
    })), React.createElement("p", null, "total: 12 minutes"))));
  }

}

class MinuteTimer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mins: 0
    };
  }

  startTime() {
    this.minTimer = setInterval(() => {
      this.setState({
        mins: this.state.mins + 1
      });
    }, 60000);
  }

  endTime() {
    clearInterval(this.minTimer);
    this.setState({
      mins: 0
    });
  }

  render() {
    return React.createElement(React.Fragment, null, this.state.mins, " minutes");
  }

}

module.exports = VinttMainRoot;
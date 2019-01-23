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
    this.playTimer = React.createRef();
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
    this.doResize();
  }

  processNowRunning(processData) {
    this.minuteTimer.current.startTime();
    this.playTimer.current.startAt(processData.totalTime);
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

  doResize(times = 3) {
    if (this.infoSection.current && !this.state.waiting) {
      setTimeout(() => {
        times--;
        requestResize(500, this.infoSection.current.clientHeight + 40);

        if (times > 0) {
          this.doResize(times);
        }
      }, 200);
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
    })), React.createElement("p", null, "total: ", React.createElement(MinuteTimer, {
      hourMode: true,
      ref: this.playTimer
    })))));
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

  startAt(mins) {
    clearInterval(this.minTimer);
    this.setState({
      mins
    });
    this.startTime();
  }

  render() {
    var displayTime = this.state.mins;
    var timeText = "minutes";

    if (displayTime == 1) {
      timeText = "minute";
    }

    if (this.props.hourMode && this.state.mins >= 60) {
      timeText = "hrs";
      displayTime = (displayTime / 60).toFixed(1);
    }

    return React.createElement(React.Fragment, null, `${displayTime} ${timeText}`);
  }

}

module.exports = VinttMainRoot;
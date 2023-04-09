import React, { useCallback, useRef, useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";
import * as cocossd from "@tensorflow-models/coco-ssd";
import swal from "sweetalert";
import * as posenet from "@tensorflow-models/posenet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Webcam from "react-webcam";

import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";

import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";
import { useLocation } from "react-router-dom";

const javascriptDefault = `
   #include<iostream>

   using namespace std;

   int main(){
    cout<<"Hello world!";
    return 0;
   }
`;

const Landing = () => {
  const { state } = useLocation();
  const data = state?.data.lab;
  const user = state?.data.user;
  console.log(user, "user");
  console.log("data", data);
  //  const [timeRemaining, setTimeRemaining] = useState(data.minutes * 60);

  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);
  const [timerId, setTimerId] = useState(null);

  // chartdata

  const [tabChange, setTabChange] = useState(0);
  const [multiFace, setMultiFace] = useState(0);
  const [key_press, setKeyPress] = useState(0);
  const [cheat, setCheat] = useState(0);
  const [mobile, setMobile] = useState(0);
  const [faceNotVisible, setFaceNotVisible] = useState(0);
  const [screenCount, setScreenCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [leftCount, setLeftCount] = useState(0);
  const [speakCount, setSpeakCount] = useState(0);

  let speaking = false;

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const chartData = {
    tab_change: tabChange,
    key_press: key_press,
    speakCount: speakCount,
    mobileCount: mobile,
    downCount: downCount,
    leftCount: leftCount,
    rightCount: rightCount,
    screenCount: screenCount,
    faceNotVisible: faceNotVisible,
    multipleFace: multiFace,
    cheating: cheat,
  };

  //to handle procter chartData

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);
  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  const handleSubmit = async (code, outputDetails, language) => {
    const out =
      atob(outputDetails.stdout) !== null
        ? `${atob(outputDetails.stdout)}`
        : null;
    const lab = {
      profileId: user._id,
      labNo: data.labNo,
      subjectName: data.subjectName,
      code: code,
      output: out,
      progLang: language.label,
      procterData: chartData,
    };

    console.log("submited lab :", lab);

    try {
      const res = await fetch("http://localhost:8001/submitLab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lab),
      });

      const data = await res.json();
      console.log("response", data);

      if (res.status === 200) {
        console.log("lab submited successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
      url: "/",
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);

          showErrorToast(
            `Quota of 100 requests exceeded for the Day! Please read the blog on freeCodeCamp to learn how to setup your own RAPID API Judge0!`,
            10000
          );
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        showSuccessToast(`Compiled Successfully!`);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      showErrorToast();
    }
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }
  useEffect(() => {
    defineTheme("oceanic-next").then((_) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  const showSuccessToast = (msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const showErrorToast = (msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  /**
   *
   */
  //procter code goes here
  const runCoco = async () => {
    const net = await cocossd.load();
    const looking = await posenet.load();
    console.log("procter model loaded.", net);
    //  Loop and detect student

    //speak count
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const source = audioContext.createMediaStreamSource(microphone);
    source.connect(analyser);
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    setInterval(() => {
      detect(net, looking, analyser, dataArray);
    }, 100);
  };

  const detect = async (net, looking, analyser, dataArray) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const prediction = await net.detect(video);
      const pose = await looking.estimateSinglePose(video);

      console.log(prediction);

      // If there is no predictionect detected and no timer is running, start the timer
      if (prediction.length === 0 && !timerId) {
        const id = setTimeout(() => {
          setFaceNotVisible((prevState) => prevState + 1);
          swal("Face Not Visible", "Action has been Recorded", "error");
          setTimerId(null);
        }, 3000); // 3 seconds
        setTimerId(id);
      }

      // If there is an predictionect detected, cancel the timer if it is running
      if (prediction.length > 0 && timerId) {
        clearTimeout(timerId);
        setTimerId(null);
      }

      let faces = 0;

      for (let i = 0; i < prediction.length; i++) {
        if (prediction[i].class === "cell phone") {
          setMobile((prevState) => prevState + 1);
          swal("Cell Phone Detected", "Action has been Recorded", "error");
        } else if (
          prediction[i].class === "book" ||
          prediction[i].class === "laptop"
        ) {
          setCheat((prevState) => prevState + 1);
          swal(
            "Prohibited Object Detected",
            "Action has been Recorded",
            "error"
          );
        } else if (prediction[i].class === "person") {
          faces++;
        }
      }

      if (faces > 1) {
        setMultiFace((prevState) => prevState + 1);
        swal(
          faces.toString() + " people detected",
          "Action has been recorded",
          "error"
        );
      }

      //detecting pose
      let count = 0;
      const leftEye = pose.keypoints[1];
      const rightEye = pose.keypoints[2];
      const screenMidpoint = video.width / 2;
      const nose = pose.keypoints[0];
      const noseY = nose.position.y;
      const noseThreshold = videoHeight * 0.7;
      if (
        leftEye.position.x <= screenMidpoint &&
        rightEye.position.x <= screenMidpoint
      ) {
        count++;
        if (count >= 20) {
          setLeftCount((prevState) => prevState + 1);
          count = 0;
        }
      } else if (
        leftEye.position.x >= screenMidpoint &&
        rightEye.position.x >= screenMidpoint
      ) {
        count++;
        if (count >= 20) {
          setRightCount((prevState) => prevState + 1);
          count = 0;
        }
      } else {
        count++;
        if (count >= 20) {
          setScreenCount((prevState) => prevState + 1);
          count = 0;
          console.log("user is looking at the screen");
        }
      }
      let dcount = 0;
      if (noseY > noseThreshold) {
        dcount++;
        if (dcount >= 20) {
          setDownCount((prevState) => prevState + 1);
          dcount = 0;
          swal("You are cheater", "Action has been Recorded", "error");
        }
      }

      if (document.hidden) {
        setTabChange((prevState) => prevState + 1);
        swal("Changed Tab Detected", "Action has been Recorded", "error");
      }

      //to detect ctrl key press
      document.addEventListener("keydown", function (event) {
        if (event.ctrlKey) {
          setKeyPress((prevState) => prevState + 1);
          swal("Ctrl Key Press Detected!", "Action has been Recorded", "error");
        }
      });

      //to detect alt key press
      document.addEventListener("keydown", function (event) {
        if (event.altKey) {
          setKeyPress((prevState) => prevState + 1);
          swal("Alt Key Press Detected!", "Action has been Recorded", "error");
        }
      });

      //detect speaking

      analyser.getByteTimeDomainData(dataArray);
      const volume = Math.max(...dataArray) - 128;
      if (volume > 10) {
        if (!speaking) {
          speaking = true;
          setSpeakCount((prevState) => prevState + 1);
          if (speakCount >= 20) {
            console.log(`User is speaking! Count: ${speakCount}`);
          }
        }
      } else {
        speaking = false;
      }

      // Draw mesh
      // const ctx = canvasRef.current.getContext("2d");
      // drawRect(prediction, ctx);
    }
  };

  useEffect(() => {
    runCoco();
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div
        className="flex flex-col  rounded-md text-white p-4  m-4"
        style={{ backgroundColor: "black" }}
      >
        <div className="flex w-full space-x-2">
          <div className="bg-[#1e293b] rounded-md h-full w-full p-4">
            <h2>
              <b>Lab No</b>
            </h2>
            {data.labNo}
          </div>
          <div className="bg-[#1e293b] rounded-md h-full w-full p-4">
            <h2>
              <b>Aim</b>
            </h2>
            {data.aim}
          </div>
          <div className="bg-[#1e293b] rounded-md h-full w-full p-4">
            <h2>
              <b>Subject</b>
            </h2>
            {data.subjectName}
          </div>
          <div className="bg-[#1e293b] rounded-md h-full w-full p-4">
            <h2>
              <b>Marks</b>
            </h2>
            {data.outOfMarks}
          </div>
          <div className="bg-[#1e293b] rounded-md h-full w-full p-4">
            <h2>
              <b>Time</b>
            </h2>
            {data.minutes} minutes {/* {formatTime(timeRemaining)} */}
            {/* <Timer minutes={data.minutes} /> */}
          </div>
        </div>
      </div>

      <div> {/* <Procter updateChartData={updateChartData}  />{" "} */}</div>
      <div className="flex flex-row space-x-4 items-start px-4 ">
        <div className="flex flex-col w-full h-[620px] justify-start items-end">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
          />
        </div>

        <div className="right-container flex w-1/3 flex-col ">
          <div className="flex flex-row">
            <div className="">
              <LanguagesDropdown onSelectChange={onSelectChange} />
            </div>
          </div>
          <OutputWindow outputDetails={outputDetails} />

          <CustomInput
            customInput={customInput}
            setCustomInput={setCustomInput}
          />
          {/*  */}
          <div className="flex gap-8">
            <Button
              variant="contained"
              onClick={handleCompile}
              disabled={!code}
              style={{ marginTop: "5px", width: "100px", display: "flex" }}
            >
              {processing ? "Executing..." : "Run"}
            </Button>
            <Button
              variant="contained"
              style={{ marginTop: "5px", width: "100px", display: "flex" }}
              onClick={() => handleSubmit(code, outputDetails, language)}
            >
              Submit
            </Button>
          </div>

          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
      <div>
        <Webcam
          ref={webcamRef}
          style={{
            width: 1,
            height: 1,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            width: 1,
            height: 1,
          }}
        />
        {/* <DoughnutChart chartData={chartData}/> */}
      </div>
    </>
  );
};
export default Landing;

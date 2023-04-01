import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
const Confirm = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [rollNo, setRollNo] = useState();
  const [email, setEmail] = useState("");
  const [labNo, setLabNo] = useState();
  const [labData, setLabData] = useState({});

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    // do nothing
  };

  const handleSubmit = async () => {
    // setOpen(false)
    const formData = {
      rollNo,
      email,
      labNo,
    };
    console.log("formData", formData);

    try {
      const res = await fetch("http://localhost:8001/fetchlab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("response", data);

      if (res.status === 200) {
        setLabData(data);
        setOpen(false);
        navigate("/compiler", { state: { data } });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleClickOpen();
  }, []);
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"jadfhlksadjhflkajhldfkhlkahfd"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <div>
              <div className="flex gap-1 space-y-4">
                <h2 className="w-1/2 mt-6 ">Email </h2>
                <TextField
                  className="w-1/2"
                  id="outlined-password-input"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="current-email"
                />
              </div>
              <div className="flex gap-1 space-y-4">
                <h2 className="w-1/2 mt-6">Roll </h2>
                <TextField
                  className="w-1/2"
                  id="outlined-password-input"
                  label="Roll No"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  autoComplete="current-roll"
                />
              </div>
              <div className="flex gap-1 space-y-4">
                <h2 className="w-1/2 mt-6">Lab No </h2>
                <TextField
                  className="w-1/2"
                  id="outlined-password-input"
                  label="Lab No"
                  value={labNo}
                  onChange={(e) => setLabNo(e.target.value)}
                  autoComplete="current-roll"
                />
              </div>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <div className="mr-4">
            <Button onClick={handleSubmit} variant="contained">
              Submit
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Confirm;

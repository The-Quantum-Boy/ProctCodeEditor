import React, { useEffect, useState } from 'react'

const Timer = ({minutes}) => {
 const [timeLeft, setTimeLeft] = useState(minutes * 60 * 10);

 useEffect(() => {
   const intervalId = setInterval(() => {
     setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
   }, 100);

   return () => clearInterval(intervalId);
 }, []);

 const minutesLeft = Math.floor((timeLeft / 10 / 60) % 60);
 const secondsLeft = Math.floor((timeLeft / 10) % 60);
 const tenthsLeft = timeLeft % 10;

 return (
   <div>
     {minutesLeft < 10 ? "0" + minutesLeft : minutesLeft}:
     {secondsLeft < 10 ? "0" + secondsLeft : secondsLeft}:{tenthsLeft}
   </div>
 );
}

export default Timer
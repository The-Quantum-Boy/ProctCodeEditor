import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Landing from "./compiler/components/Landing"
import Confirm from "./Forms/Confirm";

function App() {
 return (
   <>
     {/* {
        ()=>{
          if (labData) {
            return <Landing labData={labData} />;
          }
        }
      } */}

     <Routes >
       <Route path="/" element={<Confirm />} />
       <Route path="/compiler" element={<Landing />} />
     </Routes>
   </>
 );
}

export default App;

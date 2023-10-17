import './App.css'
import {Route, Routes} from "react-router";
import Home from "./screens/Home";
import Navbar from "./components/Navbar";
import {useEffect, useState} from "react";
import {Parent} from "../../hello-cdk/lib/types/types";
import {apiGet} from "./utils/functions";

function App() {

    const [parents, setParents] = useState<Parent[]>()

    useEffect(() => {
        apiGet(`/parents`).then(setParents)
    }, [])

    console.log(parents)

  return (
      <div className={'h-screen w-screen'} >
          <Navbar />
          <div className={'relative top-[var(--header-height)]'}>
          <Routes>
              <Route path={`/`} element={<Home />} >
              </Route>
          </Routes>
          </div>
      </div>
  )
}

export default App

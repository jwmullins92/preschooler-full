import './App.css'
import {Route, Routes} from "react-router";
import Home from "./screens/Home";
import Navbar from "./components/Navbar";
import {UserContextProvider} from "./context/UserContext";

export const userId = `652eb86a10a352bcb2010ad6`

function App() {


  return (
      <UserContextProvider>
          <Navbar />
          <div className={'relative top-[var(--header-height)] px-4 z-10'}>
          <Routes>
              <Route path={`/`} element={<Home />} >
              </Route>
          </Routes>
          </div>
      </UserContextProvider>
  )
}

export default App

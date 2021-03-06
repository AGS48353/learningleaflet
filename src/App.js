import React, { useReducer } from 'react';
import './App.css';
import MapFun from './maps';
import TabsInfo from './tabs';
import { Paper } from '@material-ui/core';
export const AppContext = React.createContext();

const initialState = {

  inputArray: ["null", ""],
  inputFly: [13, 100, 6],

};
function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_INPUT':
      return {
        inputArray: action.layer,
        inputFly: action.fly,
      };


    default:
      return initialState;
  }
}
function App() {

  const [state, dispatch] = useReducer(reducer, initialState);
  function refreshPage() {
    window.location.reload(false);
  }
  return (

    <div className="App">
    
    {/* <div className="title">just a random div for the title</div> */}
      <Paper>
        <AppContext.Provider value={{ state, dispatch }}>
          <MapFun />
          <div className="temp"><TabsInfo /><button onClick={refreshPage}>RELOAD</button></div>

        </AppContext.Provider>

      </Paper>
    </div>

  );
}

export default App;

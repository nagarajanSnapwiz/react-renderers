import React from 'react';
import PixiApp from './pixi.app';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      logo : {logo}
      <PixiApp>
        <container>
          <sprite from={logo} x={30} />
          <sprite from={logo} x={80} />
          <sprite from={logo} x={130} />
        </container>

      </PixiApp>
    </div>
  );
}

export default App;

import { BrowserRouter } from 'react-router-dom';
import Routers from './router/Routers';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routers />
    </BrowserRouter>
  );
}

export default App;
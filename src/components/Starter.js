import { useContext } from 'react';
import '../App.css';
import { CustomAudioContext } from './AudioContextProvider';

function Starter() {
  const [state] = useContext(CustomAudioContext)
  return (
    <div className={`starter ${state.initialized && 'hide'}`}>
      Click to begin
    </div>
  );
}

export default Starter;

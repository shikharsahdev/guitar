import { useContext } from 'react';
import '../App.css';
import { CustomAudioContext } from './AudioContextProvider';

function CurrentHz() {
  const [state] = useContext(CustomAudioContext)
  return (
    <div className="currentNoteStats">
      <span className="note">{state.note}</span>
      <span className="hz">{Number(state.hz).toFixed(1)}hz</span>
      <span className="err">{state.errorRange}</span>
    </div>
  );
}

export default CurrentHz;

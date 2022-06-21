import { useContext } from 'react';
import '../App.css';
import { getNoteClass } from '../constants';
import { CustomAudioContext } from './AudioContextProvider';

function Fret({note, showNote, range: stringRange, pos, approxHz, rootNote}) {
  const [state] = useContext(CustomAudioContext)
  const positionRatioFromStart = pos/22;
  const rangeBandwidth = stringRange.max - stringRange.min;
  const approxFrequency = stringRange.min + (rangeBandwidth * positionRatioFromStart);
  const refinedRange = {
    min: approxHz * 0.95,
    max: approxHz * 1.05
  }
  const range=stringRange;
  const forceBlack = rootNote && rootNote != note;
  return (
    <div className="fret">
      {showNote ? <div className={"noteOnString " + (forceBlack ? 'unimportantnote' : getNoteClass(note))}>{note}</div> : ""}
      <div className={`noteOnString currentNote ${!showNote ? 'wrong ' : ''} ${state.note !== note || state.hz > refinedRange.max || state.hz < refinedRange.min ? "hide" : ""}`}></div>
      <div className="string"></div>
    </div>
  );
}

export default Fret;

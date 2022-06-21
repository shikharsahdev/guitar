import { useEffect, useState } from 'react';
import './App.css';
import { AudioContextProvider } from './components/AudioContextProvider';
import CurrentHz from './components/CurrentHz';
import Fretboard from './components/Fretboard';
import Starter from './components/Starter';
import { getNoteClass, notes } from './constants';

function App() {
  const [selectedNotes, setSelectedNotes] = useState(["C","D","E","G","A"]);
  const [baseChord, setBaseChord] = useState("Am");
  const [mode, setMode] = useState("DIY");
  const [rootNote, setRootNote] = useState("A");
  const modes = ["DIY", "PENTATONIC", "CHORD"];
  useEffect(() => {
    if (mode === "DIY") {
      setSelectedNotes([]);
      setBaseChord("")
      setRootNote("")
    } else {
      if (!baseChord) {
        setBaseChord("Am");
        return;
      }
      const rootNote = baseChord.split('m')[0];
      const isMinor = baseChord.includes('m');
      setRootNote(rootNote);
      const rootIndex = notes.indexOf(rootNote);
      const relativePentatonicArrays = {
        PENTATONIC_MAJOR: [0,2,4,7,9],
        PENTATONIC_MINOR: [0,3,5,7,10],
        CHORD_MAJOR: [0,4,7],
        CHORD_MINOR: [0,3,7]
      }
      const relativePentatonicArray = relativePentatonicArrays[Object.keys(relativePentatonicArrays).find(key => key === (mode + (isMinor ? "_MINOR" : "_MAJOR")))];
  
      const newSelectedNodes = relativePentatonicArray.map(elem => {
        return notes[(rootIndex+elem) % notes.length]
      });
  
      setSelectedNotes(newSelectedNodes);
    }
  }, [baseChord, mode]);
  const toggleNote = (note) => {
    if (mode !== "DIY") {
      return;
    }
    if (selectedNotes.includes(note)) {
      setSelectedNotes([...selectedNotes.filter(n => note !== n)])
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  }
  return (
    <AudioContextProvider>
      <div className="App">
        <Starter />
        <Fretboard rootNote={rootNote} selectedNotes={selectedNotes.length ? selectedNotes : notes}/>
        <div className="controls">
          <div className="stats">
            <CurrentHz />
            <div className="modes">
              {modes.map(m => (<div key={m} onClick={() => setMode(m)} className={`mode `+ (mode === m ? "selected": "")}>{m}</div>))}
            </div>

          </div>
          <div className="selectors">
            { mode !== "DIY" && <div className="majorPentatonicNotes notes">
              {
                notes.map((note) => (
                  <div key={note} onClick={() => setBaseChord(note)} className={"noteControl " + (baseChord === note ? " selected": "")}>
                    {note}
                  </div>
                ))
              }
            </div>}
            { mode !== "DIY" && <div className="minorPentatonicNotes notes">
              {
                notes.map((note) => (
                  <div key={note} onClick={() => setBaseChord(`${note}m`)} className={"noteControl " + (baseChord === note+"m" ? " selected": "" ? " selected": "")}>
                    {note}m
                  </div>
                ))
              }
            </div>}
            <div className="notes">
              {
                notes.map((note) => (
                  <div key={note} onClick={() => toggleNote(note)} className={"noteControl " + getNoteClass(note) + (selectedNotes.includes(note) ? " selected": "")}>
                    {note}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
        <div className="madeby">Made with <b>&#x2764;</b> by <a href="https://www.linkedin.com/in/shikharsahdev/" target="shikharcontact"><u>Shikhar Sahdev</u></a></div>
      </div>
      <div className="desktopOnly">
        <h1>alas</h1>
        <h2><i>desktop only</i> for now</h2>
        <p>Resize the window if already on desktop, <i>lulz</i></p>
      </div>
    </AudioContextProvider>
  );
}

export default App;

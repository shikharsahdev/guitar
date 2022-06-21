import '../App.css';
import { notes } from '../constants';
import Fret from './Fret';

function Fretboard({selectedNotes, rootNote}) {
  const numberOfNotes = notes.length;
  const getNoteForFret = (baseNote, pos) => {
    let noteIndex = notes.indexOf(baseNote || "A");
    return notes[(noteIndex + pos)%numberOfNotes];
  }
  const getDotsForFret = (i) => {
    let currentIndex = 0;
    let dots = 0;
    let dotsFretIndex = 0;
    
    while(currentIndex <= i && i > 0) {
      const gapToAdd = dotGaps[dotsFretIndex];
      dotsFretIndex = (dotsFretIndex + 1) % dotGaps.length;
      currentIndex = currentIndex + gapToAdd;
      if (currentIndex === i) {
        dots = dotsFretIndex === 0 ? 2 : 1;
      }
    }

    return dots;
  }

  const fretCount = 22;

  const baseNotes = ["E","A","D","G","B","E"]
  const baseFrequencies = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63]
  const stringCount = 6;
  const dotGaps = [3,2,2,2,3]
  const ranges = [{
    min: 60,
    max: 200,
  },{
    min: 70,
    max: 280,
  },{
    min: 100,
    max: 380,
  },
  {
    min: 160,
    max: 480
  },{
    min: 200,
    max: 620,
  },{
    min: 280,
    max: 860,
  },

]
const getHz = (stringIndex, fret) => {
  return baseFrequencies[stringIndex] * Math.pow(2,fret/12)
}
  
  return (
    <div className="fretboard">
      {
        Array(fretCount).fill().map((n,i) => (
          <div className="fretWrapper" key={i}>
            {
              baseNotes.map((baseNote,k) => (
                <Fret
                  key={`${k}-${i}`}
                  dots={getDotsForFret(i)}
                  showNote={selectedNotes.includes(getNoteForFret(baseNote,i))}
                  approxHz={getHz(k, i)}
                  note={getNoteForFret(baseNote,i)}
                  range={ranges[k]}
                  pos={k}
                  rootNote={rootNote}
                />
              ))
            }
            <div className="dotsWrapper">
              { 
                Array(getDotsForFret(i)).fill().map((x,d) => (<div key={d} className="dot"/>))
              }
            </div>
          </div>
        ))
      }
      <div className="wood">
        <div className="upper"></div>
        <div className="lower"></div>
      </div>
    </div>
  );
}

export default Fretboard;

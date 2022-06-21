import { useReducer, createContext, useEffect, useState } from 'react';
// Define the set of test frequencies that we'll use to analyze microphone data.
var C2 = 65.41; // C2 note, in Hz.
var notes = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];
var test_frequencies = [];
for (var i = 0; i < 30; i++)
{
  var note_frequency = C2 * Math.pow(2, i / 12);
  var note_name = notes[i % 12];
  var note = { "frequency": note_frequency, "name": note_name };
  var just_above = { "frequency": note_frequency * Math.pow(2, 1 / 48), "name": note_name + " (a bit sharp)" };
  var just_below = { "frequency": note_frequency * Math.pow(2, -1 / 48), "name": note_name + " (a bit flat)" };
  test_frequencies = test_frequencies.concat([ just_below, note, just_above ]);
}

export const CustomAudioContext = createContext();

const initialState = {
  note: 'A',
  hz: 440,
  initialized: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE_HZ':
      return {
        ...state,
        hz: action.payload
      }
    case 'CHANGE_NOTE':
      return {
        ...state,
        note: action.payload.note,
        errorRange: action.payload.errorRange
      };
    case 'SET_INITIALIZED':
      return {
        ...state,
        initialized: true
      }
    default:
      return {
        state
      };
  }
};
let audioContext = null;
let analyser = null;


export const AudioContextProvider = props => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [initialized, setInitialized] = useState(false);
  // let analyser = null;
  useEffect(() => {
    window.onclick = () => {
      if (!initialized) {
        dispatch({type: "SET_INITIALIZED"});
        setInitialized(true);
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        init();
      }
    }
  });

  const init = () => {
    let source;
    analyser.minDecibels = -100;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    if (!navigator?.mediaDevices?.getUserMedia) {
      // No audio allowed
      alert('Sorry, getUserMedia is required for the app.')
      return;
    } else {
      const constraints = {audio: true};
      navigator.mediaDevices.getUserMedia(constraints)
        .then(
          function(stream) {
            // Initialize the SourceNode
            source = audioContext.createMediaStreamSource(stream);
            // Connect the source node to the analyzer
            source.connect(analyser);
            visualize();
          }
        )
        .catch(function(err) {
          console.error(err);
          alert('Sorry, microphone permissions are required for the app. Feel free to read on without playing :)')
        });
    }

    function visualize() {

      // Thanks to PitchDetect: https://github.com/cwilso/PitchDetect/blob/master/js/pitchdetect.js
      const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      function noteFromPitch( frequency ) {
        const noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
        return [Math.round( noteNum ) + 69, noteNum +69];
      }

      const drawNote = function() {
        const bufferLength = analyser.fftSize;
        const buffer = new Float32Array(bufferLength);
        analyser.getFloatTimeDomainData(buffer);
        const autoCorrelateValue = autoCorrelate(buffer, audioContext.sampleRate)

        // Handle rounding
        let errorRange = 0;
        let valueToDisplay = autoCorrelateValue;

        if (autoCorrelateValue !== -1)
          dispatch({type:"CHANGE_HZ", payload: autoCorrelateValue})

        const roundingValue = ''
        if (roundingValue === 'none') {
          // Do nothing
        } else if (roundingValue === 'hz') {
          valueToDisplay = Math.round(valueToDisplay);
        } else {
          // Get the closest note
          // Thanks to PitchDetect:
          const [noteNum, noteNumWithError] = noteFromPitch(autoCorrelateValue);
          valueToDisplay = noteStrings[noteNum % 12];
          errorRange = (noteNumWithError - noteNum).toFixed(2)
        }

        if (typeof(valueToDisplay) === 'number') {
          valueToDisplay += ' Hz';
        }
        if (valueToDisplay && valueToDisplay !== -1) {
          dispatch({type:"CHANGE_NOTE", payload: {
            note:valueToDisplay,
            errorRange
          }})
        }
      }
      
      setInterval(drawNote, 50);
    }
  }


  // Must be called on analyser.getFloatTimeDomainData and audioContext.sampleRate
  // From https://github.com/cwilso/PitchDetect/pull/23
  function autoCorrelate(buffer, sampleRate) {
    // Perform a quick root-mean-square to see if we have enough signal
    let SIZE = buffer.length;
    let sumOfSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      sumOfSquares += val * val;
    }
    const rootMeanSquare = Math.sqrt(sumOfSquares / SIZE)
    if (rootMeanSquare < 0.01) {
      return -1;
    }

    // Find a range in the buffer where the values are below a given threshold.
    let r1 = 0;
    let r2 = SIZE - 1;
    const threshold = 0.2;

    // Walk up for r1
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < threshold) {
        r1 = i;
        break;
      }
    }

    // Walk down for r2
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < threshold) {
        r2 = SIZE - i;
        break;
      }
    }

    // Trim the buffer to these ranges and update SIZE.
    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length

    // Create a new array of the sums of offsets to do the autocorrelation
    let c = new Array(SIZE).fill(0);
    // For each potential offset, calculate the sum of each buffer value times its offset value
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j+i]
      }
    }

    // Find the last index where that value is greater than the next one (the dip)
    let d = 0;
    while (c[d] > c[d+1]) {
      d++;
    }

    // Iterate from that index through the end and find the maximum sum
    let maxValue = -1;
    let maxIndex = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxValue) {
        maxValue = c[i];
        maxIndex = i;
      }
    }

    let T0 = maxIndex;

    // Not as sure about this part, don't @ me
    // From the original author:
    // interpolation is parabolic interpolation. It helps with precision. We suppose that a parabola pass through the
    // three points that comprise the peak. 'a' and 'b' are the unknowns from the linear equation system and b/(2a) is
    // the "error" in the abscissa. Well x1,x2,x3 should be y1,y2,y3 because they are the ordinates.
    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1]

    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2
    if (a) {
      T0 = T0 - b / (2 * a);
    }

    return sampleRate/T0;
  }

  return (
    <CustomAudioContext.Provider value={[state, dispatch]}>
      {props.children}
    </CustomAudioContext.Provider>
  );
};
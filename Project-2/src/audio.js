const NUM_SAMPLES = 128;

let audioElement;
let audioCtx;

let sourceNode; 
let biquadFilter;
let lowShelfBiquadFilter;
let distortionFilter;
let analyserNode;
let data;

let highshelf = false;
let lowshelf = false;
let distortion = false;

let distortionAmount = 20;

// init
function init(){
    audioElement = document.querySelector('audio');
        
    // 2 - create a new `AudioContext` object
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
    audioCtx = new (window.AudioContext || window.webkitAudioContext); // to support Safari and mobile

    // 3 - create a node that points at the <audio> element
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaElementSource
    sourceNode = audioCtx.createMediaElementSource(audioElement); 

    // https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
    biquadFilter = audioCtx.createBiquadFilter();
    biquadFilter.type = "highshelf";
    biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);

    lowShelfBiquadFilter = audioCtx.createBiquadFilter();
    lowShelfBiquadFilter.type = "lowshelf";
    lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    lowShelfBiquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);

    distortionFilter = audioCtx.createWaveShaper();

    // 4 - create a *analyser node*
    // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
    // this gets us real-time frequency and time-domain (i.e. waveform) information
    analyserNode = audioCtx.createAnalyser();

    // 5 - How many samples do we want? fft stands for Fast Fourier Transform
    analyserNode.fftSize = NUM_SAMPLES;

    // 6 - hook up the <audio> element to the analyserNode
    sourceNode.connect(biquadFilter);
    biquadFilter.connect(lowShelfBiquadFilter);
    lowShelfBiquadFilter.connect(distortionFilter);
    distortionFilter.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);

    // 8 - create a new array of 8-bit integers (0-255)
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
    data = new Uint8Array(analyserNode.frequencyBinCount); // OR analyserNode.fftSize/2

    // Chrome autoplay fix
    // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
    document.querySelector("audio").onplay = (e) => {
        if (audioCtx.state == "suspended") {
            audioCtx.resume();
        }
    };

}

//setupUI();


function setupUI(){
    // I. set the initial state of the high shelf checkbox
    document.querySelector('#highshelfCB').checked = highshelf; // `highshelf` is a boolean we will declare in a second
    
    // II. change the value of `highshelf` every time the high shelf checkbox changes state
    document.querySelector('#highshelfCB').onchange = e => {
        highshelf = e.target.checked;
        toggleHighshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
    };
    
    // III. 
    toggleHighshelf(); // when the app starts up, turn on or turn off the filter, depending on the value of `highshelf`!

    
    // I. set the initial state of the high shelf checkbox
    document.querySelector('#lowshelfCB').checked = lowshelf; // `highshelf` is a boolean we will declare in a second
    
    // II. change the value of `highshelf` every time the high shelf checkbox changes state
    document.querySelector('#lowshelfCB').onchange = e => {
        lowshelf = e.target.checked;
        toggleLowshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
    };
    
    // III. 
    toggleLowshelf(); // when the app starts up, turn on or turn off the filter, depending on the value of `highshelf`!


    // I. set the initial state of the high shelf checkbox
    document.querySelector('#distortionCB').checked = distortion; // `highshelf` is a boolean we will declare in a second
    
    // II. change the value of `highshelf` every time the high shelf checkbox changes state
    document.querySelector('#distortionCB').onchange = e => {
        distortion = e.target.checked;
        toggleDistortion(); // turn on or turn off the filter, depending on the value of `highshelf`!
    };
    
    // III. 
    toggleDistortion(); // when the app starts up, turn on or turn off the filter, depending on the value of `highshelf`!


    document.querySelector('#distortionSlider').value = distortionAmount;
    document.querySelector('#distortionSlider').onchange = e => {
        distortionAmount = Number(e.target.value);
        toggleDistortion();
    };

}

function toggleHighshelf(){
    if(highshelf){
        biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime); // we created the `biquadFilter` (i.e. "treble") node last time
        biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);
    }else{
        biquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

function toggleLowshelf(){
if(lowshelf){
lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
lowShelfBiquadFilter.gain.setValueAtTime(15, audioCtx.currentTime);
}else{
lowShelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
}
}

function toggleDistortion(){
if(distortion){
distortionFilter.curve = null; // being paranoid and trying to trigger garbage collection
distortionFilter.curve = makeDistortionCurve(distortionAmount);
}else{
distortionFilter.curve = null;
}
}

// from: https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
function makeDistortionCurve(amount=20) {
let n_samples = 256, curve = new Float32Array(n_samples);
for (let i =0 ; i < n_samples; ++i ) {
let x = i * 2 / n_samples - 1;

//curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));

//curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
//curve[i] =(Math.PI + 100 * x/2) / (Math.PI + 100 * Math.abs(x)); // nice distortion
//curve[i] = -(Math.PI + 100 * x/2) / (Math.PI + 50 * Math.abs(x));
//			
//curve[i] = Math.random() * 2 - 1;	// static!	
//curve[i] = x * 5 + Math.random() * 2 - 1; // adds a less intrusive static to the audio
curve[i] = x * Math.sin(x) * amount/5; // sounds like a cross between Donlad Duck and Cartman from South Park
//curve[i] = x * x - Math.tan(x) - .5 * x * 2 * Math.cos(x * 5);
}
return curve;
}

import * as midi from "/cmaj_api/cmaj-midi-helpers.js";

class ephemerides_View extends HTMLElement
{
    constructor (patchConnection)
    {
        super();
        this.patchConnection = patchConnection;
        this.classList = "main-view-element";
    }

    connectedCallback()
    {  

        const divisorSlider = this.querySelector("#divisorSlider");
        const volumeSlider = this.querySelector("#volumeSlider");
        const attackSlider = this.querySelector("#attackSlider");
        const releaseSlider = this.querySelector("#releaseSlider");
        const glideSlider = this.querySelector("#glideSlider");

        this.addRadialSlider(divisorSlider, "divisor");
        this.addRadialSlider(volumeSlider, "volume");
        this.addRadialSlider(attackSlider, "attack", 2);
        this.addRadialSlider(releaseSlider, "release", 2);
        this.addRadialSlider(glideSlider, "glide");

        

        //get algo element
        const algoSelectElement = this.querySelector('#algorithmSelect');

        //if the value is changed by midi for example
        this.algoListener = value => {
            algoSelectElement.value = value;
            console.log(value)
        }
        this.patchConnection.addParameterListener("algorithmSelect", this.algoListener);
        this.patchConnection.addEndpointListener("algorithmSelect", this.algoListener);

        algoSelectElement.addEventListener('change', (e) => {
            console.log("sending " + algoSelectElement.value )
            this.patchConnection.sendEventOrValue("algorithmSelect", algoSelectElement.value);
            this.updateEphemeris();
        })

        //get shape element
        const shapeSelectElement = this.querySelector('#shapeSelect');

        //if the value is changed by midi for example
        //idk why but the value is 4/3 the correct value
        // this.shapeListener = value => shapeSelectElement.value = (value * 3/4);
        this.patchConnection.addParameterListener("myShape", this.shapeListener);

        shapeSelectElement.addEventListener('change', (e) => {
            console.log("sending " + shapeSelectElement.value )
            this.patchConnection.sendEventOrValue("myShape", shapeSelectElement.value);
        })

        //numerator and denominator
        const topValueElement = this.querySelector('#topValue');
        const bottomValueElement = this.querySelector('#bottomValue');

        this.topValueListener = value => topValueElement.value = Math.floor(value);
        this.bottomValueListener = value => bottomValueElement.value = Math.floor(value);

        this.patchConnection.addParameterListener("topValue", this.topValueListener);
        this.patchConnection.addParameterListener("bottomValue", this.bottomValueListener);

        topValueElement.addEventListener("change", (e) => {
            this.patchConnection.sendEventOrValue("topValue", topValueElement.value);
            this.updateEphemeris();
        })
        bottomValueElement.addEventListener("change", (e) => {
            this.patchConnection.sendEventOrValue("bottomValue", bottomValueElement.value);
            this.updateEphemeris();
        });

        const droneElement = this.querySelector("#droneMode");
        this.droneListener = value => droneElement.checked = value;
        droneElement.addEventListener("change", (e) => {
            this.patchConnection.sendEventOrValue("droneMode", droneElement.checked);
        })

        //set base frequency
        this.setBaseFrequency();
        this.updateEphemeris();
        this.setDefaults();
        this.processMIDI();

        // this.allListener = value => console.log(value);
        // this.patchConnection.addAllParameterListener(this.allListener)

    }

    setDefaults() {        
        this.patchConnection.sendEventOrValue("algorithmSelect", this.querySelector("#algorithmSelect").value);
        this.patchConnection.sendEventOrValue("divisor", this.querySelector("#divisorInput").value);
        this.patchConnection.sendEventOrValue("topValue", this.querySelector("#topValue").value);
        this.patchConnection.sendEventOrValue("bottomValue", this.querySelector("#bottomValue").value);
        this.patchConnection.sendEventOrValue("attack", this.querySelector("#attack").value);
        this.patchConnection.sendEventOrValue("release", this.querySelector("#release").value);
        this.patchConnection.sendEventOrValue("glide", this.querySelector("#glide").value);
        this.patchConnection.sendEventOrValue("myShape", 0)
         
    }

    disconnectedCallback()
    {
        // When our element is removed, this is a good place to remove
        // any listeners that you may have added to the PatchConnection object.
        this.patchConnection.removeParameterListener("divisor", this.divisorListener);
        this.patchConnection.removeParameterListener("algorithmSelect", this.algoListener);
        this.patchConnection.removeParameterListener("myShape", this.shapeListener);
        //this is an issue
        this.patchConnection.removeParameterListener("volume", this.radialListener);
        this.patchConnection.removeParameterListener("topValue", this.topValueListener);
        this.patchConnection.removeParameterListener("bottomValue", this.bottomValueListener);
        this.patchConnection.removeParameterListener("droneMode", this.droneListener);
    }

    getHTML()
    {
        return `
        <body>
        <style>
        .main-view-element {
            background: black;
            display: block;
            width: 100%;
            height: 100%;
            padding: 10px;
            overflow: auto;
        }
        
        .param {
            display: inline-block;
            margin: 10px;
            width: 300px;
        }
        
        /* overall stuff */
        section {
            color: white;
        }
        
        h2, h3 {
            font-family: 'Verdana';
            font-weight: 400;
        }
        
        label {
            text-align: center;
            width: 100%;
            height: 30px;
            font-size: 20px;
            display: block;
            font-family: "verdana";
            padding: 8px;
            margin-bottom: 5px;
        }
        
        input[type="number"] {
            border: none;
            text-decoration: none;
            background: none;
            color: white;
            cursor: pointer;
        }
        
        hr {
            border: 1px solid white;
            width: 40%;
            margin: auto;
        }
        
        select {
            background: none;
            color: white;
            font-size: 15px;
            /* margin-top: 12px; */
            height: 40px;
            cursor: pointer;
        }
        
        /* Hide the browser's default checkbox */
        input[type="checkbox"] {
            position: absolute;
            top: 60px;
            left: 50px;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
        }
        
        /* Step 3: Create a custom checkbox */
        .checkmark {
            position: absolute;
            top: 54px;
            left: 42px;
            height: 50px;
            width: 50px;
            background-color: #000000;
            border-radius: 5px;
        }
            /* On mouse-over, add a grey background color */
        .checkmark:hover {
            background-color: #ccc;
        }
        
        /* Show the checkmark when checked */
        .checkmark:after {
            display: block;
        }
        
        
        /* Step 6: Create the checkmark/indicator (hidden when not checked) */
        .checkmark:after {
        content: "";
        position: absolute;
        display: none;
        }
        
        /* Step 7: Display the checkmark when checked */
        .droneContainer input:checked ~ .checkmark:after {
        display: block;
        }
        
            /* Style the checkmark/indicator */
            .checkmark:after {
        left: 15px;
        top: 5px;
        width: 15px;
        height: 30px;
        border: solid white;
        border-width: 0 3px 3px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
        }
        
        .droneContainer {
        display: block;
        position: relative;
        margin-bottom: 12px;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        }
        
        
        .main-view-element{
            background: rgb(2,0,36);
            background: linear-gradient(171deg, rgba(2,0,36,1) 0%, rgba(49,27,65,1) 35%, rgb(59, 59, 59) 68%, rgb(41, 41, 41) 100%);
        
        }
        
        .selectContainer {
            font-family: "Verdana";
            font-size: 14px;
            padding: 20px;
        }
        
        /* classes */
        .panel {
            color: white;
            border: 1px solid #ffffff88;
            /* padding: 8px; */
            border-radius: 5px;
            background-color: #ffffff22;
        }
        
        .hflex {
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            margin: auto;
            /* width: 75%; */
        }
        
        .vflex {
            display: flex;
            flex-direction: column;
            justify-content: start;
        }
        
            .radialSlider input {
            width: 100%;
            text-align: center;
            font-size: 20px;
            font-family: "verdana";
            padding: 8px;
        }
        
        
        .radialSVG circle {
            fill: #000;
            stroke-width: 1px;
            stroke: #fff;
        }
        
        .radialSVG {
            /* width: 10%; */
            filter: drop-shadow(0px 0px 10px rgb(255 255 255 / 0));
            margin: auto;
            cursor: pointer;
        }
        
        .radialSVG line {
        stroke-width: 1px;
        stroke: #fff;
        transform-origin: center center;        
        }
        
        .fraction {
            margin-top: 10px;
            margin-bottom: 10px;
            /* padding: 8px; */
            font-size: 25px;
            line-height: 28px;
        }
        
        .staticFraction {
            padding: 8px;
        }
        
        .inputFraction {
            padding: 8px 8px 8px 20px;
        }
        .referenceDiv {
            padding: 11px;
            margin-bottom: 20px;
        }
        .reference {
            /* width: 20%; */
            height: 400px;
            text-align: center;
            padding: 20px;
        }
        
        .midiRef {
            padding: 15px;
            font-size: 30px;
        }
        
        .hspacing {
            column-gap: 20px;
        }
        
        .gridChild {
            font-size: 16px;
            padding-left: 10px;
            padding-right: 10px;
            height: 80px;
            line-height: 40px;
        }
        
        #title {
            line-height: 150px;
            height: 90%;
            font-size:75px;
            font-family: "Great Vibes", cursive;
            filter: drop-shadow(0px 0px 10px rgb(255 255 255 / 0.7));
        }
        
        /* individual elements */
        #outerContainer {
            height: 100%;
            max-width: 1200px;
            min-height: 700px;
            /* background-image: url('./Untitled.png'); */
        
            background-position: 50%;
            background-repeat: repeat;
            background-size: cover;
            background-attachment: scroll;
            border-radius: 0;
        }
        
        
        
        #gridContainer {
            width: 60%;
            column-gap: 15px;
            row-gap: 15px;
            text-align: center;
            align-content: space-around;
            padding: 9px;
            height: 400px;
            flex-wrap: wrap;
        }
        
        #midiListen {
            margin-top: 30px;
            padding: 30px 10px 30px 10px;
        }
        
        #midiListen select {
            font-size: 20px;
        }
        
        #midiP {
            padding: 10px;
            font-size: 25px;
        }
        
        .numDiv {
            margin-bottom: 5px;
        }
        
        #denominatorDiv {
            margin-top: 5px;
            margin-bottom: 20px;
        }
        
        
        
        #synthSection {
            margin-top: 15px;
            margin-bottom: 10px;
        }
        
        #ephemeridesSection {
            margin-top: 15px;
        }
        
        #octaveContainer {
            margin-top: 30px;
        }
        </style>
        <link rel="stylesheet" href="styles.css">
        <div id="outerContainer">
            <section id="headerSection">
                <div class="hflex">
                    <div class="panel">
                        <label for="algorithmSelect">Algorithm</label>
                        <div class="selectContainer">
                            <select id="algorithmSelect">
                                <option selected="selected" value="0">Arithmetic</option>
                                <option value="1">Ratio</option>
                                <option value="2">Tet</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <h1 id="title">Ephemerides</h1>
                    </div>
                    <div id="divisorSlider" class="radialSlider panel">
                        <label class="radialLabel" for="inputValue">Divisor</label>
                        <svg class="radialSVG" viewBox="0 0 30 30">
                          <circle r="45%" cx="50%" cy="50%"/>
                          <line x1="50%" y1="50%" x2="10%" y2="70%" class="pointer" />
                        </svg>
                        <input type="number" id="divisorInput" min="2" max="24" step="1" value="7">
                    </div> 
                </div>
            </section>
            <section id="ephemeridesSection">
                <div class="hflex hspacing">
                    <div class="panel vflex reference">
                        <div class="referenceDiv">
                            <h2>Reference</h2>
                        </div>
                        <div class="panel">
                            <h3 class="fraction staticFraction">1</h3>
                            <hr/>
                            <h3 class="fraction staticFraction">1</h3>
                        </div>
                        <div id="midiListen" class="panel">
                            <div id="midiSelection">
                                <select id="noteName">
                                    <option selected="selected" value="1">C</option>
                                    <option value="2">C#</option>
                                    <option value="3">D</option>
                                    <option value="4">D#</option>
                                    <option value="5">E</option>
                                    <option value="6">F</option>
                                    <option value="7">F#</option>
                                    <option value="8">G</option>
                                    <option value="9">G#</option>
                                    <option value="10">A</option>
                                    <option value="11">A#</option>
                                    <option value="12">B</option>
                                </select>
                                <select id="octave">
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option selected="selected" value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                                    <option value="10">10</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div id="gridContainer" class="panel hflex">
                    </div>
                    <div class="panel vflex reference">
                        <h2 class="referenceDiv">Octave</h2>
                        <div id="octaveDiv">
                            <div class="panel">
                                <input id="topValue" class="fraction inputFraction" type="number" min="1" max="24" value="2" step="1">
                                <hr/>
                                <input id="bottomValue" class="fraction inputFraction" type="number" min="1" max="24" value="1" step="1">
                            </div>
                            <div id="octaveContainer" class="panel">
                                <p id="octaveString" class="midiRef">A3</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section id="synthSection">
                <div class="hflex hspacing">
                    <div id="volumeSlider" class="radialSlider panel">
                        <label class="radialLabel" for="volume">Volume</label>
                        <svg class="radialSVG" viewBox="0 0 30 30">
                            <circle r="45%" cx="50%" cy="50%"/>
                            <line x1="50%" y1="50%" x2="10%" y2="70%" class="pointer" />
                          </svg>
                        <input id="volume" type="number" min="-60" max="0" step="1" value="-10"/>
                    </div>
                    <div id="attackSlider" class="radialSlider panel">
                        <label class="radialLabel" for="attack">Attack</label>
                        <svg class="radialSVG" viewBox="0 0 30 30">
                            <circle r="45%" cx="50%" cy="50%"/>
                            <line x1="50%" y1="50%" x2="10%" y2="70%" class="pointer" />
                          </svg>
                        <input id="attack" type="number" min="0" max="1" step="0.01" value="0.05"/>
                    </div>
                    <div id="releaseSlider" class="radialSlider panel">
                        <label class="radialLabel" for="release">Release</label>
                        <svg class="radialSVG" viewBox="0 0 30 30">
                            <circle r="45%" cx="50%" cy="50%"/>
                            <line x1="50%" y1="50%" x2="10%" y2="70%" class="pointer" />
                          </svg>
                        <input id="release" type="number" min="0" max="4" step="0.01" value="0.7"/>
                    </div>
                    <div id="glideSlider" class="radialSlider panel">
                        <label class="radialLabel" for="glide">Glide</label>
                        <svg class="radialSVG" viewBox="0 0 30 30">
                            <circle r="45%" cx="50%" cy="50%"/>
                            <line x1="50%" y1="50%" x2="10%" y2="70%" class="pointer" />
                          </svg>
                        <input id="glide" type="number" min="1" max="100" step="1" value="1"/>
                    </div>
                    <div id="droneToggle" class="panel">
                        <label class="droneContainer">Drone Mode
                            <input id="droneMode" type="checkbox">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="panel">
                        <label for="shapeSelect">Wave Shape</label>
                        <div class="selectContainer">
                            <select id="shapeSelect">
                                <option selected="selected" value="0">Sine</option>
                                <option value="1">Square</option>
                                <option value="2">Sawtooth</option>
                                <option value="3">Triangle</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </body>    
        `
    }

    addRadialSlider(radial, endpoint, step=0) {

        //assuming a certain html structure
        const pointer = radial.querySelector("line")
        const inputElement= radial.querySelector("input");
        const svgElement = radial.querySelector("svg");

        let mouseStartY = 0;
        let dragging = false;
        let newValue;
        const minimum = parseFloat(inputElement.min);
        const range = parseFloat(inputElement.max) - parseFloat(inputElement.min);
        const height = 80;
        const scalingFactor = range / height;

        const  endDrag = (e) => {
            if(dragging) dragging = false;
            prevValue = newValue;
        }

        const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
        
        const updateDial = (newValue) => {
            console.log(newValue)
            const deg  =  newValue * 225 / range;
            const percent = newValue * 0.75 / range;
            pointer.style = `transform: rotateZ(${deg}deg)`;
            svgElement.style = `filter: drop-shadow(0px 0px 20px rgb(255 255 255 / ${percent}))`;
            this.patchConnection.sendEventOrValue(endpoint, inputElement.value);
            console.log("sending", inputElement.value)

            if(endpoint == "divisor") {
                this.updateEphemeris();
                this.setBaseFrequency();
            }
        }

        //init
        let prevValue = inputElement.value - minimum;
        updateDial(prevValue);


        radial.addEventListener('mousemove', (e) => {
            const offsetY = mouseStartY - e.clientY;
            //let's say 10px is one unit
            //take input value and adjust it
           
            const newValueOffset  = offsetY * scalingFactor;

            //clamp and rounding functions
            newValue = clamp(newValueOffset+prevValue, 0, range);
            newValue = parseFloat(newValue.toFixed(step));

            if(dragging){
                // console.log(newValue = " is new value")
                inputElement.value = newValue + minimum;
                updateDial(newValue);
            }
        });
        
        radial.addEventListener('mousedown', (e) => {
            mouseStartY = e.clientY;
            dragging = true;
        })
        
        radial.addEventListener('mouseup', endDrag);
        radial.addEventListener('mouseleave', endDrag);

        // Create a listener for the divisorInput endpoint, so that when it changes, we update our slider..
        this.radialListener = value => inputElement.value = value;
        this.endpointListener = value => console.log("end" + value);
        this.patchConnection.addParameterListener (endpoint, this.radialListener);
        this.patchConnection.addEndpointListener(endpoint, this.endpointListener);

        // Now request an initial update, to get our slider to show the correct starting value:
        this.patchConnection.requestParameterValue(endpoint);
        //if controlling from input
        inputElement.addEventListener('change', (e) => {
            prevValue = e.target.value - minimum;
            updateDial(e.target.value - minimum); 
        })

    }

    updateEphemeris() {

        const divisor = parseFloat(this.querySelector("#divisorInput").value);
        const topValue = parseFloat(this.querySelector("#topValue").value);
        const bottomValue = parseFloat(this.querySelector("#bottomValue").value);
        const algorithm = parseFloat(this.querySelector("#algorithmSelect").value);

        const calculateRatio = (midiIndex) => {
            let ratio = 1;
    
            if (algorithm == 0) {
                ratio = ((midiIndex * (topValue - bottomValue)) / divisor) + bottomValue;
            } else if (algorithm == 1) {
                ratio =  (midiIndex) * (topValue/bottomValue) / divisor;
            } else if (algorithm == 2) {
                ratio = Math.pow( Math.pow(topValue / bottomValue, 1 / divisor), midiIndex);
            }
        
            return ratio.toFixed(3);
        }

        const numChildren = divisor + 1;

        const gridElement = this.querySelector("#gridContainer");

        //clear before recalculating
        gridElement.innerHTML = "";

        for(let i = 0; i < numChildren; i++) {
            let ratio = calculateRatio(i);
            let noteName = this.getMidiNoteStringFromHTML(i);
            const child = document.createElement("div");
            child.classList.add("panel", "gridChild");
            child.innerHTML = noteName + "<br/>" + ratio;
            gridElement.appendChild(child);
        }

    }

    getMidiNoteStringFromHTML(offset = 0) {
        const noteNameElement = this.querySelector('#noteName');
        const octaveElement = this.querySelector('#octave');
       
        const noteToString = (noteIndex, octave) => {
            let midiNote = 11 + parseFloat(octave)*12 + parseFloat(noteIndex);
            midiNote += parseFloat(offset);
            const oct = Math.floor(midiNote / 12) - 1;
            const note = "C C#D D#E F F#G G#A A#B ".substr((midiNote % 12) * 2, 2);

            //return as string
            return note + oct;
        }

        const midiString = noteToString(noteNameElement.value, octaveElement.value);

        return midiString;
        
    }

    setBaseFrequency() {
        //numerator and denominator
        const noteNameElement = this.querySelector('#noteName');
        const octaveElement = this.querySelector('#octave');
        const noteToFrequency = (noteIndex, octave) => {
            //converts to a number between 0 and 127
            const midiNote = 11 + parseFloat(octave)*12 + parseFloat(noteIndex);

            //converts to a frequency value
            const baseFrequency = 440 * Math.pow(2, ((midiNote - 69) / 12));
            return baseFrequency;
        }

        this.noteNameListener = value => noteNameElement.value = Math.floor(value);
        this.octaveListener = value => octaveElement.value = Math.floor(value);

        this.patchConnection.addParameterListener("noteName", this.noteNameListener);
        this.patchConnection.addParameterListener("octave", this.octaveListener);

        const divisor = this.querySelector("#divisorInput").value;
        const newOctave = this.getMidiNoteStringFromHTML(divisor);
        this.querySelector("#octaveString").innerHTML = newOctave;

        noteNameElement.addEventListener("change", (e) => {
            const newBaseFrequency = noteToFrequency(noteNameElement.value, octaveElement.value);

            this.patchConnection.sendEventOrValue("baseFrequency", newBaseFrequency);
            console.log(newBaseFrequency)

            const newOctave = this.getMidiNoteStringFromHTML(divisor);
            this.querySelector("#octaveString").innerHTML = newOctave;

            this.updateEphemeris();
        })
        octaveElement.addEventListener("change", (e) => {
            const newBaseFrequency = noteToFrequency(noteNameElement.value, octaveElement.value);
            this.patchConnection.sendEventOrValue("baseFrequency", newBaseFrequency);

            const newOctave = this.getMidiNoteStringFromHTML(divisor);
            this.querySelector("#octaveString").innerHTML = newOctave;
            this.updateEphemeris();
        }); 
    }

    processMIDI() {
        console.log("process midi")

        let framesPerCallback = 10;

        const range = (x, min1, max1, min2, max2) => {
            return (x * (max2-min2) / (max1-min1)) + min2;
        }

        const midiListener = (input) => {

            const message = input.message;

            //if it's a controller value
            if (midi.isController(message)) {
                const controlNumber = midi.getControllerNumber(message);
                const controlValue = midi.getControllerValue(message);

                // console.log("number " + controlNumber + " . value " + controlValue);

                //update values of input elements
                switch(controlNumber) {
                    case 0:
                        let vol = this.querySelector("#volume");
                        let newVol = range(controlValue, 0, 127, parseFloat(vol.min), parseFloat(vol.max));
                        vol.value = newVol;
                        vol.dispatchEvent(new Event("change"));
                        break;
                    case 1:
                        let shape = this.querySelector("#shapeSelect");
                        let newShape = Math.floor(range(controlValue, 0, 127, 0, 3))
                        shape.value = newShape;
                        shape.dispatchEvent(new Event("change"));
                        break;
                    case 2:
                        let attack = this.querySelector("#attack");
                        let newAttack = range(controlValue, 0, 127, parseFloat(attack.min), parseFloat(attack.max));
                        attack.value = newAttack;
                        attack.dispatchEvent(new Event("change"));
                        break;
                    case 5:
                        let release = this.querySelector("#release");
                        let newRelease = range(controlValue, 0, 127, parseFloat(release.min), parseFloat(release.max));
                        release.value = newRelease;
                        release.dispatchEvent(new Event("change"));
                        break;
                    case 6:
                        let algo = this.querySelector("#algorithmSelect");
                        let newAlgo = Math.floor(range(controlValue, 0, 127, 0, 2.9));
                        algo.value = newAlgo;
                        algo.dispatchEvent(new Event("change"));
                        break;
                    case 7:
                        let numer = this.querySelector("#topValue");
                        numer.value = range(controlValue, 0, 127, parseFloat(numer.min), parseFloat(numer.max));
                        numer.dispatchEvent(new Event("change"));
                        break;
                    case 8:
                        let denom = this.querySelector("#bottomValue");
                        denom.value = range(controlValue, 0, 127, parseFloat(denom.min), parseFloat(denom.max));
                        denom.dispatchEvent(new Event("change"));
                        break;
                    case 9:
                        let div = this.querySelector("#divisorInput");
                        div.value = range(controlValue, 0, 127, parseFloat(div.min), parseFloat(div.max));
                        div.dispatchEvent(new Event("change"));
                        break;
                    case 10:
                        let glide = this.querySelector("#glide");
                        glide.value = range(controlValue, 0, 127, parseFloat(glide.min), parseFloat(glide.max));
                        glide.dispatchEvent(new Event("change"));
                        break;
                    case 11:
                        let noteName = this.querySelector("#noteName");
                        let oct = this.querySelector("#octave");
                        noteName.value = (parseInt(controlValue) % 12) + 1;
                        oct.value = Math.floor(controlValue/12);
                        noteName.dispatchEvent(new Event("change"));
                        oct.dispatchEvent(new Event("change"));
                        break;
                    case 12:
                        let droneMode = this.querySelector("#droneMode");
                        droneMode.checked = range(controlValue, 0, 127, 0, 1) > 0.5;
                        droneMode.dispatchEvent(new Event("change"));
                        break;
                    default:
                        break;
                }
            } else {
                console.log(midi.getMIDIDescription(message))
            }
        }

        this.patchConnection.addEndpointListener("midiOut", midiListener, framesPerCallback);

    }



    onPatchStatusChanged = function (buildError, manifest, inputEndpoints, outputEndpoints)
    {
        if (buildError)
            status_message.innerHTML = escapeHTML (buildError);
        else
            status_message.innerHTML = "";

        console.log("patchStatusChanged")

        // refreshTitle (manifest);
        // refreshInputControls (inputEndpoints);
        // refreshOutputControls (outputEndpoints);
    };
}

window.customElements.define ("ephemerides-view", ephemerides_View);

export default async function createPatchView (patchConnection)
{
    const myView = new ephemerides_View (patchConnection);
    myView.innerHTML = myView.getHTML();
    return myView;
}

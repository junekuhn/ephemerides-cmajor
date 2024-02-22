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
        this.algoListener = value => algoSelectElement.value = value;
        this.patchConnection.addParameterListener("algorithmSelect", this.algoListener);

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

    async getHTML()
    {
        const myhtml = await fetch('../component.html');
        const text  = await myhtml.text();
        return text;
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
        this.patchConnection.addParameterListener (endpoint, this.radialListener);

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
            const child = document.createElement("div");
            child.classList.add("panel", "gridChild");
            child.innerHTML = ratio;
            gridElement.appendChild(child);
        }

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

        noteNameElement.addEventListener("change", (e) => {
            const newBaseFrequency = noteToFrequency(noteNameElement.value, octaveElement.value);
            this.patchConnection.sendEventOrValue("baseFrequency", newBaseFrequency);
            console.log(newBaseFrequency)
        })
        octaveElement.addEventListener("change", (e) => {
            const newBaseFrequency = noteToFrequency(noteNameElement.value, octaveElement.value);
            this.patchConnection.sendEventOrValue("baseFrequency", newBaseFrequency);
        }); 
    }

    midiNumberToString(midiNumber) {
        const octave = Math.floor(midiNumber / 12) - 1;
        const note = "C C#D D#E F F#G G#A A#B ".substring((midiNumber % 12) * 2, 2);
        return note + octave;
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
    myView.innerHTML = await myView.getHTML();
    return myView;
}

import * as midi from "/cmaj_api/cmaj-midi-helpers.js";

/*
    This simple web component just manually creates a set of plain sliders for the
    known parameters, and uses some listeners to connect them to the patch.
*/
class ephemerides_View extends HTMLElement
{
    constructor (patchConnection)
    {
        super();
        this.patchConnection = patchConnection;
        this.classList = "main-view-element";
        // this.innerHTML = this.getHTML();
        console.log ("MIDI message: " + midi.getMIDIDescription (0x924030));
    }

    connectedCallback()
    {  
        this.addRadialSlider();

        //get algo element
        const algoSelectElement = this.querySelector('#algorithmSelect');


        //the the value is changed by midi for example
        this.algoListener = value => algoSelectElement.value = value;
        this.patchConnection.addParameterListener("algorithmSelect", this.algoListener);

        algoSelectElement.addEventListener('change', (e) => {
            console.log("sending " + algoSelectElement.value )
            this.patchConnection.sendEventOrValue("algorithmSelect", algoSelectElement.value);
        })





    }

    disconnectedCallback()
    {
        // When our element is removed, this is a good place to remove
        // any listeners that you may have added to the PatchConnection object.
        this.patchConnection.removeParameterListener("divisor", this.divisorListener);
        this.patchConnection.removeParameterListener("algorithmSelect", this.algoListener);
    }

    async getHTML()
    {
        const myhtml = await fetch('../component.html');
        const text  = await myhtml.text();
        return text;
    }

    addRadialSlider() {

        const radial = this.querySelector(".radialSlider");
        const pointer = this.querySelector(".radialSlider line")
        const inputElement= this.querySelector(".radialSlider input");
        const svgElement = this.querySelector(".radialSlider svg");

        let mouseStartY;
        let dragging = false;
        let newValue;
        const minimum = 2;
        const range = 22;
        const  endDrag = (e) => {
            if(dragging) dragging = false;
            prevValue = newValue;
        }

        const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
        
        const updateDial = (newValue) => {
            const deg  =  newValue * 225 / range;
            const percent = newValue * 0.75 / range;
            pointer.style = `transform: rotateZ(${deg}deg)`;
            svgElement.style = `filter: drop-shadow(0px 0px 20px rgb(255 255 255 / ${percent}))`;
            this.patchConnection.sendEventOrValue ("divisor", inputElement.value);
            console.log("sending", inputElement.value)
        }

        //init
        let prevValue = inputElement.value - minimum;
        updateDial(prevValue);


        radial.addEventListener('mousemove', (e) => {
            const offsetY = mouseStartY - e.clientY;
            //let's say 10px is one unit
            //take input value and adjust it
            const newValueOffset  = Math.floor(offsetY * 0.4);
            newValue = clamp(newValueOffset+prevValue, 0, range);
            if(dragging){
            updateDial(newValue);
            inputElement.value = newValue + minimum;
            }
        });
        
        radial.addEventListener('mousedown', (e) => {
            mouseStartY = e.clientY;
            dragging = true;
        })
        
        radial.addEventListener('mouseup', endDrag);
        radial.addEventListener('mouseleave', endDrag);



        

        
        // Create a listener for the divisorInput endpoint, so that when it changes, we update our slider..
        this.divisorListener = value => inputElement.value = value;
        this.patchConnection.addParameterListener ("divisor", this.divisorListener);

        // Now request an initial update, to get our slider to show the correct starting value:
        this.patchConnection.requestParameterValue("divisor");
        //if controlling from input
        inputElement.addEventListener('change', (e) => {
            prevValue = e.target.value - minimum;
            updateDial(e.target.value - minimum); 
            this.patchConnection.sendEventOrValue ("divisor", inputElement.value);
            console.log("sending", inputElement.value)
        })

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

/* This is the function that a host (the command line patch player, or a Cmajor plugin
   loader, or our VScode extension, etc) will call in order to create a view for your patch.

   Ultimately, a DOM element must be returned to the caller for it to append to its document.
   However, this function can be `async` if you need to perform asyncronous tasks, such as
   fetching remote resources for use in the view, before completing.
*/
export default async function createPatchView (patchConnection)
{
    const myView = new ephemerides_View (patchConnection);
    myView.innerHTML = await myView.getHTML();
    // myView.addInteractivity();
    return myView;
}

import * as midi from "/cmaj_api/cmaj-midi-helpers.js"

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
        this.innerHTML = this.getHTML();
        console.log ("MIDI message: " + midi.getMIDIDescription (0x924030));

    }

    connectedCallback()
    {
        // When the HTMLElement is shown, this is a good place to connect
        // any listeners you need to the PatchConnection object..

        // First, find our divisorInput slider:
        const divisorInput = this.querySelector ("#divisorInput");

        // When the slider is moved, this will cause the new value to be sent to the patch:
        divisorInput.onchange = () => {
            this.patchConnection.sendEventOrValue ("divisor", divisorInput.value);
            console.log("sending", divisorInput.value)
            this.patchConnection.sendEventOrValue("myShape", 2);
        }


        // Create a listener for the divisorInput endpoint, so that when it changes, we update our slider..
        this.divisorListener = value => divisorInput.value = value;
        this.patchConnection.addParameterListener ("Divisor", this.divisorListener);

        // Now request an initial update, to get our slider to show the correct starting value:
        this.patchConnection.requestParameterValue ("Divisor");
        



    }

    disconnectedCallback()
    {
        // When our element is removed, this is a good place to remove
        // any listeners that you may have added to the PatchConnection object.
        this.patchConnection.removeParameterListener ("Divisor", this.divisorListener);
    }

    getHTML()
    {
        return `
        <style>
            .main-view-element {
                background: #bcb;
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
        
            /* classes */
            .panel {
                border: 1px solid #fff;
                border-radius: 5px;
                margin: 0px;
                padding: 15px;
            }
        
            .hflex {
                display: flex;
                flex-direction: row;
            }
            /* individual elements */
            #outerContainer {
                height: 100%;
                max-width: 1200px;
                min-height: 700px;
                background-image: url('./Untitled.png');
                background-position: 50%;
                background-repeat: repeat;
                background-size: cover;
                background-attachment: scroll;
                border-radius: 0;
            }
            
        </style>

        <div id="outerContainer">
            <section id="headerSection">
                <div class="hflex">
                    <div class="panel">
                        <label for="algorithmSelect">Algorithm</label>
                        <select id="algorithmSelect"></select>
                    </div>
                    <div>
                        <h1>Ephemerides</h1>
                    </div>
                    <div class="panel">
                        <label for="divisorInput">Divisor</label>
                        <input id="divisorInput" type="range" min="2" max="24" step="1"></input>
                    </div>
                </div>
            </section>
            <section id="ephemeridesSection"></section>
            <section id="synthSection"></section>
        </div>  
        `;
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
export default function createPatchView (patchConnection)
{
    return new ephemerides_View (patchConnection);
}

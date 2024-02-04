class radialSlider {
    constructor() {
        const radial = document.querySelector("#radial");
        const pointer = document.querySelector("#pointer ")
        const inputElement= document.querySelector("#inputValue");
        const svgElement = document.querySelector('svg');


        let mouseStartX, mouseStartY;
        let dragging = false;
        let newValue;
        const minimum = 2;
        const range = 22;

        //init
        let prevValue = inputElement.value - minimum;
        updateDial(prevValue);
    }
}


const radial = document.querySelector("#radial");
const pointer = document.querySelector("#pointer ")
const inputElement= document.querySelector("#inputValue");
const svgElement = document.querySelector('svg');
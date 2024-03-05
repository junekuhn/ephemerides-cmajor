export default function myWorker (patchConnection)
{
    patchConnection.addStatusListener ((status) => console.log (status));
    patchConnection.requestStatusUpdate();

    // setTimeout (() => { patchConnection.sendEventOrValue ("divisor", 12); }, 2000);
}
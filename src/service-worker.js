importScripts('./ngsw-worker.js');



self.addEventListener('sync', (event) => {
    if (event.tag === "post-data") {

        // call method
        event.waitUntil(addData());
    }
})


function addData() {
    // indexedDB

    let obj = {
        name: 'Alvin'
    }

    fetch('http://localhost:3000/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj),
    }).then(() => Promise.resolve()).catch(() => Promise.reject());
}
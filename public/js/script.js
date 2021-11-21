const video = document.getElementById('videoInput')
// const faceapi= require('face-api.js')
// function GFG_Fun() {
                  
//     // Create anchor element.
//     var a = document.createElement('a'); 
      
//     // Create the text node for anchor element.
//     var link = document.createTextNode("This is link");
      
//     // Append the text node to anchor element.
//     a.appendChild(link); 
      
//     // Set the title.
//     a.title = "This is Link"; 
      
//     // Set the href property.
//     a.href = "https://www.geeksforgeeks.org"; 
      
//     // Append the anchor element to the body.
//     document.body.appendChild(a); 
// }



Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
]).then(start)

function start() {
    // document.body.append('Models Loaded')
    
    navigator.getUserMedia(
        { video:{} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
    console.log('webcam started')
    //video.src = '../videos/speech.mp4'
    recognizeFaces()
}

async function recognizeFaces() {

    const labeledDescriptors = await loadLabeledImages()
    console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)


    video.addEventListener('play', async () => {
        // windows.alert('Webcam Started');
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)

        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)

        

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()

            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

            const results = resizedDetections.map( (d) => {
                return faceMatcher.findBestMatch(d.descriptor)
            })
            // if(d.descriptior!= 'Unknown')
            // {
                
            // }
            results.forEach( (result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
            })
        }, 100)
        const link = document.createElement('a'); // generate node
    link.setAttribute('href', '#');         // set attribute
        link.textContent = 'Profile Page';               // assign some text
        const element= document.getElementById('ProfileID')
        document.body.append(a);
         
    })
}


function loadLabeledImages() {
    const labels = ['Black Widow', 'Captain America', 'Hawkeye' , 'Jim Rhodes', 'Tony Stark', 'Thor', 'Captain Marvel']
    // const labels = ['Tony Stark'] // for WebCam
    return Promise.all(
        labels.map(async (label)=>{
            const descriptions = []
            for(let i=1; i<=2; i++) 
            {
                const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                console.log(label + i + JSON.stringify(detections))
                descriptions.push(detections.descriptor)
            }
            // document.body.append(label+' Faces Loaded | ')
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}
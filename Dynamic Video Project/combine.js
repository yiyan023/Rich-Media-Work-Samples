const videos = [
    './public/frag-videos/rm-video-0.mp4',
    './public/frag-videos/rm-video-1.mp4',
    './public/frag-videos/rm-video-2.mp4',
    './public/frag-videos/rm-video-3.mp4',
    './public/frag-videos/rm-video-4.mp4'
]

const videoChunks = []

var videoElement = document.createElement('video');
videoElement.controls = true;
document.body.appendChild(videoElement);
videoElement.loop = true;
videoElement.muted = true;
videoElement.style.width = "50vw";
videoElement.style.height = "auto";

var mediaSource = new MediaSource();
videoElement.src = URL.createObjectURL(mediaSource);

function waitForSourceBuffer(sourceBuffer) {
    return new Promise((resolve, reject) => {
        function checkUpdating() {
            if (!sourceBuffer.updating) {
                console.log("SourceBuffer has successfully updated");
                resolve();
            } else {
                setTimeout(checkUpdating, 50); // Check again after 50ms
            }
        }
        checkUpdating();
    })
}

mediaSource.addEventListener('sourceopen', async function() {
    if (mediaSource.readyState !== 'open') {
        console.error('MediaSource is not open');
        return;
    }

    const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.4d4029, mp4a.40.2"')
    sourceBuffer.mode = "sequence";

    for (const video of videos) {
        try {
            const videoBlob = await (await(fetch(video))).blob()
            const videoBuffer = await videoBlob.arrayBuffer();
            videoChunks.push(videoBuffer);
        } catch (error) {
            console.log(error)
        }
    }

    while (videoChunks.length > 0) {
        await waitForSourceBuffer(sourceBuffer);
        console.log(mediaSource.readyState);
        sourceBuffer.appendBuffer(videoChunks.shift())
        console.log(videoChunks)
        console.log(mediaSource.readyState)
    }

    await waitForSourceBuffer(sourceBuffer);
    mediaSource.endOfStream();
    videoElement.play();
}) 

import MP4Box, { DataStream } from 'mp4box'
import { Muxer, ArrayBufferTarget } from "./node_modules/mp4-muxer/build/mp4-muxer.mjs";

// initialize
let mp4boxfile = MP4Box.createFile();
let video = document.getElementById('rich-media');

let canvas = document.createElement('canvas');
canvas.width = video.width;
canvas.height = video.height;
let ctx = canvas.getContext('2d');

let config = null;
let decoder = null;

let sampleCounter = 0;
let frameCounter = 0;

// encoder configurations:
// initialize encoder & configurations
let muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width: canvas.width,
      height: canvas.height
    },
  
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset'
  })
  
const init = {
output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
error: (e) => {
    console.log(e.message)
}
}
  
const encoderConfig = {
    codec: "avc1.42E01E", // compress / decompress data
    width: canvas.width,
    height: canvas.height,
    bitrate: 1000000, // number of bits processed per sec
    framerate: 25, // fps
}

const encoder = new VideoEncoder(init);
encoder.configure(encoderConfig);

// catch errors
mp4boxfile.onError = function(e) {
    console.log("error", e);
}

function description(track) {
    const trackFile = mp4boxfile.getTrackById(track.id);
    const box = trackFile.mdia.minf.stbl.stsd.entries[0].avcC;

    if (box) {
        const stream = new DataStream(undefined, null, DataStream.BIG_ENDIAN);
        box.write(stream)
        return new Uint8Array(stream.buffer, 8);
    }
}

// add text to video:
function draw() {
    const text = "Welcome to Rich Media"
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

// render encoded frames onto a new video (with the new text):
async function decodeAndRender() {
    await decoder.flush();
    await encoder.flush(); // video data has been processed
    muxer.finalize();
  
    let buffer = muxer.target.buffer;
    let blob = new Blob([buffer])
  
    let url = window.URL.createObjectURL(blob)
    let video = document.createElement('video')
    video.src = url
    video.controls = true;
    document.body.appendChild(video)
}

// extract files from a sample
mp4boxfile.onReady = async function (info) {
	const track = info.videoTracks[0];

    config = {
        codec: track.codec,
        codedHeight: track.video.height,
        codedWidth: track.video.width,
        description: description(track)
    }

    decoder = new VideoDecoder({
        output (frame) {
            //console.log(frame.timestamp)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

            draw();

            let newFrame = new VideoFrame(canvas, {
                timestamp: frameCounter * 1000000 / 24,
                duration: 1000000 / 24
            })

            frameCounter++;
            const keyFrame = sampleCounter % 150 == 0;
            encoder.encode(newFrame, { keyFrame })

            frame.close();
            newFrame.close();
        },
        error (e) {
            console.log("Error:", e);
        }
    })

    decoder.configure(config);
    mp4boxfile.setExtractionOptions(track.id);
    mp4boxfile.start(); // extraction is starting
    decodeAndRender();
}

// when samples are ready to be passed for extraction
mp4boxfile.onSamples = function (id, user, samples) {
    for (const sample of samples) {
        const chunk = new EncodedVideoChunk({
            type: sampleCounter % 150 ? "delta" : "key",
            timestamp: sampleCounter * 1000000  / 30,
            duration: 1000000 / 30,
            data: sample.data
        })

        sampleCounter++;
        decoder.decode(chunk);
    }

}

// appending data to the MP4Box for demuxing
const res = await fetch("/rm-video_no-text.mp4");
const buffer = await res.arrayBuffer();
buffer.fileStart = 0;
mp4boxfile.appendBuffer(buffer);
mp4boxfile.flush();

function renderAnimation() {
    ctx.drawImage(pending, 0, 0, canvas.width, canvas.height);
    pending.close();
    pending = null;
}

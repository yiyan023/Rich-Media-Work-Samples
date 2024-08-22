import { Muxer, ArrayBufferTarget } from "./node_modules/mp4-muxer/build/mp4-muxer.mjs";

let canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let frameCounter = 0;
let intervalID = 0;

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

const config = {
  codec: "avc1.42E01E", // compress / decompress data
  width: canvas.width,
  height: canvas.height,
  bitrate: 1000000, // number of bits processed per sec
  framerate: 25, // fps
}

const encoder = new VideoEncoder(init);
encoder.configure(config);

function startDrawing() {
  const text = "Welcome to Rich Media"

  let animationId = null;
  let x = canvas.width / 2;
  let dx = 5;
    
  function animate(elapsed) {
    encodeFrames();

    ctx.fillStyle = '#ffc425';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, canvas.height / 2);

    x += dx;

    if (x > canvas.width - ctx.measureText(text).width / 2  || x < ctx.measureText(text).width / 2) {
      dx = -dx;
    }

    if (elapsed < 10) {
      animate(elapsed + 30/1000)
    } else {
      decodeAndRender();
    }
  }

  function startAnimation() {
    animate(0);
  }

  startAnimation();
}

const encodeFrames = () => {
  let frame = new VideoFrame(canvas, {
    timestamp: frameCounter * 1000000 / 25,
    duration: 1000000 / 25
  })

  frameCounter += 1;
  const keyFrame = frameCounter % 150 == 0;
  encoder.encode(frame, { keyFrame });
  frame.close();
}

async function decodeAndRender() {
  await encoder.flush(); // video data has been processed
  muxer.finalize();

  let buffer = muxer.target.buffer;
  let blob = new Blob([buffer])

  let url = window.URL.createObjectURL(blob)
  let video = document.createElement('video')
  video.height = canvas.height;
  video.width = canvas.width;
  video.src = url
  video.controls = true;
  document.body.appendChild(video)
}


window.addEventListener('DOMContentLoaded', () => {
  startDrawing();
});

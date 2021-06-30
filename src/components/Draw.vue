<template>
  <div>
  <div v-show="!ready" class="loading">
    <Spinner class="spinner" :style="`--image: url('${BASE_URL}bubbles_100pt.svg'); color: #80b0c0d0; width: 100%; height: 100%;`"/>
  </div>
  <div v-show="ready" class="draw">
    <img ref="cursor" class="cursor" src="cursor.png" />
    <canvas 
      class="draw-canvas"
      ref="canvas"
      @mousedown.prevent="mouseDown"
      @mousemove.prevent="mouseMove"
      @touchstart.prevent="touchStart"
      @touchend.prevent="touchEnd"
      @touchmove.prevent="touchMove"
    ></canvas>
    <canvas
      ref="overlay"
      class="draw-overlay"
    ></canvas>
  </div>
  </div>
</template>

<script>
console.log("Starting Draw...");

import * as tf from "@tensorflow/tfjs";

import Spinner from './Spinner.vue'


export default {
  name: 'Draw',
  components: {
    Spinner,
  },
  data() {
    return {
      ready: false,
      canvas: null,
      context: null,
      BASE_URL: process.env.BASE_URL,

      width: 28,
      height: 28,
      canvas_w: 140,
      canvas_h: 140,
      drawing: false,
      mouse_x: 0,
      mouse_y: 0,
      last_x: 0,
      last_y: 0,
    };
  },
  mounted() {
    console.log("Draw component mounted 4");

    console.log("Enabling prod mode ...");
    tf.enableProdMode();
    console.log("Enabled prod mode");

    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext('2d', {alpha: false}); 

    this.loadModel().then(() => {
      console.log("Warming up model ...");
      let t_input = tf.browser.fromPixels(this.canvas, 1);
      t_input = t_input.reshape([1, 28, 28, 1]);
      this.model.predict(t_input, {batchSize: 1});
      console.log("Done warming up");
      setTimeout(() => {
        this.$emit("ready");
        this.ready = true;
      }, 1000);
    });



    this.cells_w = this.canvas_w / this.width;
    this.cells_h = this.canvas_h / this.height;

    let overlay = this.$refs.overlay;
    let overlay_ctx = overlay.getContext('2d'); 

    overlay.width = this.canvas_w;
    overlay.height = this.canvas_h;
    overlay.style.width = this.canvas_w + "px";
    overlay.style.height = this.canvas_h + "px";

    overlay_ctx.fillStyle = "rgba(0,0,0,0)";
    overlay_ctx.clearRect(0, 0, this.canvas_w, this.canvas_h);
    overlay_ctx.strokeStyle = "rgba(0,0,0,0.1)";
    overlay_ctx.lineWidth = 1;
    overlay_ctx.translate(.5, .5);

    for (let i = 0; i < this.width; i++) {
      let offset = i * this.cells_w;

      overlay_ctx.beginPath();
      overlay_ctx.moveTo(0, offset);
      overlay_ctx.lineTo(this.canvas_w, offset);
      overlay_ctx.stroke();

      overlay_ctx.beginPath();
      overlay_ctx.moveTo(offset, 0);
      overlay_ctx.lineTo(offset, this.canvas_h);
      overlay_ctx.stroke();
    }


    this.context.imageSmoothingEnabled = false;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.canvas.style.width = this.canvas_w + "px";
    this.canvas.style.height = this.canvas_h + "px";
  


    this.context.fillStyle = "rgba(1,1,1,1)";
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.fillStyle = "rgba(0,0,0,1)";
    this.context.strokeStyle = "black";
    this.context.lineWidth = 2;
    this.context.translate(.5, .5);
    window.addEventListener("mouseup", e => { this.mouseUp(e);});

    this.clear();
  },
  methods: {
    loadModel() {
  
      const model_url = this.BASE_URL + "weights/model.json";
      console.log(`Loading model url='${model_url}'`);

      return tf.loadLayersModel(model_url)
      .then(model => {
        this.model = model;
        console.log("Done loading model");
      });

    },
    mouseDown: function(e) {
      return this.drawStart(e.offsetX, e.offsetY);
    },
    mouseUp: function() {
      return this.drawEnd();
    },
    mouseMove: function(e) {
      return this.drawMove(e.offsetX, e.offsetY);
    },
    drawStart: function(x, y) {
      this.drawing = true;
      this.mouse_x = x;
      this.mouse_y = y;
      this.last_x = Math.floor(this.mouse_x / this.cells_w);
      this.last_y = Math.floor(this.mouse_y / this.cells_h);
      console.log(`Mouse down x=${this.mouse_x} y=${this.mouse_y}`);
    },
    drawEnd: function() {
      console.log("Mouse up");
      if (this.drawing) {
        let t_input = tf.browser.fromPixels(this.canvas, 1);
        t_input = tf.sub(255.0, t_input);
        t_input = tf.mul(t_input, 1.0 / 255.0);
        t_input = t_input.reshape([1, 28, 28, 1]);

        let prediction = this.model.predict(t_input, {batchSize: 1});
        window.p = prediction;
        prediction.print();
         
        let vals = prediction.dataSync();
        let max_i = 0;
        let max_v = vals[0];
        for (let i = 1; i < 10; i++) {
          if (vals[i] > max_v) {
            max_v = vals[i];
            max_i = i;
          }
        }
        console.log("Prediction: " + max_i);

        // send prediction back to container
        this.$emit("predict", max_i);
      }

      this.drawing = false;
    },
    drawMove: function(x, y) {

      let cursor = this.$refs.cursor;
      cursor.style.left = (x - 12) + "px";
      cursor.style.top = (y - 12) + "px";

      if (this.drawing) {

        this.mouse_x = x;
        this.mouse_y = y;
        let cell_x = Math.floor(this.mouse_x / this.cells_w);
        let cell_y = Math.floor(this.mouse_y / this.cells_h);

        this.context.beginPath();
        this.context.moveTo(this.last_x, this.last_y);
        this.context.lineTo(cell_x, cell_y);
        this.context.stroke();

        this.last_x = cell_x;
        this.last_y = cell_y;

      }
    },
    touchStart: function(e) {
      console.log("touchStart");
      let targetX = e.target.getBoundingClientRect().x;
      let targetY = e.target.getBoundingClientRect().y;
      let offsetX = e.touches[0].clientX - targetX;
      let offsetY = e.touches[0].clientY - targetY;
      return this.drawStart(offsetX, offsetY);
    },
    touchEnd: function(e) {
      console.log("touchEnd");

      // coords don't matter for end event
      return this.drawEnd();
    },
    touchMove: function(e) {
      let targetX = e.target.getBoundingClientRect().x;
      let targetY = e.target.getBoundingClientRect().y;
      let offsetX = e.touches[0].clientX - targetX;
      let offsetY = e.touches[0].clientY - targetY;
      return this.drawMove(offsetX, offsetY);
    },
    clear() {
      this.context.fillStyle = "rgb(255,255,255,255)";
      this.context.lineWidth = 3;

      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
    },
  } 
}
</script>
<style scoped>
.loading {
  width: 100px;
  height: 100px;
  text-align: center;
  font-size: 1.5em;
}
.spinner {
  display: block;
  margin-bottom: 10px;
}

.draw {
  cursor: none;
  position: relative;
  width: 140px;
  height: 140px;
  overflow: hidden;
}

.draw-canvas {

  position: absolute;
  /* top: 0px;
  left: 0px; */
  z-index: 1;
  border: 1px solid black; 

  image-rendering: pixelated;
}

.draw-overlay {
  position: absolute;
  z-index: 2;
  left: 0px;
  top: 0px;
   
  pointer-events: none;
}

.cursor {
  position: absolute;
  z-index: 99;
  left: -32px;
  top: -32px;
  pointer-events: none;
}
</style>

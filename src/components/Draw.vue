<template>
  <div class="draw">
    <canvas 
      ref="canvas"
      @mousedown.prevent="mouseDown"
      @mousemove.prevent="mouseMove"
    ></canvas>
  </div>
</template>

<script>
console.log("Starting Draw...");

import * as tf from "@tensorflow/tfjs";

const BASE_URL = process.env.BASE_URL;

export default {
  name: 'Draw',
  data() {
    return {
      canvas: null,
      context: null,

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

    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext('2d', {alpha: false}); 

    this.context.imageSmoothingEnabled = false;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.canvas.style.width = this.canvas_w + "px";
    this.canvas.style.height = this.canvas_h + "px";
  

    this.cells_w = this.canvas_w / this.width;
    this.cells_h = this.canvas_h / this.height;

    this.context.fillStyle = "rgba(255,255,255,255)";
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.fillStyle = "rgba(0,0,0,255)";
    this.context.strokeStyle = "black";
    this.context.lineWidth = 2;
    this.context.translate(.5, .5);
    window.addEventListener("mouseup", e => { this.mouseUp(e);});

    this.loadModel();
    this.clear();
  },
  methods: {
    loadModel() {
  
      const model_url = BASE_URL + "weights/model.json";
      console.log(`Loading model url='${model_url}'`);

      tf.loadLayersModel(model_url)
      .then(model => {
        this.model = model;
        console.log("Done loading model");
      });

    },
    mouseDown: function(e) {
      this.drawing = true;
      this.mouse_x = e.offsetX;
      this.mouse_y = e.offsetY;
      this.last_x = Math.floor(this.mouse_x / this.cells_w);
      this.last_y = Math.floor(this.mouse_y / this.cells_h);
      console.log(`Mouse down x=${this.mouse_x} y=${this.mouse_y}`);
    },
    mouseUp: function(e) {
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
    mouseMove: function(e) {
      if (this.drawing) {
        this.mouse_x = e.offsetX;
        this.mouse_y = e.offsetY;
        let cell_x = Math.floor(this.mouse_x / this.cells_w);
        let cell_y = Math.floor(this.mouse_y / this.cells_h);
        //this.context.fillRect(cell_x, cell_y, 1, 1);
        this.context.beginPath();
        this.context.moveTo(this.last_x, this.last_y);
        this.context.lineTo(cell_x, cell_y);
        this.context.stroke();
        //this.context.closePath();
        this.last_x = cell_x;
        this.last_y = cell_y;

      }
    },
    clear() {
      console.log("Inside canvas clear() ...");
      console.log("Setting fillStyle ...");
      this.context.fillStyle = "rgb(255,255,255,255)";
      this.context.lineWidth = 3;
      console.log("calling fillrect() ...");
      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
      console.log("Finished canvas clear() ...");
    },
  } 
}
</script>
<style scoped>
canvas {
  //display: inline;
  border: 1px solid black; 

  image-rendering: pixelated;

}
</style>

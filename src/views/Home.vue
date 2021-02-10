<template>
  <div class="home">

    <md-card>  
      <md-card-content>

      <div class="draw-history">
      <div 
        v-for="item in drawHistory" 
        :key="item.id"
        class="draw-history-item"
        :style="{ right:item.x + 'px', opacity: item.opacity, transform: 'scale(' + item.scale + ')' }" >

        <img :src="item.dataUrl" class="draw-history-img" />
        <h2> {{ item.prediction }}</h2>

      </div>

      <Draw class="draw-component" ref="drawCanvas" @predict="updatePrediction" />
      </div>
      </md-card-content>

    </md-card>  

  </div>
</template>

<script>
console.log("Starting App...");

// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import Draw from '@/components/Draw.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld,
    Draw
  },
  data() {
    return {
      drawHistory: [{
        id: 0,
        x: 0,
        scale: 1.0,
        opacity: 0.0,
        dataUrl: "",
      }],
      drawHistoryId: 0,
      drawHistoryMax: 6,
    };
  },
  methods: {
    clear_canvas() {
      console.log("Clearing canvas ... ");


      this.$refs.drawCanvas.clear();
    },
    updatePrediction(prediction) {
      console.log("Received prediction: " + prediction);

      window.drawHistory = this.drawHistory;
      
      let item = this.drawHistory[0];
      item.prediction = prediction;
      item.opacity = 1.0;
      item.scale = .5;
      item.dataUrl = this.$refs.drawCanvas.canvas.toDataURL();

      for (const item of this.drawHistory) {
        item.x += 100;
      }

      this.drawHistoryId++;
      this.drawHistory.unshift({
        id: this.drawHistoryId,
        x: 0,
        opacity: 0.0,
      });

      if (this.drawHistory.length >= this.drawHistoryMax) {
        // fade out last element
        let lastItem = this.drawHistory[this.drawHistoryMax - 1];
        lastItem.opacity = 0.0;
      }

      this.drawHistory.splice(this.drawHistoryMax);
      this.clear_canvas();
    },
  } 
}
</script>
<style scoped lang="scss">

.draw-history .md-card {
  display: inline-block;
  width: 800px;
  height: 200px;
  overflow: hidden;
}

.draw-history-item {
  position: absolute;
  overflow: hidden;
  top: 0px;
  right: 0px;
  display: block;
  clear: none;
  border: 2px solid black;
  width: 148px;
  height: auto;
  transition-duration: .2s;
}

.draw-history-img {
  width: 100%;
  height: 100%;
}

.draw-component {
  position: absolute;
  right: 0px;
  top: 30px;
}

.prediction {
  display: inline-block;

  width: 200px;
  vertical-align: top;
}
</style>

<template>
  <div class="home">


    <md-card>  
      <md-card-content>

      <div class="draw_container">

        <div class="draw-history">

        <Draw class="draw-component" ref="drawCanvas" @predict="updatePrediction" />

        <div 
          v-for="item in drawHistory" 
          :key="item.id"
          class="draw-history-item"
          :class="{ push: item.isPushing, show: item.isShowing }" >

          <img :src="item.dataUrl" class="draw-history-img" />

          <div class="draw-history-text">
            {{ item.prediction }}
          </div>


        </div>

        </div>

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
        dataUrl: "",
        isPushing: true,
        isShowing: false,
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
      item.isShowing = true;
      item.prediction = prediction;
      // TODO make this a method in the Draw component
      item.dataUrl = this.$refs.drawCanvas.canvas.toDataURL();


      this.drawHistoryId++;
      this.drawHistory.unshift({
        id: this.drawHistoryId,
        isPushing: false,
        isShowing: false,
        dataUrl: "",
      });
      item = this.drawHistory[0];

      // delay setting CSS class so DOM redraws first
      setTimeout(() => {
        item.isPushing = true;
      }, 10);

      if (this.drawHistory.length >= this.drawHistoryMax) {
        // fade out last element
        let lastItem = this.drawHistory[this.drawHistoryMax - 1];
      }

      this.drawHistory.splice(this.drawHistoryMax);
      this.clear_canvas();
    },
  } 
}
</script>
<style scoped lang="scss">
.draw_container {
  display: flex;
  width: 100%;
  height: auto;
  align-items: center;
  justify-content: center;
}

.draw-history {
  position: relative;
  display: block;
  width: auto;
  height: 800px;
  padding: 20px;
  overflow: hidden;
  box-shadow: 0px 0px 10px black;
}

.draw-history-item {
  position: relative;
  overflow: hidden;
  top: -140px;
  left: 0px;
  display: flex;
  height: 0px;
  opacity: 0.0;
  width: 280px;
  transition-duration: .2s;
  /* box-shadow: 0px 0px 6px black; */
  border: 4px solid #EEE;
  margin-bottom: 10px;
}

.draw-history-item.push {
  height: 140px;
}

.draw-history-item.show {
  opacity: 1.0;
}

.draw-history-img {
  image-rendering: pixelated;
  flex-grow: 0 0 140px;
  width: 140px;
  height: 140px;
}

.draw-history-text {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;

}
 
.draw-component {
  z-index: 99;
  display: block;
  position: relative;
  text-align: left;
}

</style>

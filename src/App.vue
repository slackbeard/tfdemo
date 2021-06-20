<template>
  <div class="home">

  <md-app md-mode="reveal">

    <md-app-toolbar class="md-primary">
      <span class="md-title">
        {{ documentTitle }}
      </span>
    
    </md-app-toolbar>

    <md-app-content>

      <div class="draw-container">

        <div class="draw-history">

        <div class="draw-title">
          {{ titleMessage }}
        </div>

        <Draw class="draw-component" ref="drawCanvas" @ready="drawReady" @predict="updatePrediction" />

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

    </md-app-content>
  </md-app>

  </div>

</template>

<script>
console.log("Starting App...");

// @ is an alias to /src
import Draw from '@/components/Draw.vue'

export default {
  name: 'Home',
  components: {
    Draw
  },
  data() {
    return {
      titleMessage: "Loading...",
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
  computed: {
    documentTitle: () => {
      return document.title;
    },
  },
  methods: {
    clear_canvas() {
      console.log("Clearing canvas ... ");


      this.$refs.drawCanvas.clear();
    },
    drawReady() {
      this.titleMessage = "Draw a digit:";
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

.draw-container {
  display: flex;
  flex-direction: column;
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
  padding: 0px 40px;
  overflow: hidden;
  box-shadow: 0px 0px 10px black;
}

.draw-title {
  padding: 30px 0px;
  position: relative;
  font-size: 2.0em;
  text-align: center;
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
  display: flex;
  justify-content: center;
  background-color: #FFFFFF;
  width: 100%;
  position: relative;
  // text-align: left;
}

</style>

<template>
<span class="view">
    <div class="content" >
    </div>
</span>
</template>

<script lang="ts">

export default {
    name: "Spinner",
};

</script>

<style scoped>

.view {
    border-radius: 50%;
    display: inline-block;
    position: relative;
    overflow: hidden;
    animation-duration: 2s;
}

.content {
    width: calc(var(--zoom, 1) * 100%);
    height: calc(var(--zoom, 1) * 200%);
    position: relative;
    left: 50%;
    background-color: currentColor;

    mask: var(--image);
    mask-repeat: repeat;
    mask-position: center;
    mask-size: 100% 50%;

    animation-name: scroll_anim;
    animation-duration: inherit;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
}
@keyframes scroll_anim {
    from {
        transform: translate(-50%, 0);
    }
    to {
        transform: translate(-50%, -50%);
    }
}

</style>

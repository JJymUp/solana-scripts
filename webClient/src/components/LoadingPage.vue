<script lang='ts' setup>
import Loading from './common/Loading/Loading.vue'
</script>
<template>
    <div class='flex-center fixedPage'>
        <Loading />
    </div>
</template>
<style lang='scss' scoped>
.fixedPage {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,.7);
}
</style>
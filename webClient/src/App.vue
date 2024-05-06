<script setup lang="ts">
import Header from '@/components/Layout/Header.vue'
import Footer from '@/components/Layout/Footer.vue'
import LoadingPage from '@/components/LoadingPage.vue'
</script>

<template>
    <Header />

    <div class="mainWrap">
        <router-view></router-view>
    </div>

    <Footer />

    <Teleport  to="body">
        <!-- 切换页面的loading效果 -->
        <LoadingPage v-if="false" />
    </Teleport>
</template>

<style scoped>

</style>

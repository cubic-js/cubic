<template>
<app>
    <img src="http://localhost:3020/img/catboy.jpg">
    <hello></hello>
</app>
</template>


<script>
import Hello from './components/hello.vue'
export default {
    name: 'app',
    components: {
        Hello
    }
}
</script>


<style>
app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>

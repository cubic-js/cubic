<template>
  <div id='app'>
    <navbar></navbar>
    <router-view></router-view>
  </div>
</template>



<script>
import navbar from 'src/components/nav.vue'

export default {
  components: {
    navbar
  },
  head: {
    title: 'Cubic',
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Titillium+Web' }
    ]
  }
}
</script>



<style lang='scss'>
@import '~src/styles/partials/importer';
@import '~src/styles/reset.scss';
@import '~src/styles/grid.scss';

// Make hover state on links more noticable since default styles are resetted.
a {
  opacity: 0.8;
  @include ease(0.2s);

  &:hover {
    opacity: 1 !important;
  }
}
</style>

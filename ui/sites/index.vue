<template>
  <header>
    <div class="container">
      <h1>Hi, {{ user }}!</h1>
      <img src="/img/border.svg" class="border">
      <p>
        There should be some introduction text right here, explaining how to get
        started with the tutorial. But it seems that got postponed to prevent
        postponing other things that have already been postponed too often.
        <br>
        <br>
        I hope this still gives you enough of a basis to start from. There's
        also some rather detailed introductions on every other blitz-js node
        that are worth checking out.
      </p>
    </div>
    <img src="/img/shades.png" class="shades">
  </header>
</template>



<script>
export default {
  computed: {
    user() {
      return this.$store.state.user.name
    }
  },

  async asyncData() {
    this.$store.commit('setName', await this.$blitz.get('/user'))
  },

  storeModule: {
    name: 'user',
    state: {
      name: ''
    },
    mutations: {
      setName(state, name) {
        state.name = name
      }
    }
  }
}
</script>



<style lang="scss" scoped>
@import '~src/styles/partials/importer';

header {
  display: flex;
  position: relative;
  overflow: hidden;
  color: white;
  min-height: 100vh;
  text-align: center;
  @include gradient-background-dg($color-primary, $color-accent);

  .container {
    position: relative;
    z-index: 1;
  }
  h1 {
    font-size: 5em;
    font-family: 'Uni Sans';
    color: rgb(255, 255, 255);
    line-height: 1.2;
    text-align: center;
    text-shadow: 0.53px 0.848px 2px rgba(0, 0, 0, 0.18),2.622px 6.49px 13px rgba(0, 0, 0, 0.16);
  }
  .border {
    @include shadow-0;
    margin: 40px 0;
    transform: scale(0.75);
  }
  .shades {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    min-height: 100%;
  }
  p {
    text-align: left;
    margin-left: 30px; // optical center
    font-size: 1.25em;
    max-width: 750px;
    text-shadow: 0px 10px 24px rgba(113, 18, 45, 0.18),0.53px 0.848px 5px rgba(0, 0, 0, 0.19);
  }
}
</style>
<template>
  <nav>
    <div class="logo">
      Blitz-js
    </div>
    <div class="links">
      <a href="#">API</a>
      <a href="#">UI</a>
      <a href="#">Pub/Sub</a>
      <a href="#">Beyond the basics</a>
    </div>
  </nav>
</template>



<style lang="scss" scoped>
@import '~src/styles/partials/importer';

nav {
  position: fixed;
  z-index: 1;
  display: flex;
  padding: 20px 40px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.25);
  color: white;
  width: 100%;
  @include shadow-0;

  .logo {
    margin-right: 40px;
    font-family: 'Uni Sans'
  }
  a {
    text-transform: uppercase;
    margin: 0 20px;
  }
}
</style>
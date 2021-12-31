<template>
  <div class="page-login">
    <div class="page-login-back" style="background-image: url('/static/img/back02.jpg')"></div>
    <slot></slot>
    <div class="login-footer">
      <span>© 2021 ByteDance - IconPark 京ICP备12025439号-7</span>
      <a href="http://www.beian.miit.gov.cn" target="_blank"></a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/mixin' as *;

.page-login {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;

  .page-login-back {
    position: fixed;
    top: -40px;
    left: -40px;
    right: -40px;
    bottom: -40px;
    background-size: cover;
    background-position: center center;
    filter: blur(20px);
    z-index: -9;

    &:before {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      content: '';
      z-index: -8;
      background-color: rgba(0, 0, 0, 0.4);
    }
  }

  .login-footer {
    position: fixed;
    bottom: 0;
    height: 56px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    background: #000;
    padding: 0 48px;
  }
}
</style>

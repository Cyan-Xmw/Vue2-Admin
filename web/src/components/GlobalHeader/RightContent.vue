<template>
  <div :class="wrpCls">
    <full-screen :class="prefixCls" />
    <message-button :class="prefixCls" />
    <avatar-dropdown :class="prefixCls" />
    <select-lang :class="prefixCls" />
  </div>
</template>

<script>
import SelectLang from '@/components/SelectLang'

import AvatarDropdown from './AvatarDropdown'
import FullScreen from './FullScreen.vue'
import MessageButton from './MessageButton.vue'

export default {
  name: 'RightContent',
  components: {
    AvatarDropdown,
    SelectLang,
    MessageButton,
    FullScreen
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-global-header-index-action'
    },
    isMobile: {
      type: Boolean,
      default: () => false
    },
    topMenu: {
      type: Boolean,
      required: true
    },
    theme: {
      type: String,
      required: true
    }
  },
  computed: {
    wrpCls() {
      return {
        'ant-pro-global-header-index-right': true,
        [`ant-pro-global-header-index-${this.isMobile || !this.topMenu ? 'light' : this.theme}`]: true
      }
    }
  }
}
</script>

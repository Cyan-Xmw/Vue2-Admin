<template>
  <a-table
    :columns="getColumns()"
    rowKey="id"
    :data-source="data"
    :loading="loading"
    :pagination="false"
    :scroll="{ x: 1000 }"
  >
    <template slot="name" slot-scope="text, record">
      {{ $t(record.meta.title) }}
    </template>
    <template slot="path" slot-scope="text">
      {{ text }}
    </template>
    <template slot="redirect" slot-scope="text">
      {{ text || CommonText.Null }}
    </template>
    <template slot="component" slot-scope="text">
      {{ text || CommonText.Null }}
    </template>
    <template slot="icon" slot-scope="text, record">
      <a-icon
        :component="MenuIcon[record.meta.icon]"
        :style="{ fontSize: '20px' }"
        v-if="record.meta.icon.includes('Icon')"
      />
      <a-icon :type="record.meta.icon" :style="{ fontSize: '20px' }" v-else />
    </template>
    <template slot="keepAlive" slot-scope="text, record">
      {{ record.meta.keepAlive ? $t(I18nGlobal.Yes) : $t(I18nGlobal.No) }}
    </template>
    <template slot="hidden" slot-scope="text">
      {{ text ? $t(I18nGlobal.Yes) : $t(I18nGlobal.No) }}
    </template>
    <template slot="permission" slot-scope="text, record">
      <a-tag color="purple">
        {{ record.meta.permission }}
      </a-tag>
    </template>
    <template slot="sort" slot-scope="text">
      <a-tag color="blue">
        {{ text }}
      </a-tag>
    </template>
    <template slot="createdAt" slot-scope="text, record">
      {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
    </template>
    <template slot="action" slot-scope="text, record">
      <a @click="onEdit(record)" v-action:[ActionMap.edit]>{{ $t(I18nGlobal.Edit) }}</a>
      <a-divider type="vertical" />
      <a-popconfirm :title="$t(I18nGlobal.ConfirmDelete)" @confirm="onDelete(record)">
        <a v-action:[ActionMap.delete]>{{ $t(I18nGlobal.Delete) }}</a>
      </a-popconfirm>
    </template>
  </a-table>
</template>
<script>
import dayjs from 'dayjs'

import { CommonText } from '@/constant'
import { ActionMap } from '@/constant/action'
import { I18nGlobal, I18nMenu } from '@/constant/i18n'
import MenuIcon from '@/core/icons'
export default {
  name: 'TableList',
  props: ['data', 'loading'],
  data() {
    return {
      dayjs,
      I18nGlobal,
      ActionMap,
      MenuIcon,
      CommonText
    }
  },
  methods: {
    getColumns() {
      return [
        {
          title: I18nMenu('name'),
          dataIndex: 'name',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'name' }
        },
        {
          title: I18nMenu('path'),
          dataIndex: 'path',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'path' }
        },
        {
          title: I18nMenu('redirect'),
          dataIndex: 'redirect',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'redirect' }
        },
        {
          title: I18nMenu('component'),
          dataIndex: 'component',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'component' }
        },
        {
          title: I18nMenu('meta.icon'),
          dataIndex: 'icon',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'icon' }
        },
        {
          title: I18nMenu('meta.keepAlive'),
          dataIndex: 'keepAlive',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'keepAlive' }
        },
        {
          title: I18nMenu('hidden'),
          dataIndex: 'hidden',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'hidden' }
        },
        {
          title: I18nMenu('meta.permission'),
          dataIndex: 'permission',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'permission' }
        },
        {
          title: this.$t(I18nGlobal.Sort),
          dataIndex: 'sort',
          align: 'center',
          scopedSlots: { customRender: 'sort' }
        },
        {
          title: this.$t(I18nGlobal.CreatedAt),
          dataIndex: 'createdAt',
          align: 'center',
          width: 160,
          scopedSlots: { customRender: 'createdAt' }
        },
        {
          title: this.$t(I18nGlobal.Action),
          width: '110px',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          scopedSlots: { customRender: 'action' }
        }
      ]
    },
    onEdit(record) {
      this.$emit('onEdit', record)
    },
    onDelete(record) {
      this.$emit('onDelete', record)
    }
  }
}
</script>

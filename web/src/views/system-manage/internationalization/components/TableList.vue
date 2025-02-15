<template>
  <a-table :columns="getColumns()" rowKey="id" :data-source="data" :loading="loading" :pagination="false">
    <template slot="zhCN" slot-scope="text">
      {{ text || CommonText.Null }}
    </template>
    <template slot="enUS" slot-scope="text">
      {{ text || CommonText.Null }}
    </template>
    <template slot="jaJP" slot-scope="text">
      {{ text || CommonText.Null }}
    </template>
    <template slot="zhTW" slot-scope="text">
      {{ text || CommonText.Null }}
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
import { I18nGlobal, I18nInternationalization } from '@/constant/i18n'
export default {
  name: 'TableList',
  props: ['data', 'loading'],
  data() {
    return {
      dayjs,
      I18nGlobal,
      ActionMap,
      CommonText
    }
  },
  methods: {
    getColumns() {
      return [
        {
          title: I18nInternationalization('name'),
          dataIndex: 'name',
          align: 'center',
          ellipsis: true
        },
        {
          title: I18nInternationalization('zh-CN'),
          dataIndex: 'zhCN',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'zhCN' }
        },
        {
          title: I18nInternationalization('en-US'),
          dataIndex: 'enUS',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'enUS' }
        },
        {
          title: I18nInternationalization('ja-JP'),
          dataIndex: 'jaJP',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'jaJP' }
        },
        {
          title: I18nInternationalization('zh-TW'),
          dataIndex: 'zhTW',
          align: 'center',
          ellipsis: true,
          scopedSlots: { customRender: 'zhTW' }
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

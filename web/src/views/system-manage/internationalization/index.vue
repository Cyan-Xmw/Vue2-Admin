<template>
  <page-header-wrapper>
    <a-space direction="vertical" size="middle" style="width: 100%">
      <a-card :bordered="false">
        <!-- 顶部搜索 -->
        <header-search :query-form="queryForm" @query="query" @onAdd="onAdd" />
      </a-card>
      <a-card :bordered="false">
        <!-- 表格数据 -->
        <table-list :data="data" :loading="loading" @onEdit="onEdit" @onDelete="onDelete" />
      </a-card>
    </a-space>
    <!-- 新增/编辑弹窗 -->
    <a-modal
      :title="title"
      :width="600"
      :visible="visible"
      @cancel="onClose"
      :maskClosable="false"
      @ok="handleSubmit"
      :confirm-loading="loginState"
      :okButtonProps="{
        disabled: loginState
      }"
    >
      <a-form :form="form">
        <form-modal :rules="rules" :data="data" />
      </a-form>
    </a-modal>
  </page-header-wrapper>
</template>
<script>
import dayjs from 'dayjs'
import { assign, get, keys, pick } from 'lodash-es'

import {
  addInternalization,
  delInternalization,
  getInternalizationList,
  updateInternalization
} from '@/api/system-manage/internationalization'
import { RequestCode } from '@/constant'
import { I18nEntry, I18nGlobal, I18nInternationalization } from '@/constant/i18n'

import FormModal from './components/FormModal' // 表单弹窗
import HeaderSearch from './components/HeaderSearch.vue' // 顶部搜索
import TableList from './components/TableList.vue' // 表格列表
export default {
  name: 'Internationalization',
  components: {
    HeaderSearch,
    TableList,
    FormModal
  },
  data() {
    return {
      data: [],
      loading: false,
      dayjs,
      queryForm: {},
      form: this.$form.createForm(this),
      loginState: false,
      rules: {
        name: ['name', { rules: [{ required: true, message: I18nEntry(I18nInternationalization('name')) }] }],
        parentId: ['parentId'],
        zhCN: ['zhCN'],
        enUS: ['enUS'],
        jaJP: ['jaJP'],
        zhTW: ['zhTW']
      },
      id: undefined,
      title: '',
      visible: false
    }
  },
  methods: {
    // 获取国际化列表
    async getList() {
      this.loading = true
      const params = {
        name: this.queryForm.name,
        zhCN: this.queryForm.zhCN
      }
      if (this.queryForm.createdAt?.length) {
        assign(params, {
          startTime: dayjs(this.queryForm.createdAt[0]).startOf('day').valueOf(),
          endTime: dayjs(this.queryForm.createdAt[1]).endOf('day').valueOf()
        })
      }
      const { data, code } = await getInternalizationList(params)
      if (code === RequestCode.Success) {
        this.data = get(data, 'records', [])
      }
      this.loading = false
    },
    // 查询
    query() {
      this.getList()
    },
    // 新增
    onAdd() {
      this.visible = true
      this.title = `${this.$t(I18nGlobal.Add)}${I18nInternationalization()}`
    },
    // 编辑
    onEdit(record) {
      this.visible = true
      this.title = `${this.$t(I18nGlobal.Edit)}${I18nInternationalization()}：${record.name}`
      this.id = record.id
      // 使用 $nextTick 确保 DOM 更新后再设置表单值
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(record, keys(this.rules)))
      })
    },
    // 删除
    async onDelete(record) {
      await delInternalization(record.id).then((res) => {
        if (res.code === RequestCode.Success) {
          this.$message.success(res.msg)
          this.getList()
        }
      })
    },
    // 关闭弹窗
    onClose() {
      this.visible = false
      this.id = undefined
      this.form.resetFields()
    },
    // 保存
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields(async (err, values) => {
        if (!err) {
          const id = this.id
          this.loginState = true
          await (id ? updateInternalization : addInternalization)({ id, ...values })
            .then(async ({ code, msg }) => {
              if (code === RequestCode.Success) {
                this.$message.success(msg)
                this.onClose()
                this.getList()
              }
            })
            .finally(() => {
              this.loginState = false
            })
        }
      })
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getList()
    })
  }
}
</script>

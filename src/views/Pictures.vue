<template>
  <div class="pictures-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-content">
        <h1 class="logo">Multimedia Sharing Platform</h1>
        <div class="user-info">
          <a-dropdown @select="handleCommand">
            <span class="user-dropdown">
              <a-avatar :size="32" :image-url="userStore.userInfo?.userAvatar">
                {{ userStore.userInfo?.nickname?.[0] || 'U' }}
              </a-avatar>
              <span class="username">{{ userStore.userInfo?.nickname || userStore.userInfo?.account }}</span>
              <icon-down />
            </span>
            <template #content>
              <a-doption value="logout">Logout</a-doption>
            </template>
          </a-dropdown>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <a-button type="primary" @click="showUploadDialog = true">
          <template #icon><icon-upload /></template>
          Upload Picture
        </a-button>
        <a-button type="primary" status="danger" :disabled="selectedPictures.length === 0" @click="handleBatchDelete">
          <template #icon><icon-delete /></template>
          Batch Delete ({{ selectedPictures.length }})
        </a-button>
        <div class="search-box">
          <a-input v-model="searchText" placeholder="Search picture name..." allow-clear @clear="handleSearch"
            @press-enter="handleSearch" style="width: 300px">
            <template #prefix><icon-search /></template>
          </a-input>
          <a-button type="primary" @click="handleSearch">Search</a-button>
        </div>
      </div>

      <!-- 图片列表 -->
      <a-spin :loading="loading" style="width: 100%">
        <div class="pictures-grid">
          <div v-for="picture in pictureList" :key="picture.picId" class="picture-card"
            :class="{ selected: selectedPictures.includes(picture.picId) }" @click="toggleSelect(picture.picId)">
            <div class="picture-image-wrapper">
              <img :src="picture.thumbUrl || picture.imageUrl" :alt="picture.title" @error="handleImageError"
                class="picture-image" />
              <div class="picture-overlay">
                <a-checkbox :model-value="selectedPictures.includes(picture.picId)" @click.stop
                  @change="toggleSelect(picture.picId)" />
                <div class="picture-actions">
                  <a-button type="primary" size="small" shape="circle" @click.stop="handleEdit(picture)">
                    <template #icon><icon-edit /></template>
                  </a-button>
                  <a-button type="primary" status="danger" size="small" shape="circle"
                    @click.stop="handleDelete(picture.picId)">
                    <template #icon><icon-delete /></template>
                  </a-button>
                </div>
              </div>
            </div>
            <div class="picture-info">
              <div class="picture-title" :title="picture.title">
                {{ picture.title || 'Untitled' }}
              </div>
              <div class="picture-meta">
                <span v-if="picture.tag" class="tag">{{ picture.tag }}</span>
                <span class="size">{{ formatSize(picture.size) }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-spin>

      <!-- 分页 -->
      <a-pagination v-model:current="currentPage" v-model:page-size="pageSize" :page-size-options="['12', '24', '48']"
        :total="total" show-page-size show-total @change="handlePageChange" @page-size-change="handleSizeChange"
        class="pagination" />
    </div>

    <!-- 上传对话框 -->
    <a-modal v-model:visible="showUploadDialog" title="Upload Picture" width="600px" @cancel="handleCancelUpload"
      @ok="handleUpload" :confirm-loading="uploading" ok-text="Confirm" cancel-text="Cancel">
      <a-upload ref="uploadRef" :auto-upload="false" :file-list="uploadFileList" @change="handleFileChange" :limit="1"
        accept="image/*" drag>
        <template #upload-button>
          <div class="upload-area">
            <icon-upload />
            <div class="upload-text">
              Drag file here or <em>click to upload</em>
            </div>
          </div>
        </template>
      </a-upload>
      <a-form :model="uploadForm" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }"
        style="margin-top: 20px">
        <a-form-item field="pictureName" label="Picture Name">
          <a-input v-model="uploadForm.pictureName" placeholder="Please enter picture name" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑对话框 -->
    <a-modal v-model:visible="showEditDialog" title="Edit Picture" width="500px" @cancel="resetEditForm"
      @ok="handleEditSubmit" :confirm-loading="editing" ok-text="Confirm" cancel-text="Cancel">
      <a-form :model="editForm" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
        <a-form-item field="name" label="Picture Name">
          <a-input v-model="editForm.name" placeholder="Please enter picture name" />
        </a-form-item>
        <a-form-item field="introduction" label="Description">
          <a-textarea v-model="editForm.introduction" :rows="3" placeholder="Please enter description" />
        </a-form-item>
        <a-form-item field="category" label="Category">
          <a-input v-model="editForm.category" placeholder="Please enter category" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  listPictureByPage,
  uploadPicture,
  deletePicture,
  deletePictureBatch,
  editPicture
} from '@/api/picture'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconUpload,
  IconDelete,
  IconEdit,
  IconSearch,
  IconDown
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const userStore = useUserStore()

// 数据
const loading = ref(false)
const pictureList = ref([])
const selectedPictures = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const searchText = ref('')

// 上传相关
const showUploadDialog = ref(false)
const uploading = ref(false)
const uploadRef = ref(null)
const uploadFileList = ref([])
const uploadFile = ref(null)
const uploadForm = reactive({
  pictureName: ''
})

// 编辑相关
const showEditDialog = ref(false)
const editing = ref(false)
const editForm = reactive({
  id: '',
  name: '',
  introduction: '',
  category: ''
})

// 初始化用户信息
onMounted(async () => {
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }
  loadPictures()
})

// 加载图片列表
const loadPictures = async () => {
  loading.value = true
  try {
    const params = {
      current: Number(currentPage.value),
      pageSize: Number(pageSize.value),
      searchText: searchText.value || undefined
    }
    const res = await listPictureByPage(params)
    pictureList.value = res.records || []
    // 确保 total 是数字类型
    total.value = Number(res.total) || 0
    // 同步当前页码（后端可能返回当前页信息）
    if (res.current !== undefined) {
      currentPage.value = Number(res.current)
    }
    if (res.size !== undefined) {
      pageSize.value = Number(res.size)
    }
  } catch (error) {
    console.error('Failed to load picture list:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadPictures()
}

// 分页
const handlePageChange = (page, pageSize) => {
  currentPage.value = Number(page)
  loadPictures()
}

const handleSizeChange = (size) => {
  pageSize.value = Number(size)
  currentPage.value = 1
  loadPictures()
}

// 选择图片
const toggleSelect = (id) => {
  const index = selectedPictures.value.indexOf(id)
  if (index > -1) {
    selectedPictures.value.splice(index, 1)
  } else {
    selectedPictures.value.push(id)
  }
}

// 文件选择
const handleFileChange = (fileList) => {
  uploadFileList.value = fileList
  if (fileList.length > 0) {
    uploadFile.value = fileList[0].file
  } else {
    uploadFile.value = null
  }
}


// 上传图片
const handleUpload = async () => {
  if (!uploadFile.value) {
    Message.warning('Please select a picture to upload')
    return
  }
  uploading.value = true
  try {

    await uploadPicture(uploadFile.value, {
      pictureName: uploadForm.pictureName
    })
    Message.success('Upload successful')

    showUploadDialog.value = false
    loadPictures()
    resetUploadForm()

    // await uploadPicture(uploadFile.value, {
    //   pictureName: uploadForm.pictureName
    // })
    // Message.success('上传成功')
    // showUploadDialog.value = false
    // resetUploadForm()
    // // 重置到第一页，因为新上传的图片通常在第一页
    // currentPage.value = 1
    // loadPictures()
  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    uploading.value = false
  }
}

// 取消上传
const handleCancelUpload = () => {
  resetUploadForm()
  showUploadDialog.value = false
}

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.pictureName = ''
  uploadFile.value = null
  uploadFileList.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 编辑图片
const handleEdit = (picture) => {
  editForm.id = picture.picId
  editForm.name = picture.title || ''
  editForm.introduction = picture.desc || ''
  editForm.category = picture.tag || ''
  showEditDialog.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  editing.value = true
  try {
    await editPicture({
      id: editForm.id,
      name: editForm.name,
      introduction: editForm.introduction,
      category: editForm.category
    })
    Message.success('Edit successful')
    showEditDialog.value = false
    resetEditForm()
    loadPictures()
  } catch (error) {
    console.error('Edit failed:', error)
  } finally {
    editing.value = false
  }
}

// 重置编辑表单
const resetEditForm = () => {
  editForm.id = ''
  editForm.name = ''
  editForm.introduction = ''
  editForm.category = ''
}

// 删除图片
const handleDelete = async (id) => {
  try {
    Modal.confirm({
      title: 'Confirm',
      content: 'Are you sure you want to delete this picture?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        await deletePicture(id)
        Message.success('Delete successful')
        loadPictures()
      }
    })
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedPictures.value.length === 0) {
    Message.warning('Please select pictures to delete')
    return
  }
  try {
    Modal.confirm({
      title: 'Confirm',
      content: `Are you sure you want to delete ${selectedPictures.value.length} selected picture(s)?`,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        await deletePictureBatch(selectedPictures.value)
        Message.success('Delete successful')
        selectedPictures.value = []
        loadPictures()
      }
    })
  } catch (error) {
    console.error('Batch delete failed:', error)
  }
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error'
}

// 格式化文件大小
const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 用户操作
const handleCommand = async (value) => {
  if (value === 'logout') {
    try {
      Modal.confirm({
        title: 'Confirm',
        content: 'Are you sure you want to logout?',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk: async () => {
          await userStore.logout()
          router.push('/login')
        }
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
}
</script>

<style scoped>
.pictures-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 64px;
  line-height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  margin: 0;
  font-size: 24px;
  color: #165dff;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.username {
  margin: 0 8px;
  color: #333;
}

.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.pictures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.picture-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.picture-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.picture-card.selected {
  border: 2px solid #165dff;
}

.picture-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  background: #f0f0f0;
}

.picture-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.picture-card:hover .picture-overlay {
  opacity: 1;
}

.picture-actions {
  display: flex;
  gap: 8px;
}

.picture-info {
  padding: 12px;
}

.picture-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picture-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.tag {
  background: #e6f7ff;
  color: #165dff;
  padding: 2px 8px;
  border-radius: 4px;
}

.size {
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.upload-text {
  margin-top: 12px;
  color: #666;
}

.upload-text em {
  color: #165dff;
  font-style: normal;
}

@media (max-width: 768px) {
  .pictures-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    margin-left: 0;
    width: 100%;
  }
}
</style>

<template>
  <v-container>
    <h1>Посты</h1>
    <v-row align="center">
      <v-col cols="9">
        <v-text-field v-model="newPostName" hide-details label="Название поста" outlined/>
      </v-col>
      <v-col cols="3">
        <v-btn color="primary" class="w-100" @click="addNewPost">Добавить пост</v-btn>

      </v-col>
    </v-row>
    <v-list class="posts-list" ref="scrollContainer">
      <v-list-item v-for="post in visiblePosts" :key="post.id">
        <v-row class="d-flex align-center">
          <v-col cols="10">
            <v-text-field v-model="post.name" hide-details @change="updatePost(post.id, post.name)"/>
          </v-col>
          <v-col cols="2">
            <v-btn color="error" class="w-100" @click="removePost(post.id)">Удалить</v-btn>
          </v-col>
        </v-row>

      </v-list-item>
    </v-list>
    <div ref="scrollAnchor" class="scroll-anchor"></div>
  </v-container>
</template>

<script lang="ts">
import {defineComponent, ref, reactive, onMounted, onBeforeUnmount, computed} from 'vue';
import {usePostsStore} from "./store/posts.ts"
import {v4} from "uuid";

export default defineComponent({
  setup() {
    const postsStore = usePostsStore();
    const pageSize = 20;
    const currentPage = ref(1);
    const newPostName = ref()

    const visiblePosts = computed(() => postsStore.getPostsByPage(currentPage.value, pageSize));

    const loadMorePosts = () => {
      currentPage.value++;
    };

    const scrollAnchor = ref<HTMLElement | null>(null);
    const scrollContainer = ref<HTMLElement | null>(null);
    let observer: IntersectionObserver;

    onMounted(() => {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      });

      if (scrollAnchor.value) {
        observer.observe(scrollAnchor.value);
      }
    });

    onBeforeUnmount(() => {
      if (observer && scrollAnchor.value) {
        observer.unobserve(scrollAnchor.value);
      }
    });

    const updatePost = (id: number, name: string) => {
      postsStore.editPost(id, name);
    };

    const addNewPost = () => {
      if (!newPostName.value?.length) return
      postsStore.addPost({id: v4(), name: newPostName.value})
      newPostName.value = ""
    }

    const removePost = (id: number) => {
      postsStore.removePost(id)
    }

    return {
      visiblePosts,
      scrollAnchor,
      scrollContainer,
      newPostName,
      updatePost,
      addNewPost,
      removePost
    };
  },
});
</script>

<style scoped>
.posts-list {
  max-height: 90vh;
  /* Ограничиваем высоту списка постов */
  overflow-y: auto;
  /* Добавляем прокрутку */
  padding-right: 10px;
  /* Немного отступа справа */
}

.scroll-anchor {
  height: 40px;
}

.v-list-item {
  margin-bottom: 10px;
}

.v-text-field {
  width: 100%;
}

.v-list-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

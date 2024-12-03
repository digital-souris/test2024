<template>
  <v-container>
    <h1>Посты</h1>
    <v-row align="center">
      <v-col cols="9">
        <v-text-field v-model="newPostName" hide-details label="Название поста" outlined />
      </v-col>
      <v-col cols="3">
        <v-btn color="primary" class="w-100" @click="addNewPost">Добавить пост</v-btn>

      </v-col>
    </v-row>
    <v-list class="posts-list" ref="scrollContainer">
      <v-list-item v-for="post in visiblePosts" :key="post.id">
        <v-list-item>
          <v-text-field v-model="post.name" @change="updatePost(post.id, post.name)" />
        </v-list-item>
      </v-list-item>
    </v-list>
    <div ref="scrollAnchor" class="scroll-anchor"></div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { usePostsStore } from "./store/posts.ts"
import { v4 } from "uuid";
export default defineComponent({
  setup() {
    const postsStore = usePostsStore();

    // Параметры подгрузки
    const pageSize = 20; // Количество постов на одну страницу
    const currentPage = ref(1); // Текущая страница
    const newPostName = ref()

    // Список видимых постов
    const visiblePosts = reactive(postsStore.getPostsByPage(currentPage.value, pageSize));

    // Добавляем посты на следующей странице
    const loadMorePosts = () => {
      currentPage.value++;
      const newPosts = postsStore.getPostsByPage(currentPage.value, pageSize);
      visiblePosts.push(...newPosts);
    };

    // Наблюдатель за скроллом
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
      postsStore.addPost({ id: v4(), name: newPostName.value })
      newPostName.value = ""
    }

    return {
      visiblePosts,
      scrollAnchor,
      scrollContainer,
      newPostName,
      updatePost,
      addNewPost
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
  height: 1px;
  /* Высота якоря */
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

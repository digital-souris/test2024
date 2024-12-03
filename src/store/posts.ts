import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Post } from '../interface/postInterface';
import { postData } from '../data/postData';

export const usePostsStore = defineStore('posts', () => {
    // Изначальный список постов
    const initialPosts: Post[] = postData

    // Объект изменений, загружаемый из localStorage
    const postChanges = ref<Record<string, string | null>>({});

    // Загрузка изменений из localStorage
    const loadFromLocalStorage = () => {
        const storedChanges = localStorage.getItem('postChanges');
        if (storedChanges) {
            postChanges.value = JSON.parse(storedChanges);
        }
    };

    // Сохранение изменений в localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('postChanges', JSON.stringify(postChanges.value));
    };

    // Результирующий массив постов (computed)
    const posts = computed(() => {
        // Удаляем посты, которые помечены как удаленные (name === null)
        const filteredPosts = initialPosts.filter(
            (post) => !(post.id in postChanges.value && postChanges.value[post.id] === null)
        );

        // Обновляем имена постов, если они изменены
        const updatedPosts = filteredPosts.map((post) => {
            if (post.id in postChanges.value && postChanges.value[post.id] !== null) {
                return { ...post, name: postChanges.value[post.id]! };
            }
            return post;
        });

        return updatedPosts;
    });

    // Получение постов частями
    const getPostsByPage = (page: number, pageSize: number) => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return posts.value.slice(start, end);
    };

    // Загрузка данных из localStorage при инициализации
    loadFromLocalStorage();

    return {
        getPostsByPage,
        addPost: (post: Post) => {
            postChanges.value[post.id] = post.name;
            saveToLocalStorage();
        },
        removePost: (id: number) => {
            postChanges.value[id] = null;
            saveToLocalStorage();
        },
        editPost: (id: number, newName: string) => {
            postChanges.value[id] = newName;
            saveToLocalStorage();
        },
    };
});

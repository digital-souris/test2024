import {defineStore} from 'pinia';
import {ref} from 'vue';
import {Post} from '../interface/postInterface';
import {postData} from '../data/postData';

export const usePostsStore = defineStore('posts', () => {
    // Изначальный список постов
    const initialPosts: Post[] = postData
    const posts = ref()<Post[]>


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


    // Получение постов частями
    const getPostsByPage = (page: number, pageSize: number) => {
        const start = 0;
        const end = page * pageSize;
        return posts.value.slice(start, end);
    };

    const getPostIndexById = (id: number) => {
        return posts.value.findIndex(post => post.id === id);
    }

    const initPosts = () => {
        loadFromLocalStorage();
        const createdPosts = []
        Object.keys(postChanges.value).forEach(post => {
            if (!initialPosts.find(val => post.id === post) && postChanges.value[post]) {
                createdPosts.push({id: post, name: postChanges.value[post]})
            }
        })

        posts.value = initialPosts.map((post) => {
            if (post.id in postChanges.value) {
                return {...post, name: postChanges.value[post.id]};
            }
            return post;
        })
            .filter(
                (post) => post.name)
            .concat(createdPosts)
    }
    initPosts()

    return {
        posts,
        getPostsByPage,
        addPost: (post: Post) => {
            postChanges.value[post.id] = post.name;
            posts.value.push(post)
            saveToLocalStorage();
            console.log(posts.value.length)
        },
        removePost: (id: number) => {
            postChanges.value[id] = null;
            posts.value.splice(getPostIndexById(id), 1);
            saveToLocalStorage();

        },
        editPost: (id: number, newName: string) => {
            postChanges.value[id] = newName;
            if (posts.value[getPostIndexById(id)])
                posts.value[getPostIndexById(id)].name = newName
            saveToLocalStorage();
        },
    };
});

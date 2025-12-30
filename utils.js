// 공통 유틸리티 함수
const store = {
    get: (key, def) => {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : def;
    },
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    remove: (key) => localStorage.removeItem(key)
};

// 사용자 인증 관련
const auth = {
    getCurrentUser: () => {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },
    setCurrentUser: (user) => {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    },
    logout: () => {
        sessionStorage.removeItem('currentUser');
    },
    isLoggedIn: () => {
        return auth.getCurrentUser() !== null;
    }
};

// 데이터 초기화
function initData() {
    // Videos
    if (!store.get('videos')) {
        store.set('videos', [
            { id: 'jYdbP455js0', title: 'Cha Eun-woo "Love So Fine" OST' },
            { id: '1u7s_v1Y-14', title: 'Astro - Blue Flame MV' },
            { id: 'KEgSjGQEpuA', title: 'Gucci Campaign Behind' }
        ]);
    }
    
    // Music
    if (!store.get('music')) {
        store.set('music', [
            { id: 'm1', title: 'Love So Fine', url: '#' },
            { id: 'm2', title: 'Rainbow Falling', url: '#' }
        ]);
    }
    
    // Posts
    if (!store.get('posts')) {
        store.set('posts', [
            { 
                id: 1, 
                author: 'StarDust', 
                content: 'Eunwoo oppa is literally an angel! Can\'t wait for the next album.', 
                likes: 105, 
                comments: [
                    { id: 1, author: 'Fan1', text: 'Me too!', timestamp: Date.now() }
                ], 
                timestamp: Date.now() 
            },
            { 
                id: 2, 
                author: 'MoonWalker', 
                content: 'Watching True Beauty for the 5th time. Suho is the best!', 
                likes: 42, 
                comments: [
                    { id: 2, author: 'Fan2', text: 'Same here!', timestamp: Date.now() - 86400000 }
                ], 
                timestamp: Date.now() - 86400000 
            }
        ]);
    }
    
    // Users
    if (!store.get('users')) {
        store.set('users', []);
    }
}

// 배경 이미지 관리
const backgroundImage = {
    get: () => {
        return store.get('main_image', null);
    },
    set: (imageData) => {
        store.set('main_image', imageData);
    },
    remove: () => {
        store.remove('main_image');
    }
};


// 공통 유틸리티 함수
const store = {
    get: (key, def) => {
        try {
            const val = localStorage.getItem(key);
            if (val === null || val === undefined) {
                return def;
            }
            // JSON 파싱 시도
            try {
                return JSON.parse(val);
            } catch (e) {
                // JSON 파싱 실패 시 원본 문자열 반환 (base64 이미지 등)
                return val;
            }
        } catch (error) {
            console.error('store.get error:', error, 'key:', key);
            return def;
        }
    },
    set: (key, val) => {
        try {
            // 문자열인 경우 (base64 이미지 등) 직접 저장, 그 외는 JSON.stringify
            if (typeof val === 'string' && (val.startsWith('data:') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('blob:'))) {
                localStorage.setItem(key, val);
            } else {
                localStorage.setItem(key, JSON.stringify(val));
            }
        } catch (error) {
            console.error('store.set error:', error, 'key:', key);
            // QuotaExceededError 처리
            if (error.name === 'QuotaExceededError') {
                alert('저장 공간이 부족합니다. 일부 데이터를 삭제해주세요.');
            }
            throw error;
        }
    },
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
    
    // Products (쇼핑몰 상품 데이터)
    if (!store.get('products')) {
        store.set('products', [
            {
                id: '1',
                name: '차은우 포토카드 세트',
                description: '차은우의 특별한 순간들을 담은 프리미엄 포토카드 세트입니다. 총 10장의 고품질 포토카드가 포함되어 있습니다.',
                price: 25000,
                image: 'https://via.placeholder.com/400x400/667eea/ffffff?text=Photo+Card+Set',
                category: '포토카드',
                stock: 50,
                rating: 4.8,
                reviews: 124
            },
            {
                id: '2',
                name: '차은우 공식 후드티',
                description: '편안한 착용감의 프리미엄 후드티입니다. 차은우의 시그니처 로고가 새겨진 한정판 아이템입니다.',
                price: 89000,
                image: 'https://via.placeholder.com/400x400/764ba2/ffffff?text=Hoodie',
                category: '의류',
                stock: 30,
                rating: 4.9,
                reviews: 89
            },
            {
                id: '3',
                name: '차은우 앨범 - True Beauty',
                description: '차은우의 첫 번째 솔로 앨범입니다. 수록곡 5곡이 포함되어 있으며, 특별 포토북이 함께 제공됩니다.',
                price: 35000,
                image: 'https://via.placeholder.com/400x400/f093fb/ffffff?text=Album',
                category: '음반',
                stock: 100,
                rating: 5.0,
                reviews: 256
            },
            {
                id: '4',
                name: '차은우 시그니처 머그컵',
                description: '일상에서 차은우와 함께하세요. 고급 세라믹 소재로 제작된 프리미엄 머그컵입니다.',
                price: 18000,
                image: 'https://via.placeholder.com/400x400/4facfe/ffffff?text=Mug',
                category: '액세서리',
                stock: 75,
                rating: 4.7,
                reviews: 67
            },
            {
                id: '5',
                name: '차은우 포스터 세트',
                description: '대형 포스터 3종 세트입니다. 벽면 장식용으로 최적화된 고해상도 프린트입니다.',
                price: 22000,
                image: 'https://via.placeholder.com/400x400/00f2fe/ffffff?text=Poster+Set',
                category: '포스터',
                stock: 40,
                rating: 4.6,
                reviews: 45
            },
            {
                id: '6',
                name: '차은우 공식 키링',
                description: '가방이나 키에 매달 수 있는 프리미엄 키링입니다. 차은우의 시그니처 디자인이 적용되었습니다.',
                price: 12000,
                image: 'https://via.placeholder.com/400x400/43e97b/ffffff?text=Keyring',
                category: '액세서리',
                stock: 120,
                rating: 4.5,
                reviews: 98
            }
        ]);
    }
    
    // Cart (장바구니)
    if (!store.get('cart')) {
        store.set('cart', []);
    }
    
    // Orders (주문/결제 로그)
    if (!store.get('orders')) {
        store.set('orders', []);
    }
}

// 배경 이미지 관리 (단일 이미지 - 하위 호환성 유지)
const backgroundImage = {
    get: () => {
        try {
            const imgData = store.get('main_image', null);
            // 문자열인 경우 그대로 반환, 객체인 경우 처리
            if (typeof imgData === 'string') {
                return imgData;
            }
            return imgData;
        } catch (error) {
            console.error('backgroundImage.get error:', error);
            return null;
        }
    },
    set: (imageData) => {
        try {
            if (!imageData) {
                console.warn('backgroundImage.set: imageData가 없습니다');
                return;
            }
            store.set('main_image', imageData);
        } catch (error) {
            console.error('backgroundImage.set error:', error);
            throw error;
        }
    },
    remove: () => {
        try {
            store.remove('main_image');
        } catch (error) {
            console.error('backgroundImage.remove error:', error);
        }
    }
};

// 배너 이미지 배열 관리 (슬라이더용)
const bannerImages = {
    get: () => {
        try {
            const images = store.get('main_images', []);
            // 배열이 아니거나 비어있으면 기본 이미지 반환
            if (!Array.isArray(images) || images.length === 0) {
                return [
                    'https://via.placeholder.com/1080/302b63/ffffff?text=Cha+Eun-woo+1',
                    'https://via.placeholder.com/1080/667eea/ffffff?text=Cha+Eun-woo+2',
                    'https://via.placeholder.com/1080/f093fb/ffffff?text=Cha+Eun-woo+3'
                ];
            }
            return images;
        } catch (error) {
            console.error('bannerImages.get error:', error);
            return [];
        }
    },
    set: (images) => {
        try {
            if (!Array.isArray(images)) {
                console.warn('bannerImages.set: images가 배열이 아닙니다');
                return;
            }
            store.set('main_images', images);
        } catch (error) {
            console.error('bannerImages.set error:', error);
            throw error;
        }
    },
    add: (imageData) => {
        try {
            const images = bannerImages.get();
            if (!Array.isArray(images)) {
                bannerImages.set([imageData]);
            } else {
                images.push(imageData);
                bannerImages.set(images);
            }
        } catch (error) {
            console.error('bannerImages.add error:', error);
            throw error;
        }
    },
    remove: (index) => {
        try {
            const images = bannerImages.get();
            if (Array.isArray(images) && index >= 0 && index < images.length) {
                images.splice(index, 1);
                bannerImages.set(images);
            }
        } catch (error) {
            console.error('bannerImages.remove error:', error);
            throw error;
        }
    },
    update: (index, imageData) => {
        try {
            const images = bannerImages.get();
            if (Array.isArray(images) && index >= 0 && index < images.length) {
                images[index] = imageData;
                bannerImages.set(images);
            }
        } catch (error) {
            console.error('bannerImages.update error:', error);
            throw error;
        }
    }
};

// IndexedDB를 사용한 음원 파일 저장 (큰 파일용)
const audioDB = {
    dbName: 'AntigravityAudioDB',
    storeName: 'audioFiles',
    version: 1,
    
    // DB 초기화
    init: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    },
    
    // 음원 저장
    save: async function(id, audioData, metadata) {
        try {
            const db = await this.init();
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const audioFile = {
                id: id,
                data: audioData,
                ...metadata
            };
            
            return new Promise((resolve, reject) => {
                const request = store.put(audioFile);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('AudioDB save error:', error);
            throw error;
        }
    },
    
    // 음원 가져오기
    get: async function(id) {
        try {
            const db = await this.init();
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve, reject) => {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('AudioDB get error:', error);
            throw error;
        }
    },
    
    // 음원 삭제
    delete: async function(id) {
        try {
            const db = await this.init();
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve, reject) => {
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('AudioDB delete error:', error);
            throw error;
        }
    },
    
    // 모든 음원 ID 목록 가져오기
    getAllIds: async function() {
        try {
            const db = await this.init();
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve, reject) => {
                const request = store.getAllKeys();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('AudioDB getAllIds error:', error);
            throw error;
        }
    }
};


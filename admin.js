// 관리자 페이지 스크립트

// 초기화
$(document).ready(() => {
    console.log('관리자 페이지 초기화 시작');
    
    // 데이터 초기화
    try {
        initData();
        console.log('데이터 초기화 완료');
    } catch (error) {
        console.error('데이터 초기화 오류:', error);
    }
    
    // 각 섹션 렌더링
    try {
        renderBannerImagesList();
        console.log('배너 이미지 목록 로드 완료');
    } catch (error) {
        console.error('배너 이미지 목록 로드 오류:', error);
    }
    
    try {
        renderVideosTable();
        console.log('영상 테이블 렌더링 완료');
    } catch (error) {
        console.error('영상 테이블 렌더링 오류:', error);
    }
    
    try {
        renderMusicTable();
        renderPostsTable();
        renderProductsTable();
        renderUsersTable();
        renderOrdersTable();
        console.log('모든 테이블 렌더링 완료');
    } catch (error) {
        console.error('테이블 렌더링 오류:', error);
    }

    // Random Stars
    for (let i = 0; i < 50; i++) {
        const star = $('<div class="star"></div>');
        const size = Math.random() * 3;
        star.css({
            width: size + 'px',
            height: size + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 5 + 's'
        });
        $('#stars-container').append(star);
    }

    // 로고 업로드
    $('#btn-upload-logo').click(() => {
        const fileInput = $('#admin-logo-input')[0];
        const file = fileInput.files[0];
        if (!file) {
            alert('로고 파일을 선택해주세요.');
            return;
        }

        if (!file.type.match('image.*')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const logoData = e.target.result;
            store.set('site_logo', logoData);
            $('#current-logo-preview').attr('src', logoData);
            alert('로고가 업로드되었습니다!');
            fileInput.value = '';
        };
        reader.onerror = function() {
            alert('파일 읽기에 실패했습니다.');
        };
        reader.readAsDataURL(file);
    });

    // 로고 삭제
    $('#btn-remove-logo').click(() => {
        if (confirm('로고를 삭제하시겠습니까?')) {
            store.remove('site_logo');
            $('#current-logo-preview').attr('src', 'https://via.placeholder.com/200/302b63/ffffff?text=No+Logo');
            alert('로고가 삭제되었습니다!');
        }
    });

    // 로고 로드
    function loadCurrentLogo() {
        try {
            const logoData = store.get('site_logo');
            const $preview = $('#current-logo-preview');
            
            if (logoData && typeof logoData === 'string' && (logoData.startsWith('data:') || logoData.startsWith('http://') || logoData.startsWith('https://'))) {
                $preview.attr('src', logoData);
            } else {
                $preview.attr('src', 'https://via.placeholder.com/200/302b63/ffffff?text=No+Logo');
            }
            
            // 이미지 로드 실패 시 fallback
            $preview.on('error', function() {
                $(this).off('error');
                $(this).attr('src', 'https://via.placeholder.com/200/302b63/ffffff?text=No+Logo');
            });
        } catch (error) {
            console.error('loadCurrentLogo error:', error);
            $('#current-logo-preview').attr('src', 'https://via.placeholder.com/200/302b63/ffffff?text=No+Logo');
        }
    }
    loadCurrentLogo();

    // 메인 배너 이미지 추가 (슬라이더용)
    $('#btn-upload-image').click(() => {
        const fileInput = $('#admin-img-input')[0];
        const file = fileInput.files[0];
        if (!file) {
            alert('이미지 파일을 선택해주세요.');
            return;
        }

        if (!file.type.match('image.*')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        // 파일 크기 제한 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('이미지 파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        // 최대 개수 제한 (10개)
        const currentImages = bannerImages.get();
        if (currentImages.length >= 10) {
            alert('최대 10개까지 등록할 수 있습니다. 기존 이미지를 삭제한 후 다시 시도해주세요.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const imageData = e.target.result;
                console.log('이미지 데이터 로드 완료, 크기:', imageData.length);
                
                // 이미지 배열에 추가
                bannerImages.add(imageData);
                console.log('이미지 추가 완료');
                
                // 목록 새로고침
                renderBannerImagesList();
                
                alert('이미지가 추가되었습니다! (총 ' + bannerImages.get().length + '개)');
                fileInput.value = '';
            } catch (error) {
                console.error('이미지 업로드 오류:', error);
                if (error.name === 'QuotaExceededError') {
                    alert('저장 공간이 부족합니다. 일부 이미지를 삭제한 후 다시 시도해주세요.');
                } else {
                    alert('이미지 업로드 중 오류가 발생했습니다: ' + (error.message || error));
                }
            }
        };
        reader.onerror = function(error) {
            console.error('파일 읽기 오류:', error);
            alert('파일 읽기에 실패했습니다.');
        };
        reader.readAsDataURL(file);
    });

    // 전체 이미지 삭제
    $('#btn-clear-all-images').click(() => {
        const images = bannerImages.get();
        if (images.length === 0) {
            alert('삭제할 이미지가 없습니다.');
            return;
        }
        
        if (confirm(`등록된 모든 이미지(${images.length}개)를 삭제하시겠습니까?`)) {
            try {
                bannerImages.set([]);
                renderBannerImagesList();
                alert('모든 이미지가 삭제되었습니다!');
            } catch (error) {
                console.error('이미지 삭제 오류:', error);
                alert('이미지 삭제 중 오류가 발생했습니다.');
            }
        }
    });

    // 영상 추가
    $('#btn-add-video').click(() => {
        try {
            const videoId = $('#admin-video-id').val().trim();
            const videoTitle = $('#admin-video-title').val().trim();

            if (!videoId) {
                alert('YouTube ID를 입력해주세요.');
                return;
            }

            if (!videoTitle) {
                alert('영상 제목을 입력해주세요.');
                return;
            }

            // YouTube ID 유효성 검사 (11자리 영숫자와 하이픈, 언더스코어만 허용)
            if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                alert('올바른 YouTube ID 형식이 아닙니다. (11자리 영숫자)');
                return;
            }

            const videos = store.get('videos', []);
            
            // videos가 배열이 아닌 경우 초기화
            if (!Array.isArray(videos)) {
                console.warn('videos가 배열이 아닙니다. 초기화합니다.');
                store.set('videos', []);
            }
            
            const currentVideos = Array.isArray(videos) ? videos : [];
            
            // 중복 체크
            if (currentVideos.some(v => v && v.id === videoId)) {
                alert('이미 등록된 YouTube ID입니다.');
                return;
            }
            
            currentVideos.unshift({ 
                id: videoId, 
                title: videoTitle 
            });
            
            store.set('videos', currentVideos);
            console.log('영상 추가 완료:', { id: videoId, title: videoTitle });
            
            $('#admin-video-id').val('');
            $('#admin-video-title').val('');
            renderVideosTable();
            alert('영상이 추가되었습니다!');
        } catch (error) {
            console.error('영상 추가 오류:', error);
            alert('영상 추가 중 오류가 발생했습니다: ' + (error.message || error));
        }
    });

    // 음원 추가
    $('#btn-add-music').click(async () => {
        const title = $('#admin-music-title').val().trim();
        const fileInput = $('#admin-music-file')[0];
        const file = fileInput.files[0];

        if (!title) {
            alert('곡 제목을 입력해주세요.');
            return;
        }

        if (!file) {
            alert('음원 파일을 선택해주세요.');
            return;
        }

        if (!file.type.startsWith('audio/')) {
            alert('오디오 파일만 업로드 가능합니다.');
            return;
        }

        // 파일 크기 제한 (50MB - IndexedDB는 더 큰 용량 지원)
        if (file.size > 50 * 1024 * 1024) {
            alert('파일 크기는 50MB 이하여야 합니다.');
            return;
        }

        // 로딩 표시
        const btn = $('#btn-add-music');
        const originalText = btn.html();
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> 업로드 중...');

        try {
            // FileReader를 사용하여 base64로 변환
            const audioData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(new Error('파일 읽기 실패'));
                reader.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentLoaded = Math.round((e.loaded / e.total) * 100);
                        btn.html(`<i class="fas fa-spinner fa-spin"></i> 업로드 중... ${percentLoaded}%`);
                    }
                };
                reader.readAsDataURL(file);
            });

            // IndexedDB에 저장
            const musicId = Date.now();
            await audioDB.save(musicId, audioData, {
                title: title,
                filename: file.name,
                type: file.type,
                size: file.size
            });

            // 메타데이터만 localStorage에 저장 (용량 절약)
            const music = store.get('music', []);
            music.unshift({ 
                id: musicId, 
                title: title, 
                url: 'indexeddb://' + musicId, // IndexedDB 참조 표시
                filename: file.name,
                type: file.type,
                storedIn: 'indexeddb' // 저장 위치 표시
            });
            
            // localStorage에 메타데이터만 저장 (용량 절약)
            try {
                store.set('music', music);
            } catch (storageError) {
                // localStorage가 가득 찬 경우, 오래된 항목 제거 시도
                if (storageError.name === 'QuotaExceededError') {
                    alert('저장 공간이 부족합니다. 일부 오래된 데이터를 삭제해주세요.');
                    throw storageError;
                }
                throw storageError;
            }
            
            $('#admin-music-title').val('');
            fileInput.value = '';
            renderMusicTable();
            alert('음원이 추가되었습니다!');
        } catch (error) {
            console.error('음원 저장 오류:', error);
            alert('음원 저장 중 오류가 발생했습니다: ' + (error.message || error));
        } finally {
            btn.prop('disabled', false).html(originalText);
        }
    });

    // 상품 이미지 미리보기
    $('#admin-product-image').change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#admin-product-image-preview').html(
                    `<img src="${e.target.result}" class="image-preview" style="max-width: 200px; max-height: 200px;">`
                );
            };
            reader.readAsDataURL(file);
        }
    });

    // 상품 추가
    $('#btn-add-product').click(() => {
        const name = $('#admin-product-name').val().trim();
        const price = parseInt($('#admin-product-price').val());
        const category = $('#admin-product-category').val();
        const stock = parseInt($('#admin-product-stock').val()) || 0;
        const rating = parseFloat($('#admin-product-rating').val()) || null;
        const reviews = parseInt($('#admin-product-reviews').val()) || 0;
        const description = $('#admin-product-description').val().trim();
        const fileInput = $('#admin-product-image')[0];
        const file = fileInput.files[0];

        if (!name) {
            alert('상품명을 입력해주세요.');
            return;
        }

        if (!price || price <= 0) {
            alert('가격을 올바르게 입력해주세요.');
            return;
        }

        if (!description) {
            alert('상품 설명을 입력해주세요.');
            return;
        }

        // 이미지 처리
        const processImage = (imageData) => {
            const products = store.get('products', []);
            const newId = Date.now().toString();
            
            products.push({
                id: newId,
                name: name,
                description: description,
                price: price,
                image: imageData || 'https://via.placeholder.com/400x400/302b63/ffffff?text=No+Image',
                category: category,
                stock: stock,
                rating: rating,
                reviews: reviews
            });
            
            store.set('products', products);
            renderProductsTable();
            resetProductForm();
            alert('상품이 추가되었습니다!');
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                processImage(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            processImage(null);
        }
    });

    // 상품 폼 초기화
    $('#btn-reset-product-form').click(() => {
        resetProductForm();
    });

    // 회원 검색
    $('#admin-user-search').on('input', function() {
        renderUsersTable();
    });

    // 결제 로그 검색 및 필터
    $('#admin-order-search').on('input', function() {
        renderOrdersTable();
    });
    $('#admin-order-status-filter').change(function() {
        renderOrdersTable();
    });

    // 모든 변경사항 저장 및 반영 버튼
    $('#btn-save-all').click(() => {
        // 모든 데이터가 이미 localStorage에 저장되어 있으므로, 메인 페이지로 이동하여 확인
        if (confirm('모든 변경사항이 저장되었습니다. 메인 페이지에서 확인하시겠습니까?')) {
            window.open('index.html', '_blank');
        } else {
            alert('모든 변경사항이 저장되었습니다!');
        }
    });
});

// 상품 폼 초기화 함수
function resetProductForm() {
    $('#admin-product-name').val('');
    $('#admin-product-price').val('');
    $('#admin-product-category').val('포토카드');
    $('#admin-product-stock').val('');
    $('#admin-product-rating').val('');
    $('#admin-product-reviews').val('');
    $('#admin-product-description').val('');
    $('#admin-product-image').val('');
    $('#admin-product-image-preview').html('');
}

// 배너 이미지 목록 렌더링
function renderBannerImagesList() {
    try {
        const images = bannerImages.get();
        const $list = $('#banner-images-list');
        
        if (!Array.isArray(images) || images.length === 0) {
            $list.html(`
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>등록된 이미지가 없습니다.</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">위에서 이미지를 추가해주세요.</p>
                </div>
            `);
            return;
        }
        
        const html = `
            <div style="margin-bottom: 15px;">
                <strong style="color: var(--accent-pink);">등록된 이미지: ${images.length}개</strong>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                ${images.map((img, index) => `
                    <div class="banner-image-item" style="position: relative; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 10px; border: 2px solid var(--glass-border);">
                        <div style="position: relative; padding-top: 100%; overflow: hidden; border-radius: 8px; margin-bottom: 10px;">
                            <img src="${img}" alt="Banner ${index + 1}" 
                                 style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
                                 onerror="this.onerror=null; this.src='https://via.placeholder.com/200/302b63/ffffff?text=Error';">
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">이미지 #${index + 1}</div>
                            <div style="display: flex; gap: 5px; justify-content: center;">
                                <button class="btn-danger btn-small" onclick="deleteBannerImage(${index})" style="font-size: 0.8rem; padding: 5px 10px;">
                                    <i class="fas fa-trash"></i> 삭제
                                </button>
                                ${index > 0 ? `
                                    <button class="btn-primary btn-small" onclick="moveBannerImage(${index}, -1)" style="font-size: 0.8rem; padding: 5px 10px;">
                                        <i class="fas fa-arrow-up"></i>
                                    </button>
                                ` : ''}
                                ${index < images.length - 1 ? `
                                    <button class="btn-primary btn-small" onclick="moveBannerImage(${index}, 1)" style="font-size: 0.8rem; padding: 5px 10px;">
                                        <i class="fas fa-arrow-down"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        $list.html(html);
        console.log('배너 이미지 목록 렌더링 완료:', images.length + '개');
    } catch (error) {
        console.error('renderBannerImagesList error:', error);
        $('#banner-images-list').html('<p style="color: #ff6b6b;">이미지 목록을 불러오는 중 오류가 발생했습니다.</p>');
    }
}

// 배너 이미지 삭제
window.deleteBannerImage = function(index) {
    if (confirm(`이미지 #${index + 1}을(를) 삭제하시겠습니까?`)) {
        try {
            bannerImages.remove(index);
            renderBannerImagesList();
            alert('이미지가 삭제되었습니다!');
        } catch (error) {
            console.error('이미지 삭제 오류:', error);
            alert('이미지 삭제 중 오류가 발생했습니다.');
        }
    }
};

// 배너 이미지 순서 변경
window.moveBannerImage = function(index, direction) {
    try {
        const images = bannerImages.get();
        if (!Array.isArray(images) || index < 0 || index >= images.length) {
            return;
        }
        
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= images.length) {
            return;
        }
        
        // 배열 요소 교환
        [images[index], images[newIndex]] = [images[newIndex], images[index]];
        bannerImages.set(images);
        renderBannerImagesList();
    } catch (error) {
        console.error('이미지 순서 변경 오류:', error);
        alert('이미지 순서 변경 중 오류가 발생했습니다.');
    }
};

// 현재 이미지 로드 (하위 호환성)
function loadCurrentImage() {
    renderBannerImagesList();
}

// 영상 테이블 렌더링
function renderVideosTable() {
    try {
        const videos = store.get('videos', []);
        
        // videos가 배열이 아닌 경우 처리
        if (!Array.isArray(videos)) {
            console.error('videos가 배열이 아닙니다:', videos);
            $('#video-table-body').html('<tr><td colspan="4" style="text-align:center; color:#ff6b6b;">데이터 형식 오류가 발생했습니다. 페이지를 새로고침해주세요.</td></tr>');
            return;
        }
        
        if (videos.length === 0) {
            $('#video-table-body').html('<tr><td colspan="4" style="text-align:center; color:#ccc;">등록된 영상이 없습니다.</td></tr>');
            return;
        }

        const html = videos.map((v, index) => {
            // 데이터 유효성 검사
            if (!v || !v.id || !v.title) {
                console.warn('유효하지 않은 영상 데이터:', v);
                return '';
            }
            
            // XSS 방지를 위한 이스케이프 처리
            const title = String(v.title).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const videoId = String(v.id).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            return `
        <tr>
            <td>${title}</td>
            <td>${videoId}</td>
            <td>
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="color: var(--accent-blue);">
                    <i class="fas fa-external-link-alt"></i> 보기
                </a>
            </td>
            <td>
                <button class="btn-danger btn-small" onclick="deleteVideo(${index})">삭제</button>
                <button class="btn-primary btn-small" onclick="editVideo(${index})">수정</button>
            </td>
        </tr>
    `;
        }).filter(html => html !== '').join('');
        
        $('#video-table-body').html(html || '<tr><td colspan="4" style="text-align:center; color:#ccc;">등록된 영상이 없습니다.</td></tr>');
    } catch (error) {
        console.error('renderVideosTable error:', error);
        $('#video-table-body').html('<tr><td colspan="4" style="text-align:center; color:#ff6b6b;">영상 목록을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.</td></tr>');
    }
}

// 음원 테이블 렌더링
function renderMusicTable() {
    const music = store.get('music', []);
    if (music.length === 0) {
        $('#music-table-body').html('<tr><td colspan="3" style="text-align:center; color:#ccc;">등록된 음원이 없습니다.</td></tr>');
        return;
    }

    const html = music.map((m, index) => `
        <tr>
            <td>${m.title}</td>
            <td>${m.filename || 'N/A'}</td>
            <td>
                <button class="btn-danger btn-small" onclick="deleteMusic(${index})">삭제</button>
                <button class="btn-primary btn-small" onclick="editMusic(${index})">수정</button>
            </td>
        </tr>
    `).join('');
    $('#music-table-body').html(html);
}

// 응원 메시지 테이블 렌더링
function renderPostsTable() {
    const posts = store.get('posts', []);
    if (posts.length === 0) {
        $('#post-table-body').html('<tr><td colspan="6" style="text-align:center; color:#ccc;">등록된 메시지가 없습니다.</td></tr>');
        return;
    }

    const html = posts.map((p, index) => {
        const date = p.timestamp ? new Date(p.timestamp).toLocaleDateString() : 'N/A';
        const contentPreview = p.content.length > 50 ? p.content.substring(0, 50) + '...' : p.content;
        return `
        <tr>
            <td>${p.author}</td>
            <td>${contentPreview}</td>
            <td>${p.likes || 0}</td>
            <td>${p.comments ? p.comments.length : 0}</td>
            <td>${date}</td>
            <td>
                <button class="btn-danger btn-small" onclick="deletePost(${index})">삭제</button>
            </td>
        </tr>
        `;
    }).join('');
    $('#post-table-body').html(html);
}

// 영상 삭제
window.deleteVideo = function(index) {
    if (confirm('이 영상을 삭제하시겠습니까?')) {
        const videos = store.get('videos', []);
        videos.splice(index, 1);
        store.set('videos', videos);
        renderVideosTable();
        alert('영상이 삭제되었습니다!');
    }
};

// 영상 수정
window.editVideo = function(index) {
    const videos = store.get('videos', []);
    const video = videos[index];
    
    const newId = prompt('YouTube ID를 입력하세요:', video.id);
    if (newId === null) return;
    
    const newTitle = prompt('영상 제목을 입력하세요:', video.title);
    if (newTitle === null) return;

    if (newId && newTitle) {
        videos[index] = { id: newId.trim(), title: newTitle.trim() };
        store.set('videos', videos);
        renderVideosTable();
        alert('영상 정보가 수정되었습니다!');
    }
};

// 음원 삭제
window.deleteMusic = async function(index) {
    if (confirm('이 음원을 삭제하시겠습니까?')) {
        const music = store.get('music', []);
        const musicItem = music[index];
        
        try {
            // IndexedDB에서 삭제
            if (musicItem.storedIn === 'indexeddb' || musicItem.url?.startsWith('indexeddb://')) {
                const musicId = musicItem.id;
                await audioDB.delete(musicId);
            }
            
            // Blob URL 해제 (기존 방식 지원)
            if (musicItem.url && musicItem.url.startsWith('blob:')) {
                URL.revokeObjectURL(musicItem.url);
            }
            
            // localStorage에서 메타데이터 삭제
            music.splice(index, 1);
            store.set('music', music);
            renderMusicTable();
            alert('음원이 삭제되었습니다!');
        } catch (error) {
            console.error('음원 삭제 오류:', error);
            alert('음원 삭제 중 오류가 발생했습니다: ' + (error.message || error));
        }
    }
};

// 음원 수정
window.editMusic = function(index) {
    const music = store.get('music', []);
    const musicItem = music[index];
    
    const newTitle = prompt('곡 제목을 입력하세요:', musicItem.title);
    if (newTitle === null || !newTitle.trim()) return;

    music[index].title = newTitle.trim();
    store.set('music', music);
    renderMusicTable();
    alert('음원 정보가 수정되었습니다!');
};

// 응원 메시지 삭제
window.deletePost = function(index) {
    if (confirm('이 응원 메시지를 삭제하시겠습니까?')) {
        const posts = store.get('posts', []);
        posts.splice(index, 1);
        store.set('posts', posts);
        renderPostsTable();
        alert('응원 메시지가 삭제되었습니다!');
    }
};

// 상품 테이블 렌더링
function renderProductsTable() {
    const products = store.get('products', []);
    if (products.length === 0) {
        $('#product-table-body').html('<tr><td colspan="7" style="text-align:center; color:#ccc;">등록된 상품이 없습니다.</td></tr>');
        return;
    }

    const html = products.map((p, index) => `
        <tr>
            <td><img src="${p.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.price.toLocaleString()}원</td>
            <td>${p.stock}개</td>
            <td>${p.rating ? '★ ' + p.rating + ' (' + p.reviews + ')' : '-'}</td>
            <td>
                <button class="btn-primary btn-small" onclick="editProduct(${index})">수정</button>
                <button class="btn-danger btn-small" onclick="deleteProduct(${index})">삭제</button>
            </td>
        </tr>
    `).join('');
    $('#product-table-body').html(html);
}

// 상품 수정
window.editProduct = function(index) {
    const products = store.get('products', []);
    const product = products[index];
    
    // 폼에 데이터 채우기
    $('#admin-product-name').val(product.name);
    $('#admin-product-price').val(product.price);
    $('#admin-product-category').val(product.category);
    $('#admin-product-stock').val(product.stock);
    $('#admin-product-rating').val(product.rating || '');
    $('#admin-product-reviews').val(product.reviews || 0);
    $('#admin-product-description').val(product.description);
    $('#admin-product-image-preview').html(`<img src="${product.image}" class="image-preview" style="max-width: 200px; max-height: 200px;">`);
    
    // 상품 추가 버튼을 수정 버튼으로 변경
    const addBtn = $('#btn-add-product');
    const originalText = addBtn.text();
    addBtn.text('상품 수정').off('click').on('click', function() {
        const name = $('#admin-product-name').val().trim();
        const price = parseInt($('#admin-product-price').val());
        const category = $('#admin-product-category').val();
        const stock = parseInt($('#admin-product-stock').val()) || 0;
        const rating = parseFloat($('#admin-product-rating').val()) || null;
        const reviews = parseInt($('#admin-product-reviews').val()) || 0;
        const description = $('#admin-product-description').val().trim();
        const fileInput = $('#admin-product-image')[0];
        const file = fileInput.files[0];

        if (!name || !price || !description) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        const updateProduct = (imageData) => {
            products[index] = {
                ...products[index],
                name: name,
                description: description,
                price: price,
                image: imageData || products[index].image,
                category: category,
                stock: stock,
                rating: rating,
                reviews: reviews
            };
            
            store.set('products', products);
            renderProductsTable();
            resetProductForm();
            addBtn.text(originalText).off('click').on('click', arguments.callee);
            alert('상품이 수정되었습니다!');
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updateProduct(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            updateProduct(null);
        }
    });
    
    // 스크롤을 폼으로 이동
    $('html, body').animate({
        scrollTop: $('#admin-product-name').offset().top - 100
    }, 500);
};

// 상품 삭제
window.deleteProduct = function(index) {
    if (confirm('이 상품을 삭제하시겠습니까?')) {
        const products = store.get('products', []);
        products.splice(index, 1);
        store.set('products', products);
        renderProductsTable();
        alert('상품이 삭제되었습니다!');
    }
};

// 회원 테이블 렌더링
function renderUsersTable() {
    const users = store.get('users', []);
    const searchTerm = $('#admin-user-search').val().toLowerCase();
    
    let filteredUsers = users;
    if (searchTerm) {
        filteredUsers = users.filter(u => 
            (u.email && u.email.toLowerCase().includes(searchTerm)) ||
            (u.nickname && u.nickname.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filteredUsers.length === 0) {
        $('#user-table-body').html('<tr><td colspan="5" style="text-align:center; color:#ccc;">등록된 회원이 없습니다.</td></tr>');
        return;
    }

    const html = filteredUsers.map((u, index) => {
        const signupDate = u.signupDate ? new Date(u.signupDate).toLocaleDateString() : 'N/A';
        const countryNames = {
            'KR': '대한민국',
            'US': '미국',
            'JP': '일본',
            'CN': '중국',
            'Other': '기타'
        };
        return `
        <tr>
            <td>${u.nickname || '-'}</td>
            <td>${u.email || '-'}</td>
            <td>${countryNames[u.country] || u.country || '-'}</td>
            <td>${signupDate}</td>
            <td>
                <button class="btn-danger btn-small" onclick="deleteUser(${index})">삭제</button>
            </td>
        </tr>
        `;
    }).join('');
    $('#user-table-body').html(html);
}

// 회원 삭제
window.deleteUser = function(index) {
    if (confirm('이 회원을 삭제하시겠습니까? 회원의 모든 데이터가 삭제됩니다.')) {
        const users = store.get('users', []);
        const user = users[index];
        
        // 회원의 게시글도 삭제 (선택사항)
        if (confirm('이 회원의 응원 메시지도 함께 삭제하시겠습니까?')) {
            const posts = store.get('posts', []);
            const filteredPosts = posts.filter(p => p.author !== user.nickname);
            store.set('posts', filteredPosts);
            renderPostsTable();
        }
        
        users.splice(index, 1);
        store.set('users', users);
        renderUsersTable();
        alert('회원이 삭제되었습니다!');
    }
};

// 결제 로그 테이블 렌더링
function renderOrdersTable() {
    const orders = store.get('orders', []);
    const searchTerm = $('#admin-order-search').val().toLowerCase();
    const statusFilter = $('#admin-order-status-filter').val();
    
    let filteredOrders = orders;
    
    // 검색 필터
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(o => 
            (o.id && o.id.toLowerCase().includes(searchTerm)) ||
            (o.impUid && o.impUid.toLowerCase().includes(searchTerm)) ||
            (o.shippingInfo && o.shippingInfo.name && o.shippingInfo.name.toLowerCase().includes(searchTerm))
        );
    }
    
    // 상태 필터
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(o => o.status === statusFilter);
    }
    
    // 최신순 정렬
    filteredOrders.sort((a, b) => {
        const dateA = new Date(a.paidAt || a.createdAt || 0);
        const dateB = new Date(b.paidAt || b.createdAt || 0);
        return dateB - dateA;
    });
    
    if (filteredOrders.length === 0) {
        $('#order-table-body').html('<tr><td colspan="7" style="text-align:center; color:#ccc;">결제 로그가 없습니다.</td></tr>');
        return;
    }

    const html = filteredOrders.map((o, index) => {
        const paidDate = o.paidAt ? new Date(o.paidAt).toLocaleString() : 'N/A';
        const productNames = o.items ? o.items.map(item => item.name).join(', ') : '-';
        const totalAmount = o.totalAmount || 0;
        const shippingFee = o.shippingFee || 0;
        const finalAmount = totalAmount + shippingFee;
        const statusColors = {
            'PAID': '#4CAF50',
            'PENDING': '#FF9800',
            'CANCELLED': '#F44336'
        };
        const statusTexts = {
            'PAID': '결제 완료',
            'PENDING': '결제 대기',
            'CANCELLED': '취소됨'
        };
        
        return `
        <tr>
            <td>${o.id || o.impUid || '-'}</td>
            <td>${o.shippingInfo ? o.shippingInfo.name : '-'}</td>
            <td>${productNames.length > 30 ? productNames.substring(0, 30) + '...' : productNames}</td>
            <td>${finalAmount.toLocaleString()}원</td>
            <td><span style="color: ${statusColors[o.status] || '#ccc'}; font-weight: 600;">${statusTexts[o.status] || o.status}</span></td>
            <td>${paidDate}</td>
            <td>
                <button class="btn-primary btn-small" onclick="viewOrderDetail(${index})">상세</button>
                ${o.status === 'PAID' ? `<button class="btn-danger btn-small" onclick="cancelOrder(${index})">취소</button>` : ''}
            </td>
        </tr>
        `;
    }).join('');
    $('#order-table-body').html(html);
}

// 주문 상세 보기
window.viewOrderDetail = function(index) {
    const orders = store.get('orders', []);
    const searchTerm = $('#admin-order-search').val().toLowerCase();
    const statusFilter = $('#admin-order-status-filter').val();
    
    let filteredOrders = orders;
    if (searchTerm) {
        filteredOrders = orders.filter(o => 
            (o.id && o.id.toLowerCase().includes(searchTerm)) ||
            (o.impUid && o.impUid.toLowerCase().includes(searchTerm))
        );
    }
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(o => o.status === statusFilter);
    }
    
    const order = filteredOrders[index];
    if (!order) return;
    
    const itemsHtml = order.items ? order.items.map(item => 
        `<li>${item.name} x ${item.quantity} = ${(item.price * item.quantity).toLocaleString()}원</li>`
    ).join('') : '<li>상품 정보 없음</li>';
    
    const detailHtml = `
        <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; margin-top: 10px;">
            <h3 style="color: var(--accent-pink); margin-bottom: 15px;">주문 상세 정보</h3>
            <p><strong>주문번호:</strong> ${order.id || order.impUid || '-'}</p>
            <p><strong>결제번호:</strong> ${order.impUid || '-'}</p>
            <p><strong>상태:</strong> ${order.status || '-'}</p>
            <p><strong>상품 목록:</strong></p>
            <ul style="margin-left: 20px;">${itemsHtml}</ul>
            <p><strong>상품 금액:</strong> ${(order.totalAmount || 0).toLocaleString()}원</p>
            <p><strong>배송비:</strong> ${(order.shippingFee || 0).toLocaleString()}원</p>
            <p><strong>총 결제금액:</strong> ${((order.totalAmount || 0) + (order.shippingFee || 0)).toLocaleString()}원</p>
            ${order.shippingInfo ? `
                <p><strong>배송지 정보:</strong></p>
                <ul style="margin-left: 20px;">
                    <li>이름: ${order.shippingInfo.name || '-'}</li>
                    <li>전화번호: ${order.shippingInfo.phone || '-'}</li>
                    <li>우편번호: ${order.shippingInfo.postcode || '-'}</li>
                    <li>주소: ${order.shippingInfo.addr || '-'}</li>
                </ul>
            ` : ''}
            <p><strong>결제일:</strong> ${order.paidAt ? new Date(order.paidAt).toLocaleString() : '-'}</p>
        </div>
    `;
    
    alert(detailHtml.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n'));
};

// 주문 취소
window.cancelOrder = function(index) {
    if (!confirm('이 주문을 취소하시겠습니까? 취소된 주문은 복구할 수 없습니다.')) {
        return;
    }
    
    const orders = store.get('orders', []);
    const searchTerm = $('#admin-order-search').val().toLowerCase();
    const statusFilter = $('#admin-order-status-filter').val();
    
    let filteredOrders = orders;
    if (searchTerm) {
        filteredOrders = orders.filter(o => 
            (o.id && o.id.toLowerCase().includes(searchTerm)) ||
            (o.impUid && o.impUid.toLowerCase().includes(searchTerm))
        );
    }
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(o => o.status === statusFilter);
    }
    
    const order = filteredOrders[index];
    if (!order) return;
    
    // 실제 orders 배열에서 찾기
    const actualIndex = orders.findIndex(o => o.id === order.id || o.impUid === order.impUid);
    if (actualIndex !== -1) {
        orders[actualIndex].status = 'CANCELLED';
        store.set('orders', orders);
        renderOrdersTable();
        alert('주문이 취소되었습니다!');
    }
};


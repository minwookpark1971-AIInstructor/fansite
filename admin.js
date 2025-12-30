// 관리자 페이지 스크립트

// 초기화
$(document).ready(() => {
    initData();
    loadCurrentImage();
    renderVideosTable();
    renderMusicTable();
    renderPostsTable();

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
        const logoData = store.get('site_logo');
        if (logoData) {
            $('#current-logo-preview').attr('src', logoData);
        }
    }
    loadCurrentLogo();

    // 메인 이미지 업로드
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

        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            backgroundImage.set(imageData);
            $('#current-image-preview').attr('src', imageData);
            alert('이미지가 업로드되었습니다!');
            fileInput.value = '';
        };
        reader.onerror = function() {
            alert('파일 읽기에 실패했습니다.');
        };
        reader.readAsDataURL(file);
    });

    // 메인 이미지 삭제
    $('#btn-remove-image').click(() => {
        if (confirm('메인 이미지를 삭제하시겠습니까?')) {
            backgroundImage.remove();
            $('#current-image-preview').attr('src', 'https://via.placeholder.com/300/302b63/ffffff?text=No+Image');
            alert('이미지가 삭제되었습니다!');
        }
    });

    // 영상 추가
    $('#btn-add-video').click(() => {
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

        const videos = store.get('videos', []);
        videos.unshift({ 
            id: videoId, 
            title: videoTitle 
        });
        store.set('videos', videos);
        
        $('#admin-video-id').val('');
        $('#admin-video-title').val('');
        renderVideosTable();
        alert('영상이 추가되었습니다!');
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

// 현재 이미지 로드
function loadCurrentImage() {
    const imgData = backgroundImage.get();
    if (imgData) {
        $('#current-image-preview').attr('src', imgData);
    }
}

// 영상 테이블 렌더링
function renderVideosTable() {
    const videos = store.get('videos', []);
    if (videos.length === 0) {
        $('#video-table-body').html('<tr><td colspan="4" style="text-align:center; color:#ccc;">등록된 영상이 없습니다.</td></tr>');
        return;
    }

    const html = videos.map((v, index) => `
        <tr>
            <td>${v.title}</td>
            <td>${v.id}</td>
            <td>
                <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" style="color: var(--accent-blue);">
                    <i class="fas fa-external-link-alt"></i> 보기
                </a>
            </td>
            <td>
                <button class="btn-danger btn-small" onclick="deleteVideo(${index})">삭제</button>
                <button class="btn-primary btn-small" onclick="editVideo(${index})">수정</button>
            </td>
        </tr>
    `).join('');
    $('#video-table-body').html(html);
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


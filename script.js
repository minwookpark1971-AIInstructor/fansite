// DOM Elements
const $navLinks = $('nav a');
const $sections = $('section');
const $hamburger = $('.hamburger');
const $navUl = $('nav ul');

// Current User
let currentUser = auth.getCurrentUser();

// Navigation Logic
function navigateTo(targetId) {
    $sections.removeClass('active');
    $navLinks.removeClass('active');

    $(`#${targetId}`).addClass('active');
    $(`nav a[data-target="${targetId}"]`).addClass('active');

    // Mobile Menu Close
    $navUl.removeClass('show');

    window.scrollTo(0, 0);
}

// Render Functions
function renderVideos() {
    const videos = store.get('videos', []);
    if (videos.length === 0) {
        $('#video-list').html('<p style="grid-column: 1/-1; text-align:center; color:#ccc;">아직 영상이 없습니다. 관리자 패널에서 추가해주세요!</p>');
        return;
    }
    const html = videos.map(v => `
        <div class="video-item glass-card">
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius:8px;">
                <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                        src="https://www.youtube.com/embed/${v.id}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            </div>
            <div class="video-title">${v.title}</div>
        </div>
    `).join('');
    $('#video-list').html(html);
}

function renderMusic() {
    const music = store.get('music', []);
    const html = music.map((m, index) => {
        // URL을 안전하게 처리 (base64 데이터는 매우 길 수 있으므로 인덱스 사용)
        const musicId = m.id || index;
        return `
        <div class="music-item glass-card" data-music-id="${musicId}">
            <div class="music-info">
                <span class="music-title">${m.title}</span>
            </div>
            <div class="music-controls" style="display:flex; align-items:center;">
                <button onclick="playMusicByIndex(${index})"><i class="fas fa-play"></i></button>
                <div class="equalizer">
                    <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
                </div>
            </div>
        </div>
        `;
    }).join('');
    $('#music-list').html(html);
}

// 인덱스로 음원 재생 (URL 이스케이프 문제 해결)
window.playMusicByIndex = function(index) {
    const music = store.get('music', []);
    if (index >= 0 && index < music.length) {
        const musicItem = music[index];
        if (!musicItem || !musicItem.url) {
            alert('음원 데이터를 불러올 수 없습니다.');
            return;
        }
        const btn = $(`.music-item[data-music-id="${musicItem.id || index}"] button`)[0];
        if (btn) {
            playMusic(musicItem.url, btn);
        } else {
            alert('플레이어를 찾을 수 없습니다.');
        }
    } else {
        alert('유효하지 않은 음원 인덱스입니다.');
    }
};

function renderPosts() {
    const posts = store.get('posts', []);
    if (posts.length === 0) {
        $('#post-list').html('<p style="text-align:center; color:#ccc; padding:20px;">아직 메시지가 없습니다. 첫 번째 메시지를 작성해보세요!</p>');
        return;
    }
    const html = posts.map(p => {
        const isGold = p.likes >= 100;
        const date = p.timestamp ? new Date(p.timestamp).toLocaleDateString() : 'Just now';

        let commentsHtml = '';
        if (p.comments && p.comments.length > 0) {
            commentsHtml = p.comments.map(c => `
                <div class="comment-item">
                    <span class="comment-author">${c.author}</span>${c.text}
                </div>
            `).join('');
        }

        return `
        <div class="glass-card post-item" data-id="${p.id}">
            <div class="post-header">
                <div>
                    <span class="author-name">${p.author}</span>
                    ${isGold ? '<span class="gold-sticker"><i class="fas fa-certificate"></i> Gold Fan</span>' : ''}
                </div>
                <span style="font-size:0.8rem; color:#aaa;">${date}</span>
            </div>
            <div class="post-content" style="min-height:40px; margin-bottom:10px;">${p.content}</div>
            
            <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <div class="like-section" style="margin-top:0; margin-bottom:10px;">
                    <button class="like-btn" onclick="likePost(${p.id})">
                        <i class="fas fa-heart"></i> ${p.likes}
                    </button>
                    <span style="font-size:0.8rem; color:#aaa; margin-left:auto;">댓글 ${p.comments ? p.comments.length : 0}개</span>
                </div>
                
                ${currentUser ? `
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <input type="text" placeholder="댓글을 입력하세요..." class="comment-input" style="margin:0; font-size:0.9rem;">
                    <button onclick="addComment(${p.id}, this)" class="btn-primary" style="margin:0; padding:0 20px; font-size:0.9rem;">작성</button>
                </div>` : ''}
                
                ${commentsHtml ? `<div class="comments-section">${commentsHtml}</div>` : ''}
            </div>
        </div>
        `;
    }).join('');
    $('#post-list').html(html);
}

// Feature Logic
window.playMusic = function (url, btn) {
    const audio = document.getElementById('global-player');
    if (!audio) {
        alert('오디오 플레이어를 찾을 수 없습니다.');
        return;
    }

    if (!btn) {
        alert('재생 버튼을 찾을 수 없습니다.');
        return;
    }

    $('.music-controls button i').removeClass('fa-pause').addClass('fa-play');
    $('.equalizer').removeClass('playing');

    const icon = $(btn).find('i');
    if (icon.length === 0) {
        console.error('아이콘을 찾을 수 없습니다.');
        return;
    }

    // 현재 재생 중인 음원과 같은지 확인
    const currentSrc = audio.src;
    const isSameTrack = currentSrc === url || (currentSrc && url && currentSrc.includes(url.substring(0, 50)));

    if (!audio.paused && isSameTrack) {
        // 일시정지
        audio.pause();
        icon.removeClass('fa-pause').addClass('fa-play');
        $(btn).siblings('.equalizer').removeClass('playing');
        return;
    }

    if (url === '#' || !url || url.trim() === '') {
        alert('이것은 데모 트랙입니다. 관리자 패널에서 실제 MP3 파일을 업로드하세요!');
        return;
    }

    // base64 데이터 또는 blob URL 모두 처리
    try {
        // 오디오 소스 설정
        audio.src = url;
        
        // 로딩 표시
        icon.removeClass('fa-play fa-pause').addClass('fa-spinner fa-spin');
        
        // 오디오 로드 이벤트
        audio.onloadeddata = function() {
            icon.removeClass('fa-spinner fa-spin').addClass('fa-play');
        };

        // 재생 시도
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                icon.removeClass('fa-play fa-spinner fa-spin').addClass('fa-pause');
                $(btn).siblings('.equalizer').addClass('playing');
            }).catch(e => {
                console.error("Playback failed", e);
                icon.removeClass('fa-spinner fa-spin').addClass('fa-play');
                alert("재생에 실패했습니다. 오디오 파일 형식을 확인해주세요.\n오류: " + (e.message || '알 수 없는 오류'));
            });
        }
    } catch (e) {
        console.error("Audio setup failed", e);
        icon.removeClass('fa-spinner fa-spin').addClass('fa-play');
        alert("오디오 설정에 실패했습니다. 파일이 손상되었을 수 있습니다.\n오류: " + (e.message || '알 수 없는 오류'));
    }
};

window.likePost = function (id) {
    const posts = store.get('posts', []);
    const post = posts.find(p => p.id === id);
    if (post) {
        post.likes++;
        store.set('posts', posts);
        renderPosts();
    }
};

window.addComment = function (id, btn) {
    const text = $(btn).siblings('.comment-input').val();
    if (!text) return;

    const posts = store.get('posts', []);
    const post = posts.find(p => p.id === id);
    if (post) {
        if (!post.comments) post.comments = [];
        const commentId = Date.now();
        post.comments.push({ 
            id: commentId,
            author: currentUser.nickname, 
            text: text,
            timestamp: Date.now()
        });
        store.set('posts', posts);
        renderPosts();
    }
};

function updateAuthUI() {
    if (currentUser) {
        $('#nav-auth').hide();
        $('#nav-user').show();
        $('#write-area').show();
        $('#login-prompt').hide();
    } else {
        $('#nav-auth').show();
        $('#nav-user').hide();
        $('#write-area').hide();
        $('#login-prompt').show();
    }
}

function updateUserInfo() {
    if (currentUser) {
        $('#user-nickname').text(currentUser.nickname || '-');
        $('#user-email').text(currentUser.email || '-');
        const countryNames = {
            'KR': '대한민국',
            'US': '미국',
            'JP': '일본',
            'CN': '중국',
            'Other': '기타'
        };
        $('#user-country').text(countryNames[currentUser.country] || currentUser.country || '-');
    }
}

function loadMainImage() {
    const imgData = backgroundImage.get();
    if (imgData) {
        $('#main-hero-img').attr('src', imgData);
        console.log('메인 이미지 로드됨:', imgData.substring(0, 50) + '...');
    } else {
        console.log('저장된 메인 이미지가 없습니다.');
    }
}

function loadSiteLogo() {
    const logoData = store.get('site_logo');
    if (logoData) {
        $('#site-logo').attr('src', logoData).show();
    } else {
        $('#site-logo').hide();
    }
}

// 페이지 로드 시 이미지 다시 로드 (이미지 변경 시 반영)
function refreshMainImage() {
    const imgData = backgroundImage.get();
    if (imgData) {
        $('#main-hero-img').attr('src', imgData);
    }
}

// Storage 이벤트 리스너 추가 (다른 탭에서 변경 시 반영)
window.addEventListener('storage', function(e) {
    if (e.key === 'main_image') {
        refreshMainImage();
    }
});

window.toggleAuth = function (type) {
    if (type === 'signup') {
        navigateTo('signup');
    } else {
        navigateTo('login');
    }
};

// Initialization
$(document).ready(() => {
    initData();

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

    // Initial Renders
    renderVideos();
    renderMusic();
    renderPosts();
    updateAuthUI();
    updateUserInfo();
    loadMainImage();
    loadSiteLogo();

    // 주기적으로 이미지 확인 (관리자 페이지에서 변경 시 반영)
    setInterval(() => {
        refreshMainImage();
        loadSiteLogo();
    }, 1000);

    // Navigation Listeners
    $('nav a').on('click', function (e) {
        e.preventDefault();
        const target = $(this).data('target');
        if (target) {
            navigateTo(target);
        }
    });

    $('.hamburger').on('click', () => {
        $navUl.toggleClass('show');
    });

    // Auth Listeners
    $('#btn-signup').click(() => {
        const nickname = $('#signup-nickname').val();
        const email = $('#signup-email').val();
        const password = $('#signup-password').val();
        const country = $('#signup-country').val();
        
        if (!nickname || !email || !password) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        const users = store.get('users', []);
        if (users.find(u => u.email === email)) {
            alert('이미 등록된 이메일입니다.');
            return;
        }

        // 비밀번호는 간단히 저장 (실제로는 해시화해야 함)
        users.push({ nickname, email, password, country });
        store.set('users', users);
        alert('회원가입이 완료되었습니다! 로그인해주세요.');
        toggleAuth('login');
    });

    $('#btn-login').click(() => {
        const email = $('#login-email').val();
        const password = $('#login-password').val();
        
        if (!email || !password) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        const users = store.get('users', []);
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // 비밀번호는 세션에 저장하지 않음
            const { password, ...userWithoutPassword } = user;
            currentUser = userWithoutPassword;
            auth.setCurrentUser(currentUser);
            updateAuthUI();
            updateUserInfo();
            navigateTo('home');
            alert('환영합니다, ' + currentUser.nickname + '님!');
        } else {
            alert('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
    });

    $('#btn-logout').click((e) => {
        e.preventDefault();
        currentUser = null;
        auth.logout();
        updateAuthUI();
        navigateTo('login');
    });

    // Post Listener
    $('#btn-post').click(() => {
        const content = $('#post-content').val();
        if (content && currentUser) {
            const posts = store.get('posts', []);
            posts.unshift({
                id: Date.now(),
                author: currentUser.nickname,
                content: content,
                likes: 0,
                comments: [],
                timestamp: Date.now()
            });
            store.set('posts', posts);
            $('#post-content').val('');
            renderPosts();
        }
    });
});


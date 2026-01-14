// ========== 새로운 기능 추가 ==========

// Toast 알림 함수
window.showToast = function(message, type = 'info') {
    const toast = $(`
        <div class="toast ${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `);
    $('#toast-container').append(toast);
    setTimeout(() => {
        toast.fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
};

// 로딩 스피너 표시/숨김
window.showLoading = function() {
    $('#loading-spinner').fadeIn(300);
};

window.hideLoading = function() {
    $('#loading-spinner').fadeOut(300);
};

// 최신 소식 렌더링
function renderNews() {
    const news = store.get('news', []);
    if (news.length === 0) {
        // 기본 뉴스 데이터
        const defaultNews = [
            { id: 1, title: '차은우 신곡 발매 예정', excerpt: '새로운 앨범이 곧 발매됩니다.', date: new Date().toLocaleDateString() },
            { id: 2, title: '드라마 출연 소식', excerpt: '새로운 드라마에 출연합니다.', date: new Date(Date.now() - 86400000).toLocaleDateString() },
            { id: 3, title: '팬미팅 일정 공지', excerpt: '다가오는 팬미팅 일정을 확인하세요.', date: new Date(Date.now() - 172800000).toLocaleDateString() }
        ];
        store.set('news', defaultNews);
        renderNews();
        return;
    }
    
    const html = news.slice(0, 6).map(item => `
        <div class="news-item">
            <div class="news-date">${item.date}</div>
            <div class="news-title">${item.title}</div>
            <div class="news-excerpt">${item.excerpt}</div>
        </div>
    `).join('');
    $('#news-grid').html(html);
}

// 영상 모달 닫기
$('#video-modal-close').click(function() {
    $('#video-modal').fadeOut(300);
    $('#video-modal-body').html('');
});

$(document).click(function(e) {
    if ($(e.target).hasClass('modal')) {
        $(e.target).fadeOut(300);
        $('#video-modal-body').html('');
    }
});

// 더보기 버튼
$('#btn-load-more-videos').click(function() {
    videoDisplayCount += 6;
    renderVideos(currentVideoFilter);
});

// 영상 필터 버튼
$(document).on('click', '.filter-btn', function() {
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');
    currentVideoFilter = $(this).data('category');
    videoDisplayCount = 6;
    renderVideos(currentVideoFilter);
});

// 음원 플레이어 바 기능
let currentMusicIndex = -1;
let musicPlayer = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100
};

function updateMusicPlayerBar() {
    const music = store.get('music', []);
    if (currentMusicIndex >= 0 && currentMusicIndex < music.length) {
        $('#music-player-bar').show();
        const currentMusic = music[currentMusicIndex];
        $('#player-track-title').text(currentMusic.title || '재생 중인 곡이 없습니다');
    } else {
        $('#music-player-bar').hide();
    }
}

// 음원 재생 시 플레이어 바 업데이트
const originalPlayMusic = window.playMusic;
window.playMusic = async function(url, btn) {
    await originalPlayMusic(url, btn);
    const music = store.get('music', []);
    const musicItem = $(btn).closest('.music-item');
    const musicId = musicItem.data('music-id');
    currentMusicIndex = music.findIndex(m => (m.id || '') === musicId);
    if (currentMusicIndex === -1) {
        currentMusicIndex = parseInt(musicItem.index());
    }
    updateMusicPlayerBar();
    updateMusicPlayerUI();
};

// 음원 플레이어 UI 업데이트
function updateMusicPlayerUI() {
    const audio = document.getElementById('global-player');
    if (!audio) return;
    
    if (audio.paused) {
        $('#btn-play-pause i').removeClass('fa-pause').addClass('fa-play');
        musicPlayer.isPlaying = false;
    } else {
        $('#btn-play-pause i').removeClass('fa-play').addClass('fa-pause');
        musicPlayer.isPlaying = true;
    }
    
    // 진행 시간 업데이트
    const updateTime = () => {
        if (audio.duration) {
            const current = Math.floor(audio.currentTime);
            const total = Math.floor(audio.duration);
            $('#player-current-time').text(formatTime(current));
            $('#player-duration').text(formatTime(total));
            $('#player-progress').val((audio.currentTime / audio.duration) * 100);
        }
    };
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', () => {
        $('#player-duration').text(formatTime(Math.floor(audio.duration)));
    });
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 플레이어 컨트롤 이벤트
$('#btn-play-pause').click(function() {
    const audio = document.getElementById('global-player');
    if (!audio) return;
    
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
    updateMusicPlayerUI();
});

$('#btn-prev-track').click(function() {
    const music = store.get('music', []);
    if (currentMusicIndex > 0) {
        currentMusicIndex--;
        playMusicByIndex(currentMusicIndex);
    }
});

$('#btn-next-track').click(function() {
    const music = store.get('music', []);
    if (currentMusicIndex < music.length - 1) {
        currentMusicIndex++;
        playMusicByIndex(currentMusicIndex);
    }
});

$('#player-progress').on('input', function() {
    const audio = document.getElementById('global-player');
    if (!audio) return;
    const percent = $(this).val();
    audio.currentTime = (percent / 100) * audio.duration;
});

$('#volume-slider').on('input', function() {
    const audio = document.getElementById('global-player');
    if (!audio) return;
    const volume = $(this).val() / 100;
    audio.volume = volume;
    musicPlayer.volume = volume * 100;
    $('#volume-icon').removeClass('fa-volume-up fa-volume-down fa-volume-mute');
    if (volume === 0) {
        $('#volume-icon').addClass('fa-volume-mute');
    } else if (volume < 0.5) {
        $('#volume-icon').addClass('fa-volume-down');
    } else {
        $('#volume-icon').addClass('fa-volume-up');
    }
});

// 정렬 버튼 클릭
$(document).on('click', '.sort-btn', function() {
    $('.sort-btn').removeClass('active');
    $(this).addClass('active');
    postSortOrder = $(this).data('sort');
    renderPosts();
});

// 글자 수 카운터
$('#post-content').on('input', function() {
    const length = $(this).val().length;
    $('#char-count').text(`${length} / 200`);
});

// 로그인/회원가입 개선 기능
// 비밀번호 표시/숨김 토글
$('#login-password-toggle, #signup-password-toggle').click(function() {
    const input = $(this).siblings('input[type="password"]');
    const icon = $(this).find('i');
    if (input.attr('type') === 'password') {
        input.attr('type', 'text');
        icon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
        input.attr('type', 'password');
        icon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
});

// 비밀번호 강도 체크
$('#signup-password').on('input', function() {
    const password = $(this).val();
    const strength = checkPasswordStrength(password);
    const fill = $('#strength-fill');
    const text = $('#strength-text');
    
    fill.removeClass('weak medium strong');
    if (password.length === 0) {
        fill.css('width', '0%');
        text.text('비밀번호를 입력하세요');
    } else if (strength === 'weak') {
        fill.addClass('weak');
        text.text('약함');
    } else if (strength === 'medium') {
        fill.addClass('medium');
        text.text('보통');
    } else {
        fill.addClass('strong');
        text.text('강함');
    }
});

function checkPasswordStrength(password) {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (score < 2) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
}

// 이메일 중복 확인
$('#btn-check-email').click(function() {
    const email = $('#signup-email').val().trim().toLowerCase();
    if (!email) {
        showToast('이메일을 입력해주세요.', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('올바른 이메일 형식이 아닙니다.', 'error');
        return;
    }
    
    const users = store.get('users', []);
    const exists = users.some(u => u.email === email);
    if (exists) {
        showToast('이미 사용 중인 이메일입니다.', 'error');
    } else {
        showToast('사용 가능한 이메일입니다.', 'success');
    }
});

// 소셜 로그인 (데모)
$('.social-btn').click(function() {
    showToast('소셜 로그인 기능은 준비 중입니다.', 'info');
});

// 상품 상세 모달
window.openProductModal = function(productId) {
    const products = store.get('products', []);
    const product = products.find(p => p.id === productId || p.id === String(productId));
    if (!product) return;
    
    const cart = store.get('cart', []);
    const inCart = cart.find(item => item.id === product.id || item.id === String(product.id));
    const cartQuantity = inCart ? inCart.quantity : 0;
    
    const modalHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
                <img src="${product.image || 'https://via.placeholder.com/400x400/302b63/ffffff?text=No+Image'}" alt="${product.name}" style="width: 100%; border-radius: 15px;" onerror="this.src='https://via.placeholder.com/400x400/302b63/ffffff?text=No+Image'">
            </div>
            <div>
                <h2 style="margin-bottom: 20px;">${product.name}</h2>
                <p style="color: var(--text-muted); margin-bottom: 20px;">${product.description || ''}</p>
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--accent-pink); margin-bottom: 10px;">${(product.price || 0).toLocaleString()}원</div>
                    ${product.rating ? `<div style="color: #ffd700; margin-bottom: 10px;">★ ${product.rating} (${product.reviews || 0}개 리뷰)</div>` : ''}
                    ${product.stock === 0 ? '<div style="color: #ff4757; font-weight: 600;">품절</div>' : `<div style="color: var(--text-muted);">재고: ${product.stock}개</div>`}
                </div>
                <div style="margin-top: 30px;">
                    ${cartQuantity > 0 ? `
                        <div class="cart-controls" style="justify-content: flex-start;">
                            <button class="qty-btn" onclick="updateCartQuantity('${product.id}', -1); openProductModal('${product.id}');">-</button>
                            <span class="cart-qty">${cartQuantity}</span>
                            <button class="qty-btn" onclick="updateCartQuantity('${product.id}', 1); openProductModal('${product.id}');" ${product.stock <= cartQuantity ? 'disabled' : ''}>+</button>
                        </div>
                    ` : `
                        <button class="btn-primary add-to-cart-btn" onclick="addToCart('${product.id}'); openProductModal('${product.id}');" ${product.stock === 0 ? 'disabled' : ''} style="width: 100%;">
                            ${product.stock === 0 ? '품절' : '장바구니 추가'}
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
    $('#product-modal-body').html(modalHtml);
    $('#product-modal').fadeIn(300);
};

$('#product-modal-close').click(function() {
    $('#product-modal').fadeOut(300);
});

// 스크롤 시 네비게이션 배경 변경
$(window).scroll(function() {
    if ($(window).scrollTop() > 50) {
        $('header').addClass('scrolled');
    } else {
        $('header').removeClass('scrolled');
    }
});

// 초기화 시 새 기능 실행
$(document).ready(function() {
    renderNews();
    updateMusicPlayerBar();
    
    // 음원 재생 시 플레이어 바 업데이트
    const audio = document.getElementById('global-player');
    if (audio) {
        audio.addEventListener('play', updateMusicPlayerUI);
        audio.addEventListener('pause', updateMusicPlayerUI);
        audio.addEventListener('ended', function() {
            const music = store.get('music', []);
            if (currentMusicIndex < music.length - 1) {
                currentMusicIndex++;
                playMusicByIndex(currentMusicIndex);
            }
        });
    }
});

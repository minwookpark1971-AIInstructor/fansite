// DOM Elements
const $navLinks = $('nav a');
const $sections = $('section');
const $hamburger = $('.hamburger');
const $navUl = $('nav ul');

// Current User
let currentUser = auth.getCurrentUser();

// Navigation Logic
let isNavigating = false; // 무한 루프 방지 플래그

function navigateTo(targetId) {
    // 이미 네비게이션 중이면 무시
    if (isNavigating) return;
    
    isNavigating = true;
    
    $sections.removeClass('active');
    $navLinks.removeClass('active');

    $(`#${targetId}`).addClass('active');
    $(`nav a[data-target="${targetId}"]`).addClass('active');

    // Mobile Menu Close
    $navUl.removeClass('show');

    // URL 해시 업데이트 (GitHub Pages 호환)
    const currentHash = window.location.hash.substring(1);
    if (targetId === 'home') {
        if (currentHash !== '') {
            // 해시가 없을 때도 처리하기 위해 history API 사용
            if (window.history && window.history.pushState) {
                window.history.pushState(null, null, window.location.pathname);
            } else {
                window.location.hash = '';
            }
        }
    } else {
        if (currentHash !== targetId) {
            window.location.hash = targetId;
        }
    }

    // 섹션별 렌더링
    if (targetId === 'shop') {
        renderShop();
    } else if (targetId === 'videos') {
        renderVideos();
    } else if (targetId === 'music') {
        renderMusic();
    } else if (targetId === 'community') {
        renderPosts();
    }

    window.scrollTo(0, 0);
    
    // 플래그 리셋 (약간의 지연을 두어 hashchange 이벤트가 처리되도록)
    setTimeout(() => {
        isNavigating = false;
    }, 100);
}

// Render Functions
let currentVideoFilter = 'all';
let videoDisplayCount = 6;

function renderVideos(filter = 'all') {
    const videos = store.get('videos', []);
    if (videos.length === 0) {
        $('#video-list').html('<p style="grid-column: 1/-1; text-align:center; color:#ccc;">아직 영상이 없습니다. 관리자 패널에서 추가해주세요!</p>');
        return;
    }
    
    let filteredVideos = videos;
    if (filter !== 'all') {
        filteredVideos = videos.filter(v => v.category === filter);
    }
    
    const displayedVideos = filteredVideos.slice(0, videoDisplayCount);
    const html = displayedVideos.map(v => `
        <div class="video-item glass-card" data-video-id="${v.id}">
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius:8px; cursor: pointer;" onclick="openVideoModal('${v.id}')">
                <img src="https://img.youtube.com/vi/${v.id}/maxresdefault.jpg" alt="${v.title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/640x360/302b63/ffffff?text=Video'">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-play" style="color: white; font-size: 1.5rem;"></i>
                </div>
            </div>
            <div class="video-title">${v.title}</div>
        </div>
    `).join('');
    $('#video-list').html(html);
    
    if (filteredVideos.length > videoDisplayCount) {
        $('#video-load-more').show();
    } else {
        $('#video-load-more').hide();
    }
}

// 영상 모달 열기
window.openVideoModal = function(videoId) {
    const videos = store.get('videos', []);
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    const modalHtml = `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
            <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                    src="https://www.youtube.com/embed/${video.id}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
        </div>
        <h3 style="margin-top: 20px;">${video.title}</h3>
    `;
    $('#video-modal-body').html(modalHtml);
    $('#video-modal').fadeIn(300);
};

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

// 쇼핑몰 렌더링 함수
function renderShop() {
    try {
        // 데이터 초기화 확인
        if (typeof initData === 'function') {
            initData();
        }
        
        const products = store.get('products', []);
        const cart = store.get('cart', []);
        
        console.log('renderShop called, products:', products.length, 'cart:', cart.length);
        
        // 카테고리 필터 렌더링
        const categories = ['전체', ...new Set(products.map(p => p.category))];
        const categoryHtml = categories.map((cat, index) => {
            const activeClass = index === 0 ? 'active' : '';
            return `<button class="category-btn ${activeClass}" data-category="${cat}">${cat}</button>`;
        }).join('');
        
        const $categoryFilter = $('#category-filter');
        if ($categoryFilter.length === 0) {
            console.error('category-filter element not found');
            return;
        }
        $categoryFilter.html(categoryHtml);
        
        // 상품 그리드 렌더링
        const $productGrid = $('#product-grid');
        if ($productGrid.length === 0) {
            console.error('product-grid element not found');
            return;
        }
        
        if (products.length === 0) {
            $productGrid.html('<p style="grid-column: 1/-1; text-align:center; color:#ccc; padding: 40px;">상품이 없습니다. 관리자 페이지에서 상품을 등록해주세요.</p>');
            return;
        }
        
        const productHtml = products.map(product => {
            const inCart = cart.find(item => item.id === product.id || item.id === String(product.id));
            const cartQuantity = inCart ? inCart.quantity : 0;
            const stockStatus = product.stock === 0 ? '품절' : (product.stock < 10 ? `재고 ${product.stock}개` : '');
            const isNew = product.createdAt && (Date.now() - product.createdAt < 7 * 24 * 60 * 60 * 1000);
            const isPopular = product.rating && product.rating >= 4.5;
            
            return `
        <div class="product-item glass-card" data-product-id="${product.id}">
            <div class="product-image-wrapper" onclick="openProductModal('${product.id}')">
                <img src="${product.image || 'https://via.placeholder.com/400x400/302b63/ffffff?text=No+Image'}" alt="${product.name || '상품'}" class="product-image" onerror="this.src='https://via.placeholder.com/400x400/302b63/ffffff?text=No+Image'">
                ${product.stock === 0 ? '<div class="sold-out-badge">품절</div>' : ''}
                ${isNew ? '<div class="product-badge new">NEW</div>' : ''}
                ${isPopular ? '<div class="product-badge popular">인기</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name || '상품명 없음'}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-meta">
                    <span class="product-price">${(product.price || 0).toLocaleString()}원</span>
                    ${product.rating ? `<span class="product-rating">★ ${product.rating} (${product.reviews || 0})</span>` : ''}
                </div>
                ${stockStatus && product.stock > 0 ? `<p class="stock-warning">${stockStatus}</p>` : ''}
                <div class="product-actions">
                    ${cartQuantity > 0 ? `
                        <div class="cart-controls">
                            <button class="qty-btn" onclick="updateCartQuantity('${product.id}', -1)">-</button>
                            <span class="cart-qty">${cartQuantity}</span>
                            <button class="qty-btn" onclick="updateCartQuantity('${product.id}', 1)" ${product.stock <= cartQuantity ? 'disabled' : ''}>+</button>
                        </div>
                    ` : `
                        <button class="btn-primary add-to-cart-btn" onclick="addToCart('${product.id}')" ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock === 0 ? '품절' : '장바구니 추가'}
                        </button>
                    `}
                </div>
            </div>
        </div>
        `;
        }).join('');
        
        $productGrid.html(productHtml);
    } catch (error) {
        console.error('renderShop error:', error);
        $('#product-grid').html('<p style="grid-column: 1/-1; text-align:center; color:#ff6b6b; padding: 40px;">상품을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.</p>');
    }
}

// 카테고리 필터 이벤트
$(document).on('click', '.category-btn', function() {
    const category = $(this).data('category');
    $('.category-btn').removeClass('active');
    $(this).addClass('active');
    
    const products = store.get('products', []);
    const filtered = category === '전체' ? products : products.filter(p => p.category === category);
    
    // 필터링된 상품만 렌더링
    const cart = store.get('cart', []);
    const productHtml = filtered.map(product => {
        const inCart = cart.find(item => item.id === product.id);
        const cartQuantity = inCart ? inCart.quantity : 0;
        const stockStatus = product.stock === 0 ? '품절' : (product.stock < 10 ? `재고 ${product.stock}개` : '');
        
        return `
        <div class="product-item glass-card" data-product-id="${product.id}">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                ${product.stock === 0 ? '<div class="sold-out-badge">품절</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span class="product-price">${product.price.toLocaleString()}원</span>
                    ${product.rating ? `<span class="product-rating">★ ${product.rating} (${product.reviews})</span>` : ''}
                </div>
                ${stockStatus && product.stock > 0 ? `<p class="stock-warning">${stockStatus}</p>` : ''}
                <div class="product-actions">
                    ${cartQuantity > 0 ? `
                        <div class="cart-controls">
                            <button class="qty-btn" onclick="updateCartQuantity('${product.id}', -1)">-</button>
                            <span class="cart-qty">${cartQuantity}</span>
                            <button class="qty-btn" onclick="updateCartQuantity('${product.id}', 1)" ${product.stock <= cartQuantity ? 'disabled' : ''}>+</button>
                        </div>
                    ` : `
                        <button class="btn-primary add-to-cart-btn" onclick="addToCart('${product.id}')" ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock === 0 ? '품절' : '장바구니 추가'}
                        </button>
                    `}
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    $('#product-grid').html(productHtml);
    
    if (filtered.length === 0) {
        $('#product-grid').html('<p style="grid-column: 1/-1; text-align:center; color:#ccc;">해당 카테고리의 상품이 없습니다.</p>');
    }
});

// 장바구니에 상품 추가
window.addToCart = function(productId) {
    try {
        const products = store.get('products', []);
        const cart = store.get('cart', []);
        const product = products.find(p => p.id === productId || p.id === String(productId));
        
        if (!product) {
            alert('상품을 찾을 수 없습니다.');
            console.error('Product not found:', productId, 'Available products:', products.map(p => p.id));
            return;
        }
        
        if (product.stock === 0) {
            alert('품절된 상품입니다.');
            return;
        }
        
        const existingItem = cart.find(item => item.id === productId || item.id === String(productId));
        
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                alert(`재고가 부족합니다. (남은 재고: ${product.stock}개)`);
                return;
            }
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        store.set('cart', cart);
        renderShop();
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
        alert(`${product.name}이(가) 장바구니에 추가되었습니다!`);
    } catch (error) {
        console.error('addToCart error:', error);
        alert('장바구니에 추가하는 중 오류가 발생했습니다.');
    }
};

// 장바구니 수량 업데이트
window.updateCartQuantity = function(productId, change) {
    try {
        const cart = store.get('cart', []);
        const products = store.get('products', []);
        const product = products.find(p => p.id === productId || p.id === String(productId));
        const cartItem = cart.find(item => item.id === productId || item.id === String(productId));
        
        if (!cartItem || !product) {
            console.error('Cart item or product not found:', productId);
            return;
        }
        
        const newQuantity = cartItem.quantity + change;
        
        if (newQuantity <= 0) {
            // 장바구니에서 제거
            const index = cart.findIndex(item => item.id === productId || item.id === String(productId));
            if (index !== -1) {
                cart.splice(index, 1);
            }
        } else if (newQuantity > product.stock) {
            alert(`재고가 부족합니다. (남은 재고: ${product.stock}개)`);
            return;
        } else {
            cartItem.quantity = newQuantity;
        }
        
        store.set('cart', cart);
        renderShop();
        if (typeof renderCart === 'function') {
            renderCart();
        }
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    } catch (error) {
        console.error('updateCartQuantity error:', error);
        alert('수량을 업데이트하는 중 오류가 발생했습니다.');
    }
};

// 장바구니 렌더링 함수
function renderCart() {
    const cart = store.get('cart', []);
    
    if (cart.length === 0) {
        $('#cart-empty').show();
        $('#cart-content').hide();
        return;
    }
    
    $('#cart-empty').hide();
    $('#cart-content').show();
    
    const cartHtml = cart.map((item, index) => {
        const products = store.get('products', []);
        const product = products.find(p => p.id === item.id);
        const subtotal = item.price * item.quantity;
        
        return `
        <div class="cart-item glass-card" data-item-id="${item.id}">
            <label class="cart-checkbox-label">
                <input type="checkbox" class="cart-item-checkbox" data-item-id="${item.id}" checked onchange="updateCartSummary()">
            </label>
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">${item.price.toLocaleString()}원</p>
            </div>
            <div class="cart-item-controls">
                <div class="cart-qty-controls">
                    <button class="qty-btn" onclick="updateCartItemQuantity('${item.id}', -1)">-</button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartItemQuantity('${item.id}', 1)" ${product && item.quantity >= product.stock ? 'disabled' : ''}>+</button>
                </div>
                <div class="cart-item-subtotal">
                    <strong>${subtotal.toLocaleString()}원</strong>
                </div>
                <button class="btn-danger" onclick="removeCartItem('${item.id}')" style="font-size: 0.9rem; padding: 5px 10px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    $('#cart-items-list').html(cartHtml);
    updateCartSummary();
}

// 장바구니 아이템 수량 업데이트
window.updateCartItemQuantity = function(productId, change) {
    const cart = store.get('cart', []);
    const products = store.get('products', []);
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (!cartItem || !product) return;
    
    const newQuantity = cartItem.quantity + change;
    
    if (newQuantity <= 0) {
        removeCartItem(productId);
        return;
    } else if (newQuantity > product.stock) {
        alert(`재고가 부족합니다. (남은 재고: ${product.stock}개)`);
        return;
    } else {
        cartItem.quantity = newQuantity;
    }
    
    store.set('cart', cart);
    renderCart();
    updateCartCount();
};

// 장바구니 아이템 제거
window.removeCartItem = function(productId) {
    const cart = store.get('cart', []);
    const filtered = cart.filter(item => item.id !== productId);
    store.set('cart', filtered);
    renderCart();
    renderShop();
    updateCartCount();
};

// 전체 선택/해제
window.toggleSelectAll = function() {
    const selectAll = $('#select-all-cart').prop('checked');
    $('.cart-item-checkbox').prop('checked', selectAll);
    updateCartSummary();
};

// 선택된 아이템 삭제
window.removeSelectedItems = function() {
    const selected = $('.cart-item-checkbox:checked').map(function() {
        return $(this).data('item-id');
    }).get();
    
    if (selected.length === 0) {
        alert('삭제할 상품을 선택해주세요.');
        return;
    }
    
    if (!confirm(`선택한 ${selected.length}개의 상품을 삭제하시겠습니까?`)) {
        return;
    }
    
    const cart = store.get('cart', []);
    const filtered = cart.filter(item => !selected.includes(item.id));
    store.set('cart', filtered);
    renderCart();
    renderShop();
    updateCartCount();
};

// 장바구니 요약 업데이트
function updateCartSummary() {
    const cart = store.get('cart', []);
    const selected = $('.cart-item-checkbox:checked').map(function() {
        return $(this).data('item-id');
    }).get();
    
    const selectedItems = cart.filter(item => selected.includes(item.id));
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal >= 50000 ? 0 : 3000;
    const total = subtotal + shippingFee;
    
    $('#cart-subtotal').text(subtotal.toLocaleString() + '원');
    $('#cart-shipping').text(shippingFee === 0 ? '무료' : shippingFee.toLocaleString() + '원');
    $('#cart-total').text(total.toLocaleString() + '원');
    
    // 전체 선택 체크박스 상태 업데이트
    const allChecked = $('.cart-item-checkbox').length > 0 && $('.cart-item-checkbox:checked').length === $('.cart-item-checkbox').length;
    $('#select-all-cart').prop('checked', allChecked);
}

// 결제하기 버튼 클릭
window.handleCheckout = function() {
    // 로그인 체크
    if (!currentUser) {
        if (confirm('결제를 위해 로그인이 필요합니다. 회원가입 페이지로 이동하시겠습니까?')) {
            navigateTo('signup');
        }
        return;
    }
    
    const selected = $('.cart-item-checkbox:checked').map(function() {
        return $(this).data('item-id');
    }).get();
    
    if (selected.length === 0) {
        alert('결제할 상품을 선택해주세요.');
        return;
    }
    
    // 선택된 상품 정보를 세션에 저장
    const cart = store.get('cart', []);
    const selectedItems = cart.filter(item => selected.includes(item.id));
    sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    
    // 결제 페이지로 이동
    navigateTo('payment');
    renderPayment();
};

// 결제 페이지 렌더링
function renderPayment() {
    const checkoutItemsStr = sessionStorage.getItem('checkoutItems');
    if (!checkoutItemsStr) {
        alert('결제할 상품이 없습니다.');
        navigateTo('cart');
        return;
    }
    
    const checkoutItems = JSON.parse(checkoutItemsStr);
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal >= 50000 ? 0 : 3000;
    const total = subtotal + shippingFee;
    
    $('#payment-subtotal').text(subtotal.toLocaleString() + '원');
    $('#payment-shipping').text(shippingFee === 0 ? '무료' : shippingFee.toLocaleString() + '원');
    $('#payment-total').text(total.toLocaleString() + '원');
    
    // 결제 버튼 생성
    const productName = checkoutItems.length === 1 
        ? checkoutItems[0].name 
        : `${checkoutItems[0].name} 외 ${checkoutItems.length - 1}개`;
    
    const customerName = currentUser ? currentUser.nickname : '';
    const customerEmail = currentUser ? currentUser.email : '';
    
    const paymentButtonHtml = `
        <button class="btn-primary" id="btn-payment" onclick="initiatePayment()" style="width: 100%; padding: 15px; font-size: 1.1rem;">
            💳 ${total.toLocaleString()}원 결제하기
        </button>
    `;
    
    $('#payment-button-container').html(paymentButtonHtml);
}

// 결제 시작
window.initiatePayment = function() {
    // 로그인 체크
    if (!currentUser) {
        if (confirm('결제를 위해 로그인이 필요합니다. 회원가입 페이지로 이동하시겠습니까?')) {
            navigateTo('signup');
        }
        return;
    }
    
    // 배송 정보 확인
    const name = $('#payment-name').val();
    const phone = $('#payment-phone').val();
    const postcode = $('#payment-postcode').val();
    const addr = $('#payment-addr').val();
    
    if (!name || !phone || !postcode || !addr) {
        alert('배송 정보를 모두 입력해주세요.');
        return;
    }
    
    const checkoutItemsStr = sessionStorage.getItem('checkoutItems');
    if (!checkoutItemsStr) {
        alert('결제할 상품이 없습니다.');
        navigateTo('cart');
        return;
    }
    
    const checkoutItems = JSON.parse(checkoutItemsStr);
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal >= 50000 ? 0 : 3000;
    const total = subtotal + shippingFee;
    
    const productName = checkoutItems.length === 1 
        ? checkoutItems[0].name 
        : `${checkoutItems[0].name} 외 ${checkoutItems.length - 1}개`;
    
    // 포트원 결제 요청
    if (typeof IMP === 'undefined') {
        alert('결제 모듈을 불러올 수 없습니다. 페이지를 새로고침해주세요.');
        return;
    }
    
    const merchantUid = `merchant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    IMP.request_pay({
        pg: 'html5_inicis',
        pay_method: 'card',
        merchant_uid: merchantUid,
        name: productName,
        amount: total,
        buyer_name: name,
        buyer_email: currentUser.email,
        buyer_tel: phone,
        buyer_addr: addr,
        buyer_postcode: postcode,
        m_redirect_url: window.location.href
    }, function(response) {
        if (response.success) {
            // 결제 성공
            handlePaymentSuccess(response, checkoutItems, total, shippingFee, {
                name, phone, addr, postcode
            });
        } else {
            // 결제 실패
            alert('결제에 실패했습니다: ' + (response.error_msg || '알 수 없는 오류'));
        }
    });
};

// 결제 성공 처리
function handlePaymentSuccess(response, checkoutItems, totalAmount, shippingFee, shippingInfo) {
    // 결제 검증 (실제로는 서버에서 해야 함)
    // 여기서는 클라이언트에서 간단히 처리
    
    // 장바구니에서 결제된 상품 제거
    const cart = store.get('cart', []);
    const paidItemIds = checkoutItems.map(item => item.id);
    const remainingCart = cart.filter(item => !paidItemIds.includes(item.id));
    store.set('cart', remainingCart);
    
    // 세션 스토리지 정리
    sessionStorage.removeItem('checkoutItems');
    
    // 장바구니 개수 업데이트
    updateCartCount();
    
    // 주문 정보 저장 (선택사항)
    const orders = store.get('orders', []);
    orders.push({
        id: response.merchant_uid,
        impUid: response.imp_uid,
        items: checkoutItems,
        totalAmount: totalAmount,
        shippingFee: shippingFee,
        shippingInfo: shippingInfo,
        status: 'PAID',
        paidAt: new Date().toISOString()
    });
    store.set('orders', orders);
    
    // 성공 메시지
    alert('결제가 완료되었습니다!\n주문번호: ' + response.merchant_uid);
    
    // 장바구니로 이동
    navigateTo('cart');
    renderCart();
}

// 인덱스로 음원 재생 (URL 이스케이프 문제 해결)
window.playMusicByIndex = async function(index) {
    const music = store.get('music', []);
    if (index >= 0 && index < music.length) {
        const musicItem = music[index];
        if (!musicItem) {
            alert('음원 데이터를 불러올 수 없습니다.');
            return;
        }
        
        const btn = $(`.music-item[data-music-id="${musicItem.id || index}"] button`)[0];
        if (!btn) {
            alert('플레이어를 찾을 수 없습니다.');
            return;
        }
        
        // IndexedDB에서 음원 데이터 가져오기
        let audioUrl = musicItem.url;
        if (musicItem.storedIn === 'indexeddb' || musicItem.url?.startsWith('indexeddb://')) {
            try {
                const musicId = musicItem.id;
                const audioData = await audioDB.get(musicId);
                if (audioData && audioData.data) {
                    audioUrl = audioData.data; // base64 데이터
                } else {
                    alert('음원 파일을 찾을 수 없습니다.');
                    return;
                }
            } catch (error) {
                console.error('음원 로드 오류:', error);
                alert('음원 파일을 불러오는 중 오류가 발생했습니다.');
                return;
            }
        }
        
        if (!audioUrl || audioUrl === '#') {
            alert('음원 URL이 없습니다.');
            return;
        }
        
        playMusic(audioUrl, btn);
    } else {
        alert('유효하지 않은 음원 인덱스입니다.');
    }
};

let postSortOrder = 'latest';

function renderPosts() {
    const posts = store.get('posts', []);
    if (posts.length === 0) {
        $('#post-list').html('<p style="text-align:center; color:#ccc; padding:20px;">아직 메시지가 없습니다. 첫 번째 메시지를 작성해보세요!</p>');
        return;
    }
    
    let sortedPosts = [...posts];
    if (postSortOrder === 'popular') {
        sortedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
        sortedPosts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
    
    const html = sortedPosts.map(p => {
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
window.playMusic = async function (url, btn) {
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

    // base64 데이터, blob URL, 또는 IndexedDB 참조 모두 처리
    try {
        let finalUrl = url;
        
        // IndexedDB 참조인 경우 (이미 playMusicByIndex에서 처리되어야 하지만 안전장치)
        if (url.startsWith('indexeddb://')) {
            alert('음원을 불러오는 중입니다. 잠시만 기다려주세요.');
            return;
        }
        
        // 오디오 소스 설정
        audio.src = finalUrl;
        
        // 로딩 표시
        icon.removeClass('fa-play fa-pause').addClass('fa-spinner fa-spin');
        
        // 오디오 로드 이벤트
        audio.onloadeddata = function() {
            icon.removeClass('fa-spinner fa-spin').addClass('fa-play');
        };
        
        audio.onerror = function() {
            icon.removeClass('fa-spinner fa-spin').addClass('fa-play');
            alert('오디오 파일을 로드할 수 없습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.');
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
    // 관리자 메뉴 표시/숨김
    const isAdmin = auth.isAdmin();
    if (isAdmin && currentUser) {
        $('#nav-admin').show();
        
        // 관리자 메뉴 클릭 시 해당 관리자 페이지 섹션으로 이동
        $('#nav-videos').off('click').on('click', function(e) {
            if (e.ctrlKey || e.metaKey) return; // Ctrl/Cmd 클릭은 새 탭에서 열기
            e.preventDefault();
            window.location.href = 'admin.html#videos-admin';
        });
        
        $('#nav-music').off('click').on('click', function(e) {
            if (e.ctrlKey || e.metaKey) return;
            e.preventDefault();
            window.location.href = 'admin.html#music-admin';
        });
        
        $('#nav-community').off('click').on('click', function(e) {
            if (e.ctrlKey || e.metaKey) return;
            e.preventDefault();
            window.location.href = 'admin.html#posts-admin';
        });
    } else {
        $('#nav-admin').hide();
        
        // 일반 사용자는 기본 동작
        $('#nav-videos').off('click').on('click', function(e) {
            e.preventDefault();
            navigateTo('videos');
        });
        
        $('#nav-music').off('click').on('click', function(e) {
            e.preventDefault();
            navigateTo('music');
        });
        
        $('#nav-community').off('click').on('click', function(e) {
            e.preventDefault();
            navigateTo('community');
        });
    }
    
    if (currentUser) {
        $('#nav-auth').hide();
        $('#nav-user').show();
        $('#write-area').show();
        $('#login-prompt').hide();
        updateCartCount();
    } else {
        $('#nav-auth').show();
        $('#nav-user').hide();
        $('#write-area').hide();
        $('#login-prompt').show();
        $('#cart-count-badge').text('0');
    }
}

// 장바구니 개수 업데이트
function updateCartCount() {
    const cart = store.get('cart', []);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cart-count-badge').text(totalItems || '0');
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

// 배너 슬라이더 관리
let bannerSlider = {
    currentIndex: 0,
    images: [],
    intervalId: null,
    autoPlayDelay: 5000, // 5초마다 자동 전환
    
    init: function() {
        this.loadImages();
        this.render();
        this.startAutoPlay();
        this.bindEvents();
    },
    
    loadImages: function() {
        this.images = bannerImages.get();
        // 등록된 이미지가 없거나 3개 미만일 때만 기본 이미지 추가
        if (this.images.length === 0) {
            // 이미지가 하나도 없으면 기본 이미지 3개 사용
            this.images = [
                'https://via.placeholder.com/1080/302b63/ffffff?text=Cha+Eun-woo+1',
                'https://via.placeholder.com/1080/667eea/ffffff?text=Cha+Eun-woo+2',
                'https://via.placeholder.com/1080/f093fb/ffffff?text=Cha+Eun-woo+3'
            ];
        } else if (this.images.length < 3) {
            // 등록된 이미지가 1-2개면 기본 이미지로 3개까지 채우기
            const defaultImages = [
                'https://via.placeholder.com/1080/302b63/ffffff?text=Cha+Eun-woo+1',
                'https://via.placeholder.com/1080/667eea/ffffff?text=Cha+Eun-woo+2',
                'https://via.placeholder.com/1080/f093fb/ffffff?text=Cha+Eun-woo+3'
            ];
            while (this.images.length < 3) {
                this.images.push(defaultImages[this.images.length]);
            }
        }
        // 3개 이상이면 등록된 이미지만 사용
        console.log('배너 이미지 로드:', this.images.length + '개');
    },
    
    render: function() {
        const $slides = $('#banner-slides');
        const $dots = $('#banner-dots');
        
        $slides.empty();
        $dots.empty();
        
        if (this.images.length === 0) {
            console.warn('배너 이미지가 없습니다.');
            return;
        }
        
        console.log('배너 슬라이더 렌더링:', this.images.length + '개 이미지');
        
        // 슬라이드 생성 (모든 이미지 표시)
        this.images.forEach((img, index) => {
            const slide = $(`
                <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <img src="${img}" alt="Banner ${index + 1}" 
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/1080/302b63/ffffff?text=Cha+Eun-woo';">
                </div>
            `);
            $slides.append(slide);
            
            // 인디케이터 점 생성
            const dot = $(`
                <div class="banner-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
            `);
            $dots.append(dot);
        });
        
        // 현재 인덱스가 범위를 벗어나면 조정
        if (this.currentIndex >= this.images.length) {
            this.currentIndex = 0;
        }
        
        this.updateActiveSlide();
    },
    
    updateActiveSlide: function() {
        // 현재 인덱스가 범위를 벗어나면 조정
        if (this.currentIndex >= this.images.length) {
            this.currentIndex = 0;
        }
        if (this.currentIndex < 0) {
            this.currentIndex = this.images.length - 1;
        }
        
        // 슬라이드 업데이트
        $('.banner-slide').removeClass('active');
        $(`.banner-slide[data-index="${this.currentIndex}"]`).addClass('active');
        
        // 인디케이터 업데이트
        $('.banner-dot').removeClass('active');
        $(`.banner-dot[data-index="${this.currentIndex}"]`).addClass('active');
    },
    
    next: function() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateActiveSlide();
        this.resetAutoPlay();
    },
    
    prev: function() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateActiveSlide();
        this.resetAutoPlay();
    },
    
    goTo: function(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.updateActiveSlide();
            this.resetAutoPlay();
        }
    },
    
    startAutoPlay: function() {
        this.stopAutoPlay();
        this.intervalId = setInterval(() => {
            this.next();
        }, this.autoPlayDelay);
    },
    
    stopAutoPlay: function() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
    
    resetAutoPlay: function() {
        this.stopAutoPlay();
        this.startAutoPlay();
    },
    
    bindEvents: function() {
        // 이전/다음 버튼
        $('#banner-prev').off('click').on('click', () => {
            this.prev();
        });
        
        $('#banner-next').off('click').on('click', () => {
            this.next();
        });
        
        // 인디케이터 점 클릭
        $(document).off('click', '.banner-dot').on('click', '.banner-dot', (e) => {
            const index = parseInt($(e.target).data('index'));
            this.goTo(index);
        });
        
        // 마우스 호버 시 자동 재생 일시정지
        $('#banner-slider').off('mouseenter mouseleave').on('mouseenter', () => {
            this.stopAutoPlay();
        }).on('mouseleave', () => {
            this.startAutoPlay();
        });
    },
    
    refresh: function() {
        this.loadImages();
        this.render();
        if (this.currentIndex >= this.images.length) {
            this.currentIndex = 0;
        }
        this.updateActiveSlide();
    }
};

// 기존 함수 유지 (하위 호환성)
function loadMainImage() {
    bannerSlider.refresh();
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
    bannerSlider.refresh();
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
    try {
        renderVideos();
        renderMusic();
        renderShop();
        if (typeof renderCart === 'function') {
            renderCart();
        }
        renderPosts();
        updateAuthUI();
        updateUserInfo();
        // 배너 슬라이더 초기화
        bannerSlider.init();
        loadSiteLogo();
    } catch (error) {
        console.error('Initial render error:', error);
    }
    
    // 포트원 SDK 초기화
    if (typeof IMP !== 'undefined') {
        IMP.init('imp12345678'); // 테스트용 가맹점 코드 (실제로는 환경변수 사용)
    } else {
        // SDK 로드 대기
        $(window).on('load', function() {
            if (typeof IMP !== 'undefined') {
                IMP.init('imp12345678');
            }
        });
    }

    // 주기적으로 이미지 확인 (관리자 페이지에서 변경 시 반영)
    setInterval(() => {
        refreshMainImage();
        loadSiteLogo();
    }, 2000);

    // Navigation Listeners
    $('nav a').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const target = $(this).data('target');
        if (target) {
            navigateTo(target);
        }
    });
    
    // 해시 변경 감지 (브라우저 뒤로가기/앞으로가기 지원)
    $(window).on('hashchange', function() {
        if (isNavigating) return; // navigateTo에서 호출한 경우 무시
        
        const hash = window.location.hash.substring(1); // # 제거
        if (hash) {
            const targetSection = $('#' + hash);
            if (targetSection.length > 0) {
                isNavigating = true;
                navigateTo(hash);
            }
        } else {
            // 해시가 없으면 홈으로
            isNavigating = true;
            navigateTo('home');
        }
    });
    
    // 페이지 로드 시 해시 확인
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        const targetSection = $('#' + initialHash);
        if (targetSection.length > 0) {
            navigateTo(initialHash);
        } else {
            navigateTo('home');
        }
    } else {
        navigateTo('home');
    }

    $('.hamburger').on('click', () => {
        $navUl.toggleClass('show');
    });

    // 장바구니 체크박스 이벤트 리스너
    $(document).on('change', '.cart-item-checkbox', function() {
        updateCartSummary();
    });
    
    // Auth Listeners
    $('#btn-signup').click(() => {
        const nickname = $('#signup-nickname').val().trim();
        const email = $('#signup-email').val().trim().toLowerCase(); // 소문자로 변환
        const password = $('#signup-password').val();
        const country = $('#signup-country').val();
        
        if (!nickname || !email || !password) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('올바른 이메일 형식이 아닙니다.');
            return;
        }

        const users = store.get('users', []);
        
        // 이메일 중복 체크 (대소문자 무시)
        const existingUser = users.find(u => u.email && u.email.toLowerCase() === email);
        if (existingUser) {
            alert('이미 등록된 이메일입니다.');
            console.log('중복 이메일:', email, '기존 사용자:', existingUser);
            return;
        }

        // 비밀번호는 간단히 저장 (실제로는 해시화해야 함)
        const newUser = { 
            nickname, 
            email, // 소문자로 저장
            password, 
            country,
            signupDate: new Date().toISOString()
        };
        
        users.push(newUser);
        store.set('users', users);
        console.log('회원가입 완료:', { email, nickname, country });
        console.log('저장된 사용자 수:', users.length);
        alert('회원가입이 완료되었습니다! 로그인해주세요.');
        toggleAuth('login');
    });

    $('#btn-login').click(() => {
        const email = $('#login-email').val().trim().toLowerCase(); // 소문자로 변환
        const password = $('#login-password').val();
        
        if (!email || !password) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        const users = store.get('users', []);
        console.log('로그인 시도:', { email, usersCount: users.length });
        console.log('저장된 사용자 목록:', users.map(u => ({ email: u.email, nickname: u.nickname })));
        
        // 이메일과 비밀번호 비교 (대소문자 무시)
        const user = users.find(u => {
            const userEmail = u.email ? u.email.toLowerCase() : '';
            return userEmail === email && u.password === password;
        });
        
        if (user) {
            // 비밀번호는 세션에 저장하지 않음
            const { password, ...userWithoutPassword } = user;
            currentUser = userWithoutPassword;
            auth.setCurrentUser(currentUser);
            updateAuthUI();
            updateUserInfo();
            navigateTo('home');
            console.log('로그인 성공:', currentUser);
            alert('환영합니다, ' + currentUser.nickname + '님!');
        } else {
            console.error('로그인 실패:', { 
                입력한이메일: email, 
                저장된이메일들: users.map(u => u.email),
                사용자수: users.length 
            });
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


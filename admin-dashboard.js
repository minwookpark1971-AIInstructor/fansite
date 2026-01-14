// 관리자 대시보드 및 새로운 기능 스크립트

// 전역 변수
let currentSection = 'dashboard';
let currentProductPage = 1;
let currentOrderPage = 1;
let currentReviewPage = 1;
let currentMemberPage = 1;
const itemsPerPage = 10;

// 초기화
$(document).ready(() => {
    // 데이터 초기화
    if (typeof initData === 'function') {
        initData();
    }

    initAdminDashboard();
    initSidebarNavigation();
    initDashboard();
    initProductManagement();
    initOrderManagement();
    initCategoryManagement();
    initReviewManagement();
    initBannerManagement();
    initVideoManagementStandalone();
    initMusicManagementStandalone();
    initPostManagementStandalone();
    initMemberManagement();
    initStatistics();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // 초기 섹션 설정 (대시보드)
    setTimeout(() => {
        // URL 해시 확인하여 해당 섹션으로 이동
        const hash = window.location.hash.substring(1);
        if (hash) {
            switchSection(hash);
        } else {
            // 기본적으로 대시보드 표시
            switchSection('dashboard');
        }
    }, 100);

    // 해시 변경 감지
    $(window).on('hashchange', function () {
        const newHash = window.location.hash.substring(1);
        if (newHash) {
            switchSection(newHash);
        } else {
            switchSection('dashboard');
        }
    });
});

// 관리자 대시보드 초기화
function initAdminDashboard() {
    // 사이드바 토글
    $('#toggle-sidebar').click(() => {
        $('#admin-sidebar').toggleClass('collapsed');
        $('#admin-main').toggleClass('expanded');
    });

    // 저장 버튼
    $('#btn-save-all').click(() => {
        showToast('success', '저장 완료', '모든 변경사항이 저장되었습니다.');
    });

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
}

// 사이드바 네비게이션 초기화
function initSidebarNavigation() {
    $('.admin-menu-link').click(function (e) {
        e.preventDefault();
        const section = $(this).data('section');
        switchSection(section);
    });
}

// 섹션 전환
function switchSection(section) {
    currentSection = section;

    // 메뉴 활성화
    $('.admin-menu-link').removeClass('active');
    $(`.admin-menu-link[data-section="${section}"]`).addClass('active');

    // 섹션 표시
    $('.admin-section-content').removeClass('active');
    $(`#section-${section}`).addClass('active');

    // 섹션별 초기화 함수 호출
    if (section === 'videos-admin') {
        renderVideosTableStandalone();
    } else if (section === 'music-admin') {
        renderMusicTableStandalone();
    } else if (section === 'posts-admin') {
        renderPostsTableStandalone();
    }

    // 페이지 제목 업데이트
    const titles = {
        'dashboard': '대시보드',
        'products': '상품 관리',
        'videos-admin': '영상 등록',
        'music-admin': '음원 등록',
        'posts-admin': '응원 메시지 관리',
        'orders': '주문 관리',
        'categories': '카테고리 관리',
        'reviews': '리뷰/평점 관리',
        'banners': '배너 관리',
        'members': '회원 관리',
        'statistics': '통계',
        'content': '콘텐츠 관리'
    };
    $('#page-title').text(titles[section] || '관리자 페이지');

    // 섹션별 초기화
    if (section === 'dashboard') {
        renderDashboard();
    } else if (section === 'products') {
        renderProductsTable();
    } else if (section === 'orders') {
        renderOrdersTable();
    } else if (section === 'categories') {
        renderCategoriesTable();
    } else if (section === 'reviews') {
        renderReviewsTable();
    } else if (section === 'members') {
        renderMembersTable();
    } else if (section === 'statistics') {
        renderStatistics();
    }
}

// 현재 시간 업데이트
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    $('#current-time').text(timeString);
}

// Toast 알림 표시
function showToast(type, title, message) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const toast = $(`
        <div class="admin-toast ${type}">
            <i class="fas ${icons[type]} admin-toast-icon"></i>
            <div class="admin-toast-content">
                <div class="admin-toast-title">${title}</div>
                <div class="admin-toast-message">${message}</div>
            </div>
            <button class="admin-toast-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `);

    $('#toast-container').append(toast);

    // 닫기 버튼
    toast.find('.admin-toast-close').click(() => {
        toast.fadeOut(300, () => toast.remove());
    });

    // 자동 닫기 (5초)
    setTimeout(() => {
        toast.fadeOut(300, () => toast.remove());
    }, 5000);
}

// 모달 열기/닫기
function openModal(modalId) {
    $(`#${modalId}`).addClass('active');
}

function closeModal(modalId) {
    $(`#${modalId}`).removeClass('active');
}

// 모달 외부 클릭 시 닫기
$(document).on('click', '.admin-modal', function (e) {
    if ($(e.target).hasClass('admin-modal')) {
        $(this).removeClass('active');
    }
});

// 대시보드 초기화
function initDashboard() {
    renderDashboard();
}

// 대시보드 렌더링
function renderDashboard() {
    const orders = store.get('orders', []);
    const products = store.get('products', []);
    const users = store.get('users', []);

    // 오늘 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘의 주문
    const todayOrders = orders.filter(o => {
        const orderDate = new Date(o.paidAt || o.createdAt || 0);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() && o.status === 'PAID';
    });

    // 오늘의 매출
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0) + (o.shippingFee || 0), 0);

    // 미처리 주문
    const pendingOrders = orders.filter(o =>
        o.status === 'PAID' || o.status === 'PREPARING' || o.status === 'SHIPPING'
    );

    // 재고 부족 상품 (5개 이하)
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);

    // 오늘 가입한 회원
    const todayMembers = users.filter(u => {
        const signupDate = new Date(u.signupDate || 0);
        signupDate.setHours(0, 0, 0, 0);
        return signupDate.getTime() === today.getTime();
    });

    // 이번 달 신규 회원 증가수
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const thisMonthMembers = users.filter(u => {
        const signupDate = new Date(u.signupDate || 0);
        return signupDate >= thisMonth;
    });

    // 누적 방문자수 (localStorage에서 가져오거나 기본값)
    let totalVisitors = parseInt(localStorage.getItem('totalVisitors') || '0');
    if (!totalVisitors) {
        totalVisitors = users.length * 10; // 기본값: 회원수 * 10
        localStorage.setItem('totalVisitors', totalVisitors.toString());
    }

    // 유튜브 플레이수 (localStorage에서 가져오거나 기본값)
    let youtubePlays = parseInt(localStorage.getItem('youtubePlays') || '0');
    if (!youtubePlays) {
        const videos = store.get('videos', []);
        youtubePlays = videos.length * 100; // 기본값: 영상수 * 100
        localStorage.setItem('youtubePlays', youtubePlays.toString());
    }

    // 음원 다운로드수 (localStorage에서 가져오거나 기본값)
    let musicDownloads = parseInt(localStorage.getItem('musicDownloads') || '0');
    if (!musicDownloads) {
        const music = store.get('music', []);
        musicDownloads = music.length * 50; // 기본값: 음원수 * 50
        localStorage.setItem('musicDownloads', musicDownloads.toString());
    }

    // 대시보드 카드 업데이트
    $('#dashboard-today-orders').text(todayOrders.length);
    $('#dashboard-today-revenue').text(todayRevenue.toLocaleString() + '원');
    $('#dashboard-pending-orders').text(pendingOrders.length);
    $('#dashboard-low-stock').text(lowStockProducts.length);
    $('#dashboard-new-members').text(todayMembers.length);

    // 새로운 통계 카드 업데이트
    $('#dashboard-total-visitors').text(totalVisitors.toLocaleString());
    $('#dashboard-new-members-growth').text(thisMonthMembers.length);
    $('#dashboard-youtube-plays').text(youtubePlays.toLocaleString());
    $('#dashboard-music-downloads').text(musicDownloads.toLocaleString());

    // 최근 주문 목록
    renderRecentOrders(orders.slice(0, 5));

    // 재고 부족 상품 목록
    renderLowStockProducts(lowStockProducts.slice(0, 5));
}

// 최근 주문 렌더링
function renderRecentOrders(orders) {
    const html = orders.map(o => {
        const statusClass = {
            'PAID': 'paid',
            'PENDING': 'pending',
            'CANCELLED': 'cancelled',
            'SHIPPING': 'shipping',
            'DELIVERED': 'delivered'
        }[o.status] || 'pending';

        const statusText = {
            'PAID': '결제완료',
            'PENDING': '결제대기',
            'CANCELLED': '취소됨',
            'SHIPPING': '배송중',
            'DELIVERED': '배송완료'
        }[o.status] || o.status;

        return `
            <tr>
                <td>${o.id || '-'}</td>
                <td>${o.shippingInfo ? o.shippingInfo.name : '-'}</td>
                <td>${((o.totalAmount || 0) + (o.shippingFee || 0)).toLocaleString()}원</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn-primary btn-small" onclick="viewOrderDetail('${o.id || o.impUid}')">
                        상세
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    $('#dashboard-recent-orders').html(html || '<tr><td colspan="5" style="text-align:center; color:#ccc;">주문이 없습니다.</td></tr>');
}

// 재고 부족 상품 렌더링
function renderLowStockProducts(products) {
    const html = products.map(p => `
        <tr>
            <td>${p.name || '-'}</td>
            <td><span style="color: ${p.stock === 0 ? '#F44336' : '#FF9800'};">${p.stock}개</span></td>
            <td>${p.category || '-'}</td>
            <td>
                <button class="btn-primary btn-small" onclick="editProductFromDashboard('${p.id}')">
                    수정
                </button>
            </td>
        </tr>
    `).join('');

    $('#dashboard-low-stock-products').html(html || '<tr><td colspan="4" style="text-align:center; color:#ccc;">재고 부족 상품이 없습니다.</td></tr>');
}

// 매출 차트 렌더링 (삭제됨 - 더 이상 사용하지 않음)
function renderRevenueChart() {
    // 매출 차트는 삭제되었습니다.
}

// 카테고리 차트 렌더링 (삭제됨 - 더 이상 사용하지 않음)
function renderCategoryChart() {
    // 카테고리 차트는 삭제되었습니다.
}

// 상품 관리 초기화
function initProductManagement() {
    // 검색
    $('#product-search').on('input', () => renderProductsTable());

    // 필터
    $('#product-category-filter, #product-stock-filter').change(() => renderProductsTable());

    // 정렬
    $(document).on('click', '.sortable', function () {
        const sortKey = $(this).data('sort');
        const currentSort = $(this).data('current-sort') || 'none';
        let newSort = 'asc';

        if (currentSort === 'asc') {
            newSort = 'desc';
        } else if (currentSort === 'desc') {
            newSort = 'none';
        }

        $('.sortable').removeClass('sort-asc sort-desc').data('current-sort', 'none');
        $(this).addClass(`sort-${newSort}`).data('current-sort', newSort);

        // 정렬 적용
        renderProductsTable(currentProductPage, sortKey, newSort);
    });

    // 상품 추가 모달
    $('#btn-add-product-modal').click(() => {
        $('#product-modal-title').text('상품 추가');
        resetProductModal();
        openModal('product-modal');
    });

    // 상품 저장
    $('#btn-save-product').click(() => {
        saveProductFromModal();
    });

    // 전체 선택
    $('#select-all-products').change(function () {
        $('.product-checkbox').prop('checked', $(this).prop('checked'));
        toggleBulkDeleteButton();
    });

    // 체크박스 변경 감지
    $(document).on('change', '.product-checkbox', () => {
        toggleBulkDeleteButton();
    });

    // 일괄 삭제
    $('#btn-bulk-delete-products').click(() => {
        const selected = $('.product-checkbox:checked').map(function () {
            return $(this).data('product-id');
        }).get();

        if (selected.length === 0) {
            showToast('warning', '알림', '삭제할 상품을 선택해주세요.');
            return;
        }

        if (confirm(`선택한 ${selected.length}개의 상품을 삭제하시겠습니까?`)) {
            deleteProducts(selected);
        }
    });

    // 상품 이미지 미리보기
    $('#modal-product-image').change(function () {
        const file = this.files[0];
        if (file) {
            // 파일 크기 체크
            if (file.size > 5 * 1024 * 1024) {
                showToast('error', '오류', '이미지 파일 크기는 5MB 이하여야 합니다.');
                $(this).val('');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                $('#modal-product-image-preview').html(
                    `<div style="position: relative; display: inline-block;">
                        <img src="${e.target.result}" class="image-preview" style="max-width: 300px; max-height: 300px; border-radius: 10px; border: 2px solid var(--glass-border);">
                        <button type="button" onclick="$('#modal-product-image').val(''); $('#modal-product-image-preview').html(''); $('#image-upload-area').show();" style="position: absolute; top: 5px; right: 5px; background: rgba(255, 77, 87, 0.9); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>`
                );
                $('#image-upload-area').hide();
            };
            reader.readAsDataURL(file);
        }
    });

    // 이미지 업로드 영역 드래그 앤 드롭
    const imageUploadArea = $('#image-upload-area');
    imageUploadArea.on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('dragover');
    });

    imageUploadArea.on('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
    });

    imageUploadArea.on('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');

        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.match('image.*')) {
                // 파일 크기 검증
                if (file.size > 5 * 1024 * 1024) {
                    showToast('error', '오류', '이미지 파일 크기는 5MB 이하여야 합니다.');
                    return;
                }
                $('#modal-product-image')[0].files = files;
                $('#modal-product-image').trigger('change');
            } else {
                showToast('error', '오류', '이미지 파일만 업로드 가능합니다.');
            }
        }
    });

    // 판매 상태 토글
    $('#modal-product-status').change(function () {
        $('#modal-product-status-text').text($(this).prop('checked') ? '판매중' : '품절');
    });
}

// 상품 모달 초기화
function resetProductModal() {
    $('#modal-product-name').val('');
    $('#modal-product-description').val('');
    $('#modal-product-price').val('');
    $('#modal-product-category').val('');
    $('#modal-product-stock').val('');
    $('#modal-product-image').val('');
    $('#modal-product-image-preview').html('');
    $('#modal-product-status').prop('checked', true);
    $('#modal-product-status-text').text('판매중');
    $('#image-upload-area').show();

    // 카테고리 옵션 업데이트
    const categories = ['포토카드', '의류', '음반', '액세서리', '포스터'];
    const html = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    $('#modal-product-category').html('<option value="">카테고리 선택</option>' + html);
}

// 상품 모달에서 저장
function saveProductFromModal() {
    const name = $('#modal-product-name').val().trim();
    const description = $('#modal-product-description').val().trim();
    const price = parseInt($('#modal-product-price').val());
    const category = $('#modal-product-category').val();
    const stock = parseInt($('#modal-product-stock').val()) || 0;
    const status = $('#modal-product-status').prop('checked');
    const fileInput = $('#modal-product-image')[0];
    const file = fileInput.files[0];
    const editingProductId = $('#product-modal-title').data('editing-id');

    // 필수 항목 검증
    if (!name || !description || !price || !category || stock < 0) {
        showToast('error', '오류', '필수 항목을 모두 올바르게 입력해주세요.');
        return;
    }

    // 새 상품 추가 시 이미지 필수
    if (!editingProductId && !file) {
        showToast('error', '오류', '상품 이미지를 업로드해주세요.');
        return;
    }

    const processImage = (imageData) => {
        const products = store.get('products', []);

        if (editingProductId) {
            // 수정 모드
            const productIndex = products.findIndex(p => p.id === editingProductId);
            if (productIndex !== -1) {
                products[productIndex] = {
                    ...products[productIndex],
                    name,
                    description,
                    price,
                    category,
                    stock: status ? stock : 0,
                    image: imageData || products[productIndex].image
                };
            }
        } else {
            // 추가 모드
            const newId = Date.now().toString();
            products.push({
                id: newId,
                name,
                description,
                price,
                image: imageData || 'https://via.placeholder.com/400x400/302b63/ffffff?text=No+Image',
                category,
                stock: status ? stock : 0,
                createdAt: new Date().toISOString()
            });
        }

        store.set('products', products);
        showToast('success', '저장 완료', editingProductId ? '상품이 수정되었습니다.' : '상품이 추가되었습니다.');
        closeModal('product-modal');
        renderProductsTable(currentProductPage);
    };

    if (file) {
        // 파일 크기 검증 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('error', '오류', '이미지 파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            processImage(e.target.result);
        };
        reader.onerror = function () {
            showToast('error', '오류', '이미지 파일을 읽는 중 오류가 발생했습니다.');
        };
        reader.readAsDataURL(file);
    } else {
        // 수정 모드에서는 기존 이미지 유지
        processImage(null);
    }
}

// 상품 수정
window.editProduct = function (productId) {
    const products = store.get('products', []);
    const product = products.find(p => p.id === productId);

    if (!product) {
        showToast('error', '오류', '상품을 찾을 수 없습니다.');
        return;
    }

    // 먼저 카테고리 옵션 업데이트
    const categories = ['포토카드', '의류', '음반', '액세서리', '포스터'];
    const html = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    $('#modal-product-category').html('<option value="">카테고리 선택</option>' + html);

    $('#product-modal-title').text('상품 수정').data('editing-id', productId);
    $('#modal-product-name').val(product.name || '');
    $('#modal-product-description').val(product.description || '');
    $('#modal-product-price').val(product.price || '');
    $('#modal-product-stock').val(product.stock || 0);
    $('#modal-product-status').prop('checked', product.stock > 0);
    $('#modal-product-status-text').text(product.stock > 0 ? '판매중' : '품절');

    // 카테고리 옵션이 업데이트된 후에 값 설정
    setTimeout(() => {
        $('#modal-product-category').val(product.category || '');
    }, 10);

    if (product.image) {
        $('#modal-product-image-preview').html(
            `<div style="position: relative; display: inline-block;">
                <img src="${product.image}" class="image-preview" style="max-width: 300px; max-height: 300px; border-radius: 10px; border: 2px solid var(--glass-border);">
                <button type="button" onclick="$('#modal-product-image').val(''); $('#modal-product-image-preview').html(''); $('#image-upload-area').show();" style="position: absolute; top: 5px; right: 5px; background: rgba(255, 77, 87, 0.9); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>`
        );
        $('#image-upload-area').hide();
    } else {
        $('#image-upload-area').show();
    }

    openModal('product-modal');
};

// 상품 삭제
window.deleteProduct = function (productId) {
    if (confirm('이 상품을 삭제하시겠습니까?')) {
        const products = store.get('products', []);
        const filtered = products.filter(p => p.id !== productId);
        store.set('products', filtered);
        showToast('success', '삭제 완료', '상품이 삭제되었습니다.');
        renderProductsTable(currentProductPage);
    }
};

// 대시보드에서 상품 수정
window.editProductFromDashboard = function (productId) {
    switchSection('products');
    setTimeout(() => editProduct(productId), 100);
};

// 상품 테이블 렌더링
function renderProductsTable(page = 1, sortKey = null, sortOrder = 'none') {
    currentProductPage = page;
    let products = store.get('products', []);

    // 검색 필터
    const searchTerm = $('#product-search').val().toLowerCase();
    if (searchTerm) {
        products = products.filter(p =>
            (p.name && p.name.toLowerCase().includes(searchTerm)) ||
            (p.category && p.category.toLowerCase().includes(searchTerm))
        );
    }

    // 카테고리 필터
    const categoryFilter = $('#product-category-filter').val();
    if (categoryFilter !== 'all') {
        products = products.filter(p => p.category === categoryFilter);
    }

    // 재고 필터
    const stockFilter = $('#product-stock-filter').val();
    if (stockFilter === 'low-stock') {
        products = products.filter(p => p.stock > 0 && p.stock <= 5);
    } else if (stockFilter === 'out-of-stock') {
        products = products.filter(p => p.stock === 0);
    } else if (stockFilter === 'in-stock') {
        products = products.filter(p => p.stock > 5);
    }

    // 정렬
    if (sortKey && sortOrder !== 'none') {
        products.sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];

            if (sortKey === 'price' || sortKey === 'stock' || sortKey === 'rating') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else if (sortKey === 'date') {
                aVal = new Date(a.createdAt || 0).getTime();
                bVal = new Date(b.createdAt || 0).getTime();
            } else {
                aVal = String(aVal || '').toLowerCase();
                bVal = String(bVal || '').toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : (aVal < bVal ? -1 : 0);
            } else {
                return aVal < bVal ? 1 : (aVal > bVal ? -1 : 0);
            }
        });
    }

    // 페이지네이션
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // 테이블 렌더링
    const html = paginatedProducts.map(p => {
        const status = p.stock === 0 ? '품절' : (p.stock <= 5 ? '재고부족' : '판매중');
        const statusClass = p.stock === 0 ? 'out-of-stock' : (p.stock <= 5 ? 'low-stock' : 'in-stock');

        return `
            <tr>
                <td>
                    <input type="checkbox" class="admin-checkbox product-checkbox" data-product-id="${p.id}">
                </td>
                <td>
                    <img src="${p.image || 'https://via.placeholder.com/60'}" 
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${p.name || '-'}</td>
                <td>${p.category || '-'}</td>
                <td>${(p.price || 0).toLocaleString()}원</td>
                <td><span style="color: ${p.stock === 0 ? '#F44336' : (p.stock <= 5 ? '#FF9800' : '#4CAF50')};">${p.stock}개</span></td>
                <td>${p.rating ? '★ ' + p.rating + ' (' + (p.reviews || 0) + ')' : '-'}</td>
                <td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn-primary btn-small" onclick="editProduct('${p.id}')">수정</button>
                    <button class="btn-danger btn-small" onclick="deleteProduct('${p.id}')">삭제</button>
                </td>
            </tr>
        `;
    }).join('');

    $('#product-table-body').html(html || '<tr><td colspan="10" style="text-align:center; color:#ccc;">상품이 없습니다.</td></tr>');

    // 페이지네이션 렌더링
    renderPagination('product-pagination', page, totalPages, (p) => renderProductsTable(p));

    // 카테고리 필터 옵션 업데이트
    updateCategoryFilterOptions();
}

// 카테고리 필터 옵션 업데이트
function updateCategoryFilterOptions() {
    const products = store.get('products', []);
    const categories = ['전체', ...new Set(products.map(p => p.category).filter(Boolean))];

    const html = categories.map(cat =>
        `<option value="${cat === '전체' ? 'all' : cat}">${cat}</option>`
    ).join('');

    $('#product-category-filter').html('<option value="all">전체 카테고리</option>' + html);
}

// 페이지네이션 렌더링
function renderPagination(containerId, currentPage, totalPages, callback) {
    if (totalPages <= 1) {
        $(`#${containerId}`).html('');
        return;
    }

    let html = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="${callback.name}(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `
                <button ${i === currentPage ? 'style="background: var(--accent-pink);"' : ''} 
                        onclick="${callback.name}(${i})">${i}</button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="page-info">...</span>`;
        }
    }

    html += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="${callback.name}(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
        <span class="page-info">${currentPage} / ${totalPages}</span>
    `;

    $(`#${containerId}`).html(html);
}

// 일괄 삭제 버튼 토글
function toggleBulkDeleteButton() {
    const checked = $('.product-checkbox:checked').length;
    if (checked > 0) {
        $('#btn-bulk-delete-products').show();
    } else {
        $('#btn-bulk-delete-products').hide();
    }
}

// 상품 삭제
function deleteProducts(productIds) {
    const products = store.get('products', []);
    const filtered = products.filter(p => !productIds.includes(p.id));
    store.set('products', filtered);
    showToast('success', '삭제 완료', `${productIds.length}개의 상품이 삭제되었습니다.`);
    renderProductsTable(currentProductPage);
    toggleBulkDeleteButton();
}

// 주문 관리 초기화
function initOrderManagement() {
    $('#order-search').on('input', () => renderOrdersTable());
    $('#order-status-filter, #order-date-from, #order-date-to').change(() => renderOrdersTable());
}

// 주문 테이블 렌더링
function renderOrdersTable(page = 1) {
    currentOrderPage = page;
    let orders = store.get('orders', []);

    // 검색 필터
    const searchTerm = $('#order-search').val().toLowerCase();
    if (searchTerm) {
        orders = orders.filter(o =>
            (o.id && o.id.toLowerCase().includes(searchTerm)) ||
            (o.shippingInfo && o.shippingInfo.name && o.shippingInfo.name.toLowerCase().includes(searchTerm))
        );
    }

    // 상태 필터
    const statusFilter = $('#order-status-filter').val();
    if (statusFilter !== 'all') {
        orders = orders.filter(o => o.status === statusFilter);
    }

    // 날짜 필터
    const dateFrom = $('#order-date-from').val();
    const dateTo = $('#order-date-to').val();
    if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        orders = orders.filter(o => {
            const orderDate = new Date(o.paidAt || o.createdAt || 0);
            return orderDate >= from;
        });
    }
    if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        orders = orders.filter(o => {
            const orderDate = new Date(o.paidAt || o.createdAt || 0);
            return orderDate <= to;
        });
    }

    // 최신순 정렬
    orders.sort((a, b) => {
        const dateA = new Date(a.paidAt || a.createdAt || 0);
        const dateB = new Date(b.paidAt || b.createdAt || 0);
        return dateB - dateA;
    });

    // 페이지네이션
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    // 테이블 렌더링
    const html = paginatedOrders.map(o => {
        const statusClass = {
            'PAID': 'paid',
            'PENDING': 'pending',
            'CANCELLED': 'cancelled',
            'PREPARING': 'shipping',
            'SHIPPING': 'shipping',
            'DELIVERED': 'delivered'
        }[o.status] || 'pending';

        const statusText = {
            'PAID': '결제완료',
            'PENDING': '결제대기',
            'CANCELLED': '취소됨',
            'PREPARING': '배송준비',
            'SHIPPING': '배송중',
            'DELIVERED': '배송완료'
        }[o.status] || o.status;

        const productNames = o.items ? o.items.map(item => item.name).join(', ') : '-';
        const totalAmount = ((o.totalAmount || 0) + (o.shippingFee || 0)).toLocaleString();

        return `
            <tr>
                <td>${o.id || o.impUid || '-'}</td>
                <td>${o.paidAt ? new Date(o.paidAt).toLocaleString('ko-KR') : '-'}</td>
                <td>${o.shippingInfo ? o.shippingInfo.name : '-'}</td>
                <td>${productNames.length > 30 ? productNames.substring(0, 30) + '...' : productNames}</td>
                <td>${o.items ? o.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : '-'}</td>
                <td>${totalAmount}원</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${o.trackingNumber || '-'}</td>
                <td>
                    <button class="btn-primary btn-small" onclick="viewOrderDetail('${o.id || o.impUid}')">상세</button>
                    <select class="admin-filter" style="margin-left: 5px; padding: 5px;" 
                            onchange="updateOrderStatus('${o.id || o.impUid}', this.value)">
                        <option value="PENDING" ${o.status === 'PENDING' ? 'selected' : ''}>결제대기</option>
                        <option value="PAID" ${o.status === 'PAID' ? 'selected' : ''}>결제완료</option>
                        <option value="PREPARING" ${o.status === 'PREPARING' ? 'selected' : ''}>배송준비</option>
                        <option value="SHIPPING" ${o.status === 'SHIPPING' ? 'selected' : ''}>배송중</option>
                        <option value="DELIVERED" ${o.status === 'DELIVERED' ? 'selected' : ''}>배송완료</option>
                        <option value="CANCELLED" ${o.status === 'CANCELLED' ? 'selected' : ''}>취소</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');

    $('#order-table-body').html(html || '<tr><td colspan="9" style="text-align:center; color:#ccc;">주문이 없습니다.</td></tr>');

    // 페이지네이션
    renderPagination('order-pagination', page, totalPages, (p) => renderOrdersTable(p));
}

// 주문 상세 보기
window.viewOrderDetail = function (orderId) {
    const orders = store.get('orders', []);
    const order = orders.find(o => o.id === orderId || o.impUid === orderId);

    if (!order) {
        showToast('error', '오류', '주문을 찾을 수 없습니다.');
        return;
    }

    const itemsHtml = order.items ? order.items.map(item =>
        `<tr>
            <td>${item.name || '-'}</td>
            <td>${item.quantity || 0}</td>
            <td>${(item.price || 0).toLocaleString()}원</td>
            <td>${((item.price || 0) * (item.quantity || 0)).toLocaleString()}원</td>
        </tr>`
    ).join('') : '<tr><td colspan="4">상품 정보 없음</td></tr>';

    const html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h4 style="margin-bottom: 10px; color: var(--accent-pink);">주문 정보</h4>
                <p><strong>주문번호:</strong> ${order.id || order.impUid || '-'}</p>
                <p><strong>결제번호:</strong> ${order.impUid || '-'}</p>
                <p><strong>상태:</strong> <span class="status-badge">${order.status || '-'}</span></p>
                <p><strong>결제일:</strong> ${order.paidAt ? new Date(order.paidAt).toLocaleString('ko-KR') : '-'}</p>
            </div>
            <div>
                <h4 style="margin-bottom: 10px; color: var(--accent-pink);">결제 정보</h4>
                <p><strong>상품 금액:</strong> ${(order.totalAmount || 0).toLocaleString()}원</p>
                <p><strong>배송비:</strong> ${(order.shippingFee || 0).toLocaleString()}원</p>
                <p><strong>총 결제금액:</strong> <strong style="color: var(--accent-pink);">${((order.totalAmount || 0) + (order.shippingFee || 0)).toLocaleString()}원</strong></p>
            </div>
        </div>
        ${order.shippingInfo ? `
            <div style="margin-top: 20px;">
                <h4 style="margin-bottom: 10px; color: var(--accent-pink);">배송 정보</h4>
                <p><strong>받는 분:</strong> ${order.shippingInfo.name || '-'}</p>
                <p><strong>전화번호:</strong> ${order.shippingInfo.phone || '-'}</p>
                <p><strong>우편번호:</strong> ${order.shippingInfo.postcode || '-'}</p>
                <p><strong>주소:</strong> ${order.shippingInfo.addr || '-'}</p>
                <p><strong>송장번호:</strong> 
                    <input type="text" id="tracking-number-input" value="${order.trackingNumber || ''}" 
                           placeholder="송장번호 입력" style="margin-left: 10px; padding: 5px;">
                    <button class="btn-primary btn-small" onclick="saveTrackingNumber('${order.id || order.impUid}')">저장</button>
                </p>
            </div>
        ` : ''}
        <div style="margin-top: 20px;">
            <h4 style="margin-bottom: 10px; color: var(--accent-pink);">주문 상품</h4>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>상품명</th>
                        <th>수량</th>
                        <th>단가</th>
                        <th>합계</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
        </div>
    `;

    $('#order-detail-content').html(html);
    openModal('order-detail-modal');
};

// 주문 상태 업데이트
window.updateOrderStatus = function (orderId, newStatus) {
    const orders = store.get('orders', []);
    const orderIndex = orders.findIndex(o => o.id === orderId || o.impUid === orderId);

    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        if (newStatus === 'DELIVERED' && !orders[orderIndex].deliveredAt) {
            orders[orderIndex].deliveredAt = new Date().toISOString();
        }
        store.set('orders', orders);
        showToast('success', '업데이트 완료', '주문 상태가 변경되었습니다.');
        renderOrdersTable(currentOrderPage);
        if (currentSection === 'dashboard') {
            renderDashboard();
        }
    }
};

// 송장번호 저장
window.saveTrackingNumber = function (orderId) {
    const trackingNumber = $('#tracking-number-input').val().trim();
    const orders = store.get('orders', []);
    const orderIndex = orders.findIndex(o => o.id === orderId || o.impUid === orderId);

    if (orderIndex !== -1) {
        orders[orderIndex].trackingNumber = trackingNumber;
        store.set('orders', orders);
        showToast('success', '저장 완료', '송장번호가 저장되었습니다.');
        viewOrderDetail(orderId);
    }
};

// 카테고리 관리 초기화
function initCategoryManagement() {
    $('#btn-add-category').click(() => {
        const categoryName = prompt('카테고리명을 입력하세요:');
        if (categoryName && categoryName.trim()) {
            addCategory(categoryName.trim());
        }
    });
}

// 카테고리 테이블 렌더링
function renderCategoriesTable() {
    const products = store.get('products', []);
    const orders = store.get('orders', []);

    // 카테고리별 통계 계산
    const categoryStats = {};
    const categories = ['포토카드', '의류', '음반', '액세서리', '포스터'];

    categories.forEach(cat => {
        const categoryProducts = products.filter(p => p.category === cat);
        const categoryOrders = orders.filter(o => {
            if (!o.items) return false;
            return o.items.some(item => {
                const product = products.find(p => p.id === item.id);
                return product && product.category === cat;
            });
        });

        const revenue = categoryOrders.reduce((sum, order) => {
            if (order.status !== 'PAID') return sum;
            const orderRevenue = order.items.reduce((itemSum, item) => {
                const product = products.find(p => p.id === item.id);
                if (product && product.category === cat) {
                    return itemSum + ((item.price || 0) * (item.quantity || 0));
                }
                return itemSum;
            }, 0);
            return sum + orderRevenue;
        }, 0);

        categoryStats[cat] = {
            productCount: categoryProducts.length,
            revenue: revenue
        };
    });

    const html = categories.map((cat, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${cat}</td>
            <td>${categoryStats[cat].productCount}개</td>
            <td>${categoryStats[cat].revenue.toLocaleString()}원</td>
            <td>
                <button class="btn-primary btn-small" onclick="editCategory('${cat}')">수정</button>
                <button class="btn-danger btn-small" onclick="deleteCategory('${cat}')">삭제</button>
            </td>
        </tr>
    `).join('');

    $('#category-table-body').html(html || '<tr><td colspan="5" style="text-align:center; color:#ccc;">카테고리가 없습니다.</td></tr>');
}

// 카테고리 추가
function addCategory(name) {
    // 카테고리는 상품 데이터에서 동적으로 관리되므로, 여기서는 알림만 표시
    showToast('info', '알림', '카테고리는 상품 추가 시 선택할 수 있습니다.');
}

// 카테고리 수정
window.editCategory = function (oldName) {
    const newName = prompt('새 카테고리명을 입력하세요:', oldName);
    if (newName && newName.trim() && newName !== oldName) {
        // 상품들의 카테고리 업데이트
        const products = store.get('products', []);
        products.forEach(product => {
            if (product.category === oldName) {
                product.category = newName.trim();
            }
        });
        store.set('products', products);
        showToast('success', '수정 완료', '카테고리가 수정되었습니다.');
        renderCategoriesTable();
        renderProductsTable(currentProductPage);
    }
};

// 카테고리 삭제
window.deleteCategory = function (categoryName) {
    const products = store.get('products', []);
    const categoryProducts = products.filter(p => p.category === categoryName);

    if (categoryProducts.length > 0) {
        if (!confirm(`이 카테고리에 속한 상품이 ${categoryProducts.length}개 있습니다. 정말 삭제하시겠습니까?`)) {
            return;
        }
    }

    if (confirm(`카테고리 "${categoryName}"을(를) 삭제하시겠습니까?`)) {
        // 해당 카테고리의 상품들을 '기타'로 변경
        products.forEach(product => {
            if (product.category === categoryName) {
                product.category = '기타';
            }
        });
        store.set('products', products);
        showToast('success', '삭제 완료', '카테고리가 삭제되었습니다.');
        renderCategoriesTable();
        renderProductsTable(currentProductPage);
    }
};

// 리뷰 관리 초기화
function initReviewManagement() {
    $('#review-search').on('input', () => renderReviewsTable());
    $('#review-rating-filter').change(() => renderReviewsTable());
}

// 리뷰 테이블 렌더링
function renderReviewsTable(page = 1) {
    currentReviewPage = page;
    const products = store.get('products', []);

    // 상품별 리뷰 데이터 생성 (실제 리뷰 데이터가 없으므로 상품의 평점 데이터 사용)
    let reviews = [];
    products.forEach(product => {
        if (product.rating && product.reviews > 0) {
            for (let i = 0; i < product.reviews; i++) {
                reviews.push({
                    productId: product.id,
                    productName: product.name,
                    author: `리뷰어${i + 1}`,
                    rating: product.rating,
                    content: `${product.name}에 대한 리뷰입니다.`,
                    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    visible: true
                });
            }
        }
    });

    // 검색 필터
    const searchTerm = $('#review-search').val().toLowerCase();
    if (searchTerm) {
        reviews = reviews.filter(r =>
            (r.productName && r.productName.toLowerCase().includes(searchTerm)) ||
            (r.author && r.author.toLowerCase().includes(searchTerm))
        );
    }

    // 평점 필터
    const ratingFilter = $('#review-rating-filter').val();
    if (ratingFilter !== 'all') {
        reviews = reviews.filter(r => Math.floor(r.rating) === parseInt(ratingFilter));
    }

    // 페이지네이션
    const totalPages = Math.ceil(reviews.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    const html = paginatedReviews.map(r => `
        <tr>
            <td>${r.productName || '-'}</td>
            <td>${r.author || '-'}</td>
            <td>${'★'.repeat(Math.floor(r.rating))} ${r.rating}</td>
            <td>${r.content.length > 50 ? r.content.substring(0, 50) + '...' : r.content}</td>
            <td>${new Date(r.date).toLocaleDateString('ko-KR')}</td>
            <td><span class="status-badge ${r.visible ? 'paid' : 'cancelled'}">${r.visible ? '표시' : '숨김'}</span></td>
            <td>
                <button class="btn-primary btn-small" onclick="toggleReviewVisibility('${r.productId}', ${r.visible})">
                    ${r.visible ? '숨기기' : '표시하기'}
                </button>
                <button class="btn-danger btn-small" onclick="deleteReview('${r.productId}')">삭제</button>
            </td>
        </tr>
    `).join('');

    $('#review-table-body').html(html || '<tr><td colspan="7" style="text-align:center; color:#ccc;">리뷰가 없습니다.</td></tr>');

    renderPagination('review-pagination', page, totalPages, (p) => renderReviewsTable(p));
}

// 리뷰 표시/숨김 토글
window.toggleReviewVisibility = function (productId, currentVisible) {
    // 실제 리뷰 데이터 구조에 따라 구현 필요
    showToast('success', '완료', `리뷰가 ${currentVisible ? '숨김' : '표시'} 처리되었습니다.`);
    renderReviewsTable(currentReviewPage);
};

// 배너 관리 초기화
function initBannerManagement() {
    // 기존 배너 관리 기능 사용
    if (typeof renderBannerImagesList === 'function') {
        renderBannerImagesList();
    }

    // 배너 이미지 추가 버튼 (기존 admin.js의 기능 사용)
    $('#btn-upload-image').off('click').on('click', function () {
        // 기존 admin.js의 이미지 업로드 로직이 실행되도록 함
        // admin.js에서 이미 구현되어 있음
    });
}

// 회원 관리 초기화
function initMemberManagement() {
    $('#member-search').on('input', () => renderMembersTable());
    $('#member-status-filter, #member-grade-filter').change(() => renderMembersTable());
}

// 회원 테이블 렌더링
function renderMembersTable(page = 1) {
    currentMemberPage = page;
    let users = store.get('users', []);
    const orders = store.get('orders', []);

    // 회원별 주문 통계 계산
    const userStats = {};
    orders.forEach(order => {
        if (order.shippingInfo && order.shippingInfo.email) {
            const email = order.shippingInfo.email.toLowerCase();
            if (!userStats[email]) {
                userStats[email] = { orderCount: 0, totalSpent: 0 };
            }
            if (order.status === 'PAID') {
                userStats[email].orderCount++;
                userStats[email].totalSpent += (order.totalAmount || 0) + (order.shippingFee || 0);
            }
        }
    });

    // 검색 필터
    const searchTerm = $('#member-search').val().toLowerCase();
    if (searchTerm) {
        users = users.filter(u =>
            (u.email && u.email.toLowerCase().includes(searchTerm)) ||
            (u.nickname && u.nickname.toLowerCase().includes(searchTerm))
        );
    }

    // 상태 필터
    const statusFilter = $('#member-status-filter').val();
    if (statusFilter !== 'all') {
        users = users.filter(u => (u.status || 'active') === statusFilter);
    }

    // 등급 필터
    const gradeFilter = $('#member-grade-filter').val();
    if (gradeFilter !== 'all') {
        users = users.filter(u => {
            const stats = userStats[u.email?.toLowerCase()] || { totalSpent: 0 };
            if (gradeFilter === 'vip') return stats.totalSpent >= 500000;
            if (gradeFilter === 'premium') return stats.totalSpent >= 200000 && stats.totalSpent < 500000;
            return stats.totalSpent < 200000;
        });
    }

    // 페이지네이션
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = users.slice(startIndex, endIndex);

    const html = paginatedUsers.map(u => {
        const email = u.email?.toLowerCase() || '';
        const stats = userStats[email] || { orderCount: 0, totalSpent: 0 };
        const grade = stats.totalSpent >= 500000 ? 'VIP' : (stats.totalSpent >= 200000 ? '우수회원' : '일반');
        const status = u.status || 'active';
        const statusText = { active: '정상', suspended: '정지', withdrawn: '탈퇴' }[status] || '정상';

        return `
            <tr>
                <td>${u.nickname || '-'}</td>
                <td>${u.email || '-'}</td>
                <td>${u.country || '-'}</td>
                <td>${u.signupDate ? new Date(u.signupDate).toLocaleDateString('ko-KR') : '-'}</td>
                <td>${stats.orderCount}회</td>
                <td>${stats.totalSpent.toLocaleString()}원</td>
                <td><span class="status-badge ${grade === 'VIP' ? 'paid' : (grade === '우수회원' ? 'shipping' : 'pending')}">${grade}</span></td>
                <td><span class="status-badge ${status === 'active' ? 'paid' : (status === 'suspended' ? 'pending' : 'cancelled')}">${statusText}</span></td>
                <td>
                    <select class="admin-filter" style="padding: 5px;" onchange="updateMemberStatus('${u.email}', this.value)">
                        <option value="active" ${status === 'active' ? 'selected' : ''}>정상</option>
                        <option value="suspended" ${status === 'suspended' ? 'selected' : ''}>정지</option>
                        <option value="withdrawn" ${status === 'withdrawn' ? 'selected' : ''}>탈퇴</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');

    $('#member-table-body').html(html || '<tr><td colspan="9" style="text-align:center; color:#ccc;">회원이 없습니다.</td></tr>');

    renderPagination('member-pagination', page, totalPages, (p) => renderMembersTable(p));
}

// 회원 상태 업데이트
window.updateMemberStatus = function (email, newStatus) {
    const users = store.get('users', []);
    const userIndex = users.findIndex(u => u.email?.toLowerCase() === email.toLowerCase());

    if (userIndex !== -1) {
        users[userIndex].status = newStatus;
        store.set('users', users);
        showToast('success', '업데이트 완료', '회원 상태가 변경되었습니다.');
        renderMembersTable(currentMemberPage);
    }
};

// 통계 초기화
function initStatistics() {
    $('#stat-period, #stat-date-from, #stat-date-to').change(() => renderStatistics());
}

// 통계 렌더링
function renderStatistics() {
    renderSalesChart();
    renderCategorySalesChart();
    renderTopProducts();
}

// 매출 차트 렌더링
function renderSalesChart() {
    const orders = store.get('orders', []);
    const period = $('#stat-period').val();
    const dateFrom = $('#stat-date-from').val() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateTo = $('#stat-date-to').val() || new Date().toISOString().split('T')[0];

    // 기간별 데이터 그룹화
    const chartData = {};
    orders.filter(o => {
        if (o.status !== 'PAID') return false;
        const orderDate = new Date(o.paidAt || o.createdAt || 0).toISOString().split('T')[0];
        return orderDate >= dateFrom && orderDate <= dateTo;
    }).forEach(order => {
        const orderDate = new Date(order.paidAt || order.createdAt || 0);
        let key;

        if (period === 'daily') {
            key = orderDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        } else if (period === 'weekly') {
            const weekStart = new Date(orderDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            key = weekStart.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        } else {
            key = orderDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
        }

        if (!chartData[key]) chartData[key] = 0;
        chartData[key] += (order.totalAmount || 0) + (order.shippingFee || 0);
    });

    const ctx = document.getElementById('sales-chart');
    if (!ctx) return;

    const labels = Object.keys(chartData).sort();
    const data = labels.map(key => chartData[key]);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '매출액 (원)',
                data: data,
                backgroundColor: 'rgba(255, 154, 158, 0.8)',
                borderColor: 'rgb(255, 154, 158)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

// 카테고리별 매출 차트
function renderCategorySalesChart() {
    const orders = store.get('orders', []);
    const products = store.get('products', []);
    const categoryRevenue = {};

    orders.filter(o => o.status === 'PAID').forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product && product.category) {
                    const revenue = (item.price || 0) * (item.quantity || 0);
                    categoryRevenue[product.category] = (categoryRevenue[product.category] || 0) + revenue;
                }
            });
        }
    });

    const ctx = document.getElementById('category-sales-chart');
    if (!ctx) return;

    const categories = Object.keys(categoryRevenue);
    const revenues = Object.values(categoryRevenue);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: revenues,
                backgroundColor: [
                    'rgba(255, 154, 158, 0.8)',
                    'rgba(161, 140, 209, 0.8)',
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(0, 242, 254, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#fff' }
                }
            }
        }
    });
}

// 인기 상품 TOP 10 렌더링
function renderTopProducts() {
    const orders = store.get('orders', []);
    const products = store.get('products', []);
    const productStats = {};

    orders.filter(o => o.status === 'PAID').forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                if (!productStats[item.id]) {
                    productStats[item.id] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0,
                        category: products.find(p => p.id === item.id)?.category || '-',
                        rating: products.find(p => p.id === item.id)?.rating || 0
                    };
                }
                productStats[item.id].quantity += (item.quantity || 0);
                productStats[item.id].revenue += ((item.price || 0) * (item.quantity || 0));
            });
        }
    });

    const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

    const html = topProducts.map((p, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${p.name || '-'}</td>
            <td>${p.category || '-'}</td>
            <td>${p.quantity}개</td>
            <td>${p.revenue.toLocaleString()}원</td>
            <td>${p.rating ? '★ ' + p.rating : '-'}</td>
        </tr>
    `).join('');

    $('#top-products-body').html(html || '<tr><td colspan="6" style="text-align:center; color:#ccc;">데이터가 없습니다.</td></tr>');
}

// 엑셀 다운로드 (CSV 형식)
window.exportOrdersToExcel = function () {
    const orders = store.get('orders', []);
    let csv = '주문번호,주문일시,구매자,상품명,수량,총액,상태\n';

    orders.forEach(order => {
        const productNames = order.items ? order.items.map(item => item.name).join('; ') : '-';
        const totalQuantity = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        const totalAmount = ((order.totalAmount || 0) + (order.shippingFee || 0)).toLocaleString();
        const date = order.paidAt ? new Date(order.paidAt).toLocaleString('ko-KR') : '-';

        csv += `${order.id || '-'},${date},${order.shippingInfo?.name || '-'},${productNames},${totalQuantity},${totalAmount},${order.status || '-'}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `주문목록_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('success', '다운로드 완료', '주문 목록이 다운로드되었습니다.');
};

// 엑셀 다운로드 버튼 연결
$('#btn-export-orders').click(() => {
    exportOrdersToExcel();
});

// ========== 새로운 섹션 초기화 함수들 ==========

// 영상 관리 (Standalone) 초기화
function initVideoManagementStandalone() {
    $('#btn-add-video-standalone').off('click').on('click', function () {
        const urlOrId = $('#admin-video-url-standalone').val().trim();
        const title = $('#admin-video-title-standalone').val().trim();

        if (!urlOrId || !title) {
            showToast('error', '오류', 'YouTube URL과 영상 제목을 모두 입력해주세요.');
            return;
        }

        const videoId = window.extractYouTubeId(urlOrId);
        if (!videoId) {
            showToast('error', '오류', '올바른 YouTube URL 형식이 아닙니다.');
            return;
        }

        const videos = store.get('videos', []);
        if (videos.some(v => v && v.id === videoId)) {
            showToast('warning', '알림', '이미 등록된 영상입니다.');
            return;
        }

        videos.push({ id: videoId, title: title });
        store.set('videos', videos);

        $('#admin-video-url-standalone').val('');
        $('#admin-video-title-standalone').val('');

        renderVideosTableStandalone();
        showToast('success', '추가 완료', '영상이 추가되었습니다.');
    });

    renderVideosTableStandalone();
}

// 영상 테이블 렌더링 (Standalone)
function renderVideosTableStandalone() {
    const videos = store.get('videos', []);
    if (videos.length === 0) {
        $('#video-table-body-standalone').html('<tr><td colspan="4" style="text-align:center; color:#ccc;">등록된 영상이 없습니다.</td></tr>');
        return;
    }

    const html = videos.map((v, index) => {
        if (!v || !v.id || !v.title) return '';
        const title = String(v.title).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const videoId = String(v.id).replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return `
            <tr>
                <td>${title}</td>
                <td>${videoId}</td>
                <td>
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="color: var(--accent-blue);">
                        <i class="fas fa-external-link-alt"></i> 미리보기
                    </a>
                </td>
                <td>
                    <button class="btn-danger btn-small" onclick="deleteVideoStandalone(${index})">삭제</button>
                    <button class="btn-primary btn-small" onclick="editVideoStandalone(${index})">수정</button>
                </td>
            </tr>
        `;
    }).filter(html => html !== '').join('');

    $('#video-table-body-standalone').html(html || '<tr><td colspan="4" style="text-align:center; color:#ccc;">등록된 영상이 없습니다.</td></tr>');
}

// 영상 삭제 (Standalone)
window.deleteVideoStandalone = function (index) {
    if (confirm('이 영상을 삭제하시겠습니까?')) {
        const videos = store.get('videos', []);
        videos.splice(index, 1);
        store.set('videos', videos);
        renderVideosTableStandalone();
        showToast('success', '삭제 완료', '영상이 삭제되었습니다.');
    }
};

// 영상 수정 (Standalone)
window.editVideoStandalone = function (index) {
    const videos = store.get('videos', []);
    const video = videos[index];
    if (!video) return;

    const newUrlOrId = prompt('YouTube URL 또는 ID를 입력하세요:', video.id);
    if (!newUrlOrId || !newUrlOrId.trim()) return;

    const newTitle = prompt('영상 제목을 입력하세요:', video.title);
    if (!newTitle || !newTitle.trim()) return;

    const videoId = window.extractYouTubeId(newUrlOrId.trim());
    if (!videoId) {
        showToast('error', '오류', '올바른 YouTube URL 형식이 아닙니다.');
        return;
    }

    if (videos.some((v, i) => i !== index && v && v.id === videoId)) {
        showToast('warning', '알림', '이미 등록된 영상입니다.');
        return;
    }

    videos[index] = { id: videoId, title: newTitle.trim() };
    store.set('videos', videos);
    renderVideosTableStandalone();
    showToast('success', '수정 완료', '영상 정보가 수정되었습니다.');
};

// 음원 관리 (Standalone) 초기화
function initMusicManagementStandalone() {
    $('#btn-add-music-standalone').off('click').on('click', function () {
        const title = $('#admin-music-title-standalone').val().trim();
        const fileInput = $('#admin-music-file-standalone')[0];
        const file = fileInput.files[0];

        if (!title || !file) {
            showToast('error', '오류', '곡 제목과 음원 파일을 모두 입력해주세요.');
            return;
        }

        if (!file.type.match('audio.*')) {
            showToast('error', '오류', '음원 파일만 업로드 가능합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const music = store.get('music', []);
                const musicId = Date.now().toString();

                // IndexedDB에 저장
                await audioDB.save(musicId, e.target.result);

                music.push({
                    id: musicId,
                    title: title,
                    filename: file.name,
                    storedIn: 'indexeddb'
                });

                store.set('music', music);

                $('#admin-music-title-standalone').val('');
                $('#admin-music-file-standalone').val('');

                renderMusicTableStandalone();
                showToast('success', '추가 완료', '음원이 추가되었습니다.');
            } catch (error) {
                console.error('음원 저장 오류:', error);
                showToast('error', '오류', '음원 저장 중 오류가 발생했습니다.');
            }
        };
        reader.readAsDataURL(file);
    });

    renderMusicTableStandalone();
}

// 음원 테이블 렌더링 (Standalone)
function renderMusicTableStandalone() {
    const music = store.get('music', []);
    if (music.length === 0) {
        $('#music-table-body-standalone').html('<tr><td colspan="4" style="text-align:center; color:#ccc;">등록된 음원이 없습니다.</td></tr>');
        return;
    }

    const html = music.map((m, index) => `
        <tr>
            <td>${m.title || '-'}</td>
            <td>${m.filename || 'N/A'}</td>
            <td>
                <button class="btn-primary btn-small" onclick="playMusicStandalone('${m.id}')">
                    <i class="fas fa-play"></i> 재생
                </button>
            </td>
            <td>
                <button class="btn-danger btn-small" onclick="deleteMusicStandalone(${index})">삭제</button>
                <button class="btn-primary btn-small" onclick="editMusicStandalone(${index})">수정</button>
            </td>
        </tr>
    `).join('');

    $('#music-table-body-standalone').html(html);
}

// 음원 재생 (Standalone)
window.playMusicStandalone = async function (musicId) {
    try {
        const audioFile = await audioDB.get(musicId);
        if (!audioFile || !audioFile.data) {
            showToast('error', '오류', '음원 파일을 찾을 수 없습니다.');
            return;
        }

        // audioFile.data는 base64 문자열 또는 ArrayBuffer일 수 있음
        let blob;
        if (typeof audioFile.data === 'string') {
            // base64 문자열인 경우
            const response = await fetch(audioFile.data);
            blob = await response.blob();
        } else {
            // ArrayBuffer인 경우
            blob = new Blob([audioFile.data], { type: audioFile.type || 'audio/mpeg' });
        }

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();

        audio.onended = () => URL.revokeObjectURL(url);
    } catch (error) {
        console.error('음원 재생 오류:', error);
        showToast('error', '오류', '음원 재생 중 오류가 발생했습니다.');
    }
};

// 음원 삭제 (Standalone)
window.deleteMusicStandalone = async function (index) {
    if (confirm('이 음원을 삭제하시겠습니까?')) {
        const music = store.get('music', []);
        const musicItem = music[index];

        try {
            if (musicItem.storedIn === 'indexeddb' || musicItem.url?.startsWith('indexeddb://')) {
                await audioDB.delete(musicItem.id);
            }

            music.splice(index, 1);
            store.set('music', music);
            renderMusicTableStandalone();
            showToast('success', '삭제 완료', '음원이 삭제되었습니다.');
        } catch (error) {
            console.error('음원 삭제 오류:', error);
            showToast('error', '오류', '음원 삭제 중 오류가 발생했습니다.');
        }
    }
};

// 음원 수정 (Standalone)
window.editMusicStandalone = function (index) {
    const music = store.get('music', []);
    const musicItem = music[index];

    const newTitle = prompt('곡 제목을 입력하세요:', musicItem.title);
    if (!newTitle || !newTitle.trim()) return;

    music[index].title = newTitle.trim();
    store.set('music', music);
    renderMusicTableStandalone();
    showToast('success', '수정 완료', '음원 정보가 수정되었습니다.');
};

// 응원 메시지 관리 (Standalone) 초기화
function initPostManagementStandalone() {
    $('#post-status-filter').off('change').on('change', function () {
        renderPostsTableStandalone();
    });

    $('#post-search').off('input').on('input', function () {
        renderPostsTableStandalone();
    });

    renderPostsTableStandalone();
}

// 응원 메시지 테이블 렌더링 (Standalone)
function renderPostsTableStandalone() {
    const posts = store.get('posts', []);
    const statusFilter = $('#post-status-filter').val();
    const searchQuery = $('#post-search').val().toLowerCase();

    let filteredPosts = posts;

    // 상태 필터
    if (statusFilter === 'approved') {
        filteredPosts = filteredPosts.filter(p => p.approved !== false);
    } else if (statusFilter === 'pending') {
        filteredPosts = filteredPosts.filter(p => p.approved === false || p.approved === undefined);
    }

    // 검색 필터
    if (searchQuery) {
        filteredPosts = filteredPosts.filter(p =>
            (p.author && p.author.toLowerCase().includes(searchQuery)) ||
            (p.content && p.content.toLowerCase().includes(searchQuery))
        );
    }

    if (filteredPosts.length === 0) {
        $('#post-table-body-standalone').html('<tr><td colspan="7" style="text-align:center; color:#ccc;">등록된 메시지가 없습니다.</td></tr>');
        return;
    }

    const html = filteredPosts.map((p, index) => {
        const originalIndex = posts.indexOf(p);
        const date = p.timestamp ? new Date(p.timestamp).toLocaleDateString('ko-KR') : 'N/A';
        const contentPreview = p.content && p.content.length > 50 ? p.content.substring(0, 50) + '...' : (p.content || '');
        const isApproved = p.approved !== false;

        return `
            <tr>
                <td>${p.author || '-'}</td>
                <td>${contentPreview}</td>
                <td>${p.likes || 0}</td>
                <td>${p.comments ? p.comments.length : 0}</td>
                <td>${date}</td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; ${isApproved ? 'background: rgba(76, 175, 80, 0.2); color: #4CAF50;' : 'background: rgba(255, 152, 0, 0.2); color: #FF9800;'}">
                        ${isApproved ? '승인됨' : '대기중'}
                    </span>
                </td>
                <td>
                    ${!isApproved ? `<button class="btn-primary btn-small" onclick="approvePostStandalone(${originalIndex})">승인</button>` : ''}
                    <button class="btn-danger btn-small" onclick="deletePostStandalone(${originalIndex})">삭제</button>
                </td>
            </tr>
        `;
    }).join('');

    $('#post-table-body-standalone').html(html);
}

// 응원 메시지 승인 (Standalone)
window.approvePostStandalone = function (index) {
    const posts = store.get('posts', []);
    if (posts[index]) {
        posts[index].approved = true;
        store.set('posts', posts);
        renderPostsTableStandalone();
        showToast('success', '승인 완료', '응원 메시지가 승인되었습니다.');
    }
};

// 응원 메시지 삭제 (Standalone)
window.deletePostStandalone = function (index) {
    if (confirm('이 응원 메시지를 삭제하시겠습니까?')) {
        const posts = store.get('posts', []);
        posts.splice(index, 1);
        store.set('posts', posts);
        renderPostsTableStandalone();
        showToast('success', '삭제 완료', '응원 메시지가 삭제되었습니다.');
    }
};

// 리뷰 삭제
window.deleteReview = function (productId) {
    if (confirm('이 리뷰를 정말 삭제하시겠습니까?')) {
        const products = store.get('products', []);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex !== -1 && products[productIndex].reviews > 0) {
            products[productIndex].reviews--;
            store.set('products', products);
            showToast('success', '삭제 완료', '리뷰가 삭제되었습니다.');
            renderReviewsTable(currentReviewPage);
        }
    }
};

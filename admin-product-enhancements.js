// ========================================
// 상품 등록 모달 개선 기능
// ========================================

// 1. 실시간 폼 검증 및 글자 수 카운터
function initProductFormValidation() {
    // 상품명 검증
    $('#modal-product-name').on('input', function() {
        const value = $(this).val();
        const length = value.length;
        $('#name-char-count').text(length);

        if (length === 0) {
            showFieldError('modal-product-name', '상품명을 입력해주세요.');
        } else if (length > 100) {
            showFieldError('modal-product-name', '상품명은 100자 이하여야 합니다.');
        } else {
            clearFieldError('modal-product-name');
            $(this).addClass('success');
        }
    });

    // 상품 설명 검증
    $('#modal-product-description').on('input', function() {
        const value = $(this).val();
        const length = value.length;
        $('#desc-char-count').text(length);

        if (length === 0) {
            showFieldError('modal-product-description', '상품 설명을 입력해주세요.');
        } else if (length < 10) {
            showFieldError('modal-product-description', '최소 10자 이상 입력해주세요.');
            $('.char-counter').eq(1).addClass('warning');
        } else {
            clearFieldError('modal-product-description');
            $(this).addClass('success');
            $('.char-counter').eq(1).removeClass('warning');
        }
    });

    // 가격 검증
    $('#modal-product-price').on('input', function() {
        const value = parseInt($(this).val());

        if (!value || value < 100) {
            showFieldError('modal-product-price', '가격은 최소 100원 이상이어야 합니다.');
        } else {
            clearFieldError('modal-product-price');
            $(this).addClass('success');
        }

        // 천 단위 구분 표시 (시각적 효과)
        if (value >= 1000) {
            $('.field-info').eq(0).text(`판매 가격: ₩${value.toLocaleString()}`);
        }
    });

    // 카테고리 검증
    $('#modal-product-category').on('change', function() {
        const value = $(this).val();

        if (!value) {
            showFieldError('modal-product-category', '카테고리를 선택해주세요.');
        } else {
            clearFieldError('modal-product-category');
            $(this).addClass('success');
        }
    });

    // 재고 검증 및 경고
    $('#modal-product-stock').on('input', function() {
        const value = parseInt($(this).val());

        if (isNaN(value) || value < 0) {
            showFieldError('modal-product-stock', '재고는 0 이상이어야 합니다.');
            $('#stock-warning').removeClass('show');
        } else {
            clearFieldError('modal-product-stock');
            $(this).addClass('success');

            // 재고 경고 표시
            if (value === 0) {
                $('#stock-warning').addClass('show').html('<i class="fas fa-exclamation-triangle"></i> 재고가 0이면 품절 처리됩니다.');
                $('#modal-product-sale-status').val('soldout');
            } else if (value <= 5) {
                $('#stock-warning').addClass('show').html('<i class="fas fa-exclamation-triangle"></i> 재고가 부족합니다. (5개 이하)');
            } else {
                $('#stock-warning').removeClass('show');
            }
        }
    });
}

// 필드 에러 표시
function showFieldError(fieldId, message) {
    const $field = $(`#${fieldId}`);
    const $error = $(`#error-${fieldId.replace('modal-', '')}`);

    $field.removeClass('success').addClass('error');
    $error.addClass('show').text(message);
}

// 필드 에러 제거
function clearFieldError(fieldId) {
    const $field = $(`#${fieldId}`);
    const $error = $(`#error-${fieldId.replace('modal-', '')}`);

    $field.removeClass('error');
    $error.removeClass('show').text('');
}

// 전체 폼 검증
function validateProductForm(isEditing) {
    const errors = [];

    const name = $('#modal-product-name').val().trim();
    if (!name) {
        errors.push({ field: 'modal-product-name', message: '상품명을 입력해주세요.' });
    } else if (name.length > 100) {
        errors.push({ field: 'modal-product-name', message: '상품명은 100자 이하여야 합니다.' });
    }

    const description = $('#modal-product-description').val().trim();
    if (!description) {
        errors.push({ field: 'modal-product-description', message: '상품 설명을 입력해주세요.' });
    } else if (description.length < 10) {
        errors.push({ field: 'modal-product-description', message: '상품 설명은 최소 10자 이상이어야 합니다.' });
    }

    const price = parseInt($('#modal-product-price').val());
    if (!price || price < 100) {
        errors.push({ field: 'modal-product-price', message: '가격은 최소 100원 이상이어야 합니다.' });
    }

    const category = $('#modal-product-category').val();
    if (!category) {
        errors.push({ field: 'modal-product-category', message: '카테고리를 선택해주세요.' });
    }

    const stock = parseInt($('#modal-product-stock').val());
    if (isNaN(stock) || stock < 0) {
        errors.push({ field: 'modal-product-stock', message: '재고는 0 이상이어야 합니다.' });
    }

    const fileInput = $('#modal-product-image')[0];
    const file = fileInput.files[0];
    const hasExistingImage = $('#modal-product-image-preview img').length > 0;

    if (!isEditing && !file && !hasExistingImage) {
        errors.push({ field: 'modal-product-image', message: '상품 이미지를 업로드해주세요.' });
        showFieldError('modal-product-image', '상품 이미지를 업로드해주세요.');
    }

    return errors;
}

// 2. 개선된 이미지 업로드
function initEnhancedImageUpload() {
    const $uploadArea = $('#image-upload-area');
    const $fileInput = $('#modal-product-image');
    const $preview = $('#modal-product-image-preview');

    // 클릭 이벤트
    $uploadArea.off('click').on('click', function() {
        $fileInput.click();
    });

    // 파일 선택 이벤트
    $fileInput.off('change').on('change', function() {
        const file = this.files[0];
        if (file) {
            handleImageFile(file);
        }
    });

    // 드래그 앤 드롭
    $uploadArea.off('dragover dragleave drop');

    $uploadArea.on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('dragover');
    });

    $uploadArea.on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
    });

    $uploadArea.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');

        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.match('image.*')) {
                $fileInput[0].files = files;
                handleImageFile(file);
            } else {
                showToast('error', '파일 형식 오류', '이미지 파일만 업로드 가능합니다.');
            }
        }
    });
}

// 이미지 파일 처리
function handleImageFile(file) {
    // 파일 크기 검증
    if (file.size > 5 * 1024 * 1024) {
        showToast('error', '파일 크기 오류', '이미지 파일 크기는 5MB 이하여야 합니다.');
        showFieldError('modal-product-image', '파일 크기는 5MB 이하여야 합니다.');
        return;
    }

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // 이미지 크기 체크
            const width = img.width;
            const height = img.height;

            let sizeWarning = '';
            if (width < 800 || height < 800) {
                sizeWarning = '<div style="color: #FF9800; margin-top: 10px; font-size: 0.85rem;"><i class="fas fa-info-circle"></i> 권장 크기(800x800px)보다 작습니다.</div>';
            }

            $('#modal-product-image-preview').html(
                `<div style="position: relative; display: inline-block;">
                    <img src="${e.target.result}" style="max-width: 400px; max-height: 400px; border-radius: 12px; border: 3px solid var(--glass-border); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);">
                    <button type="button" class="image-remove-btn" onclick="removeProductImage()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">
                        크기: ${width} × ${height}px | 용량: ${(file.size / 1024).toFixed(2)} KB
                    </div>
                    ${sizeWarning}
                </div>`
            );
            $('#image-upload-area').hide();
            clearFieldError('modal-product-image');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 이미지 제거
window.removeProductImage = function() {
    $('#modal-product-image').val('');
    $('#modal-product-image-preview').html('');
    $('#image-upload-area').show();

    // 신규 등록 시에만 필수로 표시
    const isEditing = $('#product-modal-title').data('editing-id');
    if (!isEditing) {
        showFieldError('modal-product-image', '상품 이미지를 업로드해주세요.');
    }
};

// 3. 고급 옵션 토글
function initAdvancedOptions() {
    $('#toggle-advanced').off('click').on('click', function() {
        $(this).toggleClass('active');
        $('#advanced-options-content').toggleClass('show');
    });
}

// 4. 임시 저장 기능
let draftSaveTimer = null;

function initDraftSaving() {
    // 5초마다 자동 임시 저장
    const fields = [
        '#modal-product-name',
        '#modal-product-description',
        '#modal-product-price',
        '#modal-product-category',
        '#modal-product-stock',
        '#modal-product-sale-status',
        '#modal-product-tags'
    ];

    fields.forEach(field => {
        $(field).on('input change', function() {
            clearTimeout(draftSaveTimer);
            draftSaveTimer = setTimeout(saveProductDraft, 5000);
        });
    });
}

function saveProductDraft() {
    const draft = {
        name: $('#modal-product-name').val(),
        description: $('#modal-product-description').val(),
        price: $('#modal-product-price').val(),
        category: $('#modal-product-category').val(),
        stock: $('#modal-product-stock').val(),
        saleStatus: $('#modal-product-sale-status').val(),
        tags: $('#modal-product-tags').val(),
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('product_draft', JSON.stringify(draft));

    // 임시 저장 표시
    $('#draft-indicator').fadeIn();
    $('#draft-text').text('임시 저장됨 (' + new Date().toLocaleTimeString() + ')');

    setTimeout(() => {
        $('#draft-indicator').fadeOut();
    }, 3000);
}

function clearProductDraft() {
    localStorage.removeItem('product_draft');
    $('#draft-indicator').hide();
    $('#btn-restore-draft').hide();
}

function checkAndRestoreDraft() {
    const draft = localStorage.getItem('product_draft');

    if (draft) {
        try {
            const draftData = JSON.parse(draft);
            const draftTime = new Date(draftData.timestamp);
            const now = new Date();
            const diffMinutes = (now - draftTime) / 1000 / 60;

            // 24시간 이내의 임시 저장 데이터만 표시
            if (diffMinutes < 1440) {
                $('#btn-restore-draft').show().off('click').on('click', function() {
                    restoreProductDraft(draftData);
                });
            } else {
                clearProductDraft();
            }
        } catch (error) {
            console.error('임시 저장 데이터 복원 오류:', error);
            clearProductDraft();
        }
    }
}

function restoreProductDraft(draftData) {
    if (confirm('이전에 작성하던 내용을 복원하시겠습니까?')) {
        $('#modal-product-name').val(draftData.name || '').trigger('input');
        $('#modal-product-description').val(draftData.description || '').trigger('input');
        $('#modal-product-price').val(draftData.price || '').trigger('input');
        $('#modal-product-category').val(draftData.category || '').trigger('change');
        $('#modal-product-stock').val(draftData.stock || '').trigger('input');
        $('#modal-product-sale-status').val(draftData.saleStatus || 'active');
        $('#modal-product-tags').val(draftData.tags || '');

        showToast('success', '복원 완료', '이전 작성 내용을 불러왔습니다.');
        $('#btn-restore-draft').hide();
    }
}

// 5. 키보드 단축키
function initKeyboardShortcuts() {
    $(document).off('keydown.productModal').on('keydown.productModal', function(e) {
        // 모달이 열려있을 때만 작동
        if (!$('#product-modal').hasClass('active')) return;

        // Ctrl/Cmd + S: 저장
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            $('#btn-save-product').click();
        }

        // ESC: 모달 닫기
        if (e.key === 'Escape') {
            e.preventDefault();
            confirmCloseModal('product-modal');
        }

        // Ctrl/Cmd + P: 미리보기
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            $('#btn-preview-product').click();
        }
    });

    // Enter 키로 다음 필드 이동 (textarea 제외)
    $('.form-input').not('textarea').off('keydown.nextField').on('keydown.nextField', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const $inputs = $('.form-input:visible');
            const index = $inputs.index(this);
            if (index < $inputs.length - 1) {
                $inputs.eq(index + 1).focus();
            }
        }
    });
}

// 6. 미리보기 기능
function initProductPreview() {
    $('#btn-preview-product').off('click').on('click', function() {
        const name = $('#modal-product-name').val().trim();
        const description = $('#modal-product-description').val().trim();
        const price = parseInt($('#modal-product-price').val());
        const category = $('#modal-product-category').val();
        const stock = parseInt($('#modal-product-stock').val()) || 0;
        const saleStatus = $('#modal-product-sale-status').val();

        const imageData = $('#modal-product-image-preview img').attr('src') || 'https://via.placeholder.com/400x400/302b63/ffffff?text=No+Image';

        const previewHtml = `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>상품 미리보기 - ${name || '제목 없음'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
                        background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
                        color: #fff;
                        padding: 40px 20px;
                        min-height: 100vh;
                    }
                    .preview-container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 20px;
                        padding: 40px;
                        backdrop-filter: blur(10px);
                    }
                    .preview-badge {
                        display: inline-block;
                        padding: 8px 16px;
                        background: rgba(255, 154, 158, 0.2);
                        border: 1px solid rgba(255, 154, 158, 0.3);
                        border-radius: 20px;
                        color: #ff9a9e;
                        font-size: 0.9rem;
                        font-weight: 600;
                        margin-bottom: 20px;
                    }
                    .product-image {
                        width: 100%;
                        max-width: 500px;
                        border-radius: 15px;
                        margin: 20px auto;
                        display: block;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    }
                    .product-title {
                        font-size: 2rem;
                        font-weight: 700;
                        margin: 20px 0;
                        background: linear-gradient(to right, #ff9a9e, #a18cd1);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .product-category {
                        display: inline-block;
                        padding: 6px 12px;
                        background: rgba(161, 140, 209, 0.2);
                        border-radius: 6px;
                        font-size: 0.9rem;
                        margin-bottom: 15px;
                    }
                    .product-price {
                        font-size: 2.5rem;
                        font-weight: 700;
                        color: #ff9a9e;
                        margin: 20px 0;
                    }
                    .product-stock {
                        font-size: 1.1rem;
                        margin: 10px 0;
                        padding: 10px 15px;
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 8px;
                        display: inline-block;
                    }
                    .product-description {
                        line-height: 1.8;
                        margin: 30px 0;
                        padding: 20px;
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 10px;
                        white-space: pre-wrap;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-weight: 600;
                        margin: 10px 0;
                    }
                    .status-active { background: rgba(76, 175, 80, 0.2); color: #4CAF50; }
                    .status-paused { background: rgba(255, 152, 0, 0.2); color: #FF9800; }
                    .status-soldout { background: rgba(244, 67, 54, 0.2); color: #F44336; }
                </style>
            </head>
            <body>
                <div class="preview-container">
                    <div class="preview-badge">🔍 상품 미리보기</div>

                    ${imageData ? `<img src="${imageData}" alt="${name}" class="product-image">` : ''}

                    ${category ? `<span class="product-category">${category}</span>` : ''}

                    <h1 class="product-title">${name || '상품명을 입력하세요'}</h1>

                    <div class="product-price">₩${price ? price.toLocaleString() : '0'}</div>

                    <div class="product-stock">
                        재고: <strong>${stock}개</strong>
                    </div>

                    <span class="status-badge status-${saleStatus}">
                        ${saleStatus === 'active' ? '판매중' : saleStatus === 'paused' ? '일시중지' : '품절'}
                    </span>

                    ${description ? `<div class="product-description">${description}</div>` : '<div class="product-description">상품 설명을 입력하세요</div>'}
                </div>
            </body>
            </html>
        `;

        const previewWindow = window.open('', 'ProductPreview', 'width=900,height=800');
        previewWindow.document.write(previewHtml);
        previewWindow.document.close();
    });
}

// 7. 카테고리 관리
function initCategoryManagement() {
    $('#btn-add-new-category').off('click').on('click', function() {
        const newCategory = prompt('새 카테고리 이름을 입력하세요:');

        if (newCategory && newCategory.trim()) {
            const categories = store.get('categories', ['포토카드', '의류', '음반', '액세서리', '포스터']);

            if (categories.includes(newCategory.trim())) {
                showToast('warning', '알림', '이미 존재하는 카테고리입니다.');
                return;
            }

            categories.push(newCategory.trim());
            store.set('categories', categories);

            loadCategoriesForSelect();
            $('#modal-product-category').val(newCategory.trim());

            showToast('success', '추가 완료', '새 카테고리가 추가되었습니다.');
        }
    });
}

function loadCategoriesForSelect() {
    const categories = store.get('categories', ['포토카드', '의류', '음반', '액세서리', '포스터']);
    const html = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    $('#modal-product-category').html('<option value="">카테고리를 선택하세요</option>' + html);
}

// 8. 재고-판매상태 자동 동기화
function initStockStatusSync() {
    $('#modal-product-stock').on('input', function() {
        const stock = parseInt($(this).val()) || 0;
        const $saleStatus = $('#modal-product-sale-status');

        if (stock === 0) {
            $saleStatus.val('soldout');
            $('#sale-status-info').text('재고 0 → 자동으로 품절 처리됩니다.');
        } else if ($saleStatus.val() === 'soldout' && stock > 0) {
            $saleStatus.val('active');
            $('#sale-status-info').text('재고 있음 → 판매중으로 변경되었습니다.');
        } else {
            $('#sale-status-info').text('재고에 따라 자동 조정됩니다');
        }
    });
}

// 모달 닫기 확인
window.confirmCloseModal = function(modalId) {
    const hasContent = $('#modal-product-name').val() ||
                      $('#modal-product-description').val() ||
                      $('#modal-product-price').val();

    if (hasContent) {
        if (confirm('작성 중인 내용이 있습니다. 정말 닫으시겠습니까?\n\n임시 저장된 내용은 나중에 복원할 수 있습니다.')) {
            closeModal(modalId);
        }
    } else {
        closeModal(modalId);
    }
};

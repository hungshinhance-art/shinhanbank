/* ========================================
   SHINHAN BANK STEP8.JS v2.0
   Professional Banking JavaScript
   ======================================== */

// Global Variables
let disbursementInterval;
let disbursementEndTime;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Shinhan Bank Step8 - Initializing...');
    
    // Wait for CryptoJS to load (if needed)
    setTimeout(() => {
        // Initialize all components
        initializeComponents();
        
        // Load stored data from step1 (this will load all data including loan amount)
        loadStoredData();
        
        // Initialize timeline
        initializeDisbursementTimeline();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('✅ Shinhan Bank Step8 - Initialized successfully');
    }, 100);
});

// Initialize Components
function initializeComponents() {
    // Initialize FAQ toggles
    initializeFAQ();
    
    // Initialize modals
    initializeModals();
    
    // Initialize tooltips
    initializeTooltips();
}

// Load Stored Data from Step1 (encrypted userData)
function loadStoredData() {
    try {
        // Load encrypted userData from step1
        const encryptedData = localStorage.getItem('userData');
        
        if (!encryptedData) {
            console.warn('⚠️ No userData found in localStorage');
            // Ẩn tất cả các trường thông tin
            hideAllInfoFields();
            return;
        }
        
        let userData;
        
        // Try to decrypt data
        try {
            // Import CryptoJS if not already loaded
            if (typeof CryptoJS === 'undefined') {
                console.warn('⚠️ CryptoJS not loaded, trying to parse as plain JSON');
                userData = JSON.parse(encryptedData);
            } else {
                const decryptedData = CryptoJS.AES.decrypt(encryptedData, 'shinhan-secret-key').toString(CryptoJS.enc.Utf8);
                userData = JSON.parse(decryptedData);
            }
        } catch (decryptError) {
            console.warn('⚠️ Decryption failed, trying plain JSON:', decryptError);
            try {
                userData = JSON.parse(encryptedData);
            } catch (jsonError) {
                console.error('❌ Failed to parse userData:', jsonError);
                return;
            }
        }
        
        console.log('✅ userData loaded:', userData);
        console.log('📊 Data fields:', {
            fullName: userData.fullName,
            loanAmount: userData.loanAmount,
            monthlyPayment: userData.monthlyPayment
        });
        
        // Update customer name - CHỈ cập nhật nếu có dữ liệu thực
        if (userData.fullName && userData.fullName.trim() !== '') {
            console.log('👤 Setting customer name from localStorage:', userData.fullName);
            updateElement('customerName', userData.fullName);
        } else {
            console.warn('⚠️ No valid fullName in userData - hiding field');
            hideElement('customerName');
        }
        
        // Update loan amount - CHỈ cập nhật nếu có dữ liệu thực
        if (userData.loanAmount && userData.loanAmount !== '' && !isNaN(parseInt(userData.loanAmount))) {
            const loanAmount = parseInt(userData.loanAmount);
            const formattedAmount = loanAmount.toLocaleString('vi-VN') + ' đ';
            console.log('💰 Setting loan amount from localStorage:', formattedAmount);
            updateElement('loanAmountValue', formattedAmount);
            updateElement('modalLoanAmount', formattedAmount);
            updateElement('modalLoanAmount2', formattedAmount);
            
            // Update required amount (10% of loan)
            const requiredAmount = Math.round(loanAmount * 0.1);
            const formattedRequired = requiredAmount.toLocaleString('vi-VN') + ' đ';
            console.log('💳 Setting required amount (10%):', formattedRequired);
            updateElement('requiredAmount', formattedRequired);
        } else {
            console.warn('⚠️ No valid loanAmount in userData - hiding field');
            hideElement('loanAmountValue');
        }
        
        // Update monthly payment - Tính toán lại để đảm bảo chính xác
        if (userData.loanAmount && userData.loanTerm && userData.interestRate) {
            const loanAmount = parseInt(userData.loanAmount);
            const loanTerm = parseInt(userData.loanTerm);
            const interestRate = parseFloat(userData.interestRate);
            
            if (loanAmount > 0 && loanTerm > 0 && interestRate > 0) {
                // Tính toán lại monthly payment theo công thức chính xác
                const monthlyRate = interestRate / 100 / 12;
                const monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))) / 
                                    (Math.pow(1 + monthlyRate, loanTerm) - 1);
                const roundedPayment = Math.floor(monthlyPayment);
                const formattedPayment = roundedPayment.toLocaleString('vi-VN') + ' đ';
                
                console.log('💵 Calculating monthly payment:', {
                    loanAmount: loanAmount,
                    loanTerm: loanTerm,
                    interestRate: interestRate,
                    monthlyRate: monthlyRate,
                    calculatedPayment: roundedPayment
                });
                
                updateElement('monthlyPaymentAmount', formattedPayment);
            } else {
                console.warn('⚠️ Invalid loan parameters for monthly payment calculation');
                hideElement('monthlyPaymentAmount');
            }
        } else if (userData.monthlyPayment && userData.monthlyPayment > 0) {
            // Fallback: sử dụng giá trị đã lưu nếu không có đủ thông tin để tính toán
            const monthlyPayment = Math.floor(userData.monthlyPayment);
            const formattedPayment = monthlyPayment.toLocaleString('vi-VN') + ' đ';
            console.log('💵 Using stored monthly payment:', formattedPayment);
            updateElement('monthlyPaymentAmount', formattedPayment);
        } else {
            console.warn('⚠️ No valid monthlyPayment data - hiding field');
            hideElement('monthlyPaymentAmount');
        }
        
        // Calculate and update payment date (first payment is 30 days from now)
        const today = new Date();
        const paymentDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        const formattedPaymentDate = paymentDate.toLocaleDateString('vi-VN');
        console.log('📅 Setting payment date:', formattedPaymentDate);
        updateElement('paymentDate', formattedPaymentDate);
        
        console.log('✅ All stored data loaded successfully from step1');
    } catch (error) {
        console.error('❌ Error loading stored data:', error);
        showError('Không thể tải dữ liệu đã lưu');
    }
}


// Initialize Disbursement Timeline
function initializeDisbursementTimeline() {
    try {
        // Check if timeline already exists
        const existingEndTime = localStorage.getItem('disbursementEndTime');
        
        if (existingEndTime) {
            disbursementEndTime = parseInt(existingEndTime);
        } else {
            // Set 24 hours from now
            disbursementEndTime = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem('disbursementEndTime', disbursementEndTime.toString());
        }
        
        // Start timeline and countdown
        updateTimeline();
        updateCountdown();
        
        // Update every second for accurate countdown
        disbursementInterval = setInterval(() => {
            updateTimeline();
            updateCountdown();
        }, 1000);
        
        console.log('⏰ Disbursement timeline initialized - 24 hours countdown started');
    } catch (error) {
        console.error('❌ Error initializing timeline:', error);
        showError('Không thể khởi tạo timeline');
    }
}

// Update Timeline Progress Bar
function updateTimeline() {
    try {
        const now = Date.now();
        const totalDuration = 24 * 60 * 60 * 1000; // 24 hours
        const elapsed = now - (disbursementEndTime - totalDuration);
        
        // Progress from 25% to 100% over 24 hours
        const timeProgress = Math.min((elapsed / totalDuration) * 100, 100);
        const displayProgress = 25 + (timeProgress * 0.75); // Start at 25%, max 100%
        
        const progressBar = document.getElementById('timelineProgress');
        if (progressBar) {
            progressBar.style.width = displayProgress + '%';
            
            // Change color based on remaining time
            if (timeProgress >= 100) {
                // Hết hạn - Đỏ
                progressBar.style.background = 'linear-gradient(90deg, #DC3545 0%, #C82333 100%)';
            } else if (timeProgress >= 90) {
                // < 10% còn lại - Vàng
                progressBar.style.background = 'linear-gradient(90deg, #FFC107 0%, #E0A800 100%)';
            } else {
                // Bình thường - Xanh
                progressBar.style.background = 'linear-gradient(90deg, #0088FF 0%, #0068CC 100%)';
            }
        }
    } catch (error) {
        console.error('❌ Error updating timeline:', error);
    }
}

// Update Countdown Timer (HH:MM:SS)
function updateCountdown() {
    try {
        const now = Date.now();
        const remaining = disbursementEndTime - now;
        
        const countdownTimer = document.getElementById('countdownTimer');
        
        if (!countdownTimer) return;
        
        if (remaining <= 0) {
            // Hết hạn
            countdownTimer.textContent = '00:00:00';
            countdownTimer.classList.add('danger');
            countdownTimer.classList.remove('warning');
            return;
        }
        
        // Calculate hours, minutes, seconds
        const totalSeconds = Math.floor(remaining / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        // Format as HH:MM:SS
        const formattedTime = 
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
        
        countdownTimer.textContent = formattedTime;
        
        // Update timer style based on remaining time
        const hoursRemaining = remaining / (60 * 60 * 1000);
        
        countdownTimer.classList.remove('warning', 'danger');
        
        if (hoursRemaining < 1) {
            // < 1 giờ - Đỏ nhấp nháy
            countdownTimer.classList.add('danger');
        } else if (hoursRemaining < 3) {
            // < 3 giờ - Vàng nhấp nháy
            countdownTimer.classList.add('warning');
        }
        
    } catch (error) {
        console.error('❌ Error updating countdown:', error);
    }
}

// Required amount is now calculated in loadStoredData()

// Setup Event Listeners
function setupEventListeners() {
    try {
        // Zalo button - now it's a direct link, just track the click
        const openZaloDirectBtn = document.getElementById('openZaloDirectBtn');
        
        if (openZaloDirectBtn) {
            openZaloDirectBtn.addEventListener('click', function(e) {
                // Track the click event
                trackEvent('zalo_button_clicked', {
                    url: 'https://zalo.me/3932037504673339016',
                    timestamp: new Date().toISOString()
                });
                
                console.log('📱 Zalo button clicked - redirecting to Zalo OA');
            });
        }
        
        // Modal buttons (if needed for other features)
        const modalCancelBtn = document.getElementById('modalCancelBtn');
        const modalConfirmBtn = document.getElementById('modalConfirmBtn');
        const modalClose = document.querySelector('.modal-close');
        const modalOverlay = document.querySelector('.modal-overlay');
        
        if (modalCancelBtn) {
            modalCancelBtn.addEventListener('click', closeConfirmationModal);
        }
        
        if (modalConfirmBtn) {
            modalConfirmBtn.addEventListener('click', closeConfirmationModal);
        }
        
        if (modalClose) {
            modalClose.addEventListener('click', closeConfirmationModal);
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeConfirmationModal);
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);
        
        console.log('🎯 Event listeners setup successfully');
    } catch (error) {
        console.error('❌ Error setting up event listeners:', error);
    }
}

// Initialize FAQ
function initializeFAQ() {
    try {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => toggleFAQ(question));
        });
        
        console.log('❓ FAQ initialized');
    } catch (error) {
        console.error('❌ Error initializing FAQ:', error);
    }
}

// Toggle FAQ
function toggleFAQ(button) {
    try {
        const answer = button.parentElement.querySelector('.faq-answer');
        const isActive = button.getAttribute('aria-expanded') === 'true';
        
        // Close all other FAQs
        document.querySelectorAll('.faq-question').forEach(q => {
            q.setAttribute('aria-expanded', 'false');
            q.parentElement.querySelector('.faq-answer').classList.remove('show');
        });
        
        // Toggle current FAQ
        if (!isActive) {
            button.setAttribute('aria-expanded', 'true');
            answer.classList.add('show');
        }
        
        console.log('📖 FAQ toggled');
    } catch (error) {
        console.error('❌ Error toggling FAQ:', error);
    }
}

// Initialize Modals
function initializeModals() {
    try {
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            // Modal is already initialized in HTML
            console.log('🪟 Modal initialized');
        }
    } catch (error) {
        console.error('❌ Error initializing modals:', error);
    }
}

// Initialize Tooltips
function initializeTooltips() {
    try {
        // Add tooltip functionality if needed
        console.log('💡 Tooltips initialized');
    } catch (error) {
        console.error('❌ Error initializing tooltips:', error);
    }
}

// Zalo link is now handled directly in HTML

// Modal Functions
function showConfirmationModal() {
    try {
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
        }
    } catch (error) {
        console.error('❌ Error showing confirmation modal:', error);
    }
}

function closeConfirmationModal() {
    try {
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        }
    } catch (error) {
        console.error('❌ Error closing confirmation modal:', error);
    }
}

function showZaloGuidance() {
    try {
        const guidance = document.getElementById('zaloGuidance');
        if (guidance) {
            guidance.style.display = 'block';
            setTimeout(() => closeZaloGuidance(), 15000);
        }
    } catch (error) {
        console.error('❌ Error showing Zalo guidance:', error);
    }
}

function closeZaloGuidance() {
    try {
        const guidance = document.getElementById('zaloGuidance');
        if (guidance) {
            guidance.style.display = 'none';
        }
    } catch (error) {
        console.error('❌ Error closing Zalo guidance:', error);
    }
}

// Handle Keyboard Navigation
function handleKeyboardNavigation(event) {
    try {
        // ESC key closes modals
        if (event.key === 'Escape') {
            closeConfirmationModal();
            closeZaloGuidance();
        }
        
        // Enter key activates focused elements
        if (event.key === 'Enter') {
            const focused = document.activeElement;
            if (focused && focused.classList.contains('faq-question')) {
                focused.click();
            }
        }
    } catch (error) {
        console.error('❌ Error handling keyboard navigation:', error);
    }
}

// Update Element
function updateElement(id, value) {
    try {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    } catch (error) {
        console.error('❌ Error updating element:', error);
    }
}

// Hide Element
function hideElement(id) {
    try {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    } catch (error) {
        console.error('❌ Error hiding element:', error);
    }
}

// Hide All Info Fields
function hideAllInfoFields() {
    hideElement('customerName');
    hideElement('loanAmountValue');
    hideElement('monthlyPaymentAmount');
    hideElement('paymentDate');
}

// Show Error
function showError(message) {
    try {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #DC3545;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            font-size: 14px;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    } catch (error) {
        console.error('❌ Error showing error message:', error);
    }
}

// Analytics Tracking
function trackEvent(eventName, eventData = {}) {
    try {
        // Track user interactions
        console.log('📊 Event tracked:', eventName, eventData);
        
        // You can integrate with Google Analytics or other tracking services here
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }
    } catch (error) {
        console.error('❌ Error tracking event:', error);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    try {
        if (disbursementInterval) {
            clearInterval(disbursementInterval);
        }
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('❌ Global error:', event.error);
    showError('Đã xảy ra lỗi không mong muốn');
});

// Copy Zalo ID to clipboard
function copyZaloId() {
    try {
        const zaloId = document.getElementById('zaloOAId');
        const text = zaloId.textContent;
        
        // Modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showCopySuccess();
                trackEvent('zalo_id_copied', { text });
            }).catch((err) => {
                console.error('❌ Clipboard API failed:', err);
                fallbackCopy(text);
            });
        } else {
            // Fallback for older browsers
            fallbackCopy(text);
        }
    } catch (error) {
        console.error('❌ Error copying Zalo ID:', error);
        showError('Không thể copy. Vui lòng copy thủ công.');
    }
}

// Fallback copy method
function fallbackCopy(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            showCopySuccess();
        } else {
            showError('Không thể copy. Vui lòng copy thủ công.');
        }
    } catch (error) {
        console.error('❌ Fallback copy failed:', error);
        showError('Không thể copy. Vui lòng copy thủ công.');
    }
}

// Show copy success notification
function showCopySuccess() {
    try {
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28A745 0%, #20C997 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = '<i class="fas fa-check-circle"></i> Đã copy OA ID!';
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    } catch (error) {
        console.error('❌ Error showing copy success:', error);
    }
}

// Make functions globally available
window.closeZaloGuidance = closeZaloGuidance;
window.toggleFAQ = toggleFAQ;

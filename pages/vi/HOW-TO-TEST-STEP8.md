# 🧪 Hướng dẫn Test Step8.html

## 📋 Checklist Kiểm tra

### ✅ Các trường phải hiển thị ĐÚNG:

| Field | ID trong HTML | Nguồn từ Step1 | Vị trí |
|-------|---------------|----------------|--------|
| **Họ và tên** | `customerName` | `userData.fullName` | Customer Info card |
| **Số tiền vay** | `loanAmountValue` | `userData.loanAmount` | Header (top) |
| **Trả hàng tháng** | `monthlyPaymentAmount` | `userData.monthlyPayment` | Customer Info card |
| **Ngày góp** | `paymentDate` | Calculated (today + 30 days) | Customer Info card |
| **Số dư cần thiết** | `requiredAmount` | `loanAmount × 10%` | Notice section |

---

## 🔍 Cách 1: Debug Script (Khuyên dùng!)

### Step 1: Mở Debug Tool
```
File: /shinhanbank/pages/vi/DEBUG-STEP8.html
```

### Step 2: Click "Kiểm tra userData"
Xem kết quả:
- ✅ Xanh = Có dữ liệu
- ❌ Đỏ = Thiếu dữ liệu

### Step 3: Nếu thiếu dữ liệu
Click "Fix & Reload" để tạo dữ liệu mẫu

### Step 4: Mở Step8
Click "Mở Step8" để xem kết quả

---

## 🧪 Cách 2: Test với Browser Console

### Step 1: Mở Step8
```
File: /shinhanbank/pages/vi/step8.html
```

### Step 2: Mở Console (F12)

### Step 3: Chạy lệnh kiểm tra
```javascript
// 1. Check if userData exists
const encrypted = localStorage.getItem('userData');
console.log('Has userData:', !!encrypted);

// 2. Decrypt and show
if (encrypted && typeof CryptoJS !== 'undefined') {
    const decrypted = CryptoJS.AES.decrypt(encrypted, 'shinhan-secret-key').toString(CryptoJS.enc.Utf8);
    const userData = JSON.parse(decrypted);
    console.log('userData:', userData);
    console.log('Name:', userData.fullName);
    console.log('Loan:', userData.loanAmount);
    console.log('Monthly:', userData.monthlyPayment);
}

// 3. Check element values
console.log('Display Name:', document.getElementById('customerName').textContent);
console.log('Display Loan:', document.getElementById('loanAmountValue').textContent);
console.log('Display Monthly:', document.getElementById('monthlyPaymentAmount').textContent);
```

### Step 4: Xem Console Output
Tìm các dòng:
```
✅ userData loaded: {fullName: "...", loanAmount: "..."}
👤 Setting customer name: ...
💰 Setting loan amount: ...
💵 Setting monthly payment: ...
```

---

## 🔧 Cách 3: Test Flow Step1 → Step8

### Step 1: Điền form Step1
```
1. Mở: /shinhanbank/pages/vi/step1.html
2. Điền form với thông tin:
   - Họ tên: Nguyễn Văn Test
   - Số tiền vay: 50.000.000 đ
   - Kỳ hạn: 12 tháng
3. Click "Tính toán khoản vay"
4. Check "Tôi đồng ý"
5. Click "Tiếp tục"
```

### Step 2: Kiểm tra localStorage
```
F12 → Console → Gõ:
localStorage.getItem('userData')
```

Phải thấy chuỗi encrypted dài!

### Step 3: Mở Step8 trực tiếp
```
File: /shinhanbank/pages/vi/step8.html
```

### Step 4: Verify data
Kiểm tra:
- [ ] Họ tên = "Nguyễn Văn Test" (không phải "Nguyễn Văn A")
- [ ] Số tiền = "50.000.000 đ" (không phải "30.000.000 đ")
- [ ] Trả hàng tháng = số tính từ step1
- [ ] Số dư cần thiết = 5.000.000 đ (10% của 50tr)

---

## ❌ Troubleshooting

### Problem 1: Hiển thị "Nguyễn Văn A" (default)
**Nguyên nhân:**
- userData chưa tồn tại trong localStorage
- Hoặc decrypt failed

**Giải pháp:**
```bash
1. Mở: /shinhanbank/pages/vi/DEBUG-STEP8.html
2. Click: "Fix & Reload"
3. Click: "Mở Step8"
4. ✓ Phải thấy "Nguyễn Văn Test"
```

### Problem 2: Console báo lỗi CryptoJS
**Nguyên nhân:**
- CryptoJS chưa load xong

**Giải pháp:**
- Đã fix: Thêm setTimeout(100ms) trong script.js
- Reload page

### Problem 3: Số tiền vay = "30.000.000 đ" (default)
**Nguyên nhân:**
- userData.loanAmount không có hoặc sai format

**Giải pháp:**
```javascript
// F12 Console
const encrypted = localStorage.getItem('userData');
const decrypted = CryptoJS.AES.decrypt(encrypted, 'shinhan-secret-key').toString(CryptoJS.enc.Utf8);
const userData = JSON.parse(decrypted);
console.log('loanAmount:', userData.loanAmount);
// Phải là string số: "50000000"
```

---

## 🎯 Expected Results

### Khi có dữ liệu ĐÚNG từ Step1:

```
┌─────────────────────────────────────┐
│ 💰 50.000.000 đ                     │ ← Từ step1
├─────────────────────────────────────┤
│ 👤 Nguyễn Văn Test                  │ ← Từ step1
│ 💵 4.441 đ / tháng                  │ ← Tính từ step1
│ 📅 15/11/2025                       │ ← Tính (today + 30)
├─────────────────────────────────────┤
│ Cần số dư: 5.000.000 đ (10%)        │ ← Tính (50tr × 10%)
└─────────────────────────────────────┘
```

### Khi KHÔNG có dữ liệu (default):

```
┌─────────────────────────────────────┐
│ 💰 30.000.000 đ                     │ ← Default
├─────────────────────────────────────┤
│ 👤 Nguyễn Văn A                     │ ← Default
│ 💵 2.500.000 đ / tháng              │ ← Default
│ 📅 15/11/2025                       │ ← Calculated
├─────────────────────────────────────┤
│ Cần số dư: 3.000.000 đ (10%)        │ ← Default
└─────────────────────────────────────┘
```

---

## 📊 Console Logs mong đợi

### Khi THÀNH CÔNG:
```
🚀 Shinhan Bank Step8 - Initializing...
✅ userData loaded: {fullName: "Nguyễn Văn Test", ...}
📊 Data fields: {fullName: "Nguyễn Văn Test", loanAmount: "50000000", ...}
👤 Setting customer name: Nguyễn Văn Test
💰 Setting loan amount: 50.000.000 đ
💳 Setting required amount (10%): 5.000.000 đ
💵 Setting monthly payment: 4.441 đ
📅 Setting payment date: 15/11/2025
✅ All stored data loaded successfully from step1
✅ Shinhan Bank Step8 - Initialized successfully
```

### Khi THẤT BẠI:
```
🚀 Shinhan Bank Step8 - Initializing...
⚠️ No userData found in localStorage
❌ Error loading stored data: ...
```

---

## 🚀 Quick Test Scripts

### Test 1: Check if data exists
```javascript
localStorage.getItem('userData') ? '✅ Có data' : '❌ Không có'
```

### Test 2: Show decrypted data
```javascript
const enc = localStorage.getItem('userData');
if (enc) {
    const dec = CryptoJS.AES.decrypt(enc, 'shinhan-secret-key').toString(CryptoJS.enc.Utf8);
    console.log(JSON.parse(dec));
}
```

### Test 3: Manual set element
```javascript
document.getElementById('customerName').textContent = 'TEST NAME';
document.getElementById('loanAmountValue').textContent = '100.000.000 đ';
```

---

## 📁 Files for Testing

1. **DEBUG-STEP8.html** - Debug tool chính
2. **test-step8-data.html** - Test data flow
3. **DEMO-STEP8.html** - Visual demo
4. **step8.html** - Live page

---

## ✅ Success Criteria

- [ ] Họ tên hiển thị ĐÚNG (không phải default)
- [ ] Số tiền vay hiển thị ĐÚNG (không phải default)
- [ ] Số tiền trả hàng tháng ĐÚNG
- [ ] Số dư cần thiết = 10% số tiền vay
- [ ] Countdown timer chạy (23:59:59 → đếm ngược)
- [ ] Progress bar bắt đầu 25%
- [ ] Console không có errors

---

## 🆘 Cần Help?

**Gửi screenshot console logs:**
1. F12 → Console tab
2. Screenshot toàn bộ logs
3. Tìm dòng có ❌ hoặc ⚠️

**Hoặc share localStorage data:**
```javascript
// F12 Console
localStorage.getItem('userData')
```

---

**Happy Testing! 🎉**



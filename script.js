/* --- DATA & STATE --- */
const PRODUCTS = [
    {id:1, title:'Tạ tay 10kg', price:450000, category:'accessory', img:'Cục tạ.jpg'},
    {id:2, title:'Thảm Yoga TPE', price:220000, category:'accessory', img:'Thảm yoga.jpg'},
    {id:3, title:'Găng tay Gym', price:120000, category:'accessory', img:'găng tay.jpg'},
    {id:4, title:'Whey Protein 1kg', price:750000, category:'supplement', img:'Protein 1kg.jpg'},
    {id:5, title:'BCAA Energy', price:420000, category:'supplement', img:'Bcaa energy.jpg'},
    {id:6, title:'Áo Thun Thể Thao', price:199000, category:'clothing', img:'áo thun thể thao.jpg'},
    {id:7, title:'Quần Short Tập', price:239000, category:'clothing', img:'quần short.jpg'},
    {id:8, title:'Dây nhảy tốc độ', price:99000, category:'accessory', img:'dây nhảy tốc độ.jpg'},
];

// Khởi tạo các biến từ LocalStorage
let cart = JSON.parse(localStorage.getItem('my_fitness_cart')) || [];
let caloEntries = JSON.parse(localStorage.getItem('my_fitness_calo')) || [];

/* --- NAVIGATION --- */
function showPage(pageId) {
    // Ẩn tất cả section
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    // Bỏ active class ở nav
    document.querySelectorAll('nav a').forEach(el => el.classList.remove('active'));
    
    // Hiện section được chọn
    document.getElementById(pageId).classList.add('active');
    document.getElementById('nav-' + pageId).classList.add('active');
    
    // Scroll lên đầu
    window.scrollTo(0, 0);

    // Render lại dữ liệu nếu cần
    if(pageId === 'cart') renderCart();
    if(pageId === 'calories') initCaloChart();
}

/* --- SHOP FUNCTIONS --- */
function formatVND(n) {
    return n.toLocaleString('vi-VN') + 'đ';
}

function renderShop(category) {
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';
    
    const filtered = category === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === category);
    
    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.img}" alt="${p.title}">
            <h3>${p.title}</h3>
            <p class="price">${formatVND(p.price)}</p>
            <button class="btn" onclick="addToCart(${p.id})"><i class="fa fa-cart-plus"></i> Thêm vào giỏ</button>
        `;
        grid.appendChild(card);
    });
}

function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);
    const existingItem = cart.find(i => i.id === id);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    saveCart();
    alert(`Đã thêm "${product.title}" vào giỏ hàng!`); 
}

/* --- CART FUNCTIONS --- */
function saveCart() {
    localStorage.setItem('my_fitness_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cartCount').textContent = count;
}

function renderCart() {
    const container = document.getElementById('cartContainer');
    const summary = document.getElementById('cartSummary');
    const emptyMsg = document.getElementById('emptyCartMessage');
    
    container.innerHTML = '';

    if (cart.length === 0) {
        container.style.display = 'none';
        summary.style.display = 'none';
        emptyMsg.style.display = 'block';
        return;
    }

    container.style.display = 'block';
    emptyMsg.style.display = 'none';
    summary.style.display = 'block';

    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.title}">
            <div class="cart-details">
                <h4>${item.title}</h4>
                <p>${formatVND(item.price)}</p>
            </div>
            <div class="cart-actions">
                <button class="btn btn-outline" onclick="changeQty(${item.id}, -1)">-</button>
                <input type="text" value="${item.qty}" readonly>
                <button class="btn btn-outline" onclick="changeQty(${item.id}, 1)">+</button>
                <button class="btn btn-danger" onclick="removeItem(${item.id})" style="margin-left:10px;"><i class="fa fa-trash"></i></button>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('cartTotal').textContent = formatVND(total);
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeItem(id);
            return;
        }
        saveCart();
        renderCart();
    }
}

function removeItem(id) {
    if(confirm('Bạn có chắc muốn xóa sản phẩm này?')) { 
        cart = cart.filter(i => i.id !== id);
        saveCart();
        renderCart();
    }
}

function checkout() {
    alert('Cảm ơn bạn đã mua hàng! Đơn hàng đang được xử lý.'); 
    cart = [];
    saveCart();
    renderCart();
}

/* --- CALORIES FUNCTIONS --- */
let myChart;

function saveCalo() {
    localStorage.setItem('my_fitness_calo', JSON.stringify(caloEntries));
    renderCaloChart();
}

function addCaloEntry() {
    const dateInput = document.getElementById('caloDate');
    const valInput = document.getElementById('caloValue');
    
    const date = dateInput.value;
    const val = Number(valInput.value);

    if (!date || val <= 0) {
        alert('Vui lòng nhập ngày và số Calo hợp lệ!');
        return;
    }

    // Kiểm tra xem ngày đó đã có chưa, nếu có thì cộng dồn
    const existingEntry = caloEntries.find(e => e.date === date);
    if (existingEntry) {
        existingEntry.calo += val;
    } else {
        caloEntries.push({ date: date, calo: val });
    }
    
    // Sắp xếp theo ngày
    caloEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    saveCalo();
    valInput.value = '';
    alert('Đã cập nhật Calo!');
}

function clearCaloData() {
    if(confirm('Xóa toàn bộ dữ liệu Calo?')) {
        caloEntries = [];
        saveCalo();
    }
}

function initCaloChart() {
    // Set default date là hôm nay
    if (!document.getElementById('caloDate').value) {
        document.getElementById('caloDate').valueAsDate = new Date();
    }
    renderCaloChart();
}

function renderCaloChart() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = caloEntries.find(e => e.date === today);
    document.getElementById('todayTotal').textContent = todayEntry ? todayEntry.calo : 0;

    // Lấy 7 ngày gần nhất để vẽ biểu đồ
    const labels = caloEntries.slice(-7).map(e => e.date);
    const data = caloEntries.slice(-7).map(e => e.calo);

    const ctx = document.getElementById('caloChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calo tiêu thụ (kcal)',
                data: data,
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

/* --- INIT --- */
(function init() {
    renderShop('all');
    updateCartCount();
    
    // Nếu URL có hash (vd #shop), mở trang đó
    const hash = window.location.hash.replace('#', '');
    if (hash && ['home','shop','video','calories','cart'].includes(hash)) {
        showPage(hash);
    }
})();
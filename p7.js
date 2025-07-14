
function NSX() {
    document.getElementById("NSXTab").style.display = "block"
    document.getElementById("SPTab").style.display = "none"
    document.getElementById("PCTab").style.display = "none"
    document.getElementById("LaptopTab").style.display = "none"
}
function SP() {
    document.getElementById("NSXTab").style.display = "none"
    document.getElementById("SPTab").style.display = "block"
    document.getElementById("PCTab").style.display = "none"
    document.getElementById("LaptopTab").style.display = "none"
}
function PC() {
    document.getElementById("NSXTab").style.display = "none"
    document.getElementById("SPTab").style.display = "none"
    document.getElementById("PCTab").style.display = "block"
    document.getElementById("LaptopTab").style.display = "none"
}
function Laptop() {
    document.getElementById("NSXTab").style.display = "none"
    document.getElementById("SPTab").style.display = "none"
    document.getElementById("PCTab").style.display = "none"
    document.getElementById("LaptopTab").style.display = "block"
}
function OpenAddNSX(){
    document.getElementById("nsx-form").style.display = "block"
}
function CloseAddNSX(){
    document.getElementById("nsx-form").style.display = "none"
}
function OpenAddSP(){
    document.getElementById("sp-form").style.display = "block"
}
function CloseAddSP(){
    document.getElementById("sp-form").style.display = "none"
}
function OpenAddPC(){
    document.getElementById("pc-form").style.display = "block"
}
function CloseAddPC(){
    document.getElementById("pc-form").style.display = "none"
}
function OpenAddLaptop(){
    document.getElementById("laptop-form").style.display = "block"
}
function CloseAddLaptop(){
    document.getElementById("laptop-form").style.display = "none"
}
document.addEventListener("click", function (event) {
    let trashButton = event.target.closest(".fa-trash");
    if (trashButton && trashButton.dataset.table) {
        let table = trashButton.dataset.table;
        table = table.replace(/Table$/, '');
        let row = trashButton.closest("tr");
        let id;
        if (confirm(`Bạn có muốn xóa phần tử này trong ${table}?`)) {
            if (table === "SP") id = row.cells[1].textContent.trim();
            else id = row.cells[0].textContent.trim();
            alert(table, id)
            deleteItem(table, id);
        }
    }
});
async function deleteItem(table, id) {

    let response = await fetch(`http://localhost:4000/${table}/${id}`, { method: "delete" });
    let result = await response.json();
    console.log(response);
    console.log(result);
    alert(result.message);
    location.reload();
}

// Thêm sự kiện click cho nút edit
document.addEventListener("click", function (event) {
    let editButton = event.target.closest(".fa-edit");
    if (editButton && editButton.dataset.table) {
        let table = editButton.dataset.table;
        let row = editButton.closest("tr");

        // Lấy ID từ cột đầu tiên
        let id = row.cells[0].textContent.trim();

        // Mở form chỉnh sửa (bạn cần tạo form này)
        openEditForm(table, id, row);
    }
});

function openEditForm(table, id, row) {
    let data = {};
    
    let columnMap = {};
    
    switch(table) {
        case 'NSX':
            columnMap = {
                'Mã NSX': 'MaNSX',
                'Tên NSX': 'TenNSX',
                'Địa chỉ': 'DiaChi',
            };
            fieldTypes = {
                'MaNSX': 'text',
                'TenNSX': 'text',
                'DiaChi': 'text',
            };
            break;
        case 'SP':
            columnMap = {
                'Mã NSX': 'MaNSX',
                'Mã SP': 'MaSP',
                'Category': 'Loai',
            };
            fieldTypes = {
                'MaNSX': 'text',
                'MaSP': 'text',
                'Loai': 'text',
            };
            break;
        case 'PC':
            columnMap = {
                'Mã SP-P': 'MaSP',
                'CPU': 'CPU',
                'RAM': 'RAM',
                'HD': 'HD',
                'Price':'gia'
            };
            fieldTypes = {
                'MaSP': 'text',
                'CPU': 'text',
                'RAM': 'text',
                'HD': 'text',
                'gia': 'number'
            };
            break;
        case 'Laptop':
            columnMap = {
                'Mã SP-L': 'MaSP',
                'CPU': 'CPU',
                'RAM': 'RAM',
                'HD': 'HD',
                'Screen':'ManHinh',
                'Price':'gia'
            };
            fieldTypes = {
                'MaSP': 'text',
                'CPU': 'text',
                'RAM': 'text',
                'HD': 'text',
                'ManHinh': 'text',
                'gia': 'number'
            };
            break;
        default:
            // Tạo mapping mặc định từ các tiêu đề cột
            const headers = Array.from(document.querySelectorAll(`#${table} thead th`));
            headers.forEach(header => {
                if (!header.classList.contains('action-column')) {
                    const text = header.textContent.trim();
                    columnMap[text] = text;
                }
            });
            break;
    }
    
     // Get headers from the table
     const headers = Array.from(document.querySelectorAll('table thead th'));
     const dataHeaders = headers.filter(th => !th.classList.contains('action-column')).map(th => th.textContent.trim());
     
     // Get data cells, skipping action columns
     const dataCells = Array.from(row.cells).slice(0, dataHeaders.length);
     
     // Create data object with correct database column names
     for (let i = 0; i < dataCells.length; i++) {
         if (dataHeaders[i]) {
             // Use the mapped column name if available, otherwise use the header text
             const columnName = columnMap[dataHeaders[i]] || dataHeaders[i];
             data[columnName] = dataCells[i].textContent.trim();
         }
     }
     
     let formHTML = `
     <div id="editForm" class="edit-form">
         <h3>Cập nhật dữ liệu ${table}</h3>
         <form id="updateForm">
     `;
     
     // Create input fields based on data and field types
     for (const displayName in columnMap) {
         const dbColumnName = columnMap[displayName];
         // Don't allow editing primary key
         if (dbColumnName !== primaryKeyMap[table.replace(/Table$/, '')]) {
             const value = data[dbColumnName] || '';
             const inputType = fieldTypes[dbColumnName] || 'text';
             
             // Đối với trường số, đảm bảo là số hợp lệ và sử dụng input type="number"
             if (inputType === 'number') {
                 const numValue = parseFloat(value.replace(/[^\d.-]/g, '')) || 0; // Chuyển đổi thành số, loại bỏ các ký tự không phải số
                 
                 formHTML += `
                 <div class="form-group">
                     <label for="${dbColumnName}">${displayName}:</label>
                     <input type="number" id="${dbColumnName}" name="${dbColumnName}" value="${numValue}" step="1" min="0">
                 </div>
                 `;
             } else {
                 formHTML += `
                 <div class="form-group">
                     <label for="${dbColumnName}">${displayName}:</label>
                     <input type="${inputType}" id="${dbColumnName}" name="${dbColumnName}" value="${value}">
                 </div>
                 `;
             }
         }
     }
     
     formHTML += `
         <button type="button" onclick="updateItem('${table}', '${id}')">Cập nhật</button>
         <button type="button" onclick="closeEditForm()">Hủy</button>
     </form>
     </div>
     `;
     
     // Add form to page
     const formContainer = document.createElement('div');
     formContainer.innerHTML = formHTML;
     document.body.appendChild(formContainer);
}

// Function to close form
function closeEditForm() {
    const form = document.getElementById('editForm');
    if (form) {
        form.parentNode.removeChild(form);
    }
}

async function updateItem(table, id) {
    try {
        // Collect data from form
        const form = document.getElementById('updateForm');
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        console.log("Dữ liệu gửi đi:", data); // Debug
        console.log("URL request:", `http://localhost:4000/${table}/${id}`); // Debug
        
        // Call API to update
        const response = await fetch(`http://localhost:4000/${table}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        // Check detailed response
        console.log("Status:", response.status);
        const result = await response.json();
        console.log("Response:", result);
        
        if (response.ok) {
            alert(result.message);
            closeEditForm();
            location.reload();
        } else {
            alert(`Lỗi: ${result.error || 'Lỗi không xác định'}`);
        }
    } catch (err) {
        console.error('Lỗi khi cập nhật:', err);
        alert('Đã xảy ra lỗi khi cập nhật dữ liệu');
    }
}

// Define primaryKeyMap just like in backend
const primaryKeyMap = {
    'NSX': 'MaNSX',
    'SP': 'MaSP',
    'PC': 'MaSP',
    'Laptop': 'MaSP'
};

document.addEventListener('DOMContentLoaded', function () {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const formContents = document.querySelectorAll('.form-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');

            // Hide all form contents
            formContents.forEach(content => {
                content.classList.remove('active');
            });

            // Show the selected form content
            const activeForm = document.getElementById(`${tabName}-form`);
            if (activeForm) {
                activeForm.classList.add('active');
            }

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Form submission handlers
    const forms = [
        { id: 'form-nsx', table: 'NSX' },
        { id: 'form-sp', table: 'SP' },
        { id: 'form-pc', table: 'PC' },
        { id: 'form-laptop', table: 'Laptop' }
    ];

    forms.forEach(form => {
        const formElement = document.getElementById(form.id);
        if (formElement) {
            formElement.addEventListener('submit', function (e) {
                e.preventDefault();
                submitForm(this, form.table);
            });
        }
    });
    // Submit form
    function submitForm(form, tableName) {
        console.log(form,tableName)
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => data[key] = value);

        // Get ID based on table
        let id = '';
        switch (tableName) {
            case 'NSX':
                id = data.MaNSX;
                break;
            case 'SP':
            case 'PC':
                id = data.MaSP;
            case 'Laptop':
                id = data.MaSP;
                break;
        }
        console.log(id)
        fetch(`http://localhost:4000/${tableName}/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (!result.error) {
                    form.reset();
                } else {
                    console.error(result.error);
                }
            })
            .catch(error => {
                console.error('Có lỗi xảy ra:', error.message);
            });
    }
});

// Add your JavaScript functionality here
document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Load employees for dropdowns
    loadEmployees();
    
    // Form submissions
    document.getElementById('addEmployeeForm').addEventListener('submit', addEmployee);
    document.getElementById('leaveApplicationForm').addEventListener('submit', applyLeave);
    document.getElementById('checkBalanceForm').addEventListener('submit', checkBalance);
    
    // Load pending leaves for approval tab
    if (document.getElementById('leave-approve')) {
        loadPendingLeaves();
    }
});

async function loadEmployees() {
    try {
        const response = await fetch('http://localhost:3000/api/employees');
        const employees = await response.json();
        
        const employeeList = document.getElementById('employeeList');
        const leaveEmployeeSelect = document.getElementById('leaveEmployee');
        const balanceEmployeeSelect = document.getElementById('balanceEmployee');
        
        // Clear existing options except the first one
        while (leaveEmployeeSelect.options.length > 1) {
            leaveEmployeeSelect.remove(1);
        }
        while (balanceEmployeeSelect.options.length > 1) {
            balanceEmployeeSelect.remove(1);
        }
        
        employeeList.innerHTML = '';
        
        employees.forEach(emp => {
            // Add to employee list
            const empCard = document.createElement('div');
            empCard.className = 'employee-card';
            empCard.innerHTML = `
                <h3>${emp.name}</h3>
                <p>Email: ${emp.email}</p>
                <p>Department: ${emp.department}</p>
                <p>Joined: ${new Date(emp.joining_date).toLocaleDateString()}</p>
            `;
            employeeList.appendChild(empCard);
            
            // Add to dropdowns
            const option1 = document.createElement('option');
            option1.value = emp.id;
            option1.textContent = `${emp.name} (${emp.department})`;
            
            const option2 = document.createElement('option');
            option2.value = emp.id;
            option2.textContent = `${emp.name} (${emp.department})`;
            
            leaveEmployeeSelect.appendChild(option1);
            balanceEmployeeSelect.appendChild(option2);
        });
    } catch (error) {
        console.error('Error loading employees:', error);
        alert('Failed to load employees');
    }
}

async function addEmployee(e) {
    e.preventDefault();
    
    const employee = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        department: document.getElementById('department').value,
        joining_date: document.getElementById('joiningDate').value
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employee)
        });
        
        if (response.ok) {
            alert('Employee added successfully');
            document.getElementById('addEmployeeForm').reset();
            loadEmployees();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to add employee');
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        alert('Failed to add employee');
    }
}

async function applyLeave(e) {
    e.preventDefault();
    
    const leave = {
        employee_id: document.getElementById('leaveEmployee').value,
        start_date: document.getElementById('leaveStartDate').value,
        end_date: document.getElementById('leaveEndDate').value,
        reason: document.getElementById('leaveReason').value
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/leaves', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leave)
        });
        
        if (response.ok) {
            alert('Leave applied successfully');
            document.getElementById('leaveApplicationForm').reset();
            loadPendingLeaves();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to apply leave');
        }
    } catch (error) {
        console.error('Error applying leave:', error);
        alert('Failed to apply leave');
    }
}

async function loadPendingLeaves() {
    try {
        const response = await fetch('http://localhost:3000/api/leaves?status=pending');
        const leaves = await response.json();
        
        const pendingLeavesList = document.getElementById('pendingLeavesList');
        pendingLeavesList.innerHTML = '';
        
        if (leaves.length === 0) {
            pendingLeavesList.innerHTML = '<p>No pending leave requests</p>';
            return;
        }
        
        leaves.forEach(leave => {
            const leaveCard = document.createElement('div');
            leaveCard.className = 'leave-card';
            leaveCard.innerHTML = `
                <h3>${leave.employee_name}</h3>
                <p>Department: ${leave.employee_department}</p>
                <p>Dates: ${new Date(leave.start_date).toLocaleDateString()} to ${new Date(leave.end_date).toLocaleDateString()}</p>
                <p>Reason: ${leave.reason || 'N/A'}</p>
                <div class="leave-actions">
                    <button class="approve-btn" data-id="${leave.id}">Approve</button>
                    <button class="reject-btn" data-id="${leave.id}">Reject</button>
                </div>
            `;
            pendingLeavesList.appendChild(leaveCard);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', () => updateLeaveStatus(btn.getAttribute('data-id'), 'approved'));
        });
        
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => updateLeaveStatus(btn.getAttribute('data-id'), 'rejected'));
        });
    } catch (error) {
        console.error('Error loading pending leaves:', error);
        alert('Failed to load pending leaves');
    }
}

async function updateLeaveStatus(leaveId, status) {
    try {
        const response = await fetch(`http://localhost:3000/api/leaves/${leaveId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            alert(`Leave ${status} successfully`);
            loadPendingLeaves();
        } else {
            const error = await response.json();
            alert(error.message || `Failed to ${status} leave`);
        }
    } catch (error) {
        console.error(`Error ${status} leave:`, error);
        alert(`Failed to ${status} leave`);
    }
}

async function checkBalance(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('balanceEmployee').value;
    
    try {
        const response = await fetch(`http://localhost:3000/api/leaves/balance/${employeeId}`);
        const balance = await response.json();
        
        const balanceResult = document.getElementById('balanceResult');
        balanceResult.innerHTML = `
            <div class="balance-card">
                <h3>${balance.employee_name}</h3>
                <p>Department: ${balance.employee_department}</p>
                <p>Annual Leave Balance: ${balance.balance} days</p>
            </div>
        `;
    } catch (error) {
        console.error('Error checking balance:', error);
        alert('Failed to check leave balance');
    }
}
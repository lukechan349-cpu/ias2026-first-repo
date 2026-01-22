// Toggle for register form (moved from inline script in index.html)
(function(){
	const regLink = document.getElementById('register-link');
	const loginLink = document.getElementById('login-link');
	const regFormWrap = document.getElementById('register-form');
	const loginFormWrap = document.getElementById('login-form');
	const closeRegBtn = document.getElementById('close-register');
	const closeLoginBtn = document.getElementById('close-login');
	const backdrop = document.getElementById('modal-backdrop');

	function openRegister(){
		// Close login form if open
		if(loginFormWrap){ 
			loginFormWrap.classList.remove('show');
			setTimeout(() => {
				loginFormWrap.classList.add('hidden');
				loginFormWrap.setAttribute('aria-hidden','true');
			}, 500);
		}
		if(backdrop) backdrop.classList.remove('hidden');
		if(regFormWrap){ 
			regFormWrap.classList.remove('hidden'); 
			regFormWrap.setAttribute('aria-hidden','false');
			// Trigger animation after display is set
			requestAnimationFrame(() => {
				regFormWrap.classList.add('show');
			});
		}
	}

	function openLogin(){
		// Close register form if open
		if(regFormWrap){ 
			regFormWrap.classList.remove('show');
			setTimeout(() => {
				regFormWrap.classList.add('hidden');
				regFormWrap.setAttribute('aria-hidden','true');
			}, 500);
		}
		if(backdrop) backdrop.classList.remove('hidden');
		if(loginFormWrap){ 
			loginFormWrap.classList.remove('hidden'); 
			loginFormWrap.setAttribute('aria-hidden','false');
			// Trigger animation after display is set
			requestAnimationFrame(() => {
				loginFormWrap.classList.add('show');
			});
		}
	}

	function clearAllAuthForms(){
		const inputs = document.querySelectorAll('#register-form .form-row input, #login-form .form-row input');
		inputs.forEach(i => { i.value = ''; i.classList.remove('filled'); });
	}

	function closeAll(){
		if(backdrop) backdrop.classList.add('hidden');
		// Remove show class first to trigger exit animation
		if(regFormWrap){ 
			regFormWrap.classList.remove('show');
		}
		if(loginFormWrap){ 
			loginFormWrap.classList.remove('show');
		}
		// Wait for animation to complete before hiding
		setTimeout(() => {
			if(regFormWrap){ 
				regFormWrap.classList.add('hidden'); 
				regFormWrap.setAttribute('aria-hidden','true'); 
			}
			if(loginFormWrap){ 
				loginFormWrap.classList.add('hidden'); 
				loginFormWrap.setAttribute('aria-hidden','true'); 
			}
			clearAllAuthForms();
		}, 500); // Match the transition duration
	}

	if(regLink){ regLink.addEventListener('click', function(e){ e.preventDefault(); openRegister(); }); }
	if(loginLink){ loginLink.addEventListener('click', function(e){ e.preventDefault(); openLogin(); }); }

	if(closeRegBtn){ closeRegBtn.addEventListener('click', function(){ closeAll(); }); }
	if(closeLoginBtn){ closeLoginBtn.addEventListener('click', function(){ closeAll(); }); }

	// Get Started button triggers login
	const getStartedBtn = document.getElementById('get-started-btn');
	if(getStartedBtn && loginLink){
		getStartedBtn.addEventListener('click', function(e){
			e.preventDefault();
			loginLink.click();
		});
	}

	// Helper: save account to localStorage
	function saveAccount(newAcc){
		const key = 'fs_accounts';
		const raw = localStorage.getItem(key);
		let accounts = raw ? JSON.parse(raw) : [];
		if(!newAcc || !newAcc.email) return { success: false, message: 'Missing account email.' };
		const email = (newAcc.email || '').toString().trim().toLowerCase();
		if(!email || !newAcc.password) return { success: false, message: 'Email and password required.' };
		const exists = accounts.find(a => a.email === email);
		if(exists) return { success: false, message: 'An account with that email already exists.' };
		// Generate unique ID if not provided
		const maxId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id || 0)) : 0;
		const acc = Object.assign({}, newAcc, { 
			id: newAcc.id || (maxId + 1),
			email, 
			verified: newAcc.verified !== undefined ? newAcc.verified : false 
		});
		accounts.push(acc);
		localStorage.setItem(key, JSON.stringify(accounts));
		return { success: true, message: 'Account created.' };
	}

	// expose helper for other scripts (optional)
	window.saveAccount = saveAccount;

	// Register form submit: gather fields and call saveAccount
	const form = document.getElementById('registerForm');
	if(form){
		form.addEventListener('submit', function(e){
			e.preventDefault();
			const first = document.getElementById('firstname').value.trim();
			const last = document.getElementById('lastname').value.trim();
			const email = document.getElementById('email').value.trim().toLowerCase();
			const password = document.getElementById('password').value;
			const role = 'user'; // All new registrations default to 'user'
			const result = saveAccount({ firstname: first, lastname: last, email, password, role, verified: false });
			if(!result.success){ alert(result.message); return; }
			// Show verification modal
			closeAll();
			setTimeout(() => {
				showVerificationModal(email);
			}, 500);
		});
	}
	// mark autofilled or prefilled inputs as filled so CSS can style them
	function markFilledInputs(){
		const inputs = document.querySelectorAll('#register-form .form-row input, #register-form .form-row select, #login-form .form-row input');
		inputs.forEach(input => {
			const v = (input.value || '').toString();
			if(v && v.trim() !== ''){ input.classList.add('filled'); } else { input.classList.remove('filled'); }
		});
	}

	// run on load and shortly after to catch browser autofill
	document.addEventListener('DOMContentLoaded', function(){
		markFilledInputs();
		// some browsers fill after load; re-check shortly after
		setTimeout(markFilledInputs, 200);
		setTimeout(markFilledInputs, 800);
	});

	// also update on input/change
	document.addEventListener('input', function(e){ if(e.target && e.target.matches('#register-form .form-row input, #register-form .form-row select, #login-form .form-row input')) markFilledInputs(); });

	// Clear form button
	const clearBtn = document.getElementById('clear-form');
	if(clearBtn){
		clearBtn.addEventListener('click', function(){
			const inputs = document.querySelectorAll('#register-form .form-row input, #register-form .form-row select');
			inputs.forEach(i => { i.value = ''; i.classList.remove('filled'); });
			const first = document.querySelector('#register-form .form-row input'); if(first) first.focus();
		});
	}

	// Clear login button
	const clearLogin = document.getElementById('clear-login');
	if(clearLogin){
		clearLogin.addEventListener('click', function(){
			const inputs = document.querySelectorAll('#login-form .form-row input');
			inputs.forEach(i => { i.value = ''; i.classList.remove('filled'); });
			const first = document.querySelector('#login-form .form-row input'); if(first) first.focus();
		});
	}

	// Login submit
	const loginForm = document.getElementById('loginForm');
	if(loginForm){
		loginForm.addEventListener('submit', function(e){
			e.preventDefault();
			const email = (document.getElementById('login-email').value || '').trim().toLowerCase();
			const password = document.getElementById('login-password').value || '';
			const key = 'fs_accounts';
			const raw = localStorage.getItem(key);
			const accounts = raw ? JSON.parse(raw) : [];
			const match = accounts.find(a => a.email === email && a.password === password);
			if(match){
				if(!match.verified){
					alert('Please verify your email before logging in.');
					return;
				}
				localStorage.setItem('fs_currentUser', JSON.stringify(match));
				updateUIForLoggedInUser(match);
				alert('Logged in as ' + match.email);
				closeAll();
			} else {
				alert('Invalid credentials');
			}
		});
	}

	// Function to update UI when user logs in
	function updateUIForLoggedInUser(user){
		document.body.classList.add('logged-in');
		
		// Add admin class if user is admin
		if(user.role === 'admin'){
			document.body.classList.add('is-admin');
		} else {
			document.body.classList.remove('is-admin');
		}
		
		// Hide all content pages first
		document.querySelectorAll('.logged-in-content').forEach(content => {
			content.classList.add('hidden');
		});
		
		// Show profile page by default
		const profileContent = document.getElementById('profile-content');
		if(profileContent){
			profileContent.classList.remove('hidden');
		}
		
		// Update dropdown display name
		const displayName = document.getElementById('user-display-name');
		if(displayName){
			const name = (user.firstname || '') + ' ' + (user.lastname || '');
			displayName.textContent = name.trim() || user.role || 'User';
		}
		
		// Update profile info
		const profileName = document.getElementById('profile-name');
		const profileEmail = document.getElementById('profile-email');
		const profileRole = document.getElementById('profile-role');
		
		if(profileName){
			const fullName = (user.firstname || '') + ' ' + (user.lastname || '');
			profileName.textContent = fullName.trim() || 'User';
		}
		if(profileEmail) profileEmail.textContent = user.email || '';
		if(profileRole) profileRole.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
	}

	// restore login state if present
	document.addEventListener('DOMContentLoaded', function(){
		try{
			const cur = localStorage.getItem('fs_currentUser');
			if(cur){ 
				const user = JSON.parse(cur);
				updateUIForLoggedInUser(user);
			}
		}catch(e){}
	});

	// Initialize default admin account if it doesn't exist
	document.addEventListener('DOMContentLoaded', function(){
		const key = 'fs_accounts';
		const raw = localStorage.getItem(key);
		let accounts = raw ? JSON.parse(raw) : [];
		const adminEmail = 'admin@admin.com';
		const adminExists = accounts.find(a => a.email === adminEmail);
		
		if(!adminExists){
			const defaultAdmin = {
				id: 1,
				firstname: 'Admin',
				lastname: 'User',
				email: adminEmail,
				password: 'admin123',
				role: 'admin',
				verified: true
			};
			accounts.push(defaultAdmin);
			localStorage.setItem(key, JSON.stringify(accounts));
			console.log('Default admin account created!');
			console.log('Email: admin@admin.com');
			console.log('Password: admin123');
		}
		
		// Migration: Ensure all existing accounts have IDs
		let needsMigration = false;
		accounts.forEach(acc => {
			if(!acc.id){
				needsMigration = true;
			}
		});
		if(needsMigration){
			const maxId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id || 0)) : 0;
			let nextId = maxId + 1;
			accounts = accounts.map(acc => {
				if(!acc.id){
					return { ...acc, id: nextId++ };
				}
				return acc;
			});
			localStorage.setItem(key, JSON.stringify(accounts));
		}
	});

	// Dropdown toggle functionality
	const dropdownBtn = document.getElementById('user-dropdown-btn');
	const dropdownMenu = document.getElementById('user-dropdown-menu');
	
	if(dropdownBtn && dropdownMenu){
		dropdownBtn.addEventListener('click', function(e){
			e.stopPropagation();
			dropdownMenu.classList.toggle('hidden');
			dropdownBtn.classList.toggle('active');
		});
		
		// Close dropdown when clicking outside
		document.addEventListener('click', function(e){
			if(!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)){
				dropdownMenu.classList.add('hidden');
				dropdownBtn.classList.remove('active');
			}
		});
		
		// Handle dropdown menu item clicks
		const dropdownLinks = dropdownMenu.querySelectorAll('a');
		dropdownLinks.forEach(link => {
			link.addEventListener('click', function(e){
				e.preventDefault();
				const page = this.getAttribute('data-page');
				
				// Hide all content pages
				document.querySelectorAll('.logged-in-content').forEach(content => {
					content.classList.add('hidden');
				});
				
				// Show selected page
				if(page === 'profile'){
					document.getElementById('profile-content').classList.remove('hidden');
				} else if(page === 'employees'){
					document.getElementById('employees-content').classList.remove('hidden');
					loadEmployees();
					updateEmployeeDepartmentDropdown();
				} else if(page === 'accounts'){
					// Check if user is admin
					const currentUser = JSON.parse(localStorage.getItem('fs_currentUser') || '{}');
					if(currentUser.role !== 'admin'){
						alert('Access denied. Admin only.');
						return;
					}
					document.getElementById('accounts-content').classList.remove('hidden');
					loadAccounts();
				} else if(page === 'departments'){
					document.getElementById('departments-content').classList.remove('hidden');
					loadDepartments();
				} else if(page === 'requests'){
					document.getElementById('requests-content').classList.remove('hidden');
					loadRequests();
				}
				
				dropdownMenu.classList.add('hidden');
				dropdownBtn.classList.remove('active');
			});
		});
	}

	// Logout functionality
	const logoutLink = document.getElementById('logout-link');
	if(logoutLink){
		logoutLink.addEventListener('click', function(e){
			e.preventDefault();
			localStorage.removeItem('fs_currentUser');
			document.body.classList.remove('logged-in');
			// Reset forms
			clearAllAuthForms();
			// Close dropdown if open
			if(dropdownMenu) dropdownMenu.classList.add('hidden');
			if(dropdownBtn) dropdownBtn.classList.remove('active');
			alert('Logged out successfully');
		});
	}

	// Employee management functions
	let editingEmployeeId = null;

	function getEmployees(){
		const key = 'fs_employees';
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : [];
	}

	function saveEmployee(employee){
		const key = 'fs_employees';
		let employees = getEmployees();
		
		if(editingEmployeeId){
			// Update existing employee
			const index = employees.findIndex(e => e.id === editingEmployeeId);
			if(index !== -1){
				employees[index] = { ...employee, id: editingEmployeeId };
			}
		} else {
			// Add new employee
			const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
			employees.push({ ...employee, id: newId });
		}
		
		localStorage.setItem(key, JSON.stringify(employees));
		loadEmployees();
		resetEmployeeForm();
	}

	function deleteEmployee(id){
		if(confirm('Are you sure you want to delete this employee?')){
			const key = 'fs_employees';
			let employees = getEmployees();
			employees = employees.filter(e => e.id !== id);
			localStorage.setItem(key, JSON.stringify(employees));
			loadEmployees();
		}
	}

	function editEmployee(id){
		const employees = getEmployees();
		const employee = employees.find(e => e.id === id);
		if(employee){
			editingEmployeeId = id;
			document.getElementById('employee-id').value = employee.employeeId || '';
			document.getElementById('employee-email').value = employee.userEmail || '';
			document.getElementById('employee-position').value = employee.position || '';
			const deptSelect = document.getElementById('employee-department');
			deptSelect.value = employee.department || 'Engineering';
			document.getElementById('employee-hire-date').value = employee.hireDate || '';
			
			// Mark fields as filled
			markEmployeeFormFields();
			
			// Show and scroll to form
			showEmployeeForm();
		}
	}

	function resetEmployeeForm(){
		editingEmployeeId = null;
		document.getElementById('employee-form').reset();
		const deptSelect = document.getElementById('employee-department');
		deptSelect.value = '';
		markEmployeeFormFields();
		hideEmployeeForm();
	}

	function showEmployeeForm(){
		const formContainer = document.querySelector('.employee-form-container');
		if(formContainer){
			formContainer.classList.add('show');
			formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

	function hideEmployeeForm(){
		const formContainer = document.querySelector('.employee-form-container');
		if(formContainer){
			formContainer.classList.remove('show');
		}
	}

	function loadEmployees(){
		const employees = getEmployees();
		const tbody = document.getElementById('employees-table-body');
		
		if(employees.length === 0){
			tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No employees.</td></tr>';
			return;
		}
		
		tbody.innerHTML = employees.map(emp => {
			// Get user name from accounts if available
			const accountsKey = 'fs_accounts';
			const accountsRaw = localStorage.getItem(accountsKey);
			const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];
			const account = accounts.find(a => a.email === emp.userEmail);
			const userName = account ? `${account.firstname || ''} ${account.lastname || ''}`.trim() : emp.userEmail;
			
			return `
				<tr>
					<td>${emp.employeeId || emp.id}</td>
					<td>${userName || emp.userEmail}</td>
					<td>${emp.position || ''}</td>
					<td>${emp.department || ''}</td>
					<td>
						<div class="action-buttons">
							<button class="action-btn edit-action-btn" onclick="window.editEmployee(${emp.id})">Edit</button>
							<button class="action-btn delete-action-btn" onclick="window.deleteEmployee(${emp.id})">Delete</button>
						</div>
					</td>
				</tr>
			`;
		}).join('');
	}

	// Expose functions globally for onclick handlers
	window.editEmployee = editEmployee;
	window.deleteEmployee = deleteEmployee;

	// Employee form submission
	const employeeForm = document.getElementById('employee-form');
	if(employeeForm){
		employeeForm.addEventListener('submit', function(e){
			e.preventDefault();
			const employeeData = {
				employeeId: document.getElementById('employee-id').value.trim(),
				userEmail: document.getElementById('employee-email').value.trim().toLowerCase(),
				position: document.getElementById('employee-position').value.trim(),
				department: document.getElementById('employee-department').value.trim(),
				hireDate: document.getElementById('employee-hire-date').value
			};
			
			saveEmployee(employeeData);
			alert(editingEmployeeId ? 'Employee updated successfully!' : 'Employee added successfully!');
			hideEmployeeForm();
		});
	}

	// Add employee button
	const addEmployeeBtn = document.getElementById('add-employee-btn');
	if(addEmployeeBtn){
		addEmployeeBtn.addEventListener('click', function(){
			editingEmployeeId = null;
			document.getElementById('employee-form').reset();
			const deptSelect = document.getElementById('employee-department');
			deptSelect.value = '';
			markEmployeeFormFields();
			showEmployeeForm();
		});
	}

	// Cancel employee form
	const cancelEmployeeBtn = document.getElementById('cancel-employee-btn');
	if(cancelEmployeeBtn){
		cancelEmployeeBtn.addEventListener('click', function(){
			resetEmployeeForm();
		});
	}

	// Mark employee form fields with values as filled
	function markEmployeeFormFields(){
		const inputs = document.querySelectorAll('#employee-form input, #employee-form select');
		inputs.forEach(input => {
			if(input.value && input.value.trim() !== ''){
				input.classList.add('filled');
			} else {
				input.classList.remove('filled');
			}
		});
	}

	// Check employee form fields on load and input
	document.addEventListener('DOMContentLoaded', function(){
		setTimeout(markEmployeeFormFields, 100);
	});

	const employeeFormInputs = document.querySelectorAll('#employee-form input, #employee-form select');
	employeeFormInputs.forEach(input => {
		input.addEventListener('input', markEmployeeFormFields);
		input.addEventListener('change', markEmployeeFormFields);
	});

	// Department management functions
	let editingDepartmentId = null;

	function getDepartments(){
		const key = 'fs_departments';
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : [];
	}

	function saveDepartment(department){
		const key = 'fs_departments';
		let departments = getDepartments();
		
		if(editingDepartmentId){
			// Update existing department
			const index = departments.findIndex(d => d.id === editingDepartmentId);
			if(index !== -1){
				departments[index] = { ...department, id: editingDepartmentId };
			}
		} else {
			// Add new department
			const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1;
			departments.push({ ...department, id: newId });
		}
		
		localStorage.setItem(key, JSON.stringify(departments));
		loadDepartments();
		updateEmployeeDepartmentDropdown();
		resetDepartmentForm();
	}

	function deleteDepartment(id){
		if(confirm('Are you sure you want to delete this department?')){
			const key = 'fs_departments';
			let departments = getDepartments();
			departments = departments.filter(d => d.id !== id);
			localStorage.setItem(key, JSON.stringify(departments));
			loadDepartments();
			updateEmployeeDepartmentDropdown();
		}
	}

	function editDepartment(id){
		const departments = getDepartments();
		const department = departments.find(d => d.id === id);
		if(department){
			editingDepartmentId = id;
			document.getElementById('department-name').value = department.name || '';
			document.getElementById('department-description').value = department.description || '';
			showDepartmentForm();
		}
	}

	function resetDepartmentForm(){
		editingDepartmentId = null;
		document.getElementById('department-form').reset();
		hideDepartmentForm();
	}

	function showDepartmentForm(){
		const formContainer = document.getElementById('department-form-container');
		if(formContainer){
			formContainer.classList.add('show');
			formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

	function hideDepartmentForm(){
		const formContainer = document.getElementById('department-form-container');
		if(formContainer){
			formContainer.classList.remove('show');
		}
	}

	function loadDepartments(){
		const departments = getDepartments();
		const tbody = document.getElementById('departments-table-body');
		
		if(departments.length === 0){
			tbody.innerHTML = '<tr class="empty-row"><td colspan="3">No departments.</td></tr>';
			return;
		}
		
		tbody.innerHTML = departments.map(dept => {
			return `
				<tr>
					<td>${dept.name || ''}</td>
					<td>${dept.description || ''}</td>
					<td>
						<div class="action-buttons">
							<button class="action-btn edit-action-btn" onclick="window.editDepartment(${dept.id})">Edit</button>
							<button class="action-btn delete-action-btn" onclick="window.deleteDepartment(${dept.id})">Delete</button>
						</div>
					</td>
				</tr>
			`;
		}).join('');
	}

	function updateEmployeeDepartmentDropdown(){
		const departments = getDepartments();
		const deptSelect = document.getElementById('employee-department');
		if(deptSelect){
			const currentValue = deptSelect.value;
			deptSelect.innerHTML = '<option value="" disabled selected hidden></option>';
			departments.forEach(dept => {
				const option = document.createElement('option');
				option.value = dept.name;
				option.textContent = dept.name;
				deptSelect.appendChild(option);
			});
			// Restore previous value if it still exists
			if(currentValue && departments.find(d => d.name === currentValue)){
				deptSelect.value = currentValue;
			}
		}
	}

	// Expose department functions globally
	window.editDepartment = editDepartment;
	window.deleteDepartment = deleteDepartment;

	// Department form submission
	const departmentForm = document.getElementById('department-form');
	if(departmentForm){
		departmentForm.addEventListener('submit', function(e){
			e.preventDefault();
			const departmentData = {
				name: document.getElementById('department-name').value.trim(),
				description: document.getElementById('department-description').value.trim()
			};
			
			saveDepartment(departmentData);
			alert(editingDepartmentId ? 'Department updated successfully!' : 'Department added successfully!');
		});
	}

	// Add department button
	const addDepartmentBtn = document.getElementById('add-department-btn');
	if(addDepartmentBtn){
		addDepartmentBtn.addEventListener('click', function(){
			editingDepartmentId = null;
			document.getElementById('department-form').reset();
			showDepartmentForm();
		});
	}


	const cancelDepartmentBtn = document.getElementById('cancel-department-btn');
	if(cancelDepartmentBtn){
		cancelDepartmentBtn.addEventListener('click', function(){
			resetDepartmentForm();
		});
	}


	document.addEventListener('DOMContentLoaded', function(){
		const departments = getDepartments();
		if(departments.length === 0){
			const defaultDepartments = [
				{ id: 1, name: 'Engineering', description: 'Software team' },
				{ id: 2, name: 'HR', description: 'Human Resources' }
			];
			localStorage.setItem('fs_departments', JSON.stringify(defaultDepartments));
		}
		updateEmployeeDepartmentDropdown();
	});


	function showVerificationModal(email){
		const verifyModal = document.getElementById('verify-email-form');
		const verifyEmailAddress = document.getElementById('verify-email-address');
		if(verifyEmailAddress) verifyEmailAddress.textContent = email;
		if(backdrop) backdrop.classList.remove('hidden');
		if(verifyModal){
			verifyModal.classList.remove('hidden');
			verifyModal.setAttribute('aria-hidden','false');
			requestAnimationFrame(() => {
				verifyModal.classList.add('show');
			});
		}
		localStorage.setItem('unverified_email', email);
	}

	function closeVerificationModal(){
		const verifyModal = document.getElementById('verify-email-form');
		if(backdrop) backdrop.classList.add('hidden');
		if(verifyModal){
			verifyModal.classList.remove('show');
			setTimeout(() => {
				verifyModal.classList.add('hidden');
				verifyModal.setAttribute('aria-hidden','true');
			}, 500);
		}
	}

	const simulateVerifyBtn = document.getElementById('simulate-verify-btn');
	if(simulateVerifyBtn){
		simulateVerifyBtn.addEventListener('click', function(){
			const unverifiedEmail = localStorage.getItem('unverified_email');
			if(unverifiedEmail){
				const key = 'fs_accounts';
				const raw = localStorage.getItem(key);
				const accounts = raw ? JSON.parse(raw) : [];
				const account = accounts.find(a => a.email === unverifiedEmail);
				if(account){
					account.verified = true;
					localStorage.setItem(key, JSON.stringify(accounts));
					alert('Email verified! You can now login.');
					closeVerificationModal();
					localStorage.removeItem('unverified_email');
					openLogin();
				}
			}
		});
	}

	const goToLoginBtn = document.getElementById('go-to-login-btn');
	if(goToLoginBtn){
		goToLoginBtn.addEventListener('click', function(){
			closeVerificationModal();
			openLogin();
		});
	}

	const closeVerifyBtn = document.getElementById('close-verify');
	if(closeVerifyBtn){
		closeVerifyBtn.addEventListener('click', function(){
			closeVerificationModal();
		});
	}


	let editingAccountId = null;

	function getAccounts(){
		const key = 'fs_accounts';
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : [];
	}

	function saveAccountToDB(account){
		const key = 'fs_accounts';
		let accounts = getAccounts();
		
		if(editingAccountId){
			const index = accounts.findIndex(a => a.email === editingAccountId);
			if(index !== -1){

				const existingId = accounts[index].id;
				accounts[index] = { ...account, email: editingAccountId, id: existingId };
			}
		} else {
			const email = account.email.trim().toLowerCase();
			if(accounts.find(a => a.email === email)){
				alert('An account with that email already exists.');
				return;
			}
	
			const maxId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id || 0)) : 0;
			accounts.push({ ...account, email, id: maxId + 1 });
		}
		
		localStorage.setItem(key, JSON.stringify(accounts));
		loadAccounts();
		resetAccountForm();
	}

	let accountToDelete = null;

	function deleteAccount(id){
		const currentUserRaw = localStorage.getItem('fs_currentUser');
		const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : {};
		const accounts = getAccounts();
		const account = accounts.find(a => a.id === id);
		
		if(!account){
			alert('Account not found.');
			return;
		}
		
		let currentUserWithId = currentUser;
		if(currentUser.email){
			const currentUserAccount = accounts.find(a => a.email === currentUser.email);
			if(currentUserAccount && currentUserAccount.id){
				currentUserWithId = currentUserAccount;
			}
		}
		
		if((currentUserWithId.id && currentUserWithId.id === id) || 
		   (!currentUserWithId.id && currentUser.email === account.email)){
			alert('You cannot delete your own account.');
			return;
		}
		
		if(currentUserWithId.role === 'admin' && account.role === 'admin'){
			const adminCount = accounts.filter(a => a.role === 'admin').length;
			if(adminCount === 1){
				alert('Cannot delete the last admin account. The application must have at least one administrator.');
				return;
			}
		}
		
		accountToDelete = account;
		showDeleteAccountModal(account.email);
	}

	function confirmDeleteAccount(){
		if(!accountToDelete) return;
		
		const key = 'fs_accounts';
		let accounts = getAccounts();
		accounts = accounts.filter(a => a.id !== accountToDelete.id);
		localStorage.setItem(key, JSON.stringify(accounts));
		loadAccounts();
		closeDeleteAccountModal();
		accountToDelete = null;
	}

	function showDeleteAccountModal(email){
		const deleteModal = document.getElementById('delete-account-modal');
		const deleteEmailSpan = document.getElementById('delete-account-email');
		if(deleteEmailSpan) deleteEmailSpan.textContent = email;
		if(backdrop) backdrop.classList.remove('hidden');
		if(deleteModal){
			deleteModal.classList.remove('hidden');
			deleteModal.setAttribute('aria-hidden','false');
			requestAnimationFrame(() => {
				deleteModal.classList.add('show');
			});
		}
	}

	function closeDeleteAccountModal(){
		const deleteModal = document.getElementById('delete-account-modal');
		if(backdrop) backdrop.classList.add('hidden');
		if(deleteModal){
			deleteModal.classList.remove('show');
			setTimeout(() => {
				deleteModal.classList.add('hidden');
				deleteModal.setAttribute('aria-hidden','true');
			}, 500);
		}
		accountToDelete = null;
	}



	function editAccount(email){
		const accounts = getAccounts();
		const account = accounts.find(a => a.email === email);
		if(account){
			editingAccountId = email;
			document.getElementById('account-firstname').value = account.firstname || '';
			document.getElementById('account-lastname').value = account.lastname || '';
			document.getElementById('account-email').value = account.email || '';
			document.getElementById('account-password').value = '';
			document.getElementById('account-role').value = account.role || 'user';
			document.getElementById('account-verified').checked = account.verified || false;
			showAccountForm();
		}
	}

	function resetPassword(email){
		const newPassword = prompt('Enter new password (min 6 characters):');
		if(newPassword && newPassword.length >= 6){
			const key = 'fs_accounts';
			let accounts = getAccounts();
			const account = accounts.find(a => a.email === email);
			if(account){
				account.password = newPassword;
				localStorage.setItem(key, JSON.stringify(accounts));
				alert('Password reset successfully.');
				loadAccounts();
			}
		} else if(newPassword){
			alert('Password must be at least 6 characters.');
		}
	}

	function resetAccountForm(){
		editingAccountId = null;
		document.getElementById('account-form').reset();
		hideAccountForm();
	}

	function showAccountForm(){
		const formContainer = document.getElementById('account-form-container');
		if(formContainer){
			formContainer.classList.add('show');
			formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

	function hideAccountForm(){
		const formContainer = document.getElementById('account-form-container');
		if(formContainer){
			formContainer.classList.remove('show');
		}
	}

	function loadAccounts(){
		const accounts = getAccounts();
		const tbody = document.getElementById('accounts-table-body');
		
		if(accounts.length === 0){
			tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No accounts.</td></tr>';
			return;
		}
		
		tbody.innerHTML = accounts.map(acc => {
			const fullName = (acc.firstname || '') + ' ' + (acc.lastname || '');
			// Ensure account has an ID (fallback: generate one if missing)
			let accountId = acc.id;
			if(!accountId){
				// Migration: assign ID to legacy accounts
				const maxId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id || 0)) : 0;
				accountId = maxId + 1;
				acc.id = accountId;
				// Save updated account
				const key = 'fs_accounts';
				let allAccounts = getAccounts();
				const index = allAccounts.findIndex(a => a.email === acc.email);
				if(index !== -1){
					allAccounts[index] = acc;
					localStorage.setItem(key, JSON.stringify(allAccounts));
				}
			}
			return `
				<tr>
					<td>${fullName.trim() || acc.email}</td>
					<td>${acc.email || ''}</td>
					<td>${acc.role ? acc.role.charAt(0).toUpperCase() + acc.role.slice(1) : 'User'}</td>
					<td>${acc.verified ? '✓' : '—'}</td>
					<td>
						<div class="action-buttons">
							<button class="action-btn edit-action-btn" onclick="window.editAccount('${acc.email}')">Edit</button>
							<button class="action-btn edit-action-btn" onclick="window.resetPassword('${acc.email}')" style="background-color: #ff9800;">Reset PW</button>
							<button class="action-btn delete-action-btn" onclick="window.deleteAccount(${accountId})">Delete</button>
						</div>
					</td>
				</tr>
			`;
		}).join('');
	}

	window.editAccount = editAccount;
	window.deleteAccount = deleteAccount;
	window.resetPassword = resetPassword;

	const accountForm = document.getElementById('account-form');
	if(accountForm){
		accountForm.addEventListener('submit', function(e){
			e.preventDefault();
			const accountData = {
				firstname: document.getElementById('account-firstname').value.trim(),
				lastname: document.getElementById('account-lastname').value.trim(),
				email: document.getElementById('account-email').value.trim().toLowerCase(),
				password: document.getElementById('account-password').value,
				role: document.getElementById('account-role').value,
				verified: document.getElementById('account-verified').checked
			};
			
			if(!accountData.password || accountData.password.length < 6){
				alert('Password must be at least 6 characters.');
				return;
			}
			
			saveAccountToDB(accountData);
			alert(editingAccountId ? 'Account updated successfully!' : 'Account added successfully!');
		});
	}

	const addAccountBtn = document.getElementById('add-account-btn');
	if(addAccountBtn){
		addAccountBtn.addEventListener('click', function(){
			editingAccountId = null;
			document.getElementById('account-form').reset();
			document.getElementById('account-verified').checked = false;
			showAccountForm();
		});
	}

	const cancelAccountBtn = document.getElementById('cancel-account-btn');
	if(cancelAccountBtn){
		cancelAccountBtn.addEventListener('click', function(){
			resetAccountForm();
		});
	}

	// Delete Account Modal Event Handlers
	const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
	if(confirmDeleteBtn){
		confirmDeleteBtn.addEventListener('click', function(){
			confirmDeleteAccount();
		});
	}

	const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
	if(cancelDeleteBtn){
		cancelDeleteBtn.addEventListener('click', function(){
			closeDeleteAccountModal();
		});
	}

	const closeDeleteModalBtn = document.getElementById('close-delete-modal');
	if(closeDeleteModalBtn){
		closeDeleteModalBtn.addEventListener('click', function(){
			closeDeleteAccountModal();
		});
	}

	// Requests Management
	let editingRequestId = null;

	function getRequests(){
		const key = 'fs_requests';
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : [];
	}

	function saveRequest(request){
		const key = 'fs_requests';
		let requests = getRequests();
		const currentUser = JSON.parse(localStorage.getItem('fs_currentUser') || '{}');
		
		if(editingRequestId){
			const index = requests.findIndex(r => r.id === editingRequestId);
			if(index !== -1){
				requests[index] = { ...request, id: editingRequestId, employeeEmail: currentUser.email };
			}
		} else {
			const newId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
			requests.push({ 
				...request, 
				id: newId, 
				employeeEmail: currentUser.email,
				date: new Date().toISOString().split('T')[0],
				status: 'Pending'
			});
		}
		
		localStorage.setItem(key, JSON.stringify(requests));
		loadRequests();
		resetRequestForm();
	}

	function deleteRequest(id){
		if(confirm('Are you sure you want to delete this request?')){
			const key = 'fs_requests';
			let requests = getRequests();
			requests = requests.filter(r => r.id !== id);
			localStorage.setItem(key, JSON.stringify(requests));
			loadRequests();
		}
	}

	function resetRequestForm(){
		editingRequestId = null;
		document.getElementById('request-form').reset();
		document.getElementById('request-items-container').innerHTML = `
			<div class="request-item-row">
				<input type="text" class="item-name" placeholder="Item name" required>
				<input type="number" class="item-qty" placeholder="Qty" min="1" required>
				<button type="button" class="remove-item-btn">×</button>
			</div>
		`;
		setupRequestItemHandlers();
		hideRequestForm();
	}

	function showRequestForm(){
		const formContainer = document.getElementById('request-form-container');
		if(formContainer){
			formContainer.classList.add('show');
			formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

	function hideRequestForm(){
		const formContainer = document.getElementById('request-form-container');
		if(formContainer){
			formContainer.classList.remove('show');
		}
	}

	function setupRequestItemHandlers(){
		document.querySelectorAll('.remove-item-btn').forEach(btn => {
			btn.addEventListener('click', function(){
				if(document.querySelectorAll('.request-item-row').length > 1){
					this.closest('.request-item-row').remove();
				} else {
					alert('At least one item is required.');
				}
			});
		});
	}

	function loadRequests(){
		const requests = getRequests();
		const currentUser = JSON.parse(localStorage.getItem('fs_currentUser') || '{}');
		const userRequests = requests.filter(r => r.employeeEmail === currentUser.email);
		const tbody = document.getElementById('requests-table-body');
		
		if(userRequests.length === 0){
			tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No requests.</td></tr>';
			return;
		}
		
		tbody.innerHTML = userRequests.map(req => {
			const itemsText = req.items ? req.items.map(i => `${i.name} (${i.qty})`).join(', ') : '';
			const statusClass = req.status === 'Approved' ? 'badge-success' : 
								req.status === 'Rejected' ? 'badge-danger' : 'badge-warning';
			return `
				<tr>
					<td>${req.type || ''}</td>
					<td>${itemsText}</td>
					<td>${req.date || ''}</td>
					<td><span class="badge ${statusClass}">${req.status || 'Pending'}</span></td>
					<td>
						<div class="action-buttons">
							<button class="action-btn delete-action-btn" onclick="window.deleteRequest(${req.id})">Delete</button>
						</div>
					</td>
				</tr>
			`;
		}).join('');
	}

	window.deleteRequest = deleteRequest;

	const requestForm = document.getElementById('request-form');
	if(requestForm){
		requestForm.addEventListener('submit', function(e){
			e.preventDefault();
			const type = document.getElementById('request-type').value;
			const itemRows = document.querySelectorAll('.request-item-row');
			const items = [];
			
			itemRows.forEach(row => {
				const name = row.querySelector('.item-name').value.trim();
				const qty = parseInt(row.querySelector('.item-qty').value);
				if(name && qty > 0){
					items.push({ name, qty });
				}
			});
			
			if(items.length === 0){
				alert('Please add at least one item.');
				return;
			}
			
			saveRequest({ type, items });
			alert('Request submitted successfully!');
		});
	}

	const addRequestBtn = document.getElementById('add-request-btn');
	if(addRequestBtn){
		addRequestBtn.addEventListener('click', function(){
			resetRequestForm();
			showRequestForm();
		});
	}

	const addItemBtn = document.getElementById('add-item-btn');
	if(addItemBtn){
		addItemBtn.addEventListener('click', function(){
			const container = document.getElementById('request-items-container');
			const newRow = document.createElement('div');
			newRow.className = 'request-item-row';
			newRow.innerHTML = `
				<input type="text" class="item-name" placeholder="Item name" required>
				<input type="number" class="item-qty" placeholder="Qty" min="1" required>
				<button type="button" class="remove-item-btn">×</button>
			`;
			container.appendChild(newRow);
			setupRequestItemHandlers();
		});
	}

	const cancelRequestBtn = document.getElementById('cancel-request-btn');
	if(cancelRequestBtn){
		cancelRequestBtn.addEventListener('click', function(){
			resetRequestForm();
		});
	}

	// Initialize request form handlers
	document.addEventListener('DOMContentLoaded', function(){
		setupRequestItemHandlers();
	});

	// Update default admin to have verified: true
	document.addEventListener('DOMContentLoaded', function(){
		const key = 'fs_accounts';
		const raw = localStorage.getItem(key);
		let accounts = raw ? JSON.parse(raw) : [];
		const adminEmail = 'admin@admin.com';
		const admin = accounts.find(a => a.email === adminEmail);
		if(admin && admin.verified === undefined){
			admin.verified = true;
			localStorage.setItem(key, JSON.stringify(accounts));
		}
	});

}
)();

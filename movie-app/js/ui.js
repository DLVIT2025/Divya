// UI utilities: Toasts, Router, Theme

export const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

export const navigateTo = (sectionId) => {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if(link.dataset.target === sectionId) {
            link.classList.add('active');
        }
    });

    // Save breadcrumb state for back buttons
    if (sectionId === 'movies-section') {
        localStorage.setItem('lastMovieTarget', 'home');
    }
};

export const toggleTheme = () => {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    document.getElementById('theme-toggle').innerHTML = isDark 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
};

export const initUI = () => {
    // Theme setup
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    }

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Navigation setup
    document.querySelectorAll('.nav-link, [data-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            if (target) {
                navigateTo(target);
            }
        });
    });

    // Password toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.currentTarget.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                e.currentTarget.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                e.currentTarget.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    // Auth tab toggles
    document.getElementById('go-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form-wrapper').classList.add('hidden');
        document.getElementById('signup-form-wrapper').classList.remove('hidden');
    });

    document.getElementById('go-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signup-form-wrapper').classList.add('hidden');
        document.getElementById('login-form-wrapper').classList.remove('hidden');
    });
};

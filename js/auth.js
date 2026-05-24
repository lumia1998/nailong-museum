// AuthManager - Supabase 认证管理模块
var AuthManager = (function() {
    var currentUser = null;
    var currentUsername = null;

    // 显示登录弹窗
    function showModal() {
        var modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('show');
            clearMessages();
            showLogin();
        }
    }

    // 隐藏登录弹窗
    function hideModal() {
        var modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('show');
            clearMessages();
        }
    }

    // 清除提示信息
    function clearMessages() {
        var errorMsg = document.getElementById('auth-error');
        var successMsg = document.getElementById('auth-success');
        if (errorMsg) errorMsg.textContent = '';
        if (successMsg) successMsg.textContent = '';
    }

    // 显示错误信息
    function showError(msg) {
        var el = document.getElementById('auth-error');
        var successEl = document.getElementById('auth-success');
        if (el) el.textContent = msg;
        if (successEl) successEl.textContent = '';
    }

    // 显示成功信息
    function showSuccess(msg) {
        var el = document.getElementById('auth-success');
        var errorEl = document.getElementById('auth-error');
        if (el) el.textContent = msg;
        if (errorEl) errorEl.textContent = '';
    }

    // 显示加载状态
    function setLoading(loading) {
        var btns = document.querySelectorAll('.auth-submit-btn');
        btns.forEach(function(btn) {
            if (loading) {
                btn.disabled = true;
                btn.classList.add('auth-loading');
            } else {
                btn.disabled = false;
                btn.classList.remove('auth-loading');
            }
        });
    }

    // 切换到登录表单
    function showLogin() {
        var loginForm = document.getElementById('login-form');
        var registerForm = document.getElementById('register-form');
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        clearMessages();
    }

    // 切换到注册表单
    function showRegister() {
        var loginForm = document.getElementById('login-form');
        var registerForm = document.getElementById('register-form');
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        clearMessages();
    }

    // 处理登录
    async function handleLogin() {
        var email = document.getElementById('login-email').value.trim();
        var password = document.getElementById('login-password').value;

        if (!email || !password) {
            showError('\u8bf7\u586b\u5199\u90ae\u7bb1\u548c\u5bc6\u7801');
            return;
        }

        setLoading(true);
        clearMessages();

        try {
            var result = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            console.log('Login result:', result);

            if (result.error) {
                showError(result.error.message || '登录失败');
                return;
            }

            if (result.data && result.data.user) {
                currentUser = result.data.user;
                await loadUsername();
                updateUI();
                hideModal();
                showSuccess('\u767b\u5f55\u6210\u529f\uff01');
            } else {
                showError('登录失败，请重试');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.message && err.message.includes('fetch')) {
                showError('网络错误，请检查网络连接');
            } else if (err.message && err.message.includes('Invalid')) {
                showError('邮箱或密码错误');
            } else {
                showError('登录失败: ' + (err.message || '请稍后再试'));
            }
        } finally {
            setLoading(false);
        }
    }

    // 处理注册
    async function handleRegister() {
        var username = document.getElementById('register-username').value.trim();
        var email = document.getElementById('register-email').value.trim();
        var password = document.getElementById('register-password').value;
        var confirmPassword = document.getElementById('register-confirm-password').value;

        if (!username || !email || !password || !confirmPassword) {
            showError('\u8bf7\u586b\u5199\u6240\u6709\u5b57\u6bb5');
            return;
        }

        if (password.length < 6) {
            showError('\u5bc6\u7801\u81f3\u5c116\u4f4d');
            return;
        }

        if (password !== confirmPassword) {
            showError('\u4e24\u6b21\u5bc6\u7801\u4e0d\u4e00\u81f4');
            return;
        }

        setLoading(true);
        clearMessages();

        try {
            var result = await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

            console.log('Register result:', result);

            if (result.error) {
                showError(result.error.message || '注册失败');
                return;
            }

            var user = result.data && result.data.user;
            if (user) {
                // 保存用户名到 profiles 表
                var profileResult = await supabaseClient.from('profiles').insert({
                    id: user.id,
                    username: username
                });

                if (profileResult.error) {
                    console.error('Profile save error:', profileResult.error);
                    // 注册成功但 profile 保存失败，仍然继续
                }

                currentUser = user;
                currentUsername = username;
                updateUI();
                hideModal();
                showSuccess('\u6ce8\u518c\u6210\u529f\uff01');
            } else {
                showError('注册失败，请重试');
            }
        } catch (err) {
            console.error('Register error:', err);
            if (err.message && err.message.includes('fetch')) {
                showError('网络错误，请检查网络连接');
            } else {
                showError('注册失败: ' + (err.message || '请稍后再试'));
            }
        } finally {
            setLoading(false);
        }
    }

    // 处理退出登录
    async function handleLogout() {
        try {
            await supabaseClient.auth.signOut();
            currentUser = null;
            currentUsername = null;
            updateUI();
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    // 加载用户名
    async function loadUsername() {
        if (!currentUser) return;
        try {
            var result = await supabaseClient.from('profiles')
                .select('username')
                .eq('id', currentUser.id)
                .single();

            if (result.data && result.data.username) {
                currentUsername = result.data.username;
            } else {
                currentUsername = currentUser.email.split('@')[0];
            }
        } catch (err) {
            currentUsername = currentUser.email.split('@')[0];
            console.error('Load username error:', err);
        }
    }

    // 检查会话状态
    async function checkSession() {
        try {
            var result = await supabaseClient.auth.getSession();
            if (result.data && result.data.session) {
                currentUser = result.data.session.user;
                await loadUsername();
            }
            updateUI();
        } catch (err) {
            console.error('Check session error:', err);
            updateUI();
        }
    }

    // 更新UI显示
    function updateUI() {
        var userInfo = document.getElementById('user-info');
        var guestInfo = document.getElementById('guest-info');
        var usernameSpan = document.querySelector('.username');

        if (currentUser) {
            if (userInfo) userInfo.style.display = 'flex';
            if (guestInfo) guestInfo.style.display = 'none';
            if (usernameSpan) usernameSpan.textContent = currentUsername || currentUser.email;
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (guestInfo) guestInfo.style.display = 'block';
        }
    }

    // 初始化事件绑定
    function init() {
        // 登录按钮
        var headerLoginBtn = document.getElementById('header-login-btn');
        if (headerLoginBtn) {
            headerLoginBtn.addEventListener('click', function() {
                showModal();
            });
        }

        // 退出按钮
        var logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                handleLogout();
            });
        }

        // 关闭弹窗
        var closeBtn = document.querySelector('.auth-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                hideModal();
            });
        }

        // 点击遮罩关闭
        var modal = document.getElementById('auth-modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    hideModal();
                }
            });
        }

        // 切换到注册
        var switchToRegister = document.getElementById('switch-to-register');
        if (switchToRegister) {
            switchToRegister.addEventListener('click', function(e) {
                e.preventDefault();
                showRegister();
            });
        }

        // 切换到登录
        var switchToLogin = document.getElementById('switch-to-login');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', function(e) {
                e.preventDefault();
                showLogin();
            });
        }

        // 登录提交
        var loginSubmit = document.getElementById('login-submit');
        if (loginSubmit) {
            loginSubmit.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogin();
            });
        }

        // 注册提交
        var registerSubmit = document.getElementById('register-submit');
        if (registerSubmit) {
            registerSubmit.addEventListener('click', function(e) {
                e.preventDefault();
                handleRegister();
            });
        }

        // 回车提交
        var loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin();
                }
            });
        }

        var registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRegister();
                }
            });
        }

        // 监听认证状态变化
        supabaseClient.auth.onAuthStateChange(async function(event, session) {
            if (event === 'SIGNED_IN' && session) {
                currentUser = session.user;
                await loadUsername();
                updateUI();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                currentUsername = null;
                updateUI();
            }
        });

        // 检查已有会话
        checkSession();
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 返回公共接口
    return {
        showModal: showModal,
        hideModal: hideModal,
        showLogin: showLogin,
        showRegister: showRegister,
        handleLogin: handleLogin,
        handleRegister: handleRegister,
        handleLogout: handleLogout,
        checkSession: checkSession,
        updateUI: updateUI,
        get currentUser() { return currentUser; },
        get currentUsername() { return currentUsername; }
    };
})();

var authManager = AuthManager;

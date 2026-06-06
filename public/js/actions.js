async function acceptQuest(questId) {
    try {
        const response = await fetch(`/api/quests/${questId}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error || 'Failed to accept quest');
        }
    } catch (err) {
        console.error(err);
        alert('Server error while accepting quest');
    }
}

async function completeQuest(questId) {
    const form = document.querySelector('form[action="/api/quests/submit-proof"]');
    if (form) {
        scrollToProof(questId);
    } else {
        // Redirect to quests page with complete query parameter to auto-scroll and select the quest
        window.location.href = `/quests?complete=${questId}`;
    }
}

function scrollToProof(questId) {
    const select = document.getElementById('questId');
    if (select) {
        select.value = questId;
    }
    const form = document.querySelector('form[action="/api/quests/submit-proof"]');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const completeId = urlParams.get('complete');
    if (completeId) {
        // Wait briefly for elements to be fully rendered/styled
        setTimeout(() => {
            scrollToProof(completeId);
        }, 100);
    }
});

async function buyItem(itemId) {
    const btn = document.querySelector(`button[onclick*="${itemId}"]`);
    if (btn) { btn.disabled = true; btn.textContent = 'Buying...'; }
    try {
        const response = await fetch(`/api/shop/buy/${itemId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        if (result.success) {
            showPurchaseModal(result.newBalance);
        } else {
            if (btn) { btn.disabled = false; btn.textContent = 'Buy Reward'; }
            showErrorModal(result.error || 'Failed to buy item');
        }
    } catch (err) {
        console.error(err);
        if (btn) { btn.disabled = false; btn.textContent = 'Buy Reward'; }
        showErrorModal('Server error while purchasing item');
    }
}

function showPurchaseModal(newBalance) {
    const existing = document.getElementById('shop-purchase-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'shop-purchase-overlay';
    overlay.className = 'quest-overlay-fade-in';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:10000;display:flex;justify-content:center;align-items:center;';
    overlay.innerHTML = `
        <div id="shop-purchase-modal" class="quest-modal-scale-up" style="background:#171717;border:2px solid #d4af37;border-radius:16px;width:90%;max-width:460px;padding:40px 30px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.5),0 0 20px rgba(212,175,55,0.2);position:relative;overflow:hidden;">
            <div class="shop-burst" id="shop-burst"></div>
            <div class="checkmark-circle" style="margin-bottom:0;">
                <svg class="checkmark-svg" viewBox="0 0 52 52">
                    <circle class="checkmark-circle-svg" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark-check-svg" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
            </div>
            <h2 style="font-size:26px;color:#d4af37;margin-top:16px;margin-bottom:6px;">Item Purchased!</h2>
            <p style="color:#9ca3af;font-size:14px;margin-bottom:20px;">Your reward has been added to your inventory.</p>
            ${newBalance !== undefined ? `<div style="margin-bottom:24px;font-size:16px;color:#e5e7eb;">New Balance: <strong style="color:#d4af37;">${newBalance} 🪙</strong></div>` : ''}
            <button onclick="closePurchaseModal()" style="background:#d4af37;color:#0c0c0c;border:none;padding:12px 32px;font-size:15px;font-weight:700;border-radius:30px;cursor:pointer;box-shadow:0 4px 15px rgba(212,175,55,0.3);transition:all 0.3s;">Awesome!</button>
        </div>
        <div class="confetti-container" id="shop-confetti"></div>
    `;
    document.body.appendChild(overlay);

    const colors = ['#d4af37','#e4c252','#3b82f6','#22c55e','#ec4899','#f97316','#a855f7'];
    const confettiContainer = document.getElementById('shop-confetti');
    for (let i = 0; i < 70; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 1.2 + 's';
        piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        confettiContainer.appendChild(piece);
    }
}

function showErrorModal(message) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:10000;display:flex;justify-content:center;align-items:center;animation:overlayFadeIn 0.3s ease;';
    overlay.innerHTML = `
        <div style="background:#171717;border:2px solid #ef4444;border-radius:16px;padding:40px 30px;text-align:center;max-width:420px;width:90%;box-shadow:0 0 25px rgba(239,68,68,0.2);animation:modalScaleUp 0.4s cubic-bezier(0.34,1.56,0.64,1);">
            <div style="font-size:52px;margin-bottom:12px;">❌</div>
            <h2 style="color:#ef4444;font-size:22px;margin-bottom:10px;">Purchase Failed</h2>
            <p style="color:#9ca3af;font-size:14px;margin-bottom:24px;">${message}</p>
            <button onclick="this.closest('#shop-error-overlay').remove()" style="background:#ef4444;color:white;border:none;padding:10px 28px;border-radius:30px;font-weight:700;cursor:pointer;">Got it</button>
        </div>
    `;
    overlay.id = 'shop-error-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function closePurchaseModal() {
    const overlay = document.getElementById('shop-purchase-overlay');
    if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.remove(); window.location.reload(); }, 300);
    }
}

async function submitQuestRequest(event) {
    event.preventDefault();
    const title = document.getElementById('questTitle').value;
    const description = document.getElementById('questDescription').value;

    try {
        const response = await fetch('/api/quests/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });
        const result = await response.json();
        if (result.success) {
            alert('Quest request submitted successfully! Pending admin approval.');
            window.location.reload();
        } else {
            alert(result.error || 'Failed to submit quest request');
        }
    } catch (err) {
        console.error(err);
        alert('Server error while submitting request');
    }
}

function closeQuestModal() {
    const overlay = document.getElementById('quest-completion-overlay');
    if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// Confetti generator if notification overlay is present
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('quest-completion-overlay');
    if (overlay) {
        const container = overlay.querySelector('.confetti-container');
        if (container) {
            const colors = ['#d4af37', '#e4c252', '#3b82f6', '#22c55e', '#ec4899', '#f97316'];
            for (let i = 0; i < 60; i++) {
                const piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.style.left = Math.random() * 100 + '%';
                piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                piece.style.animationDelay = Math.random() * 1.5 + 's';
                piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
                container.appendChild(piece);
            }
        }
    }
});

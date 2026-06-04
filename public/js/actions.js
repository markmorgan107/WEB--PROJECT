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
    // Scroll to proof submission instead of calling obsolete direct complete endpoint
    scrollToProof(questId);
}

function scrollToProof(questId) {
    const select = document.getElementById('questId');
    if (select) {
        select.value = questId;
    }
    // Find the proof submission section header or form
    const form = document.querySelector('form[action="/api/quests/submit-proof"]');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function buyItem(itemId) {
    try {
        const response = await fetch(`/api/shop/buy/${itemId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.success) {
            alert('Item purchased successfully!');
            window.location.reload();
        } else {
            alert(result.error || 'Failed to buy item');
        }
    } catch (err) {
        console.error(err);
        alert('Server error while purchasing item');
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

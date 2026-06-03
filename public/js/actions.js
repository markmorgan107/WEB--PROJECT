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
    try {
        const response = await fetch(`/api/quests/${questId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.success) {
            alert(`Quest Completed! Earned ${result.xpEarned} XP and ${result.coinsEarned} Coins.`);
            window.location.reload();
        } else {
            alert(result.error || 'Failed to complete quest');
        }
    } catch (err) {
        console.error(err);
        alert('Server error while completing quest');
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

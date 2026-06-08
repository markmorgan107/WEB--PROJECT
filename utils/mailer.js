const nodemailer = require('nodemailer');

// gmail smtp api (fallback for local development)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendNewQuestEmail(questDetails, userEmails) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey && (!emailUser || !emailPass)) {
        console.warn('Email sender not configured. Missing BREVO_API_KEY or (EMAIL_USER and EMAIL_PASS) in environment.');
        return;
    }

    if (!userEmails || userEmails.length === 0) {
        console.log('No user email addresses provided to notify.');
        return;
    }

    const { title, description, xpReward, coinsReward } = questDetails;
    // Clean up trailing slash if present to prevent double slashes like //quests
    const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');

    const mailSubject = `New Quest Available: ${title}! 🎯`;
    const mailText = `Hey hero!\n\nA new quest has just been posted on Level Up Life:\n\n✨ ${title} ✨\n${description || 'No description provided.'}\n\nRewards:\n📈 +${xpReward} XP\n🪙 +${coinsReward} Coins\n\nLog in now to accept the quest and level up your life!\n\nBest,\nLevel Up Life Team`;
    const mailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0c0c; color: #ffffff; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 2px solid #d4af37; box-shadow: 0 4px 15px rgba(212,175,55,0.15);">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://img.icons8.com/color/96/sword.png" alt="Level Up Life Logo" style="height: 64px; width: auto; margin-bottom: 10px;">
                <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">LEVEL UP LIFE</h1>
            </div>
            <div style="background-color: #171717; border-radius: 8px; padding: 24px; border-left: 4px solid #d4af37; margin-bottom: 25px;">
                <h2 style="color: #ffffff; margin-top: 0; font-size: 20px; font-weight: 600;">🎯 New Quest: ${title}</h2>
                <p style="color: #d1d5db; line-height: 1.6; font-size: 15px; margin-bottom: 20px;">
                    ${description || 'A new adventure awaits you on your path to self-improvement.'}
                </p>
                <div style="display: flex; gap: 15px; margin-top: 15px;">
                    <span style="background-color: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold;">+${xpReward} XP</span>
                    <span style="background-color: rgba(212, 175, 55, 0.15); color: #f59e0b; border: 1px solid rgba(212, 175, 55, 0.3); padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold;">+${coinsReward} Coins</span>
                </div>
            </div>
            <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
                <a href="${appUrl}/quests" style="background-color: #d4af37; color: #0c0c0c; text-decoration: none; padding: 12px 36px; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(212,175,55,0.3); transition: all 0.3s ease;">Accept Quest Now</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #262626; margin: 30px 0;">
            <div style="text-align: center; color: #737373; font-size: 12px; line-height: 1.5;">
                <p>You received this email because you are registered on Level Up Life.</p>
                <p>&copy; 2026 Level Up Life. All rights reserved.</p>
            </div>
        </div>
    `;

    // 1. If BREVO_API_KEY is available, use Brevo's HTTP API (prevents SMTP port blocking issues on cloud hosts)
    if (brevoApiKey) {
        console.log('Sending emails using Brevo HTTP API...');
        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': brevoApiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: "Level Up Life",
                        email: emailUser || "info@leveluplife.com"
                    },
                    to: [{
                        email: emailUser || "info@leveluplife.com",
                        name: "Level Up Life Admin"
                    }],
                    bcc: userEmails.map(email => ({ email })),
                    subject: mailSubject,
                    htmlContent: mailHtml,
                    textContent: mailText
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`New quest notification emails sent successfully via Brevo. Message ID: ${data.messageId || 'N/A'}`);
            } else {
                const errText = await response.text();
                console.error(`Brevo API returned error details: ${errText}`);
            }
        } catch (error) {
            console.error('Error sending new quest notification emails via Brevo API:', error);
        }
    } 
    // 2. Otherwise fall back to Gmail SMTP (Nodemailer)
    else {
        console.log('Sending emails using Nodemailer SMTP...');
        const mailOptions = {
            from: `"Level Up Life" <${emailUser}>`,
            to: emailUser,
            bcc: userEmails,
            subject: mailSubject,
            text: mailText,
            html: mailHtml
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`New quest notification emails sent successfully via Nodemailer. Message ID: ${info.messageId}`);
        } catch (error) {
            console.error('Error sending new quest notification emails via Nodemailer:', error);
        }
    }
}

module.exports = {
    sendNewQuestEmail
};
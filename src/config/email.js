/**
 * Email Configuration
 * Handles email sending using Nodemailer
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    });

    console.log('✓ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send bug assignment notification
 */
async function sendBugAssignmentEmail(bug, developer) {
  const subject = `Bug Assigned: ${bug.title}`;
  const html = `
    <h2>New Bug Assigned to You</h2>
    <p><strong>Bug ID:</strong> ${bug.id}</p>
    <p><strong>Title:</strong> ${bug.title}</p>
    <p><strong>Priority:</strong> ${bug.priority}</p>
    <p><strong>Severity:</strong> ${bug.severity}</p>
    <p><strong>Description:</strong></p>
    <p>${bug.description}</p>
    <p>Please review and update the status accordingly.</p>
  `;

  return sendEmail({ to: developer.email, subject, html });
}

/**
 * Send bug status update notification
 */
async function sendBugStatusUpdateEmail(bug, reporter) {
  const subject = `Bug Status Updated: ${bug.title}`;
  const html = `
    <h2>Your Bug Has Been Updated</h2>
    <p><strong>Bug ID:</strong> ${bug.id}</p>
    <p><strong>Title:</strong> ${bug.title}</p>
    <p><strong>New Status:</strong> ${bug.status}</p>
    <p>Thank you for reporting this issue.</p>
  `;

  return sendEmail({ to: reporter.email, subject, html });
}

module.exports = {
  sendEmail,
  sendBugAssignmentEmail,
  sendBugStatusUpdateEmail
};

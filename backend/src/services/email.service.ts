import nodemailer from 'nodemailer';
import { config } from '../config';

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass
  }
});

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html
}: SendEmailParams) => {
  try {
    const info = await transporter.sendMail({
      from: `"SynergyHub" <${config.smtp.user}>`,
      to,
      subject,
      text,
      html
    });

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Template for task assignment notification
export const sendTaskAssignmentEmail = async (
  to: string,
  taskTitle: string,
  projectName: string,
  assignerName: string
) => {
  const subject = `New Task Assignment: ${taskTitle}`;
  const html = `
    <h2>You have been assigned a new task</h2>
    <p>Hello,</p>
    <p>You have been assigned a new task by ${assignerName}:</p>
    <div style="margin: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
      <h3>${taskTitle}</h3>
      <p>Project: ${projectName}</p>
    </div>
    <p>Please log in to SynergyHub to view the task details and get started.</p>
    <p>Best regards,<br>SynergyHub Team</p>
  `;

  return sendEmail({ to, subject, html });
};
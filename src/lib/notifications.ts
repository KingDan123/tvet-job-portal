/**
 * Notification Service
 * Email and SMS notifications for all workflows
 */

export interface NotificationTemplate {
  subject: string;
  body: string;
}

export const EMAIL_TEMPLATES = {
  // Trainee notifications
  TRAINEE_REGISTERED: {
    subject: 'Welcome to TVET Hub!',
    body: 'Thank you for registering. Complete your profile to start receiving job matches.',
  },
  APPLICATION_RECEIVED: {
    subject: 'Application Received',
    body: 'Your application has been received. The employer will review it soon.',
  },
  APPLICATION_SHORTLISTED: {
    subject: 'You\'ve been shortlisted!',
    body: 'Congratulations! An employer has shortlisted you for a position.',
  },
  REFERRAL_CREATED: {
    subject: 'Job Referral from ILJC Office',
    body: 'Your employment officer has referred you for a job opportunity.',
  },
  TRAINING_INVITATION: {
    subject: 'Pre-Employment Training Invitation',
    body: 'You are invited to attend a training session to improve your employability.',
  },
  PLACEMENT_FOLLOWUP: {
    subject: 'Employment Follow-up Survey',
    body: 'How is your new job going? Please take a moment to share your experience.',
  },

  // Company notifications
  COMPANY_VERIFIED: {
    subject: 'Company Account Verified',
    body: 'Your company account has been verified. You can now post jobs and access candidates.',
  },
  COMPANY_REJECTED: {
    subject: 'Company Verification Status',
    body: 'We were unable to verify your company account. Please contact support.',
  },
  NEW_APPLICATION: {
    subject: 'New Job Application Received',
    body: 'A qualified candidate has applied to your job posting.',
  },
  SUBSCRIPTION_EXPIRING: {
    subject: 'Subscription Expiring Soon',
    body: 'Your subscription will expire in 7 days. Renew now to continue accessing premium features.',
  },
  PAYMENT_SUCCESS: {
    subject: 'Payment Successful',
    body: 'Your payment has been processed successfully. Thank you for upgrading!',
  },

  // Officer notifications
  REFERRAL_ACKNOWLEDGED: {
    subject: 'Employer Acknowledged Referral',
    body: 'An employer has acknowledged your referral letter.',
  },
  FOLLOWUP_DUE: {
    subject: 'Follow-up Due Reminder',
    body: 'You have placement follow-ups due for completion.',
  },
};

export const SMS_TEMPLATES = {
  APPLICATION_STATUS: (status: string) =>
    `TVET Hub: Your application status has been updated to ${status}.`,
  
  TRAINING_REMINDER: (date: string, location: string) =>
    `TVET Hub: Training session reminder - ${date} at ${location}. Please attend.`,
  
  INTERVIEW_SCHEDULED: (company: string, date: string) =>
    `TVET Hub: Interview scheduled with ${company} on ${date}. Good luck!`,
  
  PLACEMENT_CONFIRMED: (company: string) =>
    `TVET Hub: Congratulations! Your placement at ${company} has been confirmed.`,
};

/**
 * Send email notification (placeholder - integrate with Resend/SES)
 */
export async function sendEmail(
  to: string,
  template: NotificationTemplate,
  variables?: Record<string, string>
) {
  console.log('📧 Email notification:', { to, subject: template.subject });
  
  // TODO: Implement actual email sending
  // Example with Resend:
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'TVET Hub <noreply@tvethub.et>',
  //   to,
  //   subject: template.subject,
  //   html: renderTemplate(template.body, variables),
  // });
  
  return { success: true, message: 'Email queued' };
}

/**
 * Send SMS notification (placeholder - integrate with Afro Message/AfricasTalking)
 */
export async function sendSMS(
  to: string,
  message: string
) {
  console.log('📱 SMS notification:', { to, message: message.substring(0, 50) });
  
  // TODO: Implement actual SMS sending
  // Example with AfricasTalking:
  // const AfricasTalking = require('africastalking');
  // const sms = AfricasTalking({
  //   apiKey: process.env.AFRICASTALKING_API_KEY,
  //   username: process.env.AFRICASTALKING_USERNAME,
  // }).SMS;
  // await sms.send({
  //   to: [to],
  //   message,
  // });
  
  return { success: true, message: 'SMS queued' };
}

/**
 * Send in-app notification (store in database)
 */
export async function sendInAppNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  console.log('🔔 In-app notification:', { userId, title });
  
  // TODO: Store in notifications table
  // await db.insert(notifications).values({
  //   userId,
  //   title,
  //   message,
  //   link,
  //   read: false,
  // });
  
  return { success: true };
}

/**
 * Notify trainee about application status change
 */
export async function notifyApplicationStatus(
  traineeEmail: string,
  traineePhone: string | null,
  status: string,
  jobTitle: string
) {
  await sendEmail(traineeEmail, {
    subject: `Application Status: ${status}`,
    body: `Your application for "${jobTitle}" has been updated to ${status}.`,
  });

  if (traineePhone && ['shortlisted', 'hired'].includes(status)) {
    await sendSMS(traineePhone, SMS_TEMPLATES.APPLICATION_STATUS(status));
  }
}

/**
 * Notify company about new application
 */
export async function notifyNewApplication(
  companyEmail: string,
  jobTitle: string,
  traineeName: string
) {
  await sendEmail(companyEmail, {
    subject: `New Application for ${jobTitle}`,
    body: `${traineeName} has applied for your "${jobTitle}" position. Review the application in your dashboard.`,
  });
}

/**
 * Notify trainee about training session
 */
export async function notifyTrainingInvitation(
  traineeEmail: string,
  traineePhone: string | null,
  sessionTitle: string,
  sessionDate: Date,
  location: string
) {
  await sendEmail(traineeEmail, {
    subject: `Training Invitation: ${sessionTitle}`,
    body: `You are invited to attend "${sessionTitle}" on ${sessionDate.toLocaleDateString()} at ${location}.`,
  });

  if (traineePhone) {
    await sendSMS(
      traineePhone,
      SMS_TEMPLATES.TRAINING_REMINDER(sessionDate.toLocaleDateString(), location)
    );
  }
}

/**
 * Notify company about verification status
 */
export async function notifyCompanyVerification(
  companyEmail: string,
  approved: boolean
) {
  const template = approved ? EMAIL_TEMPLATES.COMPANY_VERIFIED : EMAIL_TEMPLATES.COMPANY_REJECTED;
  await sendEmail(companyEmail, template);
}

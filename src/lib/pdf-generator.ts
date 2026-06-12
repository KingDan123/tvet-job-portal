/**
 * PDF Generation Utilities
 * Generates referral letters and reports with multi-language support
 */

import jsPDF from 'jspdf';

interface ReferralLetterData {
  referralId: string;
  date: Date;
  trainee: {
    fullName: string;
    program: string;
    level: number;
    graduationYear: number;
    studentId?: string;
  };
  job: {
    titleEn: string;
    company: {
      name: string;
      address?: string;
    };
  };
  officer: {
    name: string;
    title: string;
  };
  institution: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export function generateReferralLetter(data: ReferralLetterData): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.institution.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (data.institution.address) {
    doc.text(data.institution.address, 105, 27, { align: 'center' });
  }
  if (data.institution.phone) {
    doc.text(`Tel: ${data.institution.phone}`, 105, 32, { align: 'center' });
  }
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 38, 190, 38);
  
  // Reference number and date
  doc.setFontSize(10);
  doc.text(`Ref: ILJC/${data.referralId.slice(0, 8)}`, 20, 48);
  doc.text(`Date: ${data.date.toLocaleDateString('en-GB')}`, 150, 48);
  
  // Recipient
  doc.setFont('helvetica', 'bold');
  doc.text('To:', 20, 58);
  doc.setFont('helvetica', 'normal');
  doc.text(data.job.company.name, 20, 64);
  if (data.job.company.address) {
    doc.text(data.job.company.address, 20, 70);
  }
  
  // Subject
  doc.setFont('helvetica', 'bold');
  doc.text('Subject: Graduate Referral for Employment', 20, 82);
  
  // Salutation
  doc.setFont('helvetica', 'normal');
  doc.text('Dear Sir/Madam,', 20, 92);
  
  // Body
  const bodyText = [
    `We are pleased to refer ${data.trainee.fullName}, a graduate from our institution,`,
    `for the position of ${data.job.titleEn} at your esteemed organization.`,
    '',
    `Graduate Details:`,
    `  • Name: ${data.trainee.fullName}`,
    `  • Program: ${data.trainee.program}`,
    `  • Level: Level ${data.trainee.level}`,
    `  • Graduation Year: ${data.trainee.graduationYear}`,
    data.trainee.studentId ? `  • Student ID: ${data.trainee.studentId}` : '',
    '',
    `${data.trainee.fullName} has successfully completed the required TVET training program`,
    `and has demonstrated competency in the relevant skills. We believe this candidate`,
    `would be a valuable addition to your organization.`,
    '',
    `The candidate has undergone pre-employment training including soft skills development,`,
    `workplace ethics, and technical skill reinforcement. We are confident in recommending`,
    `this graduate for employment consideration.`,
    '',
    `Should you require any additional information or verification, please do not hesitate`,
    `to contact our Industry Linkage and Job Creation (ILJC) office.`,
  ].filter(line => line !== null);
  
  let yPos = 102;
  bodyText.forEach(line => {
    if (line.startsWith('  •')) {
      doc.text(line, 25, yPos);
    } else {
      doc.text(line, 20, yPos);
    }
    yPos += 5;
  });
  
  // Closing
  yPos += 5;
  doc.text('Sincerely,', 20, yPos);
  
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text(data.officer.name, 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.officer.title, 20, yPos + 5);
  doc.text('Industry Linkage & Job Creation Office', 20, yPos + 10);
  doc.text(data.institution.name, 20, yPos + 15);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    'This is an official referral letter from TVET Institution - OP-GWPTC-ILJC-002',
    105,
    280,
    { align: 'center' }
  );
  
  return doc;
}

export function generateAttendanceSheet(sessionData: {
  title: string;
  date: Date;
  location: string;
  trainees: Array<{ fullName: string; studentId?: string; program: string }>;
}): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Training Session Attendance Register', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Session: ${sessionData.title}`, 20, 35);
  doc.text(`Date: ${sessionData.date.toLocaleDateString()}`, 20, 42);
  doc.text(`Location: ${sessionData.location}`, 20, 49);
  
  // Table headers
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  const headers = ['#', 'Student ID', 'Full Name', 'Program', 'Signature'];
  const colWidths = [10, 30, 60, 50, 40];
  let xPos = 20;
  const yStart = 60;
  
  headers.forEach((header, i) => {
    doc.text(header, xPos, yStart);
    xPos += colWidths[i];
  });
  
  // Line under headers
  doc.line(20, yStart + 2, 190, yStart + 2);
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  let yPos = yStart + 8;
  
  sessionData.trainees.forEach((trainee, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text((index + 1).toString(), 20, yPos);
    doc.text(trainee.studentId || 'N/A', 30, yPos);
    doc.text(trainee.fullName.substring(0, 30), 60, yPos);
    doc.text(trainee.program.substring(0, 25), 120, yPos);
    
    // Signature line
    doc.line(170, yPos, 210, yPos);
    
    yPos += 7;
  });
  
  return doc;
}

export function generatePlacementReport(data: {
  title: string;
  period: { start: Date; end: Date };
  placements: Array<{
    traineeName: string;
    program: string;
    companyName: string;
    position: string;
    placedDate: Date;
  }>;
  stats: {
    totalPlacements: number;
    placementRate: number;
    byField: Record<string, number>;
  };
}): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.title, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Period: ${data.period.start.toLocaleDateString()} - ${data.period.end.toLocaleDateString()}`,
    105,
    28,
    { align: 'center' }
  );
  
  // Summary statistics
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 20, 40);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Placements: ${data.stats.totalPlacements}`, 20, 48);
  doc.text(`Placement Rate: ${data.stats.placementRate}%`, 20, 54);
  
  // By field breakdown
  doc.setFont('helvetica', 'bold');
  doc.text('Placements by Field of Study:', 20, 64);
  doc.setFont('helvetica', 'normal');
  
  let yPos = 70;
  Object.entries(data.stats.byField).forEach(([field, count]) => {
    doc.text(`  • ${field}: ${count}`, 25, yPos);
    yPos += 6;
  });
  
  // Placements list
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Placement List', 20, yPos);
  
  yPos += 8;
  data.placements.forEach((placement, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${placement.traineeName}`, 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Program: ${placement.program}`, 25, yPos + 5);
    doc.text(`Company: ${placement.companyName}`, 25, yPos + 10);
    doc.text(`Position: ${placement.position}`, 25, yPos + 15);
    doc.text(`Date: ${placement.placedDate.toLocaleDateString()}`, 25, yPos + 20);
    
    yPos += 28;
  });
  
  return doc;
}

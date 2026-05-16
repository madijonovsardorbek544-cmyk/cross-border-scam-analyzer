import type { CheckInput } from '../types';

export interface DemoMessage {
  id: string;
  label: string;
  description: string;
  input: CheckInput;
}

export const demoMessages: DemoMessage[] = [
  {
    id: 'bank-card-phishing',
    label: 'Bank/card phishing',
    description: 'Synthetic demo: account threat, card lock, click pressure, and identity verification request.',
    input: {
      message: 'Synthetic demo sample: We detected unauthorized login activity on your account. Your card is temporarily locked. Click here immediately to verify your identity.',
      language: 'English',
      countryRegion: 'Synthetic demo student region',
      destinationCountry: 'United States',
      platform: 'SMS',
      context: 'payment',
      claimedAuthority: 'Bank Security Team',
      senderDomainOrLink: '',
    },
  },
  {
    id: 'scholarship-fee',
    label: 'Scholarship fee scam',
    description: 'Synthetic demo: guaranteed award that asks for a processing fee.',
    input: {
      message: 'Synthetic demo example: Congratulations, you are selected for the Global Merit Scholarship. To secure your guaranteed award today, pay a $420 processing and legalization fee by wire transfer to our regional coordinator. Send your passport page and bank statement before midnight or the scholarship will be reassigned.',
      language: 'English',
      countryRegion: 'Synthetic demo student region',
      destinationCountry: 'United States',
      platform: 'email',
      context: 'scholarship',
      claimedAuthority: 'Global Merit Scholarship Office',
      senderDomainOrLink: 'global-merit-scholarship.example.com',
    },
  },
  {
    id: 'visa-threat',
    label: 'Visa appointment threat',
    description: 'Synthetic demo: urgent visa cancellation language and unofficial payment.',
    input: {
      message: 'Synthetic demo example: Final visa appointment warning. Your student visa slot will be cancelled in 2 hours unless you confirm through this WhatsApp officer and pay the emergency embassy scheduling fee by gift card. Send your passport number, date of birth, and login code now.',
      language: 'English',
      countryRegion: 'Synthetic demo student region',
      destinationCountry: 'Canada',
      platform: 'WhatsApp',
      context: 'visa',
      claimedAuthority: 'Visa Appointment Unit',
      senderDomainOrLink: 'wa.me/example-visa-officer',
    },
  },
  {
    id: 'housing-crypto',
    label: 'Housing crypto deposit',
    description: 'Synthetic demo: scarce student room, crypto deposit, no official lease.',
    input: {
      message: 'Synthetic demo example: International student room near campus available today only. Many applicants are waiting. Deposit 900 USDT to reserve before arrival. No viewing needed. Send passport photo and exact arrival address after payment.',
      language: 'English',
      countryRegion: 'Synthetic demo student region',
      destinationCountry: 'United Kingdom',
      platform: 'Telegram',
      context: 'housing',
      claimedAuthority: 'Campus Housing Partner',
      senderDomainOrLink: 't.me/student_room_helper',
    },
  },
  {
    id: 'test-score-upgrade',
    label: 'IELTS/SAT score upgrade',
    description: 'Synthetic demo: impossible test score change through chat.',
    input: {
      message: 'Synthetic demo example: We can upgrade IELTS or SAT score in official database within 24 hours. 100% guaranteed admission support. Pay half by Bitcoin now and send your candidate login, password, and test registration number.',
      language: 'English',
      countryRegion: 'Synthetic demo student region',
      destinationCountry: 'Australia',
      platform: 'Instagram',
      context: 'test registration',
      claimedAuthority: 'Official Testing Support Agent',
      senderDomainOrLink: 'score-upgrade.example.xyz',
    },
  },
  {
    id: 'fake-admission-portal',
    label: 'Fake admission portal',
    description: 'Synthetic demo: lookalike admissions link and document upload request.',
    input: {
      message: 'Synthetic demo example: Your admission is approved but incomplete. Use the new international portal at https://admissions-confirm.example.info to upload passport scan, bank statement, and pay the refundable enrollment fee today. Do not contact the university office because this is a private priority route.',
      language: 'English',
      countryRegion: 'Synthetic demo student region',
      destinationCountry: 'United States',
      platform: 'website',
      context: 'admission',
      claimedAuthority: 'International Admissions Portal',
      senderDomainOrLink: 'https://admissions-confirm.example.info',
    },
  },
];

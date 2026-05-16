export interface ResourcePack {
  id: string;
  title: string;
  whoItHelps: string[];
  commonScams: string[];
  officialVerificationSteps: string[];
  normalRequests: string[];
  suspiciousRequests: string[];
  safeScript: string;
  relatedCaseTags: string[];
  officialResourceIds: string[];
  lastReviewedDate: string;
  confidenceLevel: 'low' | 'medium' | 'high';
  sourceNotes: string;
  requiredInstitutionReview: boolean;
  counselorEscalationScript: string;
  parentFriendlyScript: string;
  studentFriendlyScript: string;
}

const baseResourcePacks: Array<Omit<ResourcePack, 'lastReviewedDate' | 'confidenceLevel' | 'sourceNotes' | 'requiredInstitutionReview' | 'counselorEscalationScript' | 'parentFriendlyScript' | 'studentFriendlyScript'>> = [
  {
    id: 'us-student-visa-safety',
    title: 'U.S. student visa safety pack',
    whoItHelps: ['F-1/J-1 applicants', 'parents', 'school DSOs', 'pre-arrival counselors'],
    commonScams: ['SEVIS/I-20 payment impersonation', 'fake embassy appointment threats', 'visa cancellation calls', 'courier clearance fees'],
    officialVerificationSteps: ['Use official .gov visa and SEVIS payment sites typed manually.', 'Ask the school DSO/admissions office to confirm I-20 or fee instructions.', 'Do not use payment links from chat apps.', 'Call official embassy or consulate numbers from the government website.'],
    normalRequests: ['Official SEVIS fee payment through the official payment site', 'Appointment scheduling through official visa systems', 'School communication from verified school domains'],
    suspiciousRequests: ['Gift cards, crypto, mobile money, or personal accounts', 'Threats of deportation before enrollment', 'Requests for OTPs, card details, or passport scans in chat', 'Pressure to pay within hours'],
    safeScript: 'I will verify this through my school DSO and the official U.S. government visa/SEVIS websites before taking action. Please provide an official case number I can confirm independently.',
    relatedCaseTags: ['visa', 'SEVIS', 'I-20', 'embassy', 'payment'],
    officialResourceIds: ['us-student-visa', 'us-sevis-fee'],
  },
  {
    id: 'canada-study-permit-safety',
    title: 'Canada study permit safety pack',
    whoItHelps: ['Canada study permit applicants', 'families', 'DLIs', 'agents'],
    commonScams: ['IRCC impersonation', 'study permit cancellation threats', 'fake biometrics appointments', 'DLI payment diversion'],
    officialVerificationSteps: ['Sign in from the official canada.ca website.', 'Confirm DLI status and school payment instructions independently.', 'Use official VAC/biometrics instructions only.', 'Ask the institution international office before paying urgent fees.'],
    normalRequests: ['Application updates inside official IRCC accounts', 'Biometrics requests visible in official application portals', 'Tuition deposits paid through verified school systems'],
    suspiciousRequests: ['WhatsApp officers demanding penalties', 'Personal-account transfers', 'Threats of blacklist or cancellation unless paid today', 'Requests to share login codes'],
    safeScript: 'I cannot verify study permit messages through chat. I will check my official IRCC account and contact my school international office using published contact details.',
    relatedCaseTags: ['IRCC', 'study permit', 'DLI', 'biometrics'],
    officialResourceIds: ['canada-study-permit', 'canada-ircc'],
  },
  {
    id: 'uk-student-visa-cas-safety',
    title: 'UK student visa/CAS safety pack',
    whoItHelps: ['UK-bound students', 'CAS teams', 'parents', 'education advisers'],
    commonScams: ['CAS cancellation threats', 'Home Office impersonation', 'fake priority appointment fees', 'tuition diversion'],
    officialVerificationSteps: ['Confirm CAS details through the university and official UKVI channels.', 'Type gov.uk addresses manually.', 'Validate payment instructions with the university finance office.', 'Escalate threats to the international student support team.'],
    normalRequests: ['CAS issuance through the sponsoring institution', 'Official UKVI application steps', 'University invoices from verified domains'],
    suspiciousRequests: ['Telegram agents offering guaranteed CAS', 'Payment to individual accounts', 'Threats of CAS cancellation by midnight', 'Requests for card CVV or OTP'],
    safeScript: 'I will verify CAS and visa instructions with my university sponsor and official gov.uk channels. I will not pay or send codes based on this message alone.',
    relatedCaseTags: ['UKVI', 'CAS', 'visa', 'tuition'],
    officialResourceIds: ['uk-student-visa', 'ukvi'],
  },
  {
    id: 'australia-student-visa-safety',
    title: 'Australia student visa safety pack',
    whoItHelps: ['Australia-bound students', 'COE holders', 'parents', 'student support staff'],
    commonScams: ['ImmiAccount impersonation', 'fake COE fees', 'visa refusal threats', 'OSHC/payment diversion'],
    officialVerificationSteps: ['Use official homeaffairs.gov.au and ImmiAccount entry points.', 'Confirm COE and payment requests with the institution.', 'Check provider payment pages from official school websites.', 'Do not respond to threatening calls with payments.'],
    normalRequests: ['Official ImmiAccount notifications', 'Institution-issued COE processes', 'Approved payment portals linked from institution websites'],
    suspiciousRequests: ['Urgent penalties through remittance services', 'Requests for visa numbers and passport scans over social media', 'Guaranteed approval claims', 'Unofficial “priority” fee demands'],
    safeScript: 'I will check my official ImmiAccount and contact my institution using published contact details before responding or paying.',
    relatedCaseTags: ['Australia', 'COE', 'ImmiAccount', 'visa'],
    officialResourceIds: ['australia-student-visa', 'home-affairs'],
  },
  {
    id: 'testing-safety',
    title: 'IELTS/TOEFL/SAT testing safety pack',
    whoItHelps: ['Test takers', 'parents', 'test-prep counselors', 'admissions teams'],
    commonScams: ['Score upgrade offers', 'leaked questions', 'proxy testing', 'fake registration receipts'],
    officialVerificationSteps: ['Register through the official testing provider or approved test center.', 'Verify receipts inside official candidate accounts.', 'Report score-change offers to the provider.', 'Ask admissions offices to confirm accepted testing channels.'],
    normalRequests: ['Official registration fees', 'Identity document checks at test centers', 'Score reports sent through official provider systems'],
    suspiciousRequests: ['Guaranteed band/score increases', 'Inside examiner contacts', 'Crypto or gift-card fees', 'Requests for login credentials'],
    safeScript: 'I only register and check scores through official testing-provider accounts. I will not pay anyone offering score changes or leaked materials.',
    relatedCaseTags: ['IELTS', 'TOEFL', 'SAT', 'test score'],
    officialResourceIds: ['ielts', 'ets-toefl', 'college-board-sat'],
  },
  {
    id: 'housing-deposit-safety',
    title: 'Housing deposit safety pack',
    whoItHelps: ['Incoming students', 'parents', 'housing offices', 'off-campus housing advisers'],
    commonScams: ['Fake landlord deposits', 'no-inspection rooms', 'passport-photo demands', 'scarcity pressure'],
    officialVerificationSteps: ['Use official campus housing pages or vetted housing lists.', 'Confirm landlord identity and address before paying.', 'Avoid deposits before lease review or virtual/live viewing.', 'Use reversible and documented payment methods.'],
    normalRequests: ['Lease review', 'standard refundable deposit terms', 'official residence portal payments', 'documented landlord contact details'],
    suspiciousRequests: ['Crypto deposits', 'inspection only after arrival', 'last-room pressure', 'passport scans before lease review'],
    safeScript: 'I will verify the property, lease, and payment method with the housing office or a trusted adviser before sending a deposit.',
    relatedCaseTags: ['housing', 'deposit', 'landlord', 'lease'],
    officialResourceIds: ['campus-housing-office'],
  },
  {
    id: 'scholarship-fee-safety',
    title: 'Scholarship fee safety pack',
    whoItHelps: ['Scholarship applicants', 'families', 'financial-aid counselors', 'recruitment teams'],
    commonScams: ['Fake processing fees', 'guaranteed awards', 'refund advance scams', 'fake scholarship committees'],
    officialVerificationSteps: ['Confirm award details through official school or scholarship websites.', 'Check whether fees are normal before applying.', 'Ask financial aid offices to verify messages.', 'Do not pay to unlock a scholarship.'],
    normalRequests: ['Applications through official portals', 'documented eligibility forms', 'published deadlines', 'official award letters'],
    suspiciousRequests: ['Full scholarship guaranteed after a fee', 'Payment by mobile money or gift card', 'Generic “dear applicant” messages', 'Requests to send bank/card details'],
    safeScript: 'I will verify scholarship instructions through the official financial-aid or scholarship office before paying any fee or sending documents.',
    relatedCaseTags: ['scholarship', 'fee', 'financial aid'],
    officialResourceIds: ['university-financial-aid'],
  },
  {
    id: 'education-agent-verification',
    title: 'Education-agent verification safety pack',
    whoItHelps: ['Students using agents', 'parents', 'schools managing agent networks', 'counselors'],
    commonScams: ['Unauthorized agent claims', 'guaranteed admission', 'fake portal access', 'document withholding'],
    officialVerificationSteps: ['Check whether the agent is listed by the institution.', 'Ask the institution to confirm any agent payment process.', 'Keep copies of all documents and receipts.', 'Use official admissions portals for final status checks.'],
    normalRequests: ['Transparent service agreements', 'official institution application portals', 'receipts from registered businesses', 'clear refund terms'],
    suspiciousRequests: ['Guaranteed visa/admission', 'requests for portal passwords', 'payments to personal accounts', 'refusal to provide official receipts'],
    safeScript: 'Before continuing, I will ask the university to confirm whether this agent and payment request are authorized. I will not share portal passwords or one-time codes.',
    relatedCaseTags: ['education agent', 'admission', 'portal', 'guarantee'],
    officialResourceIds: ['institution-agent-list', 'admissions-office'],
  },
];

const defaultReviewFields = {
  lastReviewedDate: '2026-05-15',
  confidenceLevel: 'medium' as const,
  requiredInstitutionReview: true,
  counselorEscalationScript: 'I am reviewing a student message that may involve this process. Please verify the official payment, document, or portal instructions using institution-owned contacts before the student responds.',
  parentFriendlyScript: 'We are going to pause and verify this through the school or government website we type ourselves. Please do not send money, codes, or documents until an official contact confirms it.',
  studentFriendlyScript: 'Pause, save the message, and ask your counselor or international office to verify it through an official website or published contact before you click, pay, or send documents.',
};

export const resourcePacks: ResourcePack[] = baseResourcePacks.map((pack) => ({
  ...pack,
  ...defaultReviewFields,
  sourceNotes: `${pack.title} uses general safety guidance and placeholder official-resource IDs. Replace or confirm all links and scripts with institution-approved sources before a pilot.`,
}));

export function packsForText(text: string, tags: string[] = []): ResourcePack[] {
  const haystack = `${text} ${tags.join(' ')}`.toLowerCase();
  return resourcePacks.filter((pack) => [...pack.relatedCaseTags, pack.title].some((term) => haystack.includes(term.toLowerCase()))).slice(0, 3);
}

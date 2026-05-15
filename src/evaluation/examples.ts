import type { CheckInput, Platform, ContextType, RiskLevel } from '../types';

export interface EvaluationExample {
  id: string;
  message: string;
  context: ContextType;
  platform: Platform;
  expectedLevel: RiskLevel;
  expectedMinScore: number;
  expectedMaxScore?: number;
  expectedTactics: string[];
  category: string;
  notes: string;
}

const highGeneral: EvaluationExample[] = [
  ['We detected unauthorized login activity on your account. Your card is temporarily locked. Click here immediately to verify your identity.', 'payment', 'SMS', 'high', 55, undefined, ['Account security threat', 'Identity verification request', 'Click/action pressure', 'Urgency pressure', 'Financial account/card risk'], 'bank/card phishing', 'Exact regression sentence should remain high or critical.'],
  ['Final notice: your bank account will be closed today. Open link and confirm your account with card number and CVV.', 'payment', 'email', 'high', 55, undefined, ['Account security threat', 'Click/action pressure', 'Sensitive-data request'], 'bank/card phishing', 'Bank closure plus card details.'],
  ['Fraud department alert: unusual activity on your payment card. Verify now at secure-card-login.xyz to restore access.', 'payment', 'SMS', 'high', 55, undefined, ['Financial account/card risk', 'Suspicious link/domain', 'Click/action pressure'], 'bank/card phishing', 'Card fraud alert using suspicious domain.'],
  ['Your account has been suspended. Verify now to restore access or the account will be closed.', 'other', 'email', 'high', 52, undefined, ['Account security threat', 'Click/action pressure'], 'account lock phishing', 'Classic account suspension.'],
  ['Security team: suspicious login found. Send the OTP now to prevent account closure.', 'other', 'SMS', 'high', 55, undefined, ['Credential/OTP risk', 'Urgency pressure', 'Account security threat'], 'OTP stealing', 'OTP theft framed as security.'],
  ['Payment support: unauthorized transaction posted. Tap here immediately to confirm account and refund the charge.', 'payment', 'SMS', 'high', 55, undefined, ['Financial account/card risk', 'Click/action pressure', 'Urgency pressure'], 'bank/card phishing', 'Refund/charge phishing.'],
  ['Your card is suspended due to KYC failure. Follow this link today only to re-verify your account.', 'payment', 'SMS', 'high', 55, undefined, ['Financial account/card risk', 'Identity verification request', 'Click/action pressure'], 'bank/card phishing', 'KYC and card suspension.'],
  ['Customer support: password recovery required. Open link and enter login code before midnight.', 'other', 'email', 'high', 55, undefined, ['Credential/OTP risk', 'Click/action pressure', 'Urgency pressure'], 'account lock phishing', 'Credential theft.'],
  ['Your bank account frozen because of a failed transaction. Confirm your identity immediately at verify-bank.info.', 'payment', 'email', 'high', 55, undefined, ['Account security threat', 'Financial account/card risk', 'Suspicious link/domain'], 'bank/card phishing', 'Frozen account plus identity verification.'],
  ['Final notice from fraud department: verify your account now or payment method will be disabled.', 'payment', 'email', 'high', 55, undefined, ['Urgency pressure', 'Identity verification request', 'Brand or portal impersonation'], 'account lock phishing', 'Generic fraud department pressure.'],
  ['Your one-time code is required by the security team to stop unauthorized login. Send verification code now.', 'other', 'SMS', 'high', 55, undefined, ['Credential/OTP risk', 'Account security threat', 'Click/action pressure'], 'OTP stealing', 'Direct code request.'],
  ['Account department warning: payment card blocked. Click here to secure your account and confirm card details.', 'payment', 'email', 'high', 55, undefined, ['Financial account/card risk', 'Click/action pressure'], 'bank/card phishing', 'Card blocked plus details.'],
  ['Urgent: transaction refund pending. Provide password and PIN to customer support to release instant refund.', 'payment', 'WhatsApp', 'high', 55, undefined, ['Credential/OTP risk', 'Financial account/card risk', 'Urgency pressure'], 'OTP stealing', 'Credential request for refund.'],
  ['Your account restricted after unusual activity. Restore access through bit.ly/secure-login and complete security check.', 'other', 'SMS', 'high', 55, undefined, ['Account security threat', 'Suspicious link/domain', 'Identity verification request'], 'account lock phishing', 'Short-link account recovery.'],
  ['Fraud alert: unauthorized transaction. Send card number, CVV, and OTP now to reverse charge.', 'payment', 'SMS', 'high', 55, undefined, ['Financial account/card risk', 'Sensitive-data request', 'Credential/OTP risk'], 'bank/card phishing', 'Multiple high-value credentials requested.'],
].map((row, i) => ({ id: `general-high-${String(i + 1).padStart(2, '0')}`, message: row[0] as string, context: row[1] as ContextType, platform: row[2] as Platform, expectedLevel: row[3] as RiskLevel, expectedMinScore: row[4] as number, expectedMaxScore: row[5] as number | undefined, expectedTactics: row[6] as string[], category: row[7] as string, notes: row[8] as string }));

const highStudent: EvaluationExample[] = [
  ['IRCC visa officer urgent notice: pay processing fee in 2 hours via bit.ly/pay and send passport number.', 'visa', 'email', 'high', 55, undefined, ['Authority impersonation', 'Payment or fee request', 'Sensitive-data request'], 'visa appointment threat', 'Canada study permit impersonation.'],
  ['Embassy appointment cancelled unless you pay penalty today by Western Union and send passport scan.', 'visa', 'WhatsApp', 'high', 55, undefined, ['Deportation or visa threat', 'Unofficial payment method', 'Sensitive-data request'], 'visa appointment threat', 'Embassy threat plus remittance.'],
  ['Congratulations dear applicant, full scholarship guaranteed. Pay processing fee today by mobile money.', 'scholarship', 'WhatsApp', 'high', 51, undefined, ['Unrealistic guarantee', 'Payment or fee request', 'Unofficial payment method'], 'fake scholarship fee', 'Scholarship fee scam.'],
  ['Scholarship committee selected you for 100% award. Send bank statement and fee by wire transfer now.', 'scholarship', 'email', 'high', 55, undefined, ['Sensitive-data request', 'Crypto/gift card/wire transfer'], 'fake scholarship fee', 'Award plus wire.'],
  ['Last room near campus. Many applicants. Send passport photo and crypto deposit now, inspection after arrival.', 'housing', 'Instagram', 'high', 55, undefined, ['Housing scarcity pressure', 'Crypto/gift card/wire transfer', 'Sensitive-data request'], 'fake housing deposit', 'Housing scarcity scam.'],
  ['Reserve the room now; no inspection before arrival. Transfer deposit to personal account today.', 'housing', 'Telegram', 'high', 50, undefined, ['Housing scarcity pressure', 'Personal account payment', 'Payment or fee request'], 'fake housing deposit', 'No-inspection deposit.'],
  ['IELTS insider can upgrade your band score. Send passport and USDT for guaranteed score.', 'test registration', 'Telegram', 'high', 55, undefined, ['Test score upgrade claim', 'Sensitive-data request', 'Crypto/gift card/wire transfer'], 'fake test score upgrade', 'Score upgrade offer.'],
  ['TOEFL score change available through inside examiner. Pay crypto and share login code.', 'test registration', 'Telegram', 'high', 55, undefined, ['Test score upgrade claim', 'Credential/OTP risk', 'Crypto/gift card/wire transfer'], 'fake test score upgrade', 'Credential and crypto.'],
  ['Admissions-secure portal requires re-verify before midnight. Open portal-verify link or admission cancelled.', 'admission', 'email', 'high', 55, undefined, ['Suspicious link/domain', 'Identity verification request', 'Urgency pressure'], 'fake admission portal', 'Fake portal.'],
  ['University finance office: tuition deposit changed to regional account. Pay within 24 hours to keep I-20.', 'payment', 'email', 'high', 55, undefined, ['Authority impersonation', 'Personal account payment', 'Cross-border bureaucracy confusion'], 'fake admission portal', 'Payment diversion.'],
  ['Official agent guarantees admission and visa. Send transcript, passport, and service fee to my account.', 'education agent', 'WhatsApp', 'high', 44, undefined, ['Sensitive-data request', 'Payment or fee request'], 'education-agent fraud', 'Agent fraud.'],
  ['Approved agent says no interview required. Pay application fee by gift card for unconditional admission.', 'education agent', 'Instagram', 'high', 55, undefined, ['Unrealistic guarantee', 'Unofficial payment method', 'Payment or fee request'], 'education-agent fraud', 'Gift-card agent.'],
  ['Home Office warning: CAS cancelled unless you pay fine now and upload bank statement.', 'visa', 'SMS', 'high', 55, undefined, ['Deportation or visa threat', 'Payment or fee request', 'Sensitive-data request'], 'visa appointment threat', 'UK CAS threat.'],
  ['SEVIS support office: I-20 blocked. Click here immediately and pay courier clearance fee.', 'visa', 'SMS', 'high', 55, undefined, ['Cross-border bureaucracy confusion', 'Click/action pressure', 'Payment or fee request'], 'visa appointment threat', 'SEVIS/I-20 pressure.'],
  ['DLI international desk can secure study permit approval. Transfer agent fee by Wise today.', 'education agent', 'WhatsApp', 'high', 55, undefined, ['Unrealistic guarantee', 'Payment or fee request'], 'education-agent fraud', 'DLI agent promise.'],
].map((row, i) => ({ id: `student-high-${String(i + 1).padStart(2, '0')}`, message: row[0] as string, context: row[1] as ContextType, platform: row[2] as Platform, expectedLevel: row[3] as RiskLevel, expectedMinScore: row[4] as number, expectedMaxScore: row[5] as number | undefined, expectedTactics: row[6] as string[], category: row[7] as string, notes: row[8] as string }));

const lowLegit: EvaluationExample[] = [
  ['Reminder: orientation starts Monday. Please log into the official university portal using your usual bookmark for the schedule.', 'admission', 'email', 'low', 0, 54, [], 'legitimate university reminder', 'Normal orientation reminder.'],
  ['Your university orientation schedule is available in the official student portal.', 'admission', 'email', 'low', 0, 54, [], 'legitimate university reminder', 'Short normal reminder.'],
  ['Reminder: the scholarship application deadline is Friday. Log in through the official university website.', 'scholarship', 'email', 'low', 0, 54, [], 'legitimate scholarship deadline', 'Published deadline.'],
  ['Financial aid office reminder: submit your scholarship essay in the official portal by May 20.', 'scholarship', 'email', 'low', 0, 54, [], 'legitimate scholarship deadline', 'No fee.'],
  ['The housing office posted move-in dates on the official residence website.', 'housing', 'email', 'low', 0, 54, [], 'legitimate university reminder', 'Housing notice.'],
  ['Your tuition payment reminder is available in the student billing portal. Use your saved bookmark.', 'payment', 'email', 'medium', 0, 54, [], 'legitimate payment reminder', 'Payment topic can score medium but should not be high.'],
  ['International office reminder: bring printed copies of your admission letter to orientation check-in.', 'admission', 'email', 'low', 0, 54, [], 'legitimate university reminder', 'Document reminder without sharing.'],
  ['IELTS registration confirmation is available in your official candidate account.', 'test registration', 'email', 'low', 0, 54, [], 'legitimate university reminder', 'Testing confirmation.'],
  ['Visa advising webinar begins tomorrow; register from the link on the university international office page.', 'visa', 'email', 'low', 0, 54, [], 'legitimate university reminder', 'Advising webinar.'],
  ['Scholarship results will be posted in the official application portal next week.', 'scholarship', 'email', 'low', 0, 54, [], 'legitimate scholarship deadline', 'No payment or data request.'],
  ['Residence life reminder: review the official packing checklist before arrival.', 'housing', 'email', 'low', 0, 54, [], 'legitimate university reminder', 'Packing checklist.'],
  ['Please check your school email for updates about the campus health insurance information session.', 'other', 'email', 'low', 0, 54, [], 'legitimate university reminder', 'Generic normal update.'],
  ['The admissions office received your transcript and will update your application portal after review.', 'admission', 'email', 'low', 0, 54, [], 'legitimate university reminder', 'No urgent action.'],
  ['Your official SAT score report order receipt is available in your account.', 'test registration', 'email', 'low', 0, 54, [], 'legitimate payment reminder', 'Normal receipt wording.'],
  ['Payment plan installment reminder: review details in the official student accounts portal.', 'payment', 'email', 'medium', 0, 54, [], 'legitimate payment reminder', 'Normal payment reminder.'],
].map((row, i) => ({ id: `legit-low-${String(i + 1).padStart(2, '0')}`, message: row[0] as string, context: row[1] as ContextType, platform: row[2] as Platform, expectedLevel: row[3] as RiskLevel, expectedMinScore: row[4] as number, expectedMaxScore: row[5] as number | undefined, expectedTactics: row[6] as string[], category: row[7] as string, notes: row[8] as string }));

const borderline: EvaluationExample[] = [
  ['Hello student, the international desk needs you to review your admission status today.', 'admission', 'email', 'medium', 0, 54, ['Generic greeting'], 'borderline unclear message', 'Vague but no payment.'],
  ['Dear applicant, your housing deadline is soon. Contact the residence team if you still need a room.', 'housing', 'email', 'medium', 0, 54, ['Generic greeting'], 'borderline unclear message', 'Could be legitimate or vague.'],
  ['The scholarship office needs missing documents before the deadline. Use the official portal if you applied.', 'scholarship', 'email', 'medium', 0, 54, ['Vague institution'], 'borderline unclear message', 'Some vague authority.'],
  ['A visa support office says your biometrics appointment has an update; no payment requested.', 'visa', 'email', 'medium', 0, 54, ['Vague institution'], 'borderline unclear message', 'Cross-border terms but no pressure.'],
  ['Reminder from payment support: your invoice is ready in the portal.', 'payment', 'email', 'medium', 0, 54, ['Brand or portal impersonation'], 'borderline unclear message', 'Payment language from support.'],
  ['Education agent asks to discuss service agreement and application fee on WhatsApp.', 'education agent', 'WhatsApp', 'medium', 0, 54, ['Platform risk'], 'borderline unclear message', 'Agent channel needs verification.'],
  ['Student housing representative says many applicants are interested; confirm if you want to proceed.', 'housing', 'email', 'medium', 0, 54, ['Housing scarcity pressure'], 'borderline unclear message', 'Scarcity wording without direct payment.'],
  ['Admissions team asks you to verify account details in the official portal this week.', 'admission', 'email', 'medium', 0, 54, ['Identity verification request'], 'borderline unclear message', 'Verification but official portal.'],
  ['Finance office says tuition balance is posted and a receipt will be available after payment.', 'payment', 'email', 'medium', 0, 54, ['Payment or fee request'], 'borderline unclear message', 'Legit-like payment wording.'],
  ['Testing center says registration issue requires support review; do not reply with passwords.', 'test registration', 'email', 'medium', 0, 54, [], 'borderline unclear message', 'Support issue but safe instruction.'],
].map((row, i) => ({ id: `borderline-${String(i + 1).padStart(2, '0')}`, message: row[0] as string, context: row[1] as ContextType, platform: row[2] as Platform, expectedLevel: row[3] as RiskLevel, expectedMinScore: row[4] as number, expectedMaxScore: row[5] as number | undefined, expectedTactics: row[6] as string[], category: row[7] as string, notes: row[8] as string }));

const adversarial: EvaluationExample[] = [
  ['Your student file needs a quiet refresh tonight. Use admissions-secure.xyz and upload passport page so the seat is not lost.', 'admission', 'email', 'high', 50, undefined, ['Suspicious link/domain', 'Sensitive-data request'], 'fake admission portal', 'Avoids “scam” words but uses risky portal and passport.'],
  ['Small confirmation step for your card: share the six digit code with support so the recent charge can be paused.', 'payment', 'SMS', 'high', 33, undefined, ['Credential/OTP risk', 'Financial account/card risk'], 'OTP stealing', 'Soft language for OTP theft.'],
  ['Your CAS file has a courier clearance balance. The regional account holder can receive the transfer before close of business.', 'visa', 'WhatsApp', 'high', 55, undefined, ['Cross-border bureaucracy confusion', 'Personal account payment', 'Payment or fee request'], 'visa appointment threat', 'No obvious phishing keywords.'],
  ['A room can be kept for you if the holding amount arrives by coin wallet; viewing happens after arrival.', 'housing', 'Instagram', 'high', 28, undefined, ['Housing scarcity pressure', 'Unofficial payment method'], 'fake housing deposit', 'Crypto implied without common labels.'],
  ['Score review team can make your band more competitive after a service contribution; message the approved agent account.', 'test registration', 'Telegram', 'high', 41, undefined, ['Test score upgrade claim', 'Personal account payment'], 'fake test score upgrade', 'Euphemistic score upgrade.'],
].map((row, i) => ({ id: `adversarial-${String(i + 1).padStart(2, '0')}`, message: row[0] as string, context: row[1] as ContextType, platform: row[2] as Platform, expectedLevel: row[3] as RiskLevel, expectedMinScore: row[4] as number, expectedMaxScore: row[5] as number | undefined, expectedTactics: row[6] as string[], category: row[7] as string, notes: row[8] as string }));

export const evaluationExamples: EvaluationExample[] = [...highGeneral, ...highStudent, ...lowLegit, ...borderline, ...adversarial];

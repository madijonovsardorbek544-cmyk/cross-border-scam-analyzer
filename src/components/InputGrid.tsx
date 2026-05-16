import { contexts, languages, platforms } from '../data/appData';
import type { CheckInput, ContextType, Platform } from '../types';

export function InputGrid({ input, setInput }: { input: CheckInput; setInput: (input: CheckInput) => void }) {
  return (
    <div className="form-grid">
      <label>Language<select value={input.language} onChange={(e: { target: HTMLSelectElement }) => setInput({ ...input, language: e.target.value })}>{languages.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label>Student country/region<input value={input.countryRegion} maxLength={80} onChange={(e: { target: HTMLInputElement }) => setInput({ ...input, countryRegion: e.target.value })} placeholder="e.g., India, Nigeria, Vietnam, Brazil" /></label>
      <label>Destination country<input value={input.destinationCountry} maxLength={80} onChange={(e: { target: HTMLInputElement }) => setInput({ ...input, destinationCountry: e.target.value })} placeholder="e.g., United States, Canada, United Kingdom" /></label>
      <label>Platform<select value={input.platform} onChange={(e: { target: HTMLSelectElement }) => setInput({ ...input, platform: e.target.value as Platform })}>{platforms.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label>Context<select value={input.context} onChange={(e: { target: HTMLSelectElement }) => setInput({ ...input, context: e.target.value as ContextType })}>{contexts.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label>Claimed institution/authority<input value={input.claimedAuthority ?? ''} maxLength={120} onChange={(e: { target: HTMLInputElement }) => setInput({ ...input, claimedAuthority: e.target.value })} placeholder="Optional" /></label>
      <label>Sender domain or link<input value={input.senderDomainOrLink ?? ''} maxLength={180} onChange={(e: { target: HTMLInputElement }) => setInput({ ...input, senderDomainOrLink: e.target.value })} placeholder="Optional" /></label>
    </div>
  );
}

function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
const REGION_PROFILES = {
  global: {
    authority: ["online service provider", "support team", "security team"],
    trigger: "Immediate action + account fear"
  },
  us: {
    authority: ["bank", "tech company", "delivery service"],
    trigger: "Account suspension / fraud alert"
  },
  eu: {
    authority: ["government", "tax office", "police"],
    trigger: "Legal consequences / fines"
  },
  asia: {
    authority: ["university", "exam board", "scholarship office"],
    trigger: "Academic penalties / enrollment risk"
  }
};
function analyzeText(text){
  const t = (text || "").trim();
  if(!t) return {score:0, level:"No input", color:"#b8c3e6", reasons:[], tips:[]};

  const lower = t.toLowerCase();

  const rules = [
    {name:"Urgency / pressure", weight:18, hit: /(urgent|immediately|asap|now|right away|act fast|last chance|within\s+\d+\s*(min|hour|day)s?)/i.test(lower)},
    {name:"Account threat / suspension", weight:18, hit: /(suspended|locked|disabled|terminated|permanent loss|deactivated|restricted)/i.test(lower)},
    {name:"Verification / login request", weight:18, hit: /(verify|confirm|re-?login|sign in|password|credentials|otp|code)/i.test(lower)},
    {name:"Money / fee / reward bait", weight:14, hit: /(fee|payment|transfer|refund|prize|winner|voucher|bonus|earn|crypto|bitcoin|wallet)/i.test(lower)},
    {name:"Authority impersonation", weight:14, hit: /(bank|government|tax|visa|immigration|university|scholarship|police|support team|security team)/i.test(lower)},
    {name:"Link-like patterns", weight:12, hit: /(http:\/\/|https:\/\/|www\.|bit\.ly|tinyurl|t\.me|wa\.me)/i.test(lower)},
    {name:"Generic greeting", weight:6, hit: /(dear user|dear customer|hello user|valued customer)/i.test(lower)},
    {name:"Poor specificity", weight:8, hit: !/(your name|first name|last name|account id|case id|ticket|reference)/i.test(lower)},
  ];

  let score = 0;
  const reasons = [];
  for(const r of rules){
    if(r.hit){ score += r.weight; reasons.push(r.name); }
  }

  // Extra: too-short + command style
  if(t.length < 80 && /(click|verify|confirm|send|pay)/i.test(lower)){
    score += 8;
    reasons.push("Short + command style");
  }

  score = clamp(score, 0, 100);

  let level, color;
  if(score >= 70){ level="High risk"; color="var(--bad)"; }
  else if(score >= 40){ level="Medium risk"; color="var(--warn)"; }
  else { level="Low risk"; color="var(--ok)"; }

  const tips = [
    "Do not click links. Open the official website/app yourself.",
    "Never share passwords, OTP codes, or recovery codes.",
    "Check sender address carefully (small spelling differences).",
    "If it claims a deadline, verify via official support channels.",
    "If money is involved, stop and confirm with a trusted person."
  ];

  return {score, level, color, reasons, tips};
}

function setMeter(score, color){
  const bar = document.querySelector("#meterBar");
  bar.style.width = `${score}%`;
  bar.style.background = color;
}

function escapeHTML(s){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function highlight(text){
  // Light highlight for common risky words
  const risky = [
    "urgent","immediately","asap","verify","confirm","password","otp","code","suspended","locked",
    "fee","payment","transfer","refund","prize","winner","voucher","bank","government","visa","immigration","scholarship"
  ];
  let out = escapeHTML(text);
  for(const w of risky){
    const re = new RegExp(`\\b(${w})\\b`, "gi");
    out = out.replace(re, `<mark>$1</mark>`);
  }
  return out;
}
function run(){
  const input = document.querySelector("#msg").value;
  const region = (document.querySelector("#region")?.value) || "global";
  const profile = REGION_PROFILES[region] || REGION_PROFILES.global;

  const res = analyzeText(input);

  // Add region lens: if text includes region-related authority words, boost score slightly
  const lower = (input||"").toLowerCase();
  const authorityHit = profile.authority.some(a => lower.includes(a.split(" ")[0]));
  if(authorityHit) {
    res.score = clamp(res.score + 6, 0, 100);
    res.reasons.push("Matches region-specific authority pattern");
  }

  // Recompute level based on final score
  if(res.score >= 70){ res.level="High risk"; res.color="var(--bad)"; }
  else if(res.score >= 40){ res.level="Medium risk"; res.color="var(--warn)"; }
  else { res.level="Low risk"; res.color="var(--ok)"; }

  document.querySelector("#riskLevel").textContent = res.level;
  document.querySelector("#riskScore").textContent = `${res.score}/100`;
  document.querySelector("#riskLevel").style.color = res.color;

  setMeter(res.score, res.color);

  // Region explanation box
  const reasonsEl = document.querySelector("#reasons");
  const regionExplain = `
    <div class="note">
      <strong>Cross-border lens:</strong> In this region, scammers often imitate <strong>${profile.authority.join(", ")}</strong>.
      The common trigger is: <strong>${profile.trigger}</strong>.
    </div>
    <hr>
  `;

  reasonsEl.innerHTML = regionExplain + (
    res.reasons.length
      ? `<ul class="list">${res.reasons.map(x=>`<li>${x}</li>`).join("")}</ul>`
      : `<p class="note">No obvious red flags detected. Still verify via official sources.</p>`
  );

  const tipsEl = document.querySelector("#tips");
  tipsEl.innerHTML = `<ul class="list">${res.tips.map(x=>`<li>${x}</li>`).join("")}</ul>`;

  const preview = document.querySelector("#preview");
  preview.innerHTML = input.trim()
    ? `<div class="result"><div class="row"><span class="tag">Highlighted preview</span><span class="tag">No data stored</span></div><hr>${highlight(input)}</div>`
    : "";

  document.querySelector("#resultBox").style.display = "block";
}
function clearAll(){
  document.querySelector("#msg").value = "";
  document.querySelector("#resultBox").style.display = "none";
  document.querySelector("#preview").innerHTML = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const reportBtn = document.querySelector("#reportBtn");
  if(reportBtn){
    reportBtn.addEventListener("click", () => {
      window.open("https://github.com/madijonovsardorbek544-cmyk/cross-border-scam-analyzer/issues/new?title=Scam%20Report&body=Paste%20the%20scam%20message%20here%20(without%20personal%20info).%0A%0ARegion:%20%0APlatform%20(email/sms/social):%20%0AWhy%20it%20felt%20suspicious:%20", "_blank");
    });
  }
  document.querySelector("#analyzeBtn").addEventListener("click", run);
  document.querySelector("#clearBtn").addEventListener("click", clearAll);
});

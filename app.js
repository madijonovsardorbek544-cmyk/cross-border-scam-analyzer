function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }

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
  const res = analyzeText(input);

  document.querySelector("#riskLevel").textContent = res.level;
  document.querySelector("#riskScore").textContent = `${res.score}/100`;
  document.querySelector("#riskLevel").style.color = res.color;

  setMeter(res.score, res.color);

  const reasonsEl = document.querySelector("#reasons");
  reasonsEl.innerHTML = res.reasons.length
    ? `<ul class="list">${res.reasons.map(x=>`<li>${x}</li>`).join("")}</ul>`
    : `<p class="note">No obvious red flags detected. Still be careful and verify via official sources.</p>`;

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
  document.querySelector("#analyzeBtn").addEventListener("click", run);
  document.querySelector("#clearBtn").addEventListener("click", clearAll);
});

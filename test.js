// 小型測試：直接從 index.html 取出計算核心來驗證（node test.js）
const fs = require("fs"), vm = require("vm"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const m = html.match(/<script id="core">([\s\S]*?)<\/script>/);
if (!m) { console.error("找不到 core script"); process.exit(1); }
const ctx = {}; vm.createContext(ctx); vm.runInContext(m[1] + "\nthis.EstateCore = EstateCore;", ctx);
const C = ctx.EstateCore;
let fail = 0;
const near = (a, b) => Math.abs(a - b) < 1e-6;
function check(name, got, want) {
  const ok = near(got, want); if (!ok) fail++;
  console.log((ok ? "PASS " : "FAIL ") + name + "：得 " + got + "，期望 " + want);
}
const fam = (re, cash, st, oth, ch, mi, yr) => ({ re, cash, st, pol: "0", oth, debt: "0", gift: "0", sp: "1", ch, mi, yr, pa: "0", dis: "0" });
let r = C.calcEstate(fam("6000", "1000", "3000", "0", "2", "0", "0"), false);
check("總額10,000 淨額", r.net, 7864); check("總額10,000 稅", r.tax, 898.55); check("總額10,000 預留", Math.round(r.reserve * 100) / 100, 1078.26);
r = C.calcEstate(fam("3000", "500", "1500", "0", "2", "0", "0"), false);
check("總額5,000 淨額", r.net, 2864); check("總額5,000 稅", r.tax, 286.4);
r = C.calcEstate(fam("3000", "500", "14000", "500", "3", "1", "8"), false);
check("總額18,000 淨額", r.net, 15360); check("總額18,000 稅", r.tax, 2228.85);
let g = C.calcGift("344", "1", "1", false, false);
check("贈與344 淨額", g.netEach, 100); check("贈與344 稅（淨額×10%）", g.taxEach, 10);
check("級距邊界 遺產稅@5621", C.estateTax(5621), 562.1); check("級距邊界 遺產稅@11242", C.estateTax(11242), 1405.25);
check("級距邊界 贈與稅@2811", C.giftTax(2811), 281.1); check("級距邊界 贈與稅@5621", C.giftTax(5621), 702.6);
const mr = C.calcEstate(fam("6000", "1000", "3000", "0", "2", "0", "0"), true);
check("媒體推估 免稅額", mr.exempt, 1487);
console.log(fail ? "\n有 " + fail + " 項失敗" : "\n全部通過");
process.exit(fail ? 1 : 0);

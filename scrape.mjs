import { chromium } from "playwright";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const BASE = "https://sites.google.com/junyiacademy.org/junior-en-qa";
const OUT_DIR = join(import.meta.dirname, "scraped");

// Root page + 57 grammar subpages
const PAGES = [
  { slug: "線上文法選擇練習", filename: "index" },
  { slug: "線上文法選擇練習/不定詞與v-ing", filename: "01-不定詞與v-ing" },
  { slug: "線上文法選擇練習/主詞語動詞一致", filename: "02-主詞語動詞一致" },
  { slug: "線上文法選擇練習/主詞語動詞一致-02", filename: "03-主詞語動詞一致-02" },
  { slug: "線上文法選擇練習/關係副詞", filename: "04-關係副詞" },
  { slug: "線上文法選擇練習/who-vs-whose", filename: "05-who-vs-whose" },
  { slug: "線上文法選擇練習/現在完成式-vs-過去式", filename: "06-現在完成式-vs-過去式" },
  { slug: "線上文法選擇練習/時態一致性", filename: "07-時態一致性" },
  { slug: "線上文法選擇練習/三單動詞變換", filename: "08-三單動詞變換" },
  { slug: "線上文法選擇練習/授與動詞-givesendbuy-與介係詞", filename: "09-授與動詞-givesendbuy-與介係詞" },
  { slug: "線上文法選擇練習/感官動詞", filename: "10-感官動詞" },
  { slug: "線上文法選擇練習/間接問句-名詞子句", filename: "11-間接問句-名詞子句" },
  { slug: "線上文法選擇練習/形容詞子句-關係代名詞", filename: "12-形容詞子句-關係代名詞" },
  { slug: "線上文法選擇練習/if-whether-引導的條件句", filename: "13-if-whether-引導的條件句" },
  { slug: "線上文法選擇練習/so-neither-的倒裝句", filename: "14-so-neither-的倒裝句" },
  { slug: "線上文法選擇練習/感官動詞的主動-v-ing-與被動-pp", filename: "15-感官動詞的主動-v-ing-與被動-pp" },
  { slug: "線上文法選擇練習/可數與不可數名詞", filename: "16-可數與不可數名詞" },
  { slug: "線上文法選擇練習/虛主詞-it-的用法", filename: "17-虛主詞-it-的用法" },
  { slug: "線上文法選擇練習/少數多數的修飾語", filename: "18-少數多數的修飾語" },
  { slug: "線上文法選擇練習/感官動詞與使役動詞", filename: "19-感官動詞與使役動詞" },
  { slug: "線上文法選擇練習/反身代名詞", filename: "20-反身代名詞" },
  { slug: "線上文法選擇練習/花費動詞主詞是人還是物", filename: "21-花費動詞主詞是人還是物" },
  { slug: "線上文法選擇練習/too-to-vs-so-that", filename: "22-too-to-vs-so-that" },
  { slug: "線上文法選擇練習/比較級-vs-最高級", filename: "23-比較級-vs-最高級" },
  { slug: "線上文法選擇練習/介係詞的時間空間用法", filename: "24-介係詞的時間空間用法" },
  { slug: "線上文法選擇練習/附和句-too-either-so-neither", filename: "25-附和句-too-either-so-neither" },
  { slug: "線上文法選擇練習/used-to-的用法", filename: "26-used-to-的用法" },
  { slug: "線上文法選擇練習/v-ing-當主詞", filename: "27-v-ing-當主詞" },
  { slug: "線上文法選擇練習/祈使句的結構", filename: "28-祈使句的結構" },
  { slug: "線上文法選擇練習/although-but-because-so", filename: "29-although-but-because-so" },
  { slug: "線上文法選擇練習/頻率副詞-always-usually-often-sometimes-seldom-never", filename: "30-頻率副詞" },
  { slug: "線上文法選擇練習/所有格代名詞", filename: "31-所有格代名詞" },
  { slug: "線上文法選擇練習/分詞句型-whilebeforeafter-v-ing", filename: "32-分詞句型-whilebeforeafter-v-ing" },
  { slug: "線上文法選擇練習/疑問詞-to-vr", filename: "33-疑問詞-to-vr" },
  { slug: "線上文法選擇練習/虛主詞與虛受格-it-的進階用法", filename: "34-虛主詞與虛受格-it-的進階用法" },
  { slug: "線上文法選擇練習/形容詞-or-副詞", filename: "35-形容詞-or-副詞" },
  { slug: "線上文法選擇練習/數詞的單位-ten-hundred-thousand-million-billion", filename: "36-數詞的單位" },
  { slug: "線上文法選擇練習/情態助動詞的推測-must-cant-may", filename: "37-情態助動詞的推測-must-cant-may" },
  { slug: "線上文法選擇練習/連接詞與副詞的區別-however-vs-therefore", filename: "38-連接詞與副詞的區別" },
  { slug: "線上文法選擇練習/集合名詞-people-family-class-team-police", filename: "39-集合名詞" },
  { slug: "線上文法選擇練習/enough-的位置-形容詞-vs-名詞", filename: "40-enough-的位置" },
  { slug: "線上文法選擇練習/驚嘆句結構-what-vs-how", filename: "41-驚嘆句結構-what-vs-how" },
  { slug: "線上文法選擇練習/both-all-each-every-的區別", filename: "42-both-all-each-every-的區別" },
  { slug: "線上文法選擇練習/疑問詞-else", filename: "43-疑問詞-else" },
  { slug: "線上文法選擇練習/let-help-make-的差異", filename: "44-let-help-make-的差異" },
  { slug: "線上文法選擇練習/go-v-ing-vs-go-to-v", filename: "45-go-v-ing-vs-go-to-v" },
  { slug: "線上文法選擇練習/stop-forget-remember-to-v-vs-v-ing", filename: "46-stop-forget-remember-to-v-vs-v-ing" },
  { slug: "線上文法選擇練習/否定的疑問句-dont-you", filename: "47-否定的疑問句-dont-you" },
  { slug: "線上文法選擇練習/所有的也-too-also-as-well", filename: "48-所有的也-too-also-as-well" },
  { slug: "線上文法選擇練習/do-does-did-的強調用法", filename: "49-do-does-did-的強調用法" },
  { slug: "線上文法選擇練習/other-another-others-the-others", filename: "50-other-another-others-the-others" },
  { slug: "線上文法選擇練習/介係詞在-之後-in-vs-after", filename: "51-介係詞在-之後-in-vs-after" },
  { slug: "線上文法選擇練習/lie-vs-lay", filename: "52-lie-vs-lay" },
  { slug: "線上文法選擇練習/所有的看-see-watch-look-read", filename: "53-所有的看-see-watch-look-read" },
  { slug: "線上文法選擇練習/建議要求命令動詞後的-should-vr", filename: "54-建議要求命令動詞後的-should-vr" },
  { slug: "線上文法選擇練習/no-matter-無論-的讓步子句", filename: "55-no-matter-無論-的讓步子句" },
];

async function scrape() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "zh-TW",
  });

  let success = 0;
  let failed = [];

  for (let i = 0; i < PAGES.length; i++) {
    const { slug, filename } = PAGES[i];
    const url = `${BASE}/${encodeURI(slug)}`;
    const progress = `[${i + 1}/${PAGES.length}]`;

    try {
      console.log(`${progress} Fetching: ${filename}`);
      const page = await context.newPage();

      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      // Extra wait for Google Sites JS rendering
      await page.waitForTimeout(2000);

      const html = await page.content();
      await writeFile(join(OUT_DIR, `${filename}.html`), html, "utf-8");

      // Also save as MHTML for a self-contained archive
      const cdp = await context.newCDPSession(page);
      const { data: mhtml } = await cdp.send("Page.captureSnapshot", {
        format: "mhtml",
      });
      await writeFile(join(OUT_DIR, `${filename}.mhtml`), mhtml, "utf-8");
      await cdp.detach();

      await page.close();
      success++;
      console.log(`  ✓ Saved ${filename}.html + .mhtml`);
    } catch (err) {
      failed.push({ filename, error: err.message });
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  await browser.close();

  console.log(`\nDone! ${success}/${PAGES.length} pages saved.`);
  if (failed.length > 0) {
    console.log("Failed pages:");
    failed.forEach((f) => console.log(`  - ${f.filename}: ${f.error}`));
  }
}

scrape();

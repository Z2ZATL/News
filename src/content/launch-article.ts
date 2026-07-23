import type { Article } from "@/lib/content-types";

export const launchArticle: Article = {
  slug: "okmd-ai-playground-review",
  title: {
    th: "เจาะ OKMD AI Playground แพลตฟอร์ม AI ภาครัฐใช้งานจริงได้แค่ไหน?",
    en: "More than another chatbot? Inside Thailand’s OKMD AI Playground",
  },
  excerpt: {
    th: "ลองใช้หน้าเว็บ แกะเอกสาร API และไล่ดูงบ 28.355 ล้านบาท เพื่อหาว่าแพลตฟอร์ม AI ภาครัฐนี้ช่วยใครได้จริง และยังติดอยู่ตรงไหน",
    en: "We tested the interface, examined its API, and traced the THB 28.355 million programme behind it to see who this public AI platform really helps—and where it still falls short.",
  },
  cover: {
    src: "/images/okmd-ai-playground.png",
    alt: {
      th: "ภาพนำเสนอบทวิเคราะห์ OKMD AI Playground",
      en: "Cover image for the OKMD AI Playground analysis",
    },
  },
  category: { th: "AI ภาครัฐ", en: "Public AI" },
  author: {
    name: "MORI",
    role: { th: "ผู้ก่อตั้ง Z2Zs Labs", en: "Founder, Z2Zs Labs" },
  },
  tags: ["OKMD", "AI Thailand", "Developer Tools", "Public Technology"],
  featured: true,
  publishedAt: "2026-07-23T12:00:00.000Z",
  updatedAt: "2026-07-23T12:00:00.000Z",
  readingMinutes: 9,
  sources: [
    {
      label: { th: "เอกสาร API ของ OKMD AI Playground", en: "OKMD AI Playground API documentation" },
      url: "https://playground.okmd.or.th/docs/api",
    },
    {
      label: { th: "รายงานผลการดำเนินงาน OKMD ปี 2567", en: "OKMD 2024 performance report" },
      url: "https://www.okmd.or.th/upload/pdf/2567/PDF/O8-OKMD-Report-67.pdf",
    },
    {
      label: { th: "ประกาศเปิดตัวจาก TK Park", en: "TK Park launch announcement" },
      url: "https://mytk.tkpark.or.th/News/NewsInformation?id=296",
    },
  ],
  body: {
    th: [
      {
        paragraphs: [
          "หมายเหตุ: บทความนี้เขียนจากการลองใช้หน้าเว็บด้วยตัวเอง ประกอบกับเอกสาร API และข้อมูลโครงการที่เผยแพร่ต่อสาธารณะ ส่วนไหนเป็นสิ่งที่พบจากการทดสอบ ส่วนไหนเป็นข้อเสนอ จะระบุแยกไว้ให้ชัด",
          "OKMD AI Playground เป็นบริการของสำนักงานบริหารและพัฒนาองค์ความรู้ (องค์การมหาชน) หรือ OKMD ซึ่งอยู่ภายใต้สำนักนายกรัฐมนตรี สมาชิก TK Park สามารถคุยกับ AI หลายค่ายได้จากหน้าเดียว มีโควตาแยกตามผู้ให้บริการ และมีผู้ช่วยเฉพาะงานที่เรียกว่า CustomSphere",
          "หน้าที่ผมลองมีทั้ง DeepThink, Web Dev และ Apps Script Helper สำหรับช่วยวางโครงสร้าง Google Sheets กับเขียน Google Apps Script จุดนี้เหมาะกับคนที่อยากเริ่มใช้ AI แต่ไม่อยากสมัครและจ่ายค่าบริการหลายแห่งพร้อมกัน",
        ],
      },
      {
        heading: "โครงการนี้ทำขึ้นมาเพื่ออะไร",
        paragraphs: [
          "เอกสารของ OKMD วาง AI Playground ไว้ในโครงการ “มหานครแห่งการเรียนรู้ผ่าน AI” เป้าหมายใหญ่ไม่ใช่การสร้างเครื่องมือเขียนโค้ด แต่เป็นการทำให้คนทั่วไปเข้าถึงความรู้ดิจิทัลได้ง่ายขึ้น โครงการยังครอบคลุม Knowledge Portal, Knowledge Map, พอดแคสต์ เวิร์กช็อป AI Literacy Bootcamp และ Hackathon",
          "เพราะฉะนั้น ถ้าจะตัดสินว่าแพลตฟอร์มนี้ดีหรือไม่ ควรเริ่มจากบทบาทของพื้นที่เรียนรู้สาธารณะ ไม่ใช่เอาไปเทียบกับ Coding Agent เต็มรูปแบบทันที อย่างไรก็ตาม เมื่อในหน้าเว็บมีคำว่า Web Dev และมีผู้ช่วยเขียนโค้ด ความคาดหวังของผู้ใช้ก็ย่อมขยับจาก “ถามแล้วตอบ” ไปสู่ “ช่วยทำงานให้เสร็จ”",
        ],
      },
      {
        heading: "1. หน้าเว็บยังค้นข้อมูลสดไม่ได้",
        paragraphs: [
          "จากการทดสอบของผม หน้าแชตยังไม่มีเครื่องมือค้นเว็บหรือดึงข้อมูลภายนอกมาอ้างอิงให้เห็นอย่างชัดเจน เราจึงรู้ได้ยากว่าคำตอบมาจากความรู้เดิมของโมเดล ข้อมูลล่าสุด หรือการคาดเดา ข้อนี้เป็นข้อจำกัดของหน้าเว็บที่ผมเห็น ไม่ใช่ข้อสรุปว่า API ทุกส่วนทำไม่ได้",
          "สำหรับบริการความรู้ของรัฐ เรื่องนี้สำคัญเป็นพิเศษ ผมอยากเห็นสวิตช์ค้นเว็บที่ผู้ใช้เลือกเปิดได้ มีลิงก์อ้างอิงอยู่ข้างข้อความ และบอกตรง ๆ เมื่อคำตอบไม่ได้ใช้ข้อมูลสด หากเชื่อมคลังของ OKMD, TK Park หรือหน่วยงานรัฐได้ด้วย ก็จะทำให้แพลตฟอร์มมีจุดแข็งที่บริการแชตทั่วไปเลียนแบบได้ยาก",
        ],
      },
      {
        heading: "2. โค้ดที่ได้ยังต้องประกอบเอง",
        paragraphs: [
          "ผู้ช่วยเขียนโค้ดมีประโยชน์ แต่คำตอบแบบ snippet หรือฟังก์ชันสั้น ๆ ยังไม่พอสำหรับคนที่อยากนำไปใช้ทันที โดยเฉพาะ Google Apps Script ที่ต้องรู้ทั้งโครงสร้างชีต สิทธิ์ การตั้ง Trigger และขั้นตอนติดตั้ง หากให้มาไม่ครบ โค้ดอาจดูถูกต้องในแชต แต่พอวางลงโปรเจกต์จริงกลับรันไม่ได้",
        ],
        bullets: [
          "บอกชื่อชีต คอลัมน์ และชนิดข้อมูลให้ครบ",
          "ให้ Apps Script เต็มไฟล์ พร้อมวิธีนำไปติดตั้ง",
          "มีข้อมูลตัวอย่าง วิธีตั้ง Trigger และกรณีทดสอบ",
          "บอกข้อผิดพลาดที่มักพบ พร้อมแนวทางแก้",
          "มีพื้นที่ทดลอง หรือส่งออกโปรเจกต์เพื่อนำไปทำต่อ",
        ],
      },
      {
        heading: "3. คำว่า Web Dev อาจทำให้คาดหวังเกินความสามารถจริง",
        paragraphs: [
          "ปุ่ม Web Dev ที่ผมเห็นเป็นโหมดช่วยตอบคำถามด้านการพัฒนาเว็บ แต่ยังไม่ใช่ Developer Agent ที่เข้าไปอ่านโปรเจกต์ แก้ไฟล์ รันคำสั่ง ตรวจข้อผิดพลาด และทดสอบงานให้เราได้ คำสองคำนี้ใกล้กันในสายตาผู้ใช้ แต่ประสบการณ์ใช้งานต่างกันมาก",
          "ระยะต่อไปอาจเริ่มจาก workspace สำหรับโค้ดหรือ sandbox ที่จำกัดสิทธิ์อย่างรัดกุม แล้วค่อยเพิ่มการเชื่อม GitHub หรือ GitLab แบบขออนุญาตเป็นรายครั้ง ทุกการกระทำควรมีบันทึก และผู้ใช้ต้องเห็นชัดว่า AI กำลังอ่านหรือแก้อะไรอยู่",
        ],
      },
      {
        heading: "4. จุดแข็งที่ไม่ควรมองข้าม: มี API ให้ใช้",
        paragraphs: [
          "จุดนี้สำคัญและต้องแก้ความเข้าใจจากรีวิวฉบับแรกของผม: OKMD AI Playground มี API และใช้รูปแบบที่เข้ากันได้กับ OpenAI ผู้ใช้เปลี่ยน base URL แล้วนำไปต่อกับ OpenAI SDK หรือโปรแกรมที่รองรับรูปแบบเดียวกันได้ จึงไม่ได้เป็นเพียงเว็บรวมช่องแชต นักพัฒนาสามารถพาโมเดลไปใช้กับ CLI, IDE หรือขั้นตอนทำงานของตัวเองได้ ภายใต้โควตารายวันของระบบ",
          "เอกสารระบุโมเดลจาก OpenAI, Claude, Gemini, DeepSeek, Qwen, Meta, Mistral, Nova และ Perplexity แต่คำว่า OpenAI-compatible ในระดับ Chat Completions ไม่ได้แปลว่า tool calling, structured outputs, ภาพ หรือ streaming จะทำงานเหมือนกันทุกโมเดล ผมจึงอยากเห็นตารางที่ทดสอบความเข้ากันได้จริง พร้อมตัวอย่างคำสั่งของแต่ละรุ่น",
        ],
      },
      {
        heading: "ข้อเสนอที่อยากฝากไว้",
        paragraphs: [
          "อย่างแรกคือ Model Card ที่บอกชื่อรุ่น จุดเด่น งานที่เหมาะ ภาษาไทย โควตา และข้อจำกัดของ API แบบอ่านแล้วเลือกได้ทันที อย่างที่สองคือความสามารถของหน้าแชตควรแยกให้ชัดจากความสามารถที่เรียกผ่าน API เพื่อไม่ให้ผู้ใช้เข้าใจคลาดเคลื่อน",
          "ถ้าจะใช้ข้อได้เปรียบจากการมีหลายโมเดลให้คุ้ม ผมอยากเห็นโหมดที่ให้หลายโมเดลช่วยกันตรวจงาน เช่น ตัวหนึ่งวางแผน ตัวหนึ่งลงมือ และอีกตัวช่วยหาจุดผิด แทนที่จะให้ผู้ใช้เลือกชื่อโมเดลจากเมนูเพียงอย่างเดียว",
          "โดยรวม OKMD AI Playground เป็นจุดเริ่มต้นที่ดีสำหรับพื้นที่เรียนรู้ AI ของสาธารณะ และ API-compatible endpoint คือของสำคัญที่ควรสื่อสารให้เด่นกว่านี้ ส่วนที่ยังต้องพัฒนาคือคำตอบที่ตรวจสอบแหล่งที่มาได้ เครื่องมือที่บอกตรง ๆ ว่ากำลังทำอะไร และผลลัพธ์ที่ผู้ใช้นำไปทำงานต่อได้จริง",
          "ข้อมูลประกอบ: OKMD อยู่ภายใต้สำนักนายกรัฐมนตรี ส่วนโครงการ “มหานครแห่งการเรียนรู้ผ่าน AI” มีงบประมาณรวมในปี 2567–2568 จำนวน 28.355 ล้านบาท",
        ],
      },
    ],
    en: [
      {
        paragraphs: [
          "Note: This article reflects personal observations from the public website, project documents, and hands-on testing.",
          "OKMD AI Playground is operated by Thailand’s Office of Knowledge Management and Development (Public Organization), under the Office of the Prime Minister. It gives TK Park members access to multiple AI models, daily quotas, and specialist CustomSphere assistants through one interface.",
        ],
      },
      {
        heading: "The project’s purpose",
        paragraphs: [
          "OKMD positions the broader “Learning Metropolis through AI” initiative as public digital learning infrastructure. It connects knowledge portals and maps with podcasts, workshops, AI literacy bootcamps, and hackathons. The Playground should therefore be judged first as part of a lifelong-learning ecosystem—not as a full coding agent.",
        ],
      },
      {
        heading: "1. Tool calling and live sources",
        paragraphs: [
          "In the tested web interface, no visible tool-calling flow searched the web or attached external sources. That makes it difficult to distinguish model memory from current, verifiable information. A public knowledge service would benefit from opt-in web search, per-claim citations, freshness labels, and direct links into trusted OKMD and government collections.",
        ],
      },
      {
        heading: "2. Code should be runnable",
        paragraphs: [
          "Short snippets are not enough for real Google Apps Script work. Useful output should include the sheet schema, complete files, trigger setup, test data, expected errors, and a safe way to run or export the project.",
        ],
      },
      {
        heading: "3. Web Dev is not yet a developer agent",
        paragraphs: [
          "A Web Dev mode does not by itself provide a harness that can inspect a repository, edit files, run commands, execute tests, and verify results. Sandboxed workspaces and permissioned GitHub or GitLab connections could bridge that gap without giving an agent uncontrolled access.",
        ],
      },
      {
        heading: "4. The API is a real strength",
        paragraphs: [
          "OKMD exposes an OpenAI-compatible API, allowing developers to change the base URL and connect OpenAI SDK-compatible tools. This makes the platform more than a chat hub. Documentation lists models from OpenAI, Claude, Gemini, DeepSeek, Qwen, Meta, Mistral, Nova, and Perplexity.",
          "Chat-completions compatibility does not automatically guarantee identical support for tool calling, structured outputs, multimodal inputs, or streaming. A tested compatibility matrix for every model would make the API considerably easier to trust.",
        ],
      },
      {
        heading: "What should come next",
        paragraphs: [
          "Clear model cards, verifiable sources, transparent tool use, runnable code outputs, and outcome-based metrics would move the Playground from an AI hub toward a genuine learning and working environment.",
          "Supporting context: OKMD is under the Office of the Prime Minister, and the 2024–2025 budget for the “Learning Metropolis through AI” project totals THB 28.355 million.",
        ],
      },
    ],
  },
};

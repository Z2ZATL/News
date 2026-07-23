import type { Article } from "@/lib/content-types";

const author = {
  name: "Aitthikorn Khammee",
  role: { th: "ผู้เขียน Z2Zs Lab", en: "Writer, Z2Zs Lab" },
};

const cover = {
  src: "/images/z2zs-logo.png",
  alt: {
    th: "ตราสัญลักษณ์ Z2Zs Lab บนพื้นสีดำ",
    en: "Z2Zs Lab mark on a black background",
  },
};

export const facebookArticles: Article[] = [
  {
    slug: "gpt-5-6-luna-terra-sol",
    title: {
      th: "รู้จัก GPT-5.6 รุ่น Luna, Terra และ Sol ต่างกันอย่างไร",
      en: "GPT-5.6 Luna, Terra, and Sol explained",
    },
    excerpt: {
      th: "OpenAI แบ่ง GPT-5.6 เป็นสามระดับ ตั้งแต่งานที่ต้องการความเร็ว ไปจนถึงโจทย์ซับซ้อนที่ต้องใช้การให้เหตุผลเชิงลึก",
      en: "OpenAI splits GPT-5.6 into three tiers, ranging from fast everyday work to complex tasks that demand deeper reasoning.",
    },
    body: {
      th: [
        {
          paragraphs: [
            "หนึ่งในโมเดล AI รุ่นใหม่ที่น่าจับตาคือ GPT-5.6 ซึ่งไม่ได้มาเพียงรุ่นเดียว แต่แบ่งระดับการใช้งานเป็น Luna, Terra และ Sol เพื่อให้เลือกตามความยากของงาน ความเร็ว และต้นทุนได้ชัดเจนขึ้น",
            "แนวคิดนี้เปรียบได้กับการมี AI สามระดับ ตั้งแต่รุ่นเล็กที่เน้นความเร็ว ไปจนถึงรุ่นสูงสุดสำหรับงานคิดวิเคราะห์ซับซ้อน",
          ],
        },
        {
          heading: "Luna เร็วและคุ้มค่าสำหรับงานประจำ",
          paragraphs: [
            "Luna เป็นรุ่นเล็กของตระกูล เหมาะกับงานทั่วไปที่ต้องทำจำนวนมาก เช่น ตอบแชต สรุปเอกสาร จัดหมวดหมู่ข้อมูล หรือสร้างเนื้อหาเบื้องต้น",
            "จุดเด่นคือความเร็วและต้นทุนที่เข้าถึงง่าย จึงเหมาะกับ workflow ประจำวันหรือระบบที่มีผู้ใช้งานจำนวนมาก",
          ],
        },
        {
          heading: "Terra สมดุลสำหรับงานจริงจัง",
          paragraphs: [
            "Terra เป็นรุ่นกลางที่เน้นสมดุลระหว่างความสามารถ ราคา และความแม่นยำ เหมาะกับงานองค์กร งานเอกสารที่ต้องใช้เหตุผล งานวิเคราะห์ข้อมูล และการเขียนโค้ดระดับกลางถึงค่อนข้างซับซ้อน",
            "สำหรับทีมที่ต้องการโมเดลรอบด้าน ใช้กับงาน production ได้ และยังควบคุมต้นทุน Terra น่าจะเป็นตัวเลือกที่น่าสนใจที่สุด",
          ],
        },
        {
          heading: "Sol สำหรับโจทย์ที่ต้องใช้พลังคิดสูง",
          paragraphs: [
            "Sol เน้นการให้เหตุผลเชิงลึกและการแก้ปัญหาหลายขั้นตอน เหมาะกับงานวิจัย วิศวกรรม การวางแผนซับซ้อน การเขียนและตรวจสอบโค้ดระดับสูง รวมถึงงานด้านความปลอดภัยไซเบอร์",
            "ความน่าสนใจอยู่ที่การเปิดให้โมเดลใช้เวลาคิดกับโจทย์ยากมากขึ้น และแนวทางทำงานแบบเอเจนต์หลายตัวสำหรับงานขนาดใหญ่",
          ],
        },
        {
          heading: "เลือกจากงาน ไม่ใช่เลือกจากชื่อรุ่น",
          paragraphs: [
            "ข้อมูลที่เผยแพร่ในช่วงเปิดตัวระบุว่า GPT-5.6 เริ่มให้ใช้แบบจำกัดวงผ่าน API และ Codex ก่อน แล้วจึงทยอยขยายไปยัง ChatGPT และนักพัฒนา",
            "สิ่งที่ควรเตรียมจึงไม่ใช่การรีบเปลี่ยนโมเดล แต่คือการแยกให้ออกว่างานใดต้องการความเร็ว งานใดต้องการความแม่นยำ และงานใดคุ้มพอที่จะใช้โมเดลระดับสูง",
          ],
          bullets: [
            "งานตอบแชต สรุปข้อความ และงานซ้ำจำนวนมาก เหมาะกับ Luna",
            "งานเขียน โค้ด วิเคราะห์เอกสาร และงานองค์กร เหมาะกับ Terra",
            "งานวิจัย การวางแผนซับซ้อน และโจทย์หลายขั้นตอน เหมาะกับ Sol",
          ],
        },
      ],
      en: [
        {
          paragraphs: [
            "GPT-5.6 arrives as a family rather than a single model. Luna, Terra, and Sol target different balances of task complexity, speed, and cost.",
            "The idea is straightforward: use a fast compact model for routine work, a balanced model for production, and the highest tier when a problem genuinely needs deeper reasoning.",
          ],
        },
        {
          heading: "Luna for fast, repeatable work",
          paragraphs: [
            "Luna is positioned for high-volume everyday tasks such as chat replies, document summaries, classification, and first-draft content.",
            "Its appeal is speed and accessibility, particularly in routine workflows and products serving many users.",
          ],
        },
        {
          heading: "Terra for balanced production work",
          paragraphs: [
            "Terra balances capability, accuracy, and cost. It is aimed at organisational work, document reasoning, data analysis, and moderately complex coding.",
            "For many teams, it is likely to be the practical default when a model must be versatile enough for production without paying for the top tier on every request.",
          ],
        },
        {
          heading: "Sol for the hardest problems",
          paragraphs: [
            "Sol focuses on deeper reasoning and multi-step problem solving across research, engineering, complex planning, advanced coding, and cybersecurity.",
            "The more important shift is not simply a larger model, but a workflow designed to spend more effort on difficult problems and coordinate agent-like work at larger scale.",
          ],
        },
        {
          heading: "Choose for the task, not the badge",
          paragraphs: [
            "Early access was described as limited and centred on the API and Codex before broader availability.",
            "The practical lesson is to map each workflow first: routine volume goes to Luna, balanced production work to Terra, and genuinely difficult multi-step work to Sol.",
          ],
        },
      ],
    },
    cover,
    category: { th: "โมเดล AI", en: "AI Models" },
    author,
    tags: ["OpenAI", "GPT-5.6", "Luna", "Terra", "Sol"],
    sources: [
      {
        label: { th: "โพสต์ต้นฉบับบน Facebook", en: "Original Facebook post" },
        url: "https://www.facebook.com/atl.ztwoz/posts/pfbid05wAykGUNC1yUA1ayfu1P47BH6JeynRF3L55CCYjkfeETYzY8D6kgNdXFffQuWgGJl",
      },
    ],
    featured: false,
    publishedAt: "2026-07-10T13:27:00.000Z",
    updatedAt: "2026-07-10T13:27:00.000Z",
    readingMinutes: 4,
  },
  {
    slug: "chatgpt-gpt-live-voice-update",
    title: {
      th: "ChatGPT อัปเดต GPT-Live ให้สนทนาด้วยเสียงเป็นธรรมชาติมากขึ้น",
      en: "ChatGPT updates GPT-Live for more natural voice conversations",
    },
    excerpt: {
      th: "GPT-Live ปรับจังหวะการฟังและพูด ลดการตัดบท และช่วยให้ผู้ใช้แทรกหรือเปลี่ยนเรื่องระหว่างสนทนาได้ลื่นขึ้น",
      en: "GPT-Live improves turn-taking, interruptions, and background-noise handling to make voice conversations feel less mechanical.",
    },
    body: {
      th: [
        {
          paragraphs: [
            "ผู้ที่เคยใช้โหมดเสียงของ ChatGPT อาจพบว่าบางครั้งระบบรีบพูดแทรกหรือจังหวะสนทนายังดูเป็นหุ่นยนต์ OpenAI จึงอัปเดตระบบภายใต้ชื่อ GPT-Live เพื่อให้การคุยด้วยเสียงเป็นธรรมชาติ ฟังง่าย และตามบริบทได้ดีขึ้น",
          ],
        },
        {
          heading: "ฟังและพูดได้ต่อเนื่องกว่าเดิม",
          paragraphs: [
            "การเปลี่ยนแปลงสำคัญคือระบบสามารถรับฟังและตอบสนองได้ต่อเนื่องขึ้น แทนที่จะรอให้ผู้ใช้หยุดพูดอย่างชัดเจนทุกครั้ง ผู้ใช้จึงหยุดคิด พูดแทรก หรือเปลี่ยนเรื่องระหว่างสนทนาได้ลื่นกว่าเดิม และมีโอกาสถูกตัดบทกลางประโยคน้อยลง",
            "เสียงทั้ง 9 แบบของ ChatGPT ยังได้รับการปรับให้จับเสียงผู้ใช้ท่ามกลางเสียงรอบข้างได้ดีขึ้น และสนทนาต่อได้ระหว่างที่ระบบค้นข้อมูลหรือประมวลผลงานซับซ้อนอยู่เบื้องหลัง",
          ],
        },
        {
          heading: "ไม่ได้อัปเกรดเฉพาะเสียง",
          paragraphs: [
            "โหมดเสียงใหม่เชื่อมกับโมเดลเบื้องหลังสำหรับงานค้นหาและการให้เหตุผล จึงไม่ได้เพียงพูดลื่นขึ้น แต่ยังช่วยตอบคำถามที่ต้องคิดหรือค้นข้อมูลได้ดีขึ้นด้วย",
            "GPT-Live เริ่มทยอยเปิดให้ใช้บน iOS, Android และเว็บ โดยข้อมูลช่วงเปิดตัวระบุว่าผู้ใช้ฟรีจะได้ใช้ GPT-Live-1 mini ส่วนแพ็กเกจ Go, Plus และ Pro จะใช้ GPT-Live-1 เป็นค่าเริ่มต้น",
          ],
        },
        {
          heading: "จากผู้ช่วยรับคำสั่งสู่คู่สนทนา",
          paragraphs: [
            "ภาพรวมของการอัปเดตครั้งนี้คือ ChatGPT กำลังขยับจากระบบรับคำสั่งด้วยเสียง ไปสู่ผู้ช่วยที่รักษาจังหวะการสนทนาและทำงานเบื้องหลังไปพร้อมกันได้ใกล้เคียงการคุยกับคนมากขึ้น",
          ],
        },
      ],
      en: [
        {
          paragraphs: [
            "GPT-Live is an update intended to make ChatGPT voice conversations feel more natural, especially when users pause, interrupt, or change direction mid-sentence.",
          ],
        },
        {
          heading: "Smoother turn-taking",
          paragraphs: [
            "The system is designed to listen and respond more continuously instead of requiring a perfectly clean end to every turn. That should reduce premature interruptions and make it easier to pause, interject, or redirect a conversation.",
            "ChatGPT’s nine voices were also described as better at isolating the user’s voice from background noise while continuing the conversation as search or more complex processing runs behind the scenes.",
          ],
        },
        {
          heading: "More than a speech update",
          paragraphs: [
            "The voice layer connects to models used for search and reasoning, so the improvement is meant to cover both delivery and the quality of answers.",
            "The rollout began across iOS, Android, and the web, with a smaller GPT-Live-1 mini tier for free users and GPT-Live-1 positioned as the default for paid plans.",
          ],
        },
      ],
    },
    cover,
    category: { th: "Voice AI", en: "Voice AI" },
    author,
    tags: ["OpenAI", "ChatGPT", "GPT-Live", "Voice AI"],
    sources: [
      {
        label: { th: "รีลต้นฉบับบน Facebook", en: "Original Facebook reel" },
        url: "https://www.facebook.com/reel/2438812816625778/",
      },
    ],
    featured: false,
    publishedAt: "2026-07-11T08:14:00.000Z",
    updatedAt: "2026-07-11T08:14:00.000Z",
    readingMinutes: 3,
  },
  {
    slug: "kimi-k3-frontend-arena",
    title: {
      th: "Kimi K3 ขึ้นอันดับหนึ่งด้านการสร้างหน้าเว็บในการจัดอันดับ Arena AI",
      en: "Kimi K3 reaches the top of Arena AI’s frontend ranking",
    },
    excerpt: {
      th: "โมเดลจากจีนได้รับความสนใจจากคะแนนด้าน Frontend แต่ผลอันดับเฉพาะด้านยังไม่ใช่คำตอบว่าโมเดลใดเก่งที่สุดในทุกงาน",
      en: "The Chinese model drew attention for its frontend score, but a category ranking does not make it the best model for every task.",
    },
    body: {
      th: [
        {
          paragraphs: [
            "Kimi เปิดตัวโมเดล Kimi K3 และได้รับความสนใจหลังผลทดสอบจาก Arena AI ระบุว่าโมเดลขึ้นอันดับหนึ่งในหมวดการสร้างหน้าเว็บไซต์หรือ Frontend",
            "ในทางใช้งาน ผู้ใช้สามารถอธิบายหน้าเว็บที่ต้องการ เช่น ร้านกาแฟที่มีเมนูสินค้า ปุ่มสั่งซื้อ และโทนสีน้ำตาล แล้วให้โมเดลช่วยออกแบบและเขียนโค้ดตั้งต้นได้",
          ],
        },
        {
          heading: "ไม่ได้ทำได้เฉพาะหน้าเว็บ",
          paragraphs: [
            "Kimi K3 ยังถูกนำเสนอให้ช่วยเขียนโปรแกรม อ่านรูปภาพ วิเคราะห์ข้อมูล สรุปเอกสาร และทำงานหลายขั้นตอนต่อเนื่อง จึงมีโอกาสเป็นประโยชน์ต่อนักเรียน คนทำงาน เจ้าของธุรกิจ และผู้ที่ต้องการทดลองสร้างผลงานด้วย AI",
            "ผลอันดับที่ถูกเผยแพร่ระบุคะแนน 1,679 ในหมวด Frontend สูงกว่า Claude Fable 5 และ GPT-5.6 Sol อย่างไรก็ตาม นี่เป็นผลทดสอบเฉพาะด้าน ไม่ได้หมายความว่า Kimi K3 เก่งที่สุดในทุกประเภทงาน",
          ],
        },
        {
          heading: "ข้อจำกัดที่ต้องตรวจสอบก่อนใช้งานจริง",
          paragraphs: [
            "Kimi K3 ยังเป็นโมเดลใหม่ โค้ดที่ซับซ้อนอาจมีข้อผิดพลาด และคำสั่งที่ไม่ชัดเจนอาจทำให้ผลงานไม่ตรงความต้องการ ผู้ใช้จึงอาจต้องอธิบายรายละเอียดหรือสั่งแก้หลายรอบ",
            "ความสามารถบางส่วน เช่น การค้นข้อมูลจากอินเทอร์เน็ตหรือการทำงานผ่าน API อาจยังไม่เสถียรเท่าบริการที่เปิดมานาน นอกจากนี้ หน้าเว็บที่ดูสวยในครั้งแรกยังต้องตรวจการใช้งานบนมือถือ ความเร็ว ความปลอดภัย และความถูกต้องของข้อมูล",
          ],
        },
        {
          heading: "เหมาะกับใคร",
          paragraphs: [
            "โมเดลลักษณะนี้เหมาะกับผู้ที่ต้องการให้ AI ช่วยเริ่มต้นงานออกแบบเว็บไซต์หรือเขียนโปรแกรม แม้ยังไม่มีพื้นฐานโค้ด แต่ผลลัพธ์ควรถูกมองเป็นต้นแบบที่ต้องตรวจสอบและพัฒนาต่อ ไม่ใช่งาน production ที่พร้อมใช้ทันที",
          ],
        },
      ],
      en: [
        {
          paragraphs: [
            "Kimi K3 drew attention after Arena AI results placed it first in a frontend web-generation category. Users can describe a page and ask the model to produce an initial design and codebase.",
          ],
        },
        {
          heading: "Broader than frontend generation",
          paragraphs: [
            "The model is also presented as capable of programming, image understanding, data analysis, summarisation, and multi-step work.",
            "A reported score of 1,679 put it ahead of Claude Fable 5 and GPT-5.6 Sol in that frontend category. The result is still category-specific and should not be read as proof that Kimi K3 is the strongest model at every task.",
          ],
        },
        {
          heading: "Limits before production use",
          paragraphs: [
            "Complex code can still contain errors, vague instructions can produce the wrong interface, and users may need several rounds of refinement.",
            "A visually impressive first draft also needs mobile testing, performance work, security review, and factual verification before it is ready for real users.",
          ],
        },
      ],
    },
    cover,
    category: { th: "AI เขียนโค้ด", en: "Coding AI" },
    author,
    tags: ["Kimi", "Kimi K3", "Frontend", "Arena AI", "Coding AI"],
    sources: [
      {
        label: { th: "โพสต์ต้นฉบับบน Facebook", en: "Original Facebook post" },
        url: "https://www.facebook.com/atl.ztwoz/posts/pfbid0VGWDTj9YYdphF7mvinXFvnCwNZieaqBXE2Sy8KxEpYoVdPj9fDabemwWEuhqY21ml",
      },
      {
        label: { th: "หน้าทดลอง Kimi ที่แนบในโพสต์", en: "Kimi trial link shared in the post" },
        url: "https://kimi-bot.com/activities/viral-referral/share?scenario=invite&from=share_poster&invitation_code=LXNZX2",
      },
    ],
    featured: false,
    publishedAt: "2026-07-18T05:00:00.000Z",
    updatedAt: "2026-07-18T05:00:00.000Z",
    readingMinutes: 4,
  },
  {
    slug: "th-ai-passport-hands-on-review",
    title: {
      th: "ทดลอง TH AI Passport เมื่อชื่อโมเดลอย่างเดียวไม่บอกคุณภาพการใช้งาน",
      en: "Testing TH AI Passport: model names do not tell the whole story",
    },
    excerpt: {
      th: "ทดสอบการคิด เขียนเว็บ สร้างภาพ และวิดีโอ เพื่อดูว่าระบบรอบโมเดลส่งผลต่อคุณภาพงานจริงมากเพียงใด",
      en: "A hands-on test across reasoning, web development, image generation, and video shows why the system around a model matters.",
    },
    body: {
      th: [
        {
          paragraphs: [
            "ขอขอบคุณ Thanarat Kuawattanaphan สำหรับการเปิดสิทธิ์ให้ทดลอง TH AI Passport ข้อมูลในบทความนี้มาจากระบบช่วงทดสอบซึ่งยังไม่ใช่บริการฉบับเต็ม และควรประเมินอีกครั้งหลังเปิดอย่างเป็นทางการ",
            "การทดสอบครั้งนี้ไม่ได้หยุดที่การถามคำถามทั่วไป แต่เลือกงานที่ต้องใช้หลายความสามารถพร้อมกัน ทั้งการคิดวิเคราะห์ เขียนโปรแกรม สร้างภาพ และสร้างวิดีโอ เพื่อดูว่าระบบถูกเตรียมมาสำหรับงานขั้นสูงมากเพียงใด",
          ],
        },
        {
          heading: "โจทย์หนักคือเว็บจัดการการเงินสำหรับนักศึกษา",
          paragraphs: [
            "หนึ่งในการทดสอบที่ซับซ้อนที่สุดคือสั่งให้ Claude Opus 4.8 สร้างเว็บแอป React และ TypeScript ชื่อ UniWallet OS โดยกำหนดระบบรายรับรายจ่าย งบประมาณ เป้าหมายการออม รายงาน กราฟ การสำรองข้อมูล การรองรับมือถือ และความปลอดภัย",
          ],
        },
        {
          heading: "ด้านการคิดวิเคราะห์",
          paragraphs: [
            "Claude ทำได้ค่อนข้างดี สามารถพบเงื่อนไขที่ขัดแย้ง อธิบายเหตุผล และตอบตามรูปแบบที่กำหนดได้ อย่างไรก็ตาม ผู้ใช้ยังต้องตรวจรายละเอียด เพราะงานที่ยาวอาจมีเงื่อนไขตกหล่น",
          ],
        },
        {
          heading: "ด้านการเขียนเว็บ React",
          paragraphs: [
            "แม้เลือก Claude Opus 4.8 ผลลัพธ์ยังไม่เท่ากับการใช้ Claude ผ่านระบบหลักโดยตรง โมเดลวางแผนและสร้างโค้ดจำนวนมาก แต่ยังส่งมอบเว็บขนาดใหญ่ที่สมบูรณ์และทดสอบครบทุกฟังก์ชันไม่ได้",
            "สาเหตุอาจไม่ได้อยู่ที่โมเดลเพียงอย่างเดียว แต่เกี่ยวกับ harness หรือระบบที่ครอบโมเดล ทำหน้าที่ส่งคำสั่ง จัดการเครื่องมือ รันโค้ด สร้างไฟล์ และนำผลลัพธ์มาแสดง ชื่อโมเดลเดียวกันจึงไม่ได้รับประกันประสบการณ์ที่เหมือนกันในทุกแพลตฟอร์ม",
          ],
        },
        {
          heading: "ด้านภาพและวิดีโอ",
          paragraphs: [
            "ระบบสร้างภาพที่แสดงชื่อ GPT Image 2 ให้ผลค่อนข้างใกล้เคียงกับการใช้โมเดลโดยตรง ภาพถ่ายทอดหน้าตาและแนวคิดของโครงการได้ดี แม้ข้อความภาษาไทยบางส่วนยังผิดหรืออ่านไม่ชัด",
            "ส่วนวิดีโอเป็นข้อจำกัดที่ชัดที่สุด ในการทดสอบ ระบบมีเมนูและตัวเลือกโมเดล แต่ขึ้นข้อความว่าไม่สามารถส่งคำขอสร้างวิดีโอได้ จึงยังประเมินคุณภาพวิดีโอจริงไม่ได้",
          ],
        },
        {
          heading: "ข้อสรุปจากระบบช่วงทดสอบ",
          paragraphs: [
            "TH AI Passport มีประโยชน์ในฐานะพื้นที่ให้คนไทยเรียนรู้และทดลอง AI หลายรูปแบบ แต่สำหรับงานระดับสูง เช่น เว็บแอปขนาดใหญ่หรือวิดีโอพร้อมใช้ ยังไม่ควรคาดหวังว่าจะเสร็จสมบูรณ์จากคำสั่งเดียว",
            "AI ช่วยลดเวลา วางโครงสร้าง และสร้างต้นแบบได้ดี แต่คนยังต้องตรวจสอบ แก้ไข และพัฒนาต่อ โดยเฉพาะงานที่จะนำไปใช้จริง ผลการทดลองนี้เป็นประสบการณ์ในช่วงเวลาหนึ่งและระบบอาจได้รับการปรับปรุงภายหลัง",
          ],
        },
      ],
      en: [
        {
          paragraphs: [
            "This review is based on early access to a test version of TH AI Passport, provided with help from Thanarat Kuawattanaphan. It should be revisited when the full service launches.",
            "The test covered reasoning, programming, image generation, and video rather than simple chat prompts.",
          ],
        },
        {
          heading: "A demanding React application brief",
          paragraphs: [
            "Claude Opus 4.8 was asked to build UniWallet OS, a React and TypeScript finance application for students with budgeting, savings goals, reports, charts, backup, mobile support, and security requirements.",
          ],
        },
        {
          heading: "Reasoning and instruction following",
          paragraphs: [
            "The model identified conflicting constraints, explained its reasoning, and followed the requested structure reasonably well, although long tasks still required human checking for omissions.",
          ],
        },
        {
          heading: "Web development and the harness",
          paragraphs: [
            "The result did not match using Claude through its primary environment. It produced substantial planning and code but did not deliver a complete large application with every function tested.",
            "That gap may come from the harness around the model: the system responsible for tools, files, code execution, and presentation. The same model name can therefore deliver very different practical capability across platforms.",
          ],
        },
        {
          heading: "Images, video, and the practical limit",
          paragraphs: [
            "Image generation was comparatively close to the direct model experience, although Thai text in images remained unreliable. Video generation could not be evaluated because the request failed before output was produced.",
            "TH AI Passport is valuable as an AI learning and experimentation space, but complex applications and production-ready video still require human review and further development.",
          ],
        },
      ],
    },
    cover,
    category: { th: "AI ภาครัฐ", en: "Public AI" },
    author,
    tags: ["TH AI Passport", "DE", "Claude", "Harness", "AI Thailand"],
    sources: [
      {
        label: { th: "โพสต์ต้นฉบับบน Facebook", en: "Original Facebook post" },
        url: "https://www.facebook.com/atl.ztwoz/posts/pfbid02BbMB3JC4MG9JiHhCtcLWQNtEv2YtuPhGd5jbHKg2ybzo2n3gunmr9gxoTcgVMKoZl",
      },
    ],
    featured: false,
    publishedAt: "2026-07-18T05:00:00.000Z",
    updatedAt: "2026-07-18T05:00:00.000Z",
    readingMinutes: 6,
  },
  {
    slug: "google-weather-lab-weathernext-2",
    title: {
      th: "Google Weather Lab เปิดภาพอนาคตของพายุผ่านแบบจำลอง AI",
      en: "Google Weather Lab visualises possible storm futures with AI",
    },
    excerpt: {
      th: "Weather Lab แสดงเส้นทางพายุและความเป็นไปได้หลายรูปแบบจาก WeatherNext 2 แต่ยังเป็นระบบทดลอง ไม่ใช่คำเตือนภัยทางการ",
      en: "Weather Lab maps multiple storm scenarios from WeatherNext 2, but remains an experiment rather than an official warning service.",
    },
    body: {
      th: [
        {
          paragraphs: [
            "Google DeepMind เปิด Google Weather Lab ให้คนทั่วไปสำรวจการพยากรณ์อากาศจาก AI ผ่านแผนที่โลกที่แสดงเส้นทางพายุ ปริมาณฝน และความเปลี่ยนแปลงในแต่ละช่วงเวลา",
            "เครื่องมือนี้ทำให้ข้อมูลที่เดิมมักปรากฏเป็นข้อความหรือแผนภาพเฉพาะทาง มองเห็นเป็นภาพรวมที่เข้าใจได้ง่ายขึ้น และอาจเป็นจุดเริ่มต้นสำหรับนวัตกรรมด้านภัยพิบัติ การเกษตร การเดินทาง และโลจิสติกส์",
          ],
        },
        {
          heading: "WeatherNext 2 สร้างหลายอนาคตที่เป็นไปได้",
          paragraphs: [
            "เบื้องหลังเว็บไซต์คือ WeatherNext 2 ของ Google DeepMind ซึ่งเรียนรู้รูปแบบอากาศจากข้อมูลจำนวนมาก แล้วคำนวณสถานการณ์ที่อาจเกิดขึ้นในอนาคต",
            "เส้นสีน้ำเงินหลายเส้นไม่ได้หมายถึงพายุหลายลูก แต่แทนเส้นทางที่พายุลูกเดียวอาจเคลื่อนไปภายใต้สภาพอากาศแต่ละรูปแบบ ยิ่งเส้นกระจายมาก ความไม่แน่นอนของการคาดการณ์ก็ยิ่งสูง",
          ],
        },
        {
          heading: "จำลองพายุล่วงหน้าได้หลายรูปแบบ",
          paragraphs: [
            "สำหรับพายุหมุนเขตร้อน ระบบสามารถจำลองสถานการณ์ที่เป็นไปได้สูงสุดราว 50 รูปแบบ และคาดการณ์ล่วงหน้าได้ถึง 15 วัน โดยพิจารณาจุดก่อตัว เส้นทาง ความรุนแรง ขนาด และรูปร่างของพายุ",
            "ข้อมูลลักษณะนี้อาจช่วยให้นักพยากรณ์ หน่วยงานภัยพิบัติ เกษตรกร สายการบิน บริษัทขนส่ง และประชาชนเห็นทั้งเหตุการณ์ที่น่าจะเกิดขึ้นและทางเลือกอื่นที่ยังเป็นไปได้",
          ],
        },
        {
          heading: "ยังไม่ใช่ประกาศเตือนภัย",
          paragraphs: [
            "Google ระบุว่า Weather Lab ยังเป็นระบบทดลอง ผลลัพธ์ไม่ใช่คำเตือนภัยอย่างเป็นทางการและไม่ควรถูกใช้ตัดสินใจด้านความปลอดภัยเพียงแหล่งเดียว",
            "เมื่อเกิดพายุหรือสภาพอากาศรุนแรง ผู้ใช้ในประเทศไทยควรติดตามประกาศจากกรมอุตุนิยมวิทยาและหน่วยงานรัฐเป็นหลัก แล้วใช้ Weather Lab เป็นข้อมูลประกอบเพื่อทำความเข้าใจความเป็นไปได้ของสถานการณ์",
          ],
        },
      ],
      en: [
        {
          paragraphs: [
            "Google DeepMind’s Weather Lab lets the public explore AI weather forecasts on a world map, including storm tracks, rainfall, and changes over time.",
            "It turns specialist forecast output into a more legible view of several possible futures rather than a single deterministic line.",
          ],
        },
        {
          heading: "WeatherNext 2 models uncertainty",
          paragraphs: [
            "The system is powered by WeatherNext 2, which learns from large weather datasets and produces multiple plausible scenarios.",
            "Several blue tracks do not represent several storms. They show different paths one storm might take. A wider spread means greater uncertainty.",
          ],
        },
        {
          heading: "Up to 50 scenarios and 15 days",
          paragraphs: [
            "For tropical cyclones, the system can model roughly 50 scenarios up to 15 days ahead, considering formation, track, intensity, size, and shape.",
            "That perspective could support forecasters, disaster agencies, farmers, airlines, logistics teams, and the public in planning for more than one possible outcome.",
          ],
        },
        {
          heading: "An experiment, not an official warning",
          paragraphs: [
            "Google labels Weather Lab as experimental. Its output should not be the sole basis for safety decisions.",
            "People should continue to follow official meteorological and emergency authorities, using Weather Lab only as an additional way to understand forecast uncertainty.",
          ],
        },
      ],
    },
    cover,
    category: { th: "AI และสภาพอากาศ", en: "Climate AI" },
    author,
    tags: ["Google DeepMind", "Weather Lab", "WeatherNext 2", "Climate AI"],
    sources: [
      {
        label: { th: "โพสต์ต้นฉบับบน Facebook", en: "Original Facebook post" },
        url: "https://www.facebook.com/atl.ztwoz/posts/pfbid02QweWFjyxoy9hrKi2BLGRJoTAy4nXW6Lxp2ad4nTM7BzVAvWC2KthVnXHj5KDMUKAl",
      },
    ],
    featured: false,
    publishedAt: "2026-07-20T05:00:00.000Z",
    updatedAt: "2026-07-20T05:00:00.000Z",
    readingMinutes: 5,
  },
  {
    slug: "th-ai-passport-recap-developer-tools",
    title: {
      th: "Recap TH AI Passport เมื่อ Developer ต้องการมากกว่าหน้าแชต",
      en: "TH AI Passport recap: developers need more than a chat page",
    },
    excerpt: {
      th: "บทวิเคราะห์จากการทดลองสองชั่วโมง เสนอให้แพลตฟอร์ม AI ภาครัฐให้ความสำคัญกับ API, harness และเครื่องมือทำงานจริง",
      en: "A two-hour hands-on review argues that a public AI platform needs APIs, harnesses, and practical developer tools.",
    },
    body: {
      th: [
        {
          paragraphs: [
            "หมายเหตุจากกองบรรณาธิการ: โพสต์ต้นฉบับเผยแพร่ก่อนพบเอกสาร API ของแพลตฟอร์ม ภายหลังยืนยันแล้วว่า OKMD AI Playground มี OpenAI-compatible API เนื้อหาด้านล่างคงไว้ในฐานะบันทึกมุมมอง ณ เวลาที่ทดลอง TH AI Passport",
            "ขอขอบคุณ Thanarat Kuawattanaphan อีกครั้งสำหรับสิทธิ์ทดลอง ความเห็นนี้มาจากการใช้งานประมาณสองชั่วโมง และมองระบบจากประสบการณ์ใช้ GPT, Gemini, Claude Code และ Codex กับงานจริงมาอย่างต่อเนื่อง",
          ],
        },
        {
          heading: "หลายโมเดลยังไม่เพียงพอหากไม่มีเครื่องมือ",
          paragraphs: [
            "การรวมโมเดลหลายค่ายไว้ในเว็บไซต์ช่วยให้เข้าถึงง่ายขึ้น แต่คุณค่าต่อกลุ่มนักพัฒนาจะสูงขึ้นมากหากมี API หรือ proxy ที่เข้ากันได้กับเครื่องมือประเภท CLI, IDE และ agent harness",
            "ต่อให้เป็นโมเดลระดับสูง หากไม่มีเครื่องมือค้นเว็บ อ่านไฟล์ แก้โค้ด รันคำสั่ง และตรวจผล โมเดลก็ใช้ศักยภาพได้ไม่เต็มที่ ระบบที่จัดเตรียมบริบทและเครื่องมือเหล่านี้มักเรียกว่า harness ซึ่งทำหน้าที่เสมือนแขน ขา และสภาพแวดล้อมทำงานของ AI",
          ],
        },
        {
          heading: "ทำไม Coding Agent จึงต่างจากแชต",
          paragraphs: [
            "Claude Code, Codex และ Coding Agent อื่นไม่ได้เพียงส่งโค้ดกลับมาในช่องแชต แต่สามารถอ่านโครงการ แก้ไฟล์ รันโค้ด ตรวจ error และทำงานหลายขั้นตอนต่อเนื่องได้",
            "โมเดลชื่อเดียวกันเมื่อนำไปใช้ผ่าน harness คนละแบบจึงให้ผลลัพธ์ต่างกันมาก นักพัฒนายอมจ่ายค่าเครื่องมือเหล่านี้เพราะสิ่งที่ช่วยลดเวลาไม่ใช่เพียงคำตอบ แต่คือวงจรลงมือทำและตรวจสอบผล",
          ],
        },
        {
          heading: "Model Council เป็นอีกทางเลือก",
          paragraphs: [
            "หากการเปิด API หรือเครื่องมือเต็มรูปแบบใช้งบสูง อาจเพิ่ม Model Council ให้หลายโมเดลช่วยกันประมวลผลคำสั่ง เช่น ตัวหนึ่งวางแผน ตัวหนึ่งลงมือ และอีกตัวตรวจข้อผิดพลาด",
            "แนวทางนี้ทำให้การมีหลายโมเดลสร้างคุณค่ามากกว่าการเป็นเมนูเลือกชื่อโมเดลเพียงอย่างเดียว",
          ],
        },
        {
          heading: "แพลตฟอร์มต้องตามการแข่งขันให้ทัน",
          paragraphs: [
            "โมเดล AI แข่งขันและเปลี่ยนแปลงแทบทุกวัน แพลตฟอร์มจึงควรมีทั้งโมเดลระดับสูงและทางเลือกจากหลายภูมิภาค เช่น GPT-5.6, Kimi K3 และโมเดลใหม่ในอนาคต พร้อมบอกข้อจำกัดของแต่ละรุ่นอย่างตรงไปตรงมา",
            "หากระบบยังเป็นเพียงศูนย์รวมหน้าแชต กลุ่มที่อาจช่วยสร้าง use case และข้อมูลการใช้งานเชิงลึกอย่างนักพัฒนาอาจไม่เลือกใช้ แม้บริการจะไม่มีค่าใช้จ่าย เพราะสิ่งที่พวกเขาต้องการคือสภาพแวดล้อมทำงาน ไม่ใช่ช่องสนทนาเพียงอย่างเดียว",
          ],
        },
      ],
      en: [
        {
          paragraphs: [
            "Editorial update: the original post was written before the platform’s API documentation was found. OKMD AI Playground was later confirmed to offer an OpenAI-compatible API. The following text is preserved as a record of the TH AI Passport test at that time.",
            "The review reflects roughly two hours of use and a perspective shaped by sustained work with GPT, Gemini, Claude Code, and Codex.",
          ],
        },
        {
          heading: "A model catalogue is not a working environment",
          paragraphs: [
            "Putting many models in one website improves access, but developers gain much more when those models connect to CLI tools, IDEs, and agent harnesses through an API or compatible proxy.",
            "A strong model without web access, files, code execution, and result verification cannot use its full capability. The harness provides those tools and the context required to work.",
          ],
        },
        {
          heading: "Why coding agents differ from chat",
          paragraphs: [
            "Claude Code, Codex, and similar agents can inspect a project, edit files, run commands, test the result, and continue across several steps.",
            "That is why the same model can perform very differently across products. Developers pay for the execution and verification loop, not simply for another chat response.",
          ],
        },
        {
          heading: "Model Council as a middle path",
          paragraphs: [
            "If full API or tool access is too expensive, a Model Council could assign planning, implementation, and review to different models.",
            "This would give a multi-model platform value beyond a drop-down list of providers.",
          ],
        },
        {
          heading: "Keep pace with a fast market",
          paragraphs: [
            "The model market changes daily. A public platform should offer strong current models from several regions and explain each model’s limits clearly.",
            "If the product remains only a chat hub, developers who could produce deeper use cases may still avoid it, even when access is free.",
          ],
        },
      ],
    },
    cover,
    category: { th: "AI ภาครัฐ", en: "Public AI" },
    author,
    tags: ["TH AI Passport", "Developer Tools", "Harness", "Model Council", "Agentic AI"],
    sources: [
      {
        label: { th: "โพสต์ต้นฉบับบน Facebook", en: "Original Facebook post" },
        url: "https://www.facebook.com/atl.ztwoz/posts/pfbid0e7aCSdFeBw3x8Cg9ftaHXKPksLpgmHsY3Bf6aZKS2wBk2fktnY3a4c7Sf2pHLQuFl",
      },
      {
        label: { th: "บทเรียนเริ่มต้น Microsoft 365 Copilot", en: "Microsoft 365 Copilot learning path" },
        url: "https://learn.microsoft.com/en-us/training/paths/get-started-with-microsoft-365-copilot",
      },
    ],
    featured: false,
    publishedAt: "2026-07-21T05:00:00.000Z",
    updatedAt: "2026-07-24T05:00:00.000Z",
    readingMinutes: 7,
  },
];

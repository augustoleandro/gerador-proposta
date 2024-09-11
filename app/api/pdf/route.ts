// pages/api/generatePDF.js
import { promises as fs } from "fs";
import handlebars from "handlebars";
import path from "path";
import puppeteer from "puppeteer";

export async function POST(req: Request, res: Response) {
  if (req.method === "POST") {
    try {
      const { data } = await req.json();
      const htmlTemplate = await fs.readFile(
        path.join(process.cwd(), "public", "proposal.html"),
        "utf-8"
      );
      const template = handlebars.compile(htmlTemplate);
      const filledHTML = template(data);

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(filledHTML, { waitUntil: "networkidle0" });

      await page.evaluate(() => {
        const baseElement = document.querySelector("base");
        if (baseElement) {
          baseElement.href = "http://localhost:3000/";
        }
      });

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        preferCSSPageSize: true,
      });

      await browser.close();

      return new Response(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=proposal.pdf",
        },
      });
    } catch (error) {
      console.error(error);
      return new Response(null, {
        status: 500,
        statusText: "Failed to generate PDF",
      });
    }
  } else {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }
}
